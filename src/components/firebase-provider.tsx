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
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // User logged in, check user doc in firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        try {
          const userDoc = await getDoc(userDocRef);
          
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
            setSemestersState(initialSemesters);
          }
          
          // Setup real-time listener on user doc
          const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const cloudSemesters = data.semesters || [];
              setSemestersState(cloudSemesters);
              localStorage.setItem('semesters', JSON.stringify(cloudSemesters));

              if (data.name) {
                setProfile({
                  name: data.name,
                  registrationNumber: data.registrationNumber || '',
                  branch: data.branch || '',
                  program: data.program || '',
                  currentYear: data.currentYear || 1,
                  currentSemester: data.currentSemester || 1
                });
              } else {
                setProfile(null);
              }
            }
          });
          
          setLoading(false);
          return () => {
            unsubscribeDoc();
          };
        } catch (error) {
          console.error('Error fetching/setting user doc:', error);
          setLoading(false);
        }
      } else {
        // Logged out / Fresh load -> Sign in anonymously
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Error signing in anonymously:', error);
          setLoading(false);
        }
      }
    });

    return () => {
      unsubscribeAuth();
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
