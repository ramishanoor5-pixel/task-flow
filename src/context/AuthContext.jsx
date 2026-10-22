import { createContext, useContext, useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../config/firebase'

const AuthContext = createContext(null)

// Human-friendly error translation for Firebase Auth error codes
export function formatAuthError(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Try logging in.'
    case 'auth/invalid-email':
      return 'Please provide a valid email address.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in the Firebase Console.'
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'
    case 'auth/user-not-found':
      return 'No account found with this email address.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please double check and try again.'
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access has been temporarily paused. Try again later.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.'
    default:
      return 'Authentication failed. Please verify your details and try again.'
  }
}

// Local storage key for demo sandbox mode
const DEMO_USER_KEY = 'taskflow_demo_user'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If Firebase keys are configured, use official Firebase Auth listener
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user)
        setLoading(false)
      })
      return unsubscribe
    }

    // Fallback sandbox mode when Firebase env keys are still at placeholder values
    const savedDemoUser = localStorage.getItem(DEMO_USER_KEY)
    if (savedDemoUser) {
      try {
        setCurrentUser(JSON.parse(savedDemoUser))
      } catch (err) {
        console.error('Failed to parse demo session:', err)
      }
    }
    setLoading(false)
  }, [])

  // User Signup
  const signup = async (email, password, displayName) => {
    if (isFirebaseConfigured && auth) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Set display name in Firebase Auth profile
      if (displayName) {
        await updateProfile(user, { displayName })
      }

      // Store user record in Firestore
      if (db) {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: displayName || email.split('@')[0],
            email: user.email,
            createdAt: serverTimestamp(),
          })
        } catch (dbErr) {
          console.warn('Note: Could not create user profile document in Firestore:', dbErr.message)
        }
      }

      return user
    }

    // Demo fallback mode for local testing before .env keys are filled
    const mockUser = {
      uid: 'demo_user_' + Math.random().toString(36).substring(2, 8),
      email,
      displayName: displayName || email.split('@')[0],
      isDemo: true,
    }
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser))
    setCurrentUser(mockUser)
    return mockUser
  }

  // User Login
  const login = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    }

    // Demo fallback mode
    const mockUser = {
      uid: 'demo_user_101',
      email,
      displayName: email.split('@')[0],
      isDemo: true,
    }
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser))
    setCurrentUser(mockUser)
    return mockUser
  }

  // User Logout
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth)
    }
    localStorage.removeItem(DEMO_USER_KEY)
    setCurrentUser(null)
  }

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    isFirebaseConfigured,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
