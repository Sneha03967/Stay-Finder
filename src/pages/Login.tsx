import { useState, FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { LogIn, Loader2, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to dashboard or where the user was heading before forced login redirection
  const fromPath = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please complete all field elements.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { user, token } = response.data;
      login(user, token);
      navigate(fromPath, { replace: true });
    } catch (err: any) {
      console.error("Login attempt failure:", err);
      const msg = err.response?.data?.message || "Invalid credentials credentials. Hint: john@example.com / password123";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container container" id="login-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <LogIn size={24} />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Log in to manage bookings and properties</p>
        </div>

        {errorMsg ? (
          <div className="auth-error-alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="login-email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="login-password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New to StayFinder? <Link to="/register" className="auth-link">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
