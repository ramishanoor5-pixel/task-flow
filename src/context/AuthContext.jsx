import { createContext, useContext, useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

const AuthContext = createContext(null)

// Human-friendly error translation for Firebase Auth error codes
export function formatAuthError(err) {
  const code = err?.code || (typeof err === 'string' ? err : '')
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in.'
    case 'auth/invalid-email':
      return 'Please provide a valid email address.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in Firebase Console (Authentication > Sign-in method).'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'
    case 'auth/user-not-found':
      return 'No account found with this email address.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please double-check and try again.'
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access has been temporarily paused. Try again later.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.'
    default:
      return err?.message || 'Authentication failed. Please verify your details and try again.'
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // User Signup
  const signup = async (email, password, displayName) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please verify .env.local credentials.')
    }

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
        console.warn('Note on Firestore user profile:', dbErr.message)
      }
    }

    return user
  }

  // User Login (Strict validation via Firebase Auth)
  const login = async (email, password) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please verify .env.local credentials.')
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  }

  // User Logout
  const logout = async () => {
    if (auth) {
      await signOut(auth)
    }
    setCurrentUser(null)
  }

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
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
