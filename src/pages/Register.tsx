import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"guest" | "host">("guest");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg("Please fill in all of the fields.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
      });

      const { user, token } = response.data;
      login(user, token);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Registration error:", err);
      const msg = err.response?.data?.message || "Registration failed. Email standard exists or validation failed.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container container" id="register-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <UserPlus size={24} />
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Discover and book unique properties worldwide</p>
        </div>

        {errorMsg ? (
          <div className="auth-error-alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="register-name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="register-name"
              className="form-input"
              placeholder="Emma Watson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="register-email"
              className="form-input"
              placeholder="emma@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="register-password"
              className="form-input"
              placeholder="Minimum 6 characters"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-role" className="form-label">
              Account Role
            </label>
            <select
              id="register-role"
              className="form-input form-select"
              value={role}
              onChange={(e) => setRole(e.target.value as "guest" | "host")}
            >
              <option value="guest">Guest (I want to book rooms and properties)</option>
              <option value="host">Host (I want to list and rent out my properties)</option>
            </select>
            <p className="form-help-text">
              Note: Only Hosts can list new rental properties. Let's select "Host" if you want to rent rooms.
            </p>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Signing Up...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
