// Import Firebase service
import {
  initializeFirebaseService,
  saveSemestersToFirestore,
} from "./firebase-service.js";

// Wait for Firebase to be initialized from HTML
let auth, db;
const waitForFirebase = setInterval(() => {
  if (window.firebaseAuth && window.firebaseDb) {
    auth = window.firebaseAuth;
    db = window.firebaseDb;
    clearInterval(waitForFirebase);

    // Initialize Firebase service with callback
    initializeFirebaseService(auth, db, (updatedSemesters) => {
      semesters = updatedSemesters;
      updateDashboard();
    });
  }
}, 100);

let courses = [];
let semesters = [];
let currentSemester = null;
let currentViewingSemester = null;
let notificationTimeout = null;

// Make showNotification globally available for firebase-service
window.showNotification = showNotification;

// Notification System
function showNotification(message, type = "info") {
  const popup = document.getElementById("notification-popup");
  const messageEl = popup.querySelector(".notification-message");

  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  popup.classList.remove("warning", "error", "success", "exit");
  popup.classList.add(type);

  messageEl.textContent = message;
  popup.classList.remove("hidden");

  notificationTimeout = setTimeout(() => {
    popup.classList.add("exit");
    setTimeout(() => {
      popup.classList.add("hidden");
      popup.classList.remove("exit");
    }, 400);
  }, 4000);
}

// Confirmation Modal System
function showConfirmation(message, callback) {
  const modal = document.getElementById("confirmation-modal");
  const messageEl = document.getElementById("confirmation-message");
  const confirmOk = document.getElementById("confirm-ok");
  const confirmCancel = document.getElementById("confirm-cancel");

  messageEl.textContent = message;
  modal.classList.remove("hidden");

  window.currentConfirmCallback = callback;

  const newOk = confirmOk.cloneNode(true);
  const newCancel = confirmCancel.cloneNode(true);

  confirmOk.parentNode.replaceChild(newOk, confirmOk);
  confirmCancel.parentNode.replaceChild(newCancel, confirmCancel);

  document
    .getElementById("confirm-ok")
    .addEventListener("click", handleConfirmOk, false);
  document
    .getElementById("confirm-cancel")
    .addEventListener("click", handleConfirmCancel, false);
}

function handleConfirmOk(e) {
  e.preventDefault();
  e.stopPropagation();

  if (window.currentConfirmCallback) {
    const cb = window.currentConfirmCallback;
    closeConfirmation();
    cb(true);
  }
}

function handleConfirmCancel(e) {
  e.preventDefault();
  e.stopPropagation();
  closeConfirmation();
  if (window.currentConfirmCallback) {
    window.currentConfirmCallback(false);
  }
}

function closeConfirmation() {
  const modal = document.getElementById("confirmation-modal");
  modal.classList.add("hidden");
  window.currentConfirmCallback = null;
}

// Initialize function to load data and set up UI
function initialize() {
  // Load saved data
  const saved = localStorage.getItem("semesters");
  if (saved) {
    try {
      semesters = JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing saved data:", e);
      semesters = [];
    }
  }

  // Always update dashboard on initialization
  updateDashboard();

  // Setup notification close button
  const closeBtn = document.querySelector(".notification-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      const popup = document.getElementById("notification-popup");
      popup.classList.add("exit");
      setTimeout(() => {
        popup.classList.add("hidden");
        popup.classList.remove("exit");
      }, 400);
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
    });
  }
}

// Dashboard and Form Navigation
function openAddSemesterForm(semesterNum) {
  courses = [];
  currentSemester = null;
  document.getElementById("course-type").value = "theory";
  document.getElementById("semester-num").value = semesterNum;
  showFormView();
  updateCourseInputs();
}

function openSemesterDetailView(semesterNum) {
  currentViewingSemester = semesterNum;
  const sem = semesters.find((s) => s.semester === semesterNum);

  if (sem) {
    courses = JSON.parse(JSON.stringify(sem.courses));
    displaySemesterDetail(sem);
  } else {
    courses = [];
    const newSem = {
      semester: semesterNum,
      cgpa: 0,
      courses: [],
      totalPoints: 0,
      totalCredits: 0,
    };
    displaySemesterDetail(newSem);
  }

  showSemesterDetailView();
}

function displaySemesterDetail(sem) {
  document.getElementById("sem-detail-title").textContent =
    `Semester ${sem.semester}`;
  document.getElementById("sem-course-count").textContent = courses.length;

  const coursesList = document.getElementById("semester-courses-list");
  coursesList.innerHTML = "";

  if (courses.length === 0) {
    coursesList.innerHTML =
      '<div class="empty-courses-message">No subjects added yet. Add one below!</div>';
  } else {
    courses.forEach((course, index) => {
      const courseCard = document.createElement("div");
      courseCard.className = "semester-course-card";
      if (course.hasBack) {
        courseCard.classList.add("back-course-card");
      }

      const gradeClass = course.hasBack ? "back" : "";
      const gradeLetter = getGradeLetter(course.grade);

      courseCard.innerHTML = `
                <div class="course-card-header">
                    <div class="course-card-title">${course.name || "Subject " + (index + 1)}</div>
                    <div class="course-card-grade ${gradeClass}">${gradeLetter}${course.hasBack ? " (BACK)" : ""}</div>
                </div>
                <div class="course-card-info">
                    <p><strong>Marks:</strong> ${course.total_marks.toFixed(2)}/100</p>
                    <p><strong>Credits:</strong> ${course.credit}</p>
                </div>
                <div class="course-card-footer">
                    <div class="course-credit">Credits: ${course.credit}</div>
                    <button class="btn-delete-course" onclick="deleteCourseSemDetail(${index})">Delete</button>
                </div>
            `;
      coursesList.appendChild(courseCard);
    });
  }

  if (courses.length > 0) {
    let totalPoints = 0;
    let totalCredits = 0;
    courses.forEach((course) => {
      if (!course.hasBack) {
        totalPoints += course.grade * course.credit;
        totalCredits += course.credit;
      }
    });
    const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    document.getElementById("sem-detail-cgpa").textContent = cgpa.toFixed(2);
  } else {
    document.getElementById("sem-detail-cgpa").textContent = "-";
  }
}

// Make this function global for onclick handler
window.deleteCourseSemDetail = function (index) {
  showConfirmation("Delete this subject?", function (confirmed) {
    if (confirmed) {
      courses.splice(index, 1);

      const semIndex = semesters.findIndex(
        (s) => s.semester === currentViewingSemester,
      );
      if (semIndex !== -1) {
        semesters[semIndex].courses = courses;
        semesters[semIndex].cgpa = 0;
        semesters[semIndex].totalPoints = 0;
        semesters[semIndex].totalCredits = 0;
        saveSemestersToFirestore(semesters, db);
      }

      const sem = {
        semester: currentViewingSemester,
        courses: courses,
        cgpa: 0,
        totalPoints: 0,
        totalCredits: 0,
      };
      displaySemesterDetail(sem);
      updateSemesterData();
      showNotification("Subject deleted successfully!", "success");
    }
  });
};

function updateSemesterData() {
  let totalPoints = 0;
  let totalCredits = 0;
  courses.forEach((course) => {
    if (!course.hasBack) {
      totalPoints += course.grade * course.credit;
      totalCredits += course.credit;
    }
  });
  const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  let semIndex = semesters.findIndex(
    (s) => s.semester === currentViewingSemester,
  );
  if (semIndex !== -1) {
    semesters[semIndex] = {
      semester: currentViewingSemester,
      cgpa: cgpa,
      courses: courses,
      totalPoints: totalPoints,
      totalCredits: totalCredits,
    };
  }
}

function showDashboardView() {
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("form-view").classList.add("hidden");
  document.getElementById("semester-detail-view").classList.add("hidden");
}

function showFormView() {
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("form-view").classList.remove("hidden");
  document.getElementById("semester-detail-view").classList.add("hidden");
}

function showSemesterDetailView() {
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("form-view").classList.add("hidden");
  document.getElementById("semester-detail-view").classList.remove("hidden");
}

function updateCourseInputs() {
  const type = document.getElementById("course-type").value;
  if (type === "lab") {
    document.getElementById("theory-inputs").style.display = "none";
    document.getElementById("lab-inputs").style.display = "block";
  } else {
    document.getElementById("theory-inputs").style.display = "block";
    document.getElementById("lab-inputs").style.display = "none";
  }
}

// Make this function global for onclick handler
window.setSemCourseType = function (type) {
  const buttons = document.querySelectorAll(".course-type-btn");
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.type === type) {
      btn.classList.add("active");
    }
  });

  if (type === "lab") {
    document.getElementById("sem-theory-inputs").style.display = "none";
    document.getElementById("sem-lab-inputs").style.display = "grid";
  } else {
    document.getElementById("sem-theory-inputs").style.display = "grid";
    document.getElementById("sem-lab-inputs").style.display = "none";
  }
};

function getGradeFromMarks(marks, hasBack = false) {
  if (hasBack) return 0;
  if (marks >= 90) return 10;
  if (marks >= 80) return 9;
  if (marks >= 70) return 8;
  if (marks >= 60) return 7;
  if (marks >= 50) return 6;
  return 5;
}

function displayCourses() {
  const list = document.getElementById("course-list");
  list.innerHTML = "";
  courses.forEach((course, index) => {
    const li = document.createElement("li");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Remove";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.addEventListener("click", function () {
      courses.splice(index, 1);
      displayCourses();
    });

    let courseText = `${course.name || "Course " + (index + 1)}: ${course.total_marks.toFixed(2)}/100, Grade ${getGradeLetter(course.grade)}, Credit ${course.credit}`;
    if (course.hasBack) {
      courseText += " [BACK]";
      li.style.backgroundColor = "#ffcccc";
    }

    li.textContent = courseText;
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

function clearForm() {
  document.getElementById("course-name").value = "";
  document.getElementById("mst1").value = "";
  document.getElementById("mst2").value = "";
  document.getElementById("assignment").value = "";
  document.getElementById("endsem").value = "";
  document.getElementById("lab-internal").value = "";
  document.getElementById("lab-external").value = "";
  document.getElementById("credit").value = "";
  document.getElementById("semester-num").value = "";
  displayCourses();
}

function getGradeLetter(points) {
  const map = {
    10: "S",
    9: "A",
    8: "B",
    7: "C",
    6: "D",
    5: "E",
  };
  return map[points] || "Unknown";
}

function updateDashboard() {
  const semesterListDiv = document.getElementById("semester-list");
  if (!semesterListDiv) {
    console.error("semester-list element not found!");
    return;
  }

  semesterListDiv.innerHTML = "";

  for (let i = 1; i <= 8; i++) {
    const sem = semesters.find((s) => s.semester === i);
    const semCard = document.createElement("div");
    semCard.className = "semester-card";

    if (sem) {
      semCard.classList.add("filled");
      const hasBackCourses = sem.courses.some((c) => c.hasBack);
      let backBadge = "";
      if (hasBackCourses) {
        semCard.classList.add("has-backs");
        backBadge = '<p class="back-indicator">⚠️ Has Back(s)</p>';
      }
      semCard.innerHTML = `
                <h4>Semester ${i}</h4>
                <p class="sem-cgpa">${sem.cgpa.toFixed(2)}</p>
                <p class="sem-courses">${sem.courses.length} courses</p>
                ${backBadge}
            `;
      semCard.addEventListener("click", function () {
        openSemesterDetailView(i);
      });
    } else {
      semCard.classList.add("empty");
      semCard.innerHTML = `
                <h4>Semester ${i}</h4>
                <p class="empty-text">Click to add</p>
            `;
      semCard.addEventListener("click", function () {
        openSemesterDetailView(i);
      });
    }

    semesterListDiv.appendChild(semCard);
  }

  if (semesters.length > 0) {
    let overallPoints = 0;
    let overallCredits = 0;
    semesters.forEach((sem) => {
      overallPoints += sem.totalPoints;
      overallCredits += sem.totalCredits;
    });
    const overallCgpa = overallCredits > 0 ? overallPoints / overallCredits : 0;
    document.getElementById("overall-cgpa").textContent =
      overallCgpa.toFixed(2);

    const startIndex = Math.max(0, semesters.length - 4);
    let yearPoints = 0;
    let yearCredits = 0;
    for (let i = startIndex; i < semesters.length; i++) {
      yearPoints += semesters[i].totalPoints;
      yearCredits += semesters[i].totalCredits;
    }
    const yearCgpa = yearCredits > 0 ? yearPoints / yearCredits : 0;
    document.getElementById("year-cgpa").textContent = yearCgpa.toFixed(2);
  } else {
    document.getElementById("overall-cgpa").textContent = "-";
    document.getElementById("year-cgpa").textContent = "-";
  }

  displayBacks();
}

function displayBacks() {
  const backsSection = document.getElementById("backs-section");
  const backsList = document.getElementById("backs-list");

  if (!backsSection || !backsList) return;

  backsSection.classList.add("hidden");
  backsList.innerHTML = "";

  if (semesters.length === 0) {
    return;
  }

  const backsCourses = [];

  semesters.forEach((sem) => {
    sem.courses.forEach((course) => {
      if (course.hasBack) {
        backsCourses.push({
          courseName: course.name,
          semesterNum: sem.semester,
          marks: course.total_marks,
        });
      }
    });
  });

  if (backsCourses.length === 0) {
    return;
  }

  backsSection.classList.remove("hidden");

  backsCourses.forEach((back) => {
    const clearSemester = getNextClearSemester(back.semesterNum);
    const backCard = document.createElement("div");
    backCard.className = "back-card";

    let clearSemInfo = "";
    if (clearSemester) {
      clearSemInfo = `<p class="clear-sem"><strong>Can clear in:</strong> Semester ${clearSemester}</p>`;
    } else {
      clearSemInfo = `<p class="clear-sem no-clear"><strong>No future semester available</strong></p>`;
    }

    backCard.innerHTML = `
            <div class="back-info">
                <h4>${back.courseName || "Course"}</h4>
                <p><strong>Failed in:</strong> Semester ${back.semesterNum}</p>
                <p><strong>Marks:</strong> ${back.marks.toFixed(2)}/100</p>
                ${clearSemInfo}
            </div>
        `;
    backsList.appendChild(backCard);
  });
}

function getNextClearSemester(semesterNum) {
  let nextSem = semesterNum + 2;
  if (nextSem > 8) {
    return null;
  }
  return nextSem;
}

function deleteSemester(index) {
  showConfirmation(
    `Delete Semester ${semesters[index].semester}?`,
    function (confirmed) {
      if (confirmed) {
        semesters.splice(index, 1);
        saveSemestersToFirestore(semesters, db);
        updateDashboard();
      }
    },
  );
}

function openSemesterModal(index) {
  const sem = semesters[index];
  if (!sem) return;

  document.getElementById("modal-sem-title").textContent =
    `Semester ${sem.semester}`;

  const coursesDiv = document.getElementById("modal-courses");
  coursesDiv.innerHTML = "";

  sem.courses.forEach((course) => {
    const courseDiv = document.createElement("div");
    courseDiv.className = "modal-course";
    if (course.hasBack) {
      courseDiv.classList.add("back-course");
    }

    const statusBadge = course.hasBack
      ? '<span class="back-badge">BACK</span>'
      : "";

    courseDiv.innerHTML = `
            <div class="course-header">
                <h4>${course.name || "Course"}</h4>
                <span class="course-grade">${getGradeLetter(course.grade)}</span>
                ${statusBadge}
            </div>
            <div class="course-details">
                <p>Marks: <strong>${course.total_marks.toFixed(2)}/100</strong></p>
                <p>Credit: <strong>${course.credit}</strong></p>
                <p>Grade Points: <strong>${course.hasBack ? "Back (0)" : course.grade}</strong></p>
            </div>
        `;
    coursesDiv.appendChild(courseDiv);
  });

  document.getElementById("modal-cgpa").innerHTML =
    `<strong>Net CGPA: ${sem.cgpa.toFixed(2)}</strong>`;

  document.getElementById("delete-sem-btn").onclick = function () {
    showConfirmation(`Delete Semester ${sem.semester}?`, function (confirmed) {
      if (confirmed) {
        const semIndex = semesters.findIndex(
          (s) => s.semester === sem.semester,
        );
        semesters.splice(semIndex, 1);
        saveSemestersToFirestore(semesters, db);
        document.getElementById("semester-modal").classList.add("hidden");
        updateDashboard();
      }
    });
  };

  document.getElementById("semester-modal").classList.remove("hidden");
}

// Event Listeners - Set up when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the app
  initialize();

  // Course type change
  const courseTypeSelect = document.getElementById("course-type");
  if (courseTypeSelect) {
    courseTypeSelect.addEventListener("change", updateCourseInputs);
  }

  // Add course button (old form)
  const addCourseBtn = document.getElementById("add-course");
  if (addCourseBtn) {
    addCourseBtn.addEventListener("click", function () {
      const name = document.getElementById("course-name").value;
      const type = document.getElementById("course-type").value;
      const credit = parseFloat(document.getElementById("credit").value);

      let total_marks, grade, hasBack, internal;

      if (type === "theory") {
        const mst1 = parseFloat(document.getElementById("mst1").value);
        const mst2 = parseFloat(document.getElementById("mst2").value);
        const assignment = parseFloat(
          document.getElementById("assignment").value,
        );
        const endsem = parseFloat(document.getElementById("endsem").value);

        internal = (mst1 / 30) * 15 + (mst2 / 30) * 15 + (assignment / 10) * 10;

        if (
          isNaN(mst1) ||
          mst1 < 0 ||
          mst1 > 30 ||
          isNaN(mst2) ||
          mst2 < 0 ||
          mst2 > 30 ||
          isNaN(assignment) ||
          assignment < 0 ||
          assignment > 10 ||
          isNaN(credit)
        ) {
          showNotification("Please enter valid marks and credit.", "error");
          return;
        }

        let externalConverted = 0;
        if (internal >= 20) {
          if (isNaN(endsem) || endsem < 0 || endsem > 100) {
            showNotification("Please enter valid external marks.", "error");
            return;
          }
          externalConverted = (endsem / 100) * 60;
        } else {
          showNotification(
            `Warning: Internal marks (${internal.toFixed(2)}) is less than 20. This will be marked as a BACK paper.`,
            "warning",
          );
        }

        total_marks = internal + externalConverted;
      } else {
        const internalLab = parseFloat(
          document.getElementById("lab-internal").value,
        );
        const externalLab = parseFloat(
          document.getElementById("lab-external").value,
        );

        if (
          isNaN(internalLab) ||
          internalLab < 0 ||
          internalLab > 60 ||
          isNaN(externalLab) ||
          externalLab < 0 ||
          externalLab > 40 ||
          isNaN(credit)
        ) {
          showNotification("Please enter valid marks and credit.", "error");
          return;
        }

        internal = internalLab;
        if (internal < 20) {
          showNotification(
            `Warning: Internal marks (${internal}) is less than 20. This will be marked as a BACK paper.`,
            "warning",
          );
        }

        total_marks = internalLab + externalLab;
      }

      hasBack = internal < 20;
      grade = getGradeFromMarks(total_marks, hasBack);

      courses.push({ name, total_marks, grade, credit, hasBack });
      displayCourses();

      document.getElementById("course-name").value = "";
      document.getElementById("mst1").value = "";
      document.getElementById("mst2").value = "";
      document.getElementById("assignment").value = "";
      document.getElementById("endsem").value = "";
      document.getElementById("lab-internal").value = "";
      document.getElementById("lab-external").value = "";
      document.getElementById("credit").value = "";
    });
  }

  // Semester detail view add course
  const semAddCourseBtn = document.getElementById("sem-add-course-btn");
  if (semAddCourseBtn) {
    semAddCourseBtn.addEventListener("click", function () {
      const name = document.getElementById("sem-course-name").value;
      const activeBtn = document.querySelector(".course-type-btn.active");
      const type = activeBtn ? activeBtn.dataset.type : "theory";
      const credit = parseFloat(document.getElementById("sem-credit").value);

      let total_marks, grade, hasBack, internal;

      if (type === "theory") {
        const mst1 = parseFloat(document.getElementById("sem-mst1").value);
        const mst2 = parseFloat(document.getElementById("sem-mst2").value);
        const assignment = parseFloat(
          document.getElementById("sem-assignment").value,
        );
        const endsem = parseFloat(document.getElementById("sem-endsem").value);

        internal = (mst1 / 30) * 15 + (mst2 / 30) * 15 + (assignment / 10) * 10;

        if (
          isNaN(mst1) ||
          mst1 < 0 ||
          mst1 > 30 ||
          isNaN(mst2) ||
          mst2 < 0 ||
          mst2 > 30 ||
          isNaN(assignment) ||
          assignment < 0 ||
          assignment > 10 ||
          isNaN(credit)
        ) {
          showNotification("Please enter valid marks and credit.", "error");
          return;
        }

        let externalConverted = 0;
        if (internal >= 20) {
          if (isNaN(endsem) || endsem < 0 || endsem > 100) {
            showNotification("Please enter valid external marks.", "error");
            return;
          }
          externalConverted = (endsem / 100) * 60;
        } else {
          showNotification(
            `Warning: Internal marks (${internal.toFixed(2)}) is less than 20. This will be marked as a BACK paper.`,
            "warning",
          );
        }

        total_marks = internal + externalConverted;
      } else {
        const internalLab = parseFloat(
          document.getElementById("sem-lab-internal").value,
        );
        const externalLab = parseFloat(
          document.getElementById("sem-lab-external").value,
        );

        if (
          isNaN(internalLab) ||
          internalLab < 0 ||
          internalLab > 60 ||
          isNaN(externalLab) ||
          externalLab < 0 ||
          externalLab > 40 ||
          isNaN(credit)
        ) {
          showNotification("Please enter valid marks and credit.", "error");
          return;
        }

        internal = internalLab;
        if (internal < 20) {
          showNotification(
            `Warning: Internal marks (${internal}) is less than 20. This will be marked as a BACK paper.`,
            "warning",
          );
        }

        total_marks = internalLab + externalLab;
      }

      hasBack = internal < 20;
      grade = getGradeFromMarks(total_marks, hasBack);

      courses.push({ name, total_marks, grade, credit, hasBack });

      document.getElementById("sem-course-name").value = "";
      document.getElementById("sem-mst1").value = "";
      document.getElementById("sem-mst2").value = "";
      document.getElementById("sem-assignment").value = "";
      document.getElementById("sem-endsem").value = "";
      document.getElementById("sem-lab-internal").value = "";
      document.getElementById("sem-lab-external").value = "";
      document.getElementById("sem-credit").value = "";

      const sem = {
        semester: currentViewingSemester,
        courses: courses,
        cgpa: 0,
        totalPoints: 0,
        totalCredits: 0,
      };
      displaySemesterDetail(sem);
    });
  }

  // Back button
  const backBtn = document.getElementById("back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", showDashboardView);
  }

  // Cancel semester button
  const cancelBtn = document.getElementById("cancel-semester");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", showDashboardView);
  }

  // Close modal button
  const closeModalBtn = document.getElementById("close-modal");
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", function () {
      document.getElementById("semester-modal").classList.add("hidden");
    });
  }

  // Back to dashboard button
  const backToDashboardBtn = document.getElementById("back-to-dashboard-btn");
  if (backToDashboardBtn) {
    backToDashboardBtn.addEventListener("click", function () {
      updateSemesterData();
      saveSemestersToFirestore(semesters, db);

      document.getElementById("sem-course-name").value = "";
      document.getElementById("sem-mst1").value = "";
      document.getElementById("sem-mst2").value = "";
      document.getElementById("sem-assignment").value = "";
      document.getElementById("sem-endsem").value = "";
      document.getElementById("sem-lab-internal").value = "";
      document.getElementById("sem-lab-external").value = "";
      document.getElementById("sem-credit").value = "";

      const buttons = document.querySelectorAll(".course-type-btn");
      buttons.forEach((btn) => btn.classList.remove("active"));
      if (buttons[0]) buttons[0].classList.add("active");

      const theoryInputs = document.getElementById("sem-theory-inputs");
      const labInputs = document.getElementById("sem-lab-inputs");
      if (theoryInputs) theoryInputs.style.display = "grid";
      if (labInputs) labInputs.style.display = "none";

      updateDashboard();
      showDashboardView();
      showNotification("Semester data saved successfully!", "success");
    });
  }

  // Calculate CGPA button
  const calculateBtn = document.getElementById("calculate-cgpa");
  if (calculateBtn) {
    calculateBtn.addEventListener("click", function () {
      if (courses.length === 0) {
        showNotification("Please add at least one course.", "error");
        return;
      }

      const semesterNum = parseInt(
        document.getElementById("semester-num").value,
      );
      if (isNaN(semesterNum) || semesterNum < 1) {
        showNotification("Please enter a valid semester number.", "error");
        return;
      }

      let totalPoints = 0;
      let totalCredits = 0;
      courses.forEach((course) => {
        if (!course.hasBack) {
          totalPoints += course.grade * course.credit;
          totalCredits += course.credit;
        }
      });

      const semesterCgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

      semesters.push({
        semester: semesterNum,
        cgpa: semesterCgpa,
        courses: courses,
        totalPoints: totalPoints,
        totalCredits: totalCredits,
      });

      localStorage.setItem("semesters", JSON.stringify(semesters));

      if (db && window.firebaseAuth?.currentUser) {
        saveSemestersToFirestore(semesters, db);
      }

      showNotification(
        `Semester ${semesterNum} saved! CGPA: ${semesterCgpa.toFixed(2)}`,
        "success",
      );

      showDashboardView();
      updateDashboard();
      courses = [];
      currentSemester = null;
      clearForm();
    });
  }
});
