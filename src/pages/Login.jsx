import React, { useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams
} from 'react-router-dom'
import { saveCustomer } from '../utils/auth'
import { apiFetch } from '../utils/api'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const isAdminLogin = searchParams.get('role') === 'admin'

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Password vs OTP login mode (customers only, not admin)
  const [loginMode, setLoginMode] = useState('password')
  const [loginOtpSent, setLoginOtpSent] = useState(false)
  const [loginOtp, setLoginOtp] = useState('')

  // Forgot password states
  const [forgotPassword, setForgotPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // =========================================================
  // LOGIN (password)
  // =========================================================
  const handleSubmit = async (event) => {
    event.preventDefault()

    setIsSubmitting(true)
    setError('')
    setMessage('')

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier,
          password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Login failed')
      }

      saveCustomer({
        ...result.customer,
        token: result.token
      })

      navigate(
        isAdminLogin
          ? '/admin'
          : (location.state?.from || '/collection'),
        {
          replace: true
        }
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // =========================================================
  // SEND OTP - LOGIN (passwordless)
  // =========================================================
  const handleSendLoginOtp = async (event) => {
    event.preventDefault()

    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      const response = await apiFetch('/api/auth/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || 'Unable to send OTP'
        )
      }

      setLoginOtpSent(true)

      setMessage(
        result.message || 'OTP sent successfully'
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // =========================================================
  // VERIFY OTP - LOGIN (passwordless)
  // =========================================================
  const handleVerifyLoginOtp = async (event) => {
    event.preventDefault()

    setError('')
    setMessage('')

    if (!/^\d{6}$/.test(loginOtp)) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await apiFetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier,
          otp: loginOtp
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'OTP verification failed')
      }

      saveCustomer({
        ...result.customer,
        token: result.token
      })

      navigate(location.state?.from || '/collection', {
        replace: true
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // =========================================================
  // SWITCH LOGIN MODE (password <-> otp)
  // =========================================================
  const handleSwitchLoginMode = (mode) => {
    setLoginMode(mode)
    setLoginOtpSent(false)
    setLoginOtp('')
    setError('')
    setMessage('')
  }

  // =========================================================
  // SEND OTP - FORGOT PASSWORD
  // =========================================================
  const handleSendOtp = async (event) => {
    event.preventDefault()

    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      const response = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || 'Unable to send OTP'
        )
      }

      setOtpSent(true)

      setMessage(
        result.message || 'OTP sent successfully'
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // =========================================================
  // RESET PASSWORD
  // =========================================================
  const handleResetPassword = async (event) => {
    event.preventDefault()

    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await apiFetch(
        '/api/auth/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            identifier,
            otp,
            newPassword
          })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || 'Password reset failed'
        )
      }

      setMessage(
        'Password reset successfully. Please login.'
      )

      // Reset forgot password states
      setForgotPassword(false)
      setOtpSent(false)
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
      setPassword('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // =========================================================
  // BACK TO LOGIN
  // =========================================================
  const handleBackToLogin = () => {
    setForgotPassword(false)
    setOtpSent(false)
    setOtp('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setMessage('')
  }

  // =========================================================
  // FORGOT PASSWORD UI
  // =========================================================
  if (forgotPassword) {
    return (
      <main className="auth-page flex w-full justify-center px-6 py-16 sm:px-10 sm:py-24">
        <div className="auth-panel w-full max-w-md border border-slate-200 bg-white p-8 sm:p-10">

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Account recovery
          </p>

          <h1 className="mt-3 font-serif text-4xl text-slate-950">
            Forgot Password
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Reset your password using an OTP.
          </p>

          {!otpSent ? (
            <form
              onSubmit={handleSendOtp}
              className="mt-8 space-y-5"
            >
              <label className="block text-sm font-medium">
                Email or mobile number

                <input
                  required
                  type="text"
                  value={identifier}
                  onChange={(event) =>
                    setIdentifier(event.target.value)
                  }
                  placeholder="Enter email or mobile"
                  className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700"
                />
              </label>

              {error && (
                <p
                  role="alert"
                  className="text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {message && (
                <p className="text-sm text-green-700">
                  {message}
                </p>
              )}

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-950 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Sending OTP...'
                  : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleResetPassword}
              className="mt-8 space-y-5"
            >
              <label className="block text-sm font-medium">
                Enter OTP

                <input
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value.replace(/\D/g, '')
                    )
                  }
                  placeholder="6-digit OTP"
                  className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700"
                />
              </label>

              <label className="block text-sm font-medium">
                New Password

                <input
                  required
                  minLength="6"
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  placeholder="New password"
                  className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700"
                />
              </label>

              <label className="block text-sm font-medium">
                Confirm Password

                <input
                  required
                  minLength="6"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm password"
                  className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700"
                />
              </label>

              {error && (
                <p
                  role="alert"
                  className="text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {message && (
                <p className="text-sm text-green-700">
                  {message}
                </p>
              )}

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-950 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Resetting...'
                  : 'Reset Password'}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={handleBackToLogin}
            className="mt-6 w-full text-center text-sm font-semibold text-teal-800 hover:text-teal-950"
          >
            ← Back to Login
          </button>
        </div>
      </main>
    )
  }

  // =========================================================
  // NORMAL LOGIN UI
  // =========================================================
  return (
    <main className="auth-page flex w-full justify-center px-6 py-16 sm:px-10 sm:py-24">
      <div className="auth-panel w-full max-w-md border border-slate-200 bg-white p-8 sm:p-10">

        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
          {isAdminLogin
            ? 'Administrator access'
            : 'Welcome back'}
        </p>

        <h1 className="mt-3 font-serif text-4xl text-slate-950">
          {isAdminLogin
            ? 'Sign in to manage gifts'
            : 'Sign in to order'}
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          {isAdminLogin
            ? 'Use the administrator credentials configured for this store.'
            : 'Sign in with your email or mobile number to track your festival gift orders.'}
        </p>

        {!isAdminLogin && (
          <div className="mt-6 grid grid-cols-2 border border-slate-200 text-sm font-semibold">
            <button
              type="button"
              onClick={() => handleSwitchLoginMode('password')}
              className={`px-4 py-2 transition ${
                loginMode === 'password'
                  ? 'bg-teal-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Password
            </button>

            <button
              type="button"
              onClick={() => handleSwitchLoginMode('otp')}
              className={`px-4 py-2 transition ${
                loginMode === 'otp'
                  ? 'bg-teal-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              OTP
            </button>
          </div>
        )}

        {/* -------------------------------------------------
            PASSWORD LOGIN FORM
        ------------------------------------------------- */}
        {(isAdminLogin || loginMode === 'password') && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <label className="block text-sm font-medium">
              {isAdminLogin
                ? 'Admin email'
                : 'Email or mobile number'}

              <input
                required
                type={isAdminLogin ? 'email' : 'text'}
                value={identifier}
                onChange={(event) =>
                  setIdentifier(event.target.value)
                }
                autoComplete="username"
                className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700"
              />
            </label>

            <label className="block text-sm font-medium">
              Password

              <input
                required
                minLength="6"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700"
              />
            </label>

            {!isAdminLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setForgotPassword(true)
                    setError('')
                    setMessage('')
                  }}
                  className="text-sm font-semibold text-teal-800 hover:text-teal-950"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {message && (
              <p className="text-sm text-green-700">
                {message}
              </p>
            )}

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-950 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting
                ? 'Signing in...'
                : isAdminLogin
                  ? 'Open admin dashboard'
                  : 'Continue to checkout'}
            </button>
          </form>
        )}

        {/* -------------------------------------------------
            OTP LOGIN FORM (customers only)
        ------------------------------------------------- */}
        {!isAdminLogin && loginMode === 'otp' && (
          !loginOtpSent ? (
            <form
              onSubmit={handleSendLoginOtp}
              className="mt-8 space-y-5"
            >
              <label className="block text-sm font-medium">
                Email or mobile number

                <input
                  required
                  type="text"
                  value={identifier}
                  onChange={(event) =>
                    setIdentifier(event.target.value)
                  }
                  autoComplete="username"
                  className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700"
                />
              </label>

              {error && (
                <p
                  role="alert"
                  className="text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {message && (
                <p className="text-sm text-green-700">
                  {message}
                </p>
              )}

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-950 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Sending OTP...'
                  : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyLoginOtp}
              className="mt-8 space-y-5"
            >
              <p className="text-sm text-slate-500">
                Enter the OTP sent to{' '}
                <span className="font-semibold text-slate-800">
                  {identifier}
                </span>
              </p>

              <label className="block text-sm font-medium">
                Enter OTP

                <input
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  value={loginOtp}
                  onChange={(event) =>
                    setLoginOtp(
                      event.target.value.replace(/\D/g, '')
                    )
                  }
                  placeholder="6-digit OTP"
                  className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700"
                />
              </label>

              {error && (
                <p
                  role="alert"
                  className="text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {message && (
                <p className="text-sm text-green-700">
                  {message}
                </p>
              )}

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-950 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Verifying...'
                  : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={handleSendLoginOtp}
                disabled={isSubmitting}
                className="w-full text-center text-sm font-semibold text-teal-800 hover:text-teal-950 disabled:opacity-60"
              >
                Resend OTP
              </button>
            </form>
          )
        )}

        {!isAdminLogin && (
          <p className="mt-6 text-center text-sm text-slate-500">
            New here?{' '}

            <Link
              to="/register"
              className="font-semibold text-teal-800 hover:text-teal-950"
            >
              Create an account
            </Link>
          </p>
        )}

        {isAdminLogin && (
          <p className="mt-6 text-center text-sm text-slate-500">
            <Link
              to="/login"
              className="font-semibold text-teal-800 hover:text-teal-950"
            >
              Customer login
            </Link>
          </p>
        )}
      </div>
    </main>
  )
}

export default Login
