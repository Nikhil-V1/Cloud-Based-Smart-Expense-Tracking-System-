import { initializeApp, getApps } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Object.values(config).every(Boolean)

const app = firebaseConfigured
  ? getApps()[0] ?? initializeApp(config)
  : null
const auth = app ? getAuth(app) : null
const db = app ? getFirestore(app) : null

export type AuthUser = {
  userId: string
  email: string
}

export type Expense = {
  id: string
  title: string
  amount: number
  category: string
  expense_date: string
}

function requireFirebase() {
  if (!auth || !db) throw new Error('Firebase is not configured.')
  return { auth, db }
}

export function observeAuth(callback: (user: AuthUser | null) => void) {
  if (!auth) {
    callback(null)
    return () => undefined
  }
  return onAuthStateChanged(auth, (user) => callback(user ? toAuthUser(user) : null))
}

function toAuthUser(user: User): AuthUser {
  return { userId: user.uid, email: user.email ?? '' }
}

export async function createAccount(email: string, password: string) {
  const { auth } = requireFirebase()
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function login(email: string, password: string) {
  const { auth } = requireFirebase()
  return signInWithEmailAndPassword(auth, email, password)
}

export async function logout() {
  const { auth } = requireFirebase()
  await signOut(auth)
}

export function observeExpenses(
  userId: string,
  callback: (expenses: Expense[]) => void,
  onError: (error: Error) => void,
) {
  const { db } = requireFirebase()
  return onSnapshot(query(collection(db, 'expenses'), where('userId', '==', userId)), (snapshot) => {
    const expenses = snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }) as Expense)
      .sort((a, b) => b.expense_date.localeCompare(a.expense_date))
    callback(expenses)
  }, onError)
}

export async function addExpense(
  userId: string,
  expense: Omit<Expense, 'id'>,
): Promise<Expense> {
  const { db } = requireFirebase()
  const reference = await addDoc(collection(db, 'expenses'), { ...expense, userId })
  return { ...expense, id: reference.id }
}

export async function deleteExpense(id: string) {
  const { db } = requireFirebase()
  await deleteDoc(doc(db, 'expenses', id))
}
