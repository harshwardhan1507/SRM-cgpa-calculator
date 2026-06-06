'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Semester } from '@/types/semester';
import { UserProfile } from '@/types/profile';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  semesters: Semester[];
  setSemesters: (semesters: Semester[]) => Promise<void>;
  profile: UserProfile | null;
  updateProfile: (profile: UserProfile) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// Deduplicate concurrent anonymous sign-in operations across double mounts
let anonymousSignInPromise: Promise<any> | null = null;

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [semesters, setSemestersState] = useState<Semester[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Load initial data from localStorage for offline/immediate display & register SW
  useEffect(() => {
    const localData = localStorage.getItem('semesters');
    if (localData) {
      try {
        setSemestersState(JSON.parse(localData));
      } catch (e) {
        console.error('Error parsing local semesters:', e);
      }
    }

    const localProfile = localStorage.getItem('profile');
    if (localProfile) {
      try {
        setProfile(JSON.parse(localProfile));
      } catch (e) {
        console.error('Error parsing local profile:', e);
      }
    }

    // Register service worker for PWA support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('ServiceWorker registration successful with scope: ', reg.scope);
      }).catch((err) => {
        console.error('ServiceWorker registration failed: ', err);
      });
    }
  }, []);

  // Listen to Auth changes
  useEffect(() => {
    let active = true;
    let unsubscribeDoc: (() => void) | undefined;

    const handleAuthChange = async (currentUser: User | null) => {
      // Clean up previous document listener if any
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = undefined;
      }

      if (!active) return;
      setUser(currentUser);
      
      if (currentUser) {
        // User logged in, check user doc in firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        try {
          const userDoc = await getDoc(userDocRef);
          if (!active) return;
          
          if (!userDoc.exists()) {
            // New user, check if we have localStorage data to migrate
            const localData = localStorage.getItem('semesters');
            let initialSemesters: Semester[] = [];
            if (localData) {
              try {
                initialSemesters = JSON.parse(localData);
              } catch (e) {}
            }
            
            await setDoc(userDocRef, {
              semesters: initialSemesters,
              createdAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString()
            });
            if (!active) return;
            setSemestersState(initialSemesters);
          }
          
          // Setup real-time listener on user doc
          unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
            if (!active) return;
            if (docSnap.exists()) {
              const data = docSnap.data();
              const cloudSemesters = data.semesters || [];
              setSemestersState(cloudSemesters);
              localStorage.setItem('semesters', JSON.stringify(cloudSemesters));

              if (data.name) {
                const newProfile = {
                  name: data.name,
                  registrationNumber: data.registrationNumber || '',
                  branch: data.branch || '',
                  program: data.program || '',
                  currentYear: data.currentYear || 1,
                  currentSemester: data.currentSemester || 1
                };
                setProfile(newProfile);
                localStorage.setItem('profile', JSON.stringify(newProfile));
              } else {
                setProfile(null);
                localStorage.removeItem('profile');
              }
            }
          });
          
          setLoading(false);
        } catch (error) {
          if (active) {
            console.error('Error fetching/setting user doc:', error);
            setLoading(false);
          }
        }
      } else {
        // Logged out / Fresh load -> Sign in anonymously (if online)
        if (typeof window !== 'undefined' && navigator.onLine) {
          try {
            if (!anonymousSignInPromise) {
              anonymousSignInPromise = signInAnonymously(auth).finally(() => {
                anonymousSignInPromise = null;
              });
            }
            await anonymousSignInPromise;
          } catch (error: any) {
            if (active) {
              if (error?.code === 'auth/admin-restricted-operation') {
                console.warn(
                  'Firebase Anonymous Auth is not enabled in the Firebase Console. ' +
                  'Please enable it under Authentication > Sign-in method > Anonymous. ' +
                  'Falling back to local storage.'
                );
              } else if (error?.code === 'auth/network-request-failed') {
                console.warn('Network error during Firebase anonymous sign-in. Falling back to local storage.');
              } else {
                console.error('Error signing in anonymously:', error);
              }
              setLoading(false);
            }
          }
        } else {
          // If offline, bypass online login and initialize local fallback
          if (active) {
            setLoading(false);
          }
        }
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      handleAuthChange(currentUser).catch((err) => {
        if (active) {
          console.error('Error handling auth change:', err);
          setLoading(false);
        }
      });
    });

    return () => {
      active = false;
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const setSemesters = async (newSemesters: Semester[]) => {
    setSemestersState(newSemesters);
    localStorage.setItem('semesters', JSON.stringify(newSemesters));
    
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          semesters: newSemesters,
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating firestore semesters:', error);
      }
    }
  };

  const updateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('profile', JSON.stringify(newProfile));
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          name: newProfile.name,
          registrationNumber: newProfile.registrationNumber,
          branch: newProfile.branch,
          program: newProfile.program,
          currentYear: newProfile.currentYear,
          currentSemester: newProfile.currentSemester,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        console.error('Error updating firestore profile:', error);
      }
    }
  };

  return (
    <FirebaseContext.Provider value={{
      user,
      loading,
      semesters,
      setSemesters,
      profile,
      updateProfile,
      loginWithGoogle,
      logout
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
