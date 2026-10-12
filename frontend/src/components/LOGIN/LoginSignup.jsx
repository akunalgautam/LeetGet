import { useState } from "react";
import "../../../public/styles/loginSignup.css";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import getErrorMessage from "../../api/getErrorMessage";
import { useAuth } from "../../context/AuthContext";

function LoginSignup({ mode }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const isRegister = mode === "register";

  const [details, setDetails] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
    if (error) setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isRegister && details.password !== details.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        const { data } = await api.post("/api/register", {
          username: details.name,
          email: details.email,
          password: details.password,
        });
        login(data.token, data.user);
      } else {
        const { data } = await api.post("/api/login", {
          email: details.email,
          password: details.password,
        });
        login(data.token, data.user);
      }
      navigate("/");
    } catch (err) {
      setError(
        getErrorMessage(err, isRegister ? "Couldn't register that account." : "Couldn't log in.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="login-container">
        <div className="login-header">
          <div className="login-text">{isRegister ? "Register" : "Login"}</div>
          <div className="underline"></div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="login-inputs">
            {isRegister && (
              <div className="login-input">
                <input
                  className="login-input1"
                  type="text"
                  name="name"
                  placeholder="Username"
                  value={details.name}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            )}
            <div className="login-input">
              <input
                className="login-input1"
                type="email"
                name="email"
                placeholder="email"
                value={details.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            <div className="login-input">
              <input
                type="password"
                name="password"
                placeholder="password"
                className="login-input1"
                value={details.password}
                onChange={handleChange}
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
            </div>
            {isRegister && (
              <div className="login-input">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="confirm password"
                  className="login-input1"
                  value={details.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            )}
          </div>

          {error && <p className="login-error">{error}</p>}

          <div className="submit-container">
            {isRegister ? (
              <button id="2" type="submit" className="login-register" disabled={submitting}>
                {submitting ? "..." : "Register"}
              </button>
            ) : (
              <button id="1" type="submit" className="login-submit" disabled={submitting}>
                {submitting ? "..." : "Login"}
              </button>
            )}
          </div>
        </form>
        <div className="forgot-password-container">
          {isRegister ? (
            <Link className="forgot-password" to="/login">
              Already have an account?
            </Link>
          ) : (
            <Link className="forgot-password" to="/register">
              New user?
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
export default LoginSignup;
