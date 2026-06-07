'use client';

import { useFirebase } from '@/components/firebase-provider';
import { calculateSGPA } from '@/lib/sgpa';
import { parseERPText } from '@/lib/ocr-parser';
import { Subject, CourseType } from '@/types/subject';
import { Semester } from '@/types/semester';
import { getGradeLetter, getGradeFromMarks, GRADE_POINTS } from '@/lib/grade-mapping';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, Suspense } from 'react';
import {
  Upload,
  Clipboard,
  Trash2,
  Plus,
  Save,
  FileImage,
  Loader2,
  CheckCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createWorker } from 'tesseract.js';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/toast';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { motion, AnimatePresence } from 'framer-motion';

function NewSemesterForm() {
  const { semesters, setSemesters, profile } = useFirebase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // URL params for editing
  const editingSemNum = searchParams.get('sem') ? parseInt(searchParams.get('sem')!) : null;

  // Local state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesterNum, setSemesterNum] = useState<number>(1);
  const [academicYear, setAcademicYear] = useState<string>('2023-2024');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // OCR & Paste text state
  const [pastedText, setPastedText] = useState<string>('');
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [textLoading, setTextLoading] = useState<boolean>(false);

  // Manual Entry Form state
  const [manualName, setManualName] = useState<string>('');
  const [manualCredits, setManualCredits] = useState<number>(3);
  const [manualGrade, setManualGrade] = useState<string>('S');
  const [manualType, setManualType] = useState<CourseType>('theory');
  const [entryMode, setEntryMode] = useState<'grade' | 'marks'>('grade');

  // Theory marks state
  const [mst1, setMst1] = useState<string>('');
  const [mst2, setMst2] = useState<string>('');
  const [assignment, setAssignment] = useState<string>('');
  const [endsem, setEndsem] = useState<string>('');

  // Lab marks state
  const [labInternal, setLabInternal] = useState<string>('');
  const [labExternal, setLabExternal] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing semester data if editing or load defaults from profile
  useEffect(() => {
    if (editingSemNum !== null) {
      setSemesterNum(editingSemNum);
      const existing = semesters.find(s => s.semester === editingSemNum);
      if (existing) {
        setSubjects(existing.courses);
        if (existing.academicYear) {
          setAcademicYear(existing.academicYear);
        }
      }
    } else {
      // Prepopulate semester number from profile if available, else guess next empty
      const nextSem = profile ? profile.currentSemester : (semesters.length > 0
        ? Math.max(...semesters.map(s => s.semester)) + 1
        : 1);
      setSemesterNum(nextSem > 8 ? 8 : nextSem);

      if (profile) {
        const baseYear = 2023 + (profile.currentYear - 1);
        setAcademicYear(`${baseYear}-${baseYear + 1}`);
      }
    }
  }, [editingSemNum, semesters, profile]);

  // Auto-trigger ERP screenshot upload dialog if query parameter ?import=true is set
  useEffect(() => {
    if (searchParams.get('import') === 'true' && fileInputRef.current) {
      fileInputRef.current.click();
      // Clear URL parameter safely without reloading
      const cleanUrl = window.location.pathname;
      router.replace(cleanUrl);
    }
  }, [searchParams, router]);

  // Calculations
  const sgpaResult = calculateSGPA(subjects);

  // Total points (credit * grade points)
  const totalPoints = sgpaResult.totalPoints;
  const totalCredits = sgpaResult.totalCredits;
  const sgpa = sgpaResult.sgpa;
  const earnedCredits = sgpaResult.earnedCredits;

  // Running calculations for the detailed marks inputs
  const parseNum = (val: string) => parseFloat(val) || 0;

  const theoryMst1 = parseNum(mst1);
  const theoryMst2 = parseNum(mst2);
  const theoryAssg = parseNum(assignment);
  const theoryEndSem = parseNum(endsem);

  const theoryInternal = (theoryMst1 / 30) * 15 + (theoryMst2 / 30) * 15 + (theoryAssg / 10) * 10;
  const theoryHasBack = theoryInternal < 20;
  const theoryExternalConverted = theoryHasBack ? 0 : (theoryEndSem / 100) * 60;
  const theoryTotal = theoryInternal + theoryExternalConverted;
  const theoryGradePoints = getGradeFromMarks(theoryTotal, theoryHasBack);
  const theoryGradeLetter = getGradeLetter(theoryGradePoints, theoryHasBack);

  const labInt = parseNum(labInternal);
  const labExt = parseNum(labExternal);

  const labInternalVal = labInt;
  const labHasBack = labInternalVal < 20;
  const labTotal = labInternalVal + labExt;
  const labGradePoints = getGradeFromMarks(labTotal, labHasBack, true);
  const labGradeLetter = getGradeLetter(labGradePoints, labHasBack);

  // OCR Screenshot Processing
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(file);
      const text = ret.data.text;
      await worker.terminate();

      const parsedSubjects = parseERPText(text);
      if (parsedSubjects.length > 0) {
        setSubjects(prev => [...prev, ...parsedSubjects]);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 2000);
        showToast(`Successfully extracted ${parsedSubjects.length} subjects from screenshot!`, 'success');
      } else {
        showToast("OCR completed, but could not detect any subjects. Try copy-pasting the ERP text table instead.", 'warning');
      }
    } catch (error) {
      console.error("OCR upload error:", error);
      showToast("Error scanning image. Make sure the text is clear and readable.", 'error');
    } finally {
      setOcrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Paste Text Processing
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      showToast("Please paste the ERP table text first.", 'warning');
      return;
    }

    setTextLoading(true);
    setTimeout(() => {
      const parsedSubjects = parseERPText(pastedText);
      if (parsedSubjects.length > 0) {
        setSubjects(prev => [...prev, ...parsedSubjects]);
        setPastedText('');
        showToast(`Successfully parsed ${parsedSubjects.length} subjects from text!`, 'success');
      } else {
        showToast("Could not parse subjects from text. Make sure you copy the entire table row contents (including credits and grades).", 'error');
      }
      setTextLoading(false);
    }, 800);
  };

  // Add Subject Manually
  const handleAddManualSubject = () => {
    if (!manualName.trim()) {
      showToast("Please enter subject name.", 'warning');
      return;
    }

    let gradePoints = GRADE_POINTS[manualGrade] || 0;
    let hasBack = manualGrade === 'F' || manualGrade === 'Ab';
    let totalMarks = hasBack ? 39 : 85;

    let subMst1: number | undefined;
    let subMst2: number | undefined;
    let subAssignment: number | undefined;
    let subEndsem: number | undefined;
    let subLabInternal: number | undefined;
    let subLabExternal: number | undefined;

    if (entryMode === 'marks') {
      if (manualType === 'theory') {
        const m1 = parseFloat(mst1);
        const m2 = parseFloat(mst2);
        const a = parseFloat(assignment);
        const es = parseFloat(endsem);

        if (
          isNaN(m1) || m1 < 0 || m1 > 30 ||
          isNaN(m2) || m2 < 0 || m2 > 30 ||
          isNaN(a) || a < 0 || a > 10 ||
          isNaN(es) || es < 0 || es > 100
        ) {
          showToast('Please enter valid theory marks: MST1 (0-30), MST2 (0-30), Assignment (0-10), EndSem (0-100).', 'error');
          return;
        }

        const internal = (m1 / 30) * 15 + (m2 / 30) * 15 + (a / 10) * 10;
        const isBack = internal < 20;
        const extConverted = isBack ? 0 : (es / 100) * 60;
        const total = internal + extConverted;

        gradePoints = getGradeFromMarks(total, isBack);
        hasBack = isBack || gradePoints === 0;
        totalMarks = total;

        subMst1 = m1;
        subMst2 = m2;
        subAssignment = a;
        subEndsem = es;

        if (isBack) {
          showToast(`Warning: Internal marks (${internal.toFixed(2)}) are less than 20. Marked as BACK (Fail) paper.`, 'warning');
        }
      } else {
        const li = parseFloat(labInternal);
        const le = parseFloat(labExternal);

        if (
          isNaN(li) || li < 0 || li > 60 ||
          isNaN(le) || le < 0 || le > 40
        ) {
          showToast('Please enter valid practical marks: Internal (0-60), External (0-40).', 'error');
          return;
        }

        const isBack = li < 20;
        const total = li + le;

        gradePoints = getGradeFromMarks(total, isBack, true);
        hasBack = isBack || gradePoints === 0;
        totalMarks = total;

        subLabInternal = li;
        subLabExternal = le;

        if (isBack) {
          showToast(`Warning: Internal marks (${li.toFixed(2)}) are less than 20. Marked as BACK (Fail) paper.`, 'warning');
        }
      }
    }

    const newSub: Subject = {
      id: uuidv4(),
      name: manualName.trim(),
      credit: manualCredits,
      grade: gradePoints,
      hasBack: hasBack,
      type: manualType,
      totalMarks: totalMarks,
      mst1: subMst1,
      mst2: subMst2,
      assignment: subAssignment,
      endsem: subEndsem,
      labInternal: subLabInternal,
      labExternal: subLabExternal,
    };

    setSubjects([...subjects, newSub]);
    setManualName('');
    setManualCredits(3);
    setManualGrade('S');
    setMst1('');
    setMst2('');
    setAssignment('');
    setEndsem('');
    setLabInternal('');
    setLabExternal('');
  };

  // Delete subject from list
  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  // Change subject grade/credits directly in table list
  const handleUpdateSubjectField = (id: string, field: 'credit' | 'grade', value: any) => {
    setSubjects(subjects.map(s => {
      if (s.id === id) {
        let updatedSub = { ...s, [field]: value };
        if (field === 'grade') {
          const isF = value === 0;
          updatedSub.hasBack = isF;
          if (isF) updatedSub.totalMarks = 40;
        }
        return updatedSub;
      }
      return s;
    }));
  };

  // Save the entire semester
  const handleSaveSemester = async () => {
    if (subjects.length === 0) {
      showToast("Please add or import at least one subject.", 'warning');
      return;
    }

    if (semesterNum < 1 || semesterNum > 8) {
      showToast("Semester number must be between 1 and 8.", 'error');
      return;
    }

    const doSave = async () => {
      const semesterData: Semester = {
        semester: semesterNum,
        cgpa: sgpa, // SGPA mapping to cgpa field
        courses: subjects,
        totalPoints,
        totalCredits,
        earnedCredits,
        academicYear
      };

      // Remove old semester if it matches (for overwrite/edit)
      const filteredSemesters = semesters.filter(s => s.semester !== semesterNum);
      const updatedSemesters = [...filteredSemesters, semesterData].sort((a, b) => a.semester - b.semester);

      try {
        await setSemesters(updatedSemesters);
        showToast(`Semester ${semesterNum} saved successfully!`, 'success');
        router.push('/');
      } catch (e) {
        console.error(e);
        showToast("Failed to save semester.", 'error');
      }
    };

    // Check if semester number is already used (when creating a new one)
    if (editingSemNum === null) {
      const alreadyExists = semesters.some(s => s.semester === semesterNum);
      if (alreadyExists) {
        triggerConfirm(
          "Overwrite Semester",
          `Semester ${semesterNum} already exists. Do you want to overwrite it?`,
          doSave
        );
        return;
      }
    }

    await doSave();
  };

  return (
    <>
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-grow pt-[80px] pb-24 max-w-[1440px] mx-auto px-4 sm:px-6 w-full flex flex-col gap-8 sm:gap-12"
      >
        {/* Banner Title */}
        <section className="flex flex-col gap-2 mt-8">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Intelligence Layer
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-none">
            {editingSemNum ? `Edit Semester ${editingSemNum}` : 'Import ERP Results'}
          </h1>
        </section>

        {/* Import Zone Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Option A: OCR Screenshot */}
          <motion.div
            whileHover={{ y: -3, borderColor: '#FAFAFA' }}
            whileTap={{ scale: 0.98 }}
            animate={uploadSuccess ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.3 }}
            onClick={() => fileInputRef.current?.click()}
            className="group relative bg-[#090909] border border-border p-6 hover:border-neutral-800 transition-all duration-200 flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden rounded-2xl min-h-[180px]"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleScreenshotUpload}
              accept="image/*"
              className="hidden"
            />
            {ocrLoading ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
                <div>
                  <h3 className="text-base font-semibold text-white">Analyzing Results Portal...</h3>
                  <p className="text-xs text-muted-foreground mt-1">Tesseract.js is extracting grades and credits.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-4 min-h-[180px] justify-center">
                <div className="w-12 h-12 flex items-center justify-center bg-neutral-900 rounded-xl border border-border group-hover:border-white transition-colors">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{uploadSuccess ? '✓ ERP Detected' : 'Upload ERP Result or Take Photo'}</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                    Scan grades and credits from your AcademiA exam portal by uploading a screenshot or taking a photo.
                  </p>
                </div>
                <div className="flex gap-2 pt-1">
                  <span className="font-mono text-[9px] bg-neutral-900 border border-border px-3 py-1.5 rounded-lg text-white font-semibold flex items-center gap-1.5">
                    <FileImage className="w-3.5 h-3.5" /> GALLERY
                  </span>
                  <span className="font-mono text-[9px] bg-neutral-900 border border-border px-3 py-1.5 rounded-lg text-white font-semibold flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> TAKE PHOTO
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Option B: Copy Paste Text */}
          <div className="bg-[#090909] border border-border p-6 rounded-2xl flex flex-col justify-between min-h-[180px] gap-4">
            <div className="flex flex-col gap-2 w-full">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-white" />
                Paste ERP Table Text
              </h3>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Copy your results table rows from AcademiA portal and paste them here..."
                className="w-full h-24 bg-black border border-border text-xs p-3 rounded-xl focus:border-white focus:outline-none focus:ring-0 resize-none font-mono text-muted-foreground"
              />
            </div>
            <Button
              disabled={textLoading}
              onClick={handleProcessPastedText}
              size="xl"
              className="w-full flex items-center justify-center gap-2"
            >
              {textLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'PROCESS TEXT'}
            </Button>
          </div>
        </section>

        {/* Results Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Detected Subjects */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-border pb-3">
              <h2 className="text-lg font-bold text-white">Subjects List</h2>
              <span className="font-mono text-xs text-muted-foreground">{subjects.length} ITEMS FOUND</span>
            </div>

            <div className="flex flex-col border border-border bg-[#090909] rounded-2xl overflow-hidden">
              {/* Desktop View: Table Header */}
              <div className="hidden md:grid grid-cols-12 px-5 py-3 border-b border-border bg-neutral-900/50 font-mono text-[10px] text-muted-foreground">
                <div className="col-span-7">SUBJECT NAME</div>
                <div className="col-span-2 text-center">CREDITS</div>
                <div className="col-span-2 text-center">GRADE</div>
                <div className="col-span-1"></div>
              </div>

              {/* Rows */}
              {ocrLoading || textLoading ? (
                <div className="flex flex-col divide-y divide-border animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-12 px-5 py-4 items-center bg-[#090909]/40">
                      <div className="col-span-7 space-y-2 text-left">
                        <div className="h-3.5 bg-neutral-900 rounded w-2/3"></div>
                        <div className="h-2.5 bg-neutral-900 rounded w-1/3"></div>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <div className="h-7 bg-neutral-900 rounded w-8"></div>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <div className="h-7 bg-neutral-900 rounded w-10"></div>
                      </div>
                      <div className="col-span-1"></div>
                    </div>
                  ))}
                </div>
              ) : subjects.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground leading-relaxed">
                  No subjects added. Upload a screenshot, paste ERP text, or add subjects manually below.
                </div>
              ) : (
                <motion.div 
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.04
                      }
                    }
                  }}
                  className="flex flex-col divide-y divide-border"
                >
                  {subjects.map((course, idx) => (
                    <motion.div
                      key={course.id || `${course.name}-${idx}`}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
                      }}
                      className={`p-4 md:px-5 md:py-4 transition-colors ${course.hasBack ? 'bg-red-950/5 hover:bg-red-950/10' : 'hover:bg-neutral-900/40'}`}
                    >
                      {/* Desktop Row: Grid layout */}
                      <div className="hidden md:grid grid-cols-12 items-center">
                        <div className="col-span-7 font-medium text-white text-xs sm:text-sm truncate pr-2 flex flex-col gap-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{course.name}</span>
                            {course.type === 'lab' && (
                              <span className="bg-neutral-800 text-muted-foreground text-[9px] px-1.5 py-0.5 rounded font-mono">LAB</span>
                            )}
                          </div>

                          {(course.mst1 !== undefined || course.labInternal !== undefined) && (
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {course.type === 'theory' ? (
                                <span>
                                  mst1: {course.mst1}/30 • mst2: {course.mst2}/30 • Assg: {course.assignment}/10 • EndSem: {course.endsem}/100
                                  <span className="text-white font-medium ml-1">({(course.totalMarks ?? (course.grade === 10 ? 95 : course.grade === 9 ? 85 : course.grade === 8 ? 75 : course.grade === 7 ? 65 : course.grade === 6 ? 55 : course.grade === 5 ? 45 : 35)).toFixed(1)}/100)</span>
                                </span>
                              ) : (
                                <span>
                                  Internal: {course.labInternal}/60 • External: {course.labExternal}/40
                                  <span className="text-white font-medium ml-1">({(course.totalMarks ?? (course.grade === 10 ? 95 : course.grade === 9 ? 85 : course.grade === 8 ? 75 : course.grade === 7 ? 65 : course.grade === 6 ? 55 : course.grade === 5 ? 45 : 35)).toFixed(1)}/100)</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Credits Selector */}
                        <div className="col-span-2 flex justify-center">
                          <select
                            value={course.credit}
                            onChange={(e) => handleUpdateSubjectField(course.id, 'credit', parseInt(e.target.value))}
                            className="bg-black border border-border text-white text-xs p-1.5 rounded-lg outline-none font-mono focus:border-white"
                          >
                            {[1, 2, 3, 4, 5].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        {/* Grade Selector */}
                        <div className="col-span-2 flex justify-center">
                          <select
                            value={course.grade}
                            onChange={(e) => handleUpdateSubjectField(course.id, 'grade', parseInt(e.target.value))}
                            className={`border text-xs p-1.5 rounded-lg outline-none font-mono focus:border-white ${course.hasBack
                              ? 'bg-red-950/20 border-red-900 text-red-400'
                              : 'bg-black border-border text-white'
                              }`}
                          >
                            <option value={10}>S</option>
                            <option value={9}>A</option>
                            <option value={8}>B</option>
                            <option value={7}>C</option>
                            <option value={6}>D</option>
                            <option value={5}>E</option>
                            <option value={0}>F (Fail)</option>
                          </select>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 text-right">
                          <button
                            onClick={() => handleDeleteSubject(course.id)}
                            className="text-muted-foreground hover:text-red-400 p-1 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>

                      {/* Mobile Row: Card layout */}
                      <div className="md:hidden flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1 text-left max-w-[85%]">
                            <span className="font-semibold text-white text-sm break-words leading-tight">{course.name}</span>
                            {course.type === 'lab' && (
                              <span className="bg-neutral-800 text-muted-foreground text-[9px] px-1.5 py-0.5 rounded font-mono w-max">LAB</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteSubject(course.id)}
                            className="text-muted-foreground hover:text-red-400 p-1 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>

                        {/* Marks details if detailed entry was used */}
                        {(course.mst1 !== undefined || course.labInternal !== undefined) && (
                          <div className="text-[10px] text-muted-foreground font-mono text-left bg-black/40 p-2 rounded-lg border border-border/30">
                            {course.type === 'theory' ? (
                              <div>
                                <span>mst1: {course.mst1}/30 • mst2: {course.mst2}/30 • Assg: {course.assignment}/10 • EndSem: {course.endsem}/100</span>
                                <div className="mt-1 text-white">Total: {(course.totalMarks ?? 0).toFixed(1)}/100</div>
                              </div>
                            ) : (
                              <div>
                                <span>Internal: {course.labInternal}/60 • External: {course.labExternal}/40</span>
                                <div className="mt-1 text-white">Total: {(course.totalMarks ?? 0).toFixed(1)}/100</div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1 text-left">
                            <span className="font-mono text-[9px] text-muted-foreground uppercase">Credits</span>
                            <select
                              value={course.credit}
                              onChange={(e) => handleUpdateSubjectField(course.id, 'credit', parseInt(e.target.value))}
                              className="bg-black border border-border text-white text-xs p-2.5 rounded-lg outline-none font-mono focus:border-white w-full"
                            >
                              {[1, 2, 3, 4, 5].map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1 text-left">
                            <span className="font-mono text-[9px] text-muted-foreground uppercase">Grade</span>
                            <select
                              value={course.grade}
                              onChange={(e) => handleUpdateSubjectField(course.id, 'grade', parseInt(e.target.value))}
                              className={`border text-xs p-2.5 rounded-lg outline-none font-mono focus:border-white w-full ${course.hasBack
                                ? 'bg-red-950/20 border-red-900 text-red-400'
                                : 'bg-black border-border text-white'
                                }`}
                            >
                              <option value={10}>S</option>
                              <option value={9}>A</option>
                              <option value={8}>B</option>
                              <option value={7}>C</option>
                              <option value={6}>D</option>
                              <option value={5}>E</option>
                              <option value={0}>F</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground border-t border-[#1A1A1A] pt-2 mt-1">
                          <span>Grade Point: <strong className="text-white">{course.hasBack ? 0 : course.grade}</strong></span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column: Save & Metadata Aside */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* Calculation details */}
            <div className="bg-[#090909] border border-border p-6 rounded-2xl flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs text-muted-foreground uppercase">CALCULATED RESULT</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-bold text-white font-mono leading-none tracking-tight">
                    {sgpa.toFixed(2)}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">SGPA</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
                <div className="flex justify-between items-center">
                  <span>Registered Credits</span>
                  <span className="font-mono text-white font-semibold">{totalCredits}</span>
                </div>
                {earnedCredits !== totalCredits && (
                  <div className="flex justify-between items-center">
                    <span>Earned Credits</span>
                    <span className="font-mono text-white font-semibold">{earnedCredits}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>Weighted Points</span>
                  <span className="font-mono text-white font-semibold">{totalPoints.toFixed(1)}</span>
                </div>
              </div>

              <Button
                onClick={handleSaveSemester}
                size="xl"
                className="w-full flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                SAVE SEMESTER
              </Button>
            </div>

            {/* Metadata panel */}
            <div className="bg-[#090909] border border-border p-6 rounded-2xl flex flex-col gap-4">
              <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">Semester Metadata</h3>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-muted-foreground uppercase">Semester Number</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={semesterNum}
                  onChange={(e) => setSemesterNum(parseInt(e.target.value) || 1)}
                  disabled={editingSemNum !== null}
                  className="bg-black border border-border text-white text-xs p-3 rounded-xl outline-none focus:border-white disabled:opacity-50 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <label className="font-mono text-[10px] text-muted-foreground uppercase">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="bg-black border border-border text-white text-xs p-3 rounded-xl outline-none focus:border-white transition-colors"
                >
                  <option value="2023-2024">2023-2024</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>
            </div>
          </aside>
        </div>

        {/* Manual entry form section */}
        <section className="border-t border-border pt-12 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Manual Subject Entry</h2>
              <p className="text-xs text-muted-foreground mt-1">Use this form to add subjects individually with custom values.</p>
            </div>

            {/* Toggles for entry mode and type */}
            <div className="flex flex-wrap gap-3">
              <div className="flex bg-neutral-900 border border-border p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEntryMode('grade')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-colors uppercase ${entryMode === 'grade' ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'
                    }`}
                >
                  Quick Grade
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('marks')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-colors uppercase ${entryMode === 'marks' ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'
                    }`}
                >
                  Detailed Marks
                </button>
              </div>

              {entryMode === 'marks' && (
                <div className="flex bg-neutral-900 border border-border p-0.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setManualType('theory')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-colors uppercase ${manualType === 'theory' ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'
                      }`}
                  >
                    Theory
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualType('lab')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-colors uppercase ${manualType === 'lab' ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'
                      }`}
                  >
                    Practical / Lab
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#090909] border border-border p-6 rounded-2xl flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end">
              {/* Common field: Name */}
              <div className="col-span-1 sm:col-span-2 md:col-span-4 flex flex-col gap-2">
                <label className="font-mono text-[10px] text-muted-foreground uppercase">Subject Name</label>
                <input
                  type="text"
                  placeholder={manualType === 'lab' ? "e.g. Object Oriented Programming Lab" : "e.g. Engineering Mathematics-I"}
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="bg-black border border-border text-white text-xs p-3 rounded-xl outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Common field: Credits */}
              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <label className="font-mono text-[10px] text-muted-foreground uppercase">Credits</label>
                <select
                  value={manualCredits}
                  onChange={(e) => setManualCredits(parseInt(e.target.value))}
                  className="bg-black border border-border text-white text-xs p-3 rounded-xl outline-none focus:border-white transition-colors"
                >
                  {[1, 2, 3, 4, 5].map(c => (
                    <option key={c} value={c}>{c} Credits</option>
                  ))}
                </select>
              </div>

              {/* Conditional fields based on Entry Mode */}
              {entryMode === 'grade' ? (
                <>
                  <div className="col-span-1 md:col-span-4 flex flex-col gap-2">
                    <label className="font-mono text-[10px] text-muted-foreground uppercase">Obtained Grade</label>
                    <select
                      value={manualGrade}
                      onChange={(e) => setManualGrade(e.target.value)}
                      className="bg-black border border-border text-white text-xs p-3 rounded-xl outline-none focus:border-white transition-colors"
                    >
                      <option value="S">S (10)</option>
                      <option value="A">A (9)</option>
                      <option value="B">B (8)</option>
                      <option value="C">C (7)</option>
                      <option value="D">D (6)</option>
                      <option value="E">E (5)</option>
                      <option value="F">F (0 / Fail)</option>
                    </select>
                  </div>
                </>
              ) : manualType === 'theory' ? (
                <>
                  <div className="col-span-1 sm:col-span-1 md:col-span-1 flex flex-col gap-2">
                    <label className="font-mono text-[9px] text-muted-foreground uppercase truncate" title="MST1 (Max 30)">mst1 (30)</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      placeholder="0-30"
                      value={mst1}
                      onChange={(e) => setMst1(e.target.value)}
                      className="bg-black border border-border text-white text-xs p-3 rounded-xl outline-none focus:border-white transition-colors font-mono"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-1 md:col-span-1 flex flex-col gap-2">
                    <label className="font-mono text-[9px] text-muted-foreground uppercase truncate" title="MST2 (Max 30)">mst2 (30)</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      placeholder="0-30"
                      value={mst2}
                      onChange={(e) => setMst2(e.target.value)}
                      className="bg-black border border-border text-white text-xs p-3 rounded-xl outline-none focus:border-white transition-colors font-mono"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-1 md:col-span-1 flex flex-col gap-2">
                    <label className="font-mono text-[9px] text-muted-foreground uppercase truncate" title="Assignment/Surprise (Max 10)">Assg (10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      placeholder="0-10"
                      value={assignment}
                      onChange={(e) => setAssignment(e.target.value)}
                      className="bg-black border border-border text-white text-xs p-3 rounded-xl outline-none focus:border-white transition-colors font-mono"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-1 md:col-span-1 flex flex-col gap-2">
                    <label className="font-mono text-[9px] text-muted-foreground uppercase truncate" title="End Semester Exam (Max 100)">EndSem (100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={endsem}
                      onChange={(e) => setEndsem(e.target.value)}
                      className="bg-black border border-border text-white text-xs p-3 rounded-xl outline-none focus:border-white transition-colors font-mono"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-1 sm:col-span-1 md:col-span-2 flex flex-col gap-2">
                    <label className="font-mono text-[10px] text-muted-foreground uppercase">Internal Lab (60)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      placeholder="0-60"
                      value={labInternal}
                      onChange={(e) => setLabInternal(e.target.value)}
                      className="bg-black border border-border text-white text-xs p-3 rounded-xl outline-none focus:border-white transition-colors font-mono"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-1 md:col-span-2 flex flex-col gap-2">
                    <label className="font-mono text-[10px] text-muted-foreground uppercase">External Lab (40)</label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      placeholder="0-40"
                      value={labExternal}
                      onChange={(e) => setLabExternal(e.target.value)}
                      className="bg-black border border-border text-white text-xs p-3 rounded-xl outline-none focus:border-white transition-colors font-mono"
                    />
                  </div>
                </>
              )}

              {/* Action Button */}
              <div className="col-span-1 sm:col-span-2 md:col-span-2">
                <Button
                  onClick={handleAddManualSubject}
                  size="xl"
                  className="w-full flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  ADD SUBJECT
                </Button>
              </div>
            </div>

            {/* Calculations preview bar */}
            {entryMode === 'marks' && (
              <div className="bg-black/60 border border-border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                <div className="flex flex-wrap gap-6 text-xs font-mono text-muted-foreground">
                  <div>
                    INTERNAL MARKS:{' '}
                    <strong className={`text-white ${manualType === 'theory' ? (theoryHasBack ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold') : (labHasBack ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold')}`}>
                      {manualType === 'theory' ? theoryInternal.toFixed(1) : labInternalVal.toFixed(1)}
                      {manualType === 'theory' ? '/40' : '/60'}
                    </strong>
                  </div>
                  <div>
                    EXTERNAL CONVERTED:{' '}
                    <strong className="text-white">
                      {manualType === 'theory' ? theoryExternalConverted.toFixed(1) : labExt.toFixed(1)}
                      {manualType === 'theory' ? '/60' : '/40'}
                    </strong>
                  </div>
                  <div>
                    TOTAL MARKS:{' '}
                    <strong className="text-white">
                      {manualType === 'theory' ? theoryTotal.toFixed(1) : labTotal.toFixed(1)}/100
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {(manualType === 'theory' ? theoryHasBack : labHasBack) && (
                    <span className="text-[10px] bg-red-950 border border-red-800 text-red-400 px-2 py-1 rounded-lg font-mono font-semibold animate-pulse">
                      ⚠️ BACKLOG (INTERNAL &lt; 20)
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground font-mono">PREDICTED GRADE:</span>
                  <span className={`font-mono text-sm px-3 py-1 rounded-lg font-bold border ${(manualType === 'theory' ? theoryHasBack : labHasBack)
                    ? 'bg-red-950 border-red-800 text-red-400'
                    : 'bg-neutral-900 border-border text-white'
                    }`}>
                    {manualType === 'theory' ? theoryGradeLetter : labGradeLetter}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      </motion.main>

      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}

export default function SGPAPage() {
  return (
    <Suspense fallback={
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-grow flex items-center justify-center font-sans"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-xs text-muted-foreground font-mono">Initializing academic editor...</p>
        </div>
      </motion.main>
    }>
      <NewSemesterForm />
    </Suspense>
  );
}
