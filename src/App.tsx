import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import './index.css'

type Expense = {
  id: string
  title: string
  amount: number
  category: string
  expense_date: string
}

const categories = ['Food', 'Transport', 'Housing', 'Shopping', 'Health', 'Other']
const demoExpenses: Expense[] = [
  { id: '1', title: 'Weekly groceries', amount: 64.5, category: 'Food', expense_date: '2026-10-08' },
  { id: '2', title: 'Train ticket', amount: 18, category: 'Transport', expense_date: '2026-10-06' },
  { id: '3', title: 'Streaming subscription', amount: 12.99, category: 'Other', expense_date: '2026-10-01' },
]

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>(demoExpenses)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [message, setMessage] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Food',
    expense_date: new Date().toISOString().slice(0, 10),
  })

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !session) return
    async function loadExpenses() {
      const { data, error } = await supabase!
        .from('expenses')
        .select('id, title, amount, category, expense_date')
        .order('expense_date', { ascending: false })
      if (error) setMessage(error.message)
      else setExpenses((data as Expense[]) ?? [])
    }
    void loadExpenses()
  }, [session])

  const total = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses])

  async function handleAuth(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (!supabase) {
      setMessage('Demo mode is active. Add your Supabase values to .env.local to enable login.')
      return
    }
    const result =
      authMode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
    if (result.error) setMessage(result.error.message)
    else setMessage(authMode === 'signup' ? 'Account created. Check your email to confirm it.' : 'Welcome back!')
  }

  async function addExpense(event: FormEvent) {
    event.preventDefault()
    const amount = Number(form.amount)
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) {
      setMessage('Enter a title and an amount greater than zero.')
      return
    }
    const newExpense = { ...form, title: form.title.trim(), amount }
    if (supabase && session) {
      const { data, error } = await supabase
        .from('expenses')
        .insert({ ...newExpense, user_id: session.user.id })
        .select('id, title, amount, category, expense_date')
        .single()
      if (error) {
        setMessage(error.message)
        return
      }
      setExpenses((current) => [data as Expense, ...current])
    } else {
      setExpenses((current) => [{ ...newExpense, id: crypto.randomUUID() }, ...current])
      setMessage('Saved locally in demo mode.')
    }
    setForm({ title: '', amount: '', category: 'Food', expense_date: new Date().toISOString().slice(0, 10) })
  }

  async function deleteExpense(id: string) {
    if (supabase && session) {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) {
        setMessage(error.message)
        return
      }
    }
    setExpenses((current) => current.filter((expense) => expense.id !== id))
  }

  async function signOut() {
    await supabase?.auth.signOut()
    setSession(null)
    setExpenses(demoExpenses)
  }

  if (loading) return <main className="loading-screen">Loading your expense tracker...</main>

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19a1 1 0 1 1 0 2H6.5A.5.5 0 0 0 6 7.5v9a.5.5 0 0 0 .5.5H19a1 1 0 1 1 0 2H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" />
              <path d="M19 9h-4a3 3 0 1 0 0 6h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2Zm-4 4a1 1 0 1 1 0-2h4v2h-4Z" />
            </svg>
          </span>
          <span>spendwise</span>
        </a>
        {session ? (
          <div className="account">
            <span>{session.user.email}</span>
            <button className="button button-ghost" onClick={signOut}>Log out</button>
          </div>
        ) : (
          <span className="secure-label">Simple. Secure. Yours.</span>
        )}
      </header>

      {!supabase && (
        <div className="demo-banner">
          <strong>Demo mode</strong>
          <span>Sample expenses are shown. Supabase login and cloud saving will activate after you add your project values to <code>.env.local</code>.</span>
        </div>
      )}

      {!session && (
        <section className="auth-card">
          <div>
            <p className="eyebrow">YOUR MONEY, CLEARLY</p>
            <h1>Spend with intention.</h1>
            <p className="muted">Track the everyday expenses that shape your bigger picture.</p>
          </div>
          <form className="auth-form" onSubmit={handleAuth}>
            <div className="tabs">
              <button type="button" className={authMode === 'login' ? 'tab active' : 'tab'} onClick={() => setAuthMode('login')}>Log in</button>
              <button type="button" className={authMode === 'signup' ? 'tab active' : 'tab'} onClick={() => setAuthMode('signup')}>Create account</button>
            </div>
            <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
            <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} required /></label>
            <button className="button button-primary" type="submit">{authMode === 'login' ? 'Log in' : 'Create account'} <span>→</span></button>
            {message && <p className="form-message">{message}</p>}
          </form>
        </section>
      )}

      <section className="dashboard">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h2>{session ? 'Your spending' : 'A quick look at your spending'}</h2>
          </div>
          <span className="date-chip">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
        <div className="stats">
          <article className="stat-card stat-highlight"><span>Total spending</span><strong>{formatMoney(total)}</strong><small>Across {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}</small></article>
          <article className="stat-card"><span>Average expense</span><strong>{formatMoney(expenses.length ? total / expenses.length : 0)}</strong><small>Per transaction</small></article>
          <article className="stat-card"><span>Top category</span><strong>{expenses.length ? (categories.find((category) => expenses.filter((expense) => expense.category === category).length === Math.max(...categories.map((item) => expenses.filter((expense) => expense.category === item).length))) ?? '—') : '—'}</strong><small>By number of expenses</small></article>
        </div>

        <div className="content-grid">
          <section className="panel">
            <div className="panel-heading"><div><p className="eyebrow">NEW ENTRY</p><h3>Add an expense</h3></div><span className="plus-icon">+</span></div>
            <form className="expense-form" onSubmit={addExpense}>
              <label>What was it for?<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Morning coffee" /></label>
              <div className="two-columns">
                <label>Amount (₹)<input type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0.00" /></label>
                <label>Date<input type="date" value={form.expense_date} onChange={(event) => setForm({ ...form, expense_date: event.target.value })} /></label>
              </div>
              <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
              <button className="button button-primary" type="submit">Add expense <span>→</span></button>
              {message && session && <p className="form-message">{message}</p>}
            </form>
          </section>

          <section className="panel expenses-panel">
            <div className="panel-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h3>Your expenses</h3></div><span className="expense-count">{expenses.length}</span></div>
            {expenses.length === 0 ? <div className="empty-state"><p>No expenses yet.</p><span>Add your first expense to get started.</span></div> : <div className="expense-list">{expenses.map((expense) => <article className="expense-row" key={expense.id}><div className={`category-dot category-${expense.category.toLowerCase()}`}></div><div className="expense-info"><strong>{expense.title}</strong><span>{expense.category} · {new Date(`${expense.expense_date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div><strong className="expense-amount">{formatMoney(expense.amount)}</strong><button className="delete-button" onClick={() => deleteExpense(expense.id)} aria-label={`Delete ${expense.title}`}>×</button></article>)}</div>}
          </section>
        </div>
      </section>
      <footer>Built for a calmer relationship with money <span>✦</span></footer>
    </main>
  )
}

export default App
