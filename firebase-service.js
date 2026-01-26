// firebase-service.js - Firebase Authentication & Firestore Integration
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    onSnapshot 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Global state
let currentUser = null;
let unsubscribeFirestore = null;

// Initialize Firebase Service
export function initializeFirebaseService(auth, db, onDataUpdate) {
    const provider = new GoogleAuthProvider();
    
    // Auth State Listener
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        
        if (user) {
            // User is signed in
            updateAuthUI(true, user);
            
            // Migrate localStorage data to Firestore if needed
            await migrateLocalStorageToFirestore(user.uid, db);
            
            // Listen to Firestore changes
            listenToFirestoreChanges(user.uid, db, onDataUpdate);
            
            console.log('User signed in:', user.email);
        } else {
            // User is signed out
            updateAuthUI(false);
            
            // Stop listening to Firestore
            if (unsubscribeFirestore) {
                unsubscribeFirestore();
                unsubscribeFirestore = null;
            }
            
            // Load from localStorage
            const saved = localStorage.getItem('semesters');
            if (saved && onDataUpdate) {
                onDataUpdate(JSON.parse(saved));
            }
            
            console.log('User signed out');
        }
    });
    
    // Google Sign In Handler
    document.getElementById('google-login-btn').addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Sign in error:', error);
            if (window.showNotification) {
                window.showNotification('Sign in failed: ' + error.message, 'error');
            }
        }
    });
    
    // Logout Handler
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            // Optionally clear localStorage on logout
            // localStorage.removeItem('semesters');
            await signOut(auth);
            if (window.showNotification) {
                window.showNotification('Signed out successfully', 'success');
            }
        } catch (error) {
            console.error('Sign out error:', error);
            if (window.showNotification) {
                window.showNotification('Sign out failed: ' + error.message, 'error');
            }
        }
    });
}

// Update Auth UI
function updateAuthUI(isLoggedIn, user = null) {
    const loggedOutSection = document.getElementById('auth-logged-out');
    const loggedInSection = document.getElementById('auth-logged-in');
    
    if (isLoggedIn && user) {
        loggedOutSection.classList.add('hidden');
        loggedInSection.classList.remove('hidden');
        
        // Update user info
        document.getElementById('user-name').textContent = user.displayName || user.email;
        document.getElementById('user-avatar').src = user.photoURL || 'https://via.placeholder.com/36';
    } else {
        loggedOutSection.classList.remove('hidden');
        loggedInSection.classList.add('hidden');
    }
}

// Migrate localStorage data to Firestore on first login
async function migrateLocalStorageToFirestore(uid, db) {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        
        // Check if user document already exists
        if (!userDoc.exists()) {
            // New user - migrate localStorage data if it exists
            const localData = localStorage.getItem('semesters');
            
            if (localData) {
                const semesters = JSON.parse(localData);
                await setDoc(userDocRef, {
                    semesters: semesters,
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                });
                
                console.log('Migrated localStorage data to Firestore');
                if (window.showNotification) {
                    window.showNotification('Data synced to cloud!', 'success');
                }
            } else {
                // No local data, create empty document
                await setDoc(userDocRef, {
                    semesters: [],
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                });
            }
        } else {
            // Existing user - Firestore data takes precedence
            console.log('User data already exists in Firestore');
        }
    } catch (error) {
        console.error('Migration error:', error);
        if (window.showNotification) {
            window.showNotification('Failed to sync data: ' + error.message, 'error');
        }
    }
}

// Listen to Firestore changes in real-time
function listenToFirestoreChanges(uid, db, onDataUpdate) {
    const userDocRef = doc(db, 'users', uid);
    
    unsubscribeFirestore = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const semesters = data.semesters || [];
            
            // Update localStorage for offline access
            localStorage.setItem('semesters', JSON.stringify(semesters));
            
            // Notify app to update UI
            if (onDataUpdate) {
                onDataUpdate(semesters);
            }
            
            console.log('Firestore data updated');
        }
    }, (error) => {
        console.error('Firestore listener error:', error);
    });
}

// Save semesters to Firestore
export async function saveSemestersToFirestore(semesters, db) {
    if (!currentUser) {
        // Not logged in - save to localStorage only
        localStorage.setItem('semesters', JSON.stringify(semesters));
        return;
    }
    
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        await updateDoc(userDocRef, {
            semesters: semesters,
            lastUpdated: new Date().toISOString()
        });
        
        // Also save to localStorage for offline access
        localStorage.setItem('semesters', JSON.stringify(semesters));
        
        console.log('Saved to Firestore successfully');
    } catch (error) {
        console.error('Firestore save error:', error);
        
        // Fallback to localStorage
        localStorage.setItem('semesters', JSON.stringify(semesters));
        
        if (window.showNotification) {
            window.showNotification('Saved locally (cloud sync failed)', 'warning');
        }
    }
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}

// Check if user is logged in
export function isUserLoggedIn() {
    return currentUser !== null;
}



