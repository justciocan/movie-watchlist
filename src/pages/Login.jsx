import { useState } from "react";
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  resetPassword,
} from "../services/auth";

function Login() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-container">
      <div className="auth-card">
        <h1 className="auth-title">Movie Watchlist</h1>
        <p className="auth-subtitle">
          {mode === "signin"
            ? "Sign in to manage your lists."
            : "Create an account to save your lists."}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Email
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-label">
            Password
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              required
              minLength={6}
            />
          </label>
          {mode === "signup" && (
            <label className="auth-label">
              Confirm Password
              <input
                className="auth-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </label>
          )}

          {mode === "signin" && (
            <button
              type="button"
              className="auth-link auth-forgot"
              onClick={async () => {
                if (!email) {
                  setError("Enter your email first");
                  return;
                }
                try {
                  await resetPassword(email);
                  setError("Password reset email sent");
                } catch (err) {
                  setError(err.message);
                }
              }}
            >
              Forgot password?
            </button>
          )}

          <button
            className="auth-primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Working..."
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}
          </button>

          <button
            className="auth-google"
            type="button"
            onClick={handleGoogle}
            disabled={isSubmitting}
          >
            Continue with Google
          </button>
        </form>

        <div className="auth-switch">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                className="auth-link"
                type="button"
                onClick={() => {
                  setMode("signup");
                  setConfirmPassword("");
                  setError("");
                }}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="auth-link"
                type="button"
                onClick={() => {
                  setMode("signin");
                  setConfirmPassword("");
                  setError("");
                }}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
