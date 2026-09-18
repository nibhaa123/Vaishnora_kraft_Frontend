import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { saveCustomer } from '../utils/auth'
import { apiFetch } from '../utils/api'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const mobilePattern = /^[6-9]\d{9}$/

const Register = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const value = identifier.trim()
    const normalizedMobile = value.replace(/\D/g, '')
    const isEmail = emailPattern.test(value)
    const isMobile = mobilePattern.test(normalizedMobile)

    if (!isEmail && !isMobile) {
      setError('Enter a valid email address or 10-digit mobile number.')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, identifier: value, password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Registration failed')
      saveCustomer({ ...result.customer, token: result.token })
      navigate('/collection', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page flex w-full justify-center px-6 py-16 sm:px-10 sm:py-24">
      <div className="auth-panel w-full max-w-md border border-slate-200 bg-white p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Create your account</p>
        <h1 className="mt-3 font-serif text-4xl text-slate-950">Join Vaishnora Kraft</h1>
        <p className="mt-3 text-sm text-slate-500">Register with your email or mobile number to place and track orders.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm font-medium">Full name
            <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" />
          </label>
          <label className="block text-sm font-medium">Email or mobile number
            <input required value={identifier} onChange={(event) => { setIdentifier(event.target.value); setError('') }} placeholder="you@example.com or 9876543210" autoComplete="username" className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" />
          </label>
          <label className="block text-sm font-medium">Password
            <input required minLength="6" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" />
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button disabled={isSubmitting} type="submit" className="w-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-950 disabled:cursor-wait disabled:opacity-60">{isSubmitting ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-semibold text-teal-800 hover:text-teal-950">Sign in</Link></p>
      </div>
    </main>
  )
}

export default Register
