
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Brand } from '../components/shell'
import { apiRequest, loginForm, setAccessToken, ApiError } from '../lib/api'
import { Button, ErrorMessage, FormInput, LoadingState } from '../components/ui'

export function Login() {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const username = String(form.get('username') || '').trim()
    const password = String(form.get('password') || '')

    if (!username || !password) {
      setError('Please enter your username and password.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await apiRequest<{
        access_token: string
        token_type: string
      }>('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: loginForm(username, password).toString(),
      })

      setAccessToken(response.access_token)
      navigate('/')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Invalid username or password.')
      } else {
        setError(
          err instanceof Error
            ? err.message
            : 'Login failed. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <Brand />

        <div className="login-story-copy">
          <span className="eyebrow">
            LESS PAPERWORK. MORE POSSIBILITIES.
          </span>

          <h1>
            Your business.
            <br />
            In a better gear.
          </h1>

          <p>
            One thoughtful workspace for your motorcycles,
            <br />
            your sales, and everything in between.
          </p>

          <img
            src={`${import.meta.env.BASE_URL}images/motorcycle.png`}
            alt="Blue and chrome commuter motorcycle"
          />
        </div>

        <span className="login-story-footer">
          <ShieldCheck size={17} />
          Built for independent motorcycle dealerships.
        </span>
      </section>

      <section className="login-panel">
        <div className="login-mobile-brand">
          <Brand />
        </div>

        <div className="login-form-container">
          <h2>Welcome back.</h2>

          <p className="login-subtitle">
            Your dealership, ready when you are.
          </p>

          <form onSubmit={submit} noValidate>
            <FormInput
              id="username"
              name="username"
              label="Username"
              placeholder="Enter your username"
              autoComplete="username"
              aria-invalid={!!error}
              disabled={loading}
            />

            <FormInput
              id="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              aria-invalid={!!error}
              disabled={loading}
            >
              <button
                className="password-toggle icon-button"
                type="button"
                aria-label={show ? 'Hide password' : 'Show password'}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </FormInput>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Button type="submit" disabled={loading}>
              {loading ? (
                <LoadingState label="Signing in..." />
              ) : (
                <>
                  Sign in <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          <p className="login-footnote">
            Administrator access only.
          </p>
        </div>

        <span className="login-copyright">
          MotoDesk — Made for the way you do business.
        </span>
      </section>
    </main>
  )
}
