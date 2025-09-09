import React, { useState } from "react";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login form submitted with:", { email, password });

    try {
      setLoading(true);
      setError(null);

      // calling API for login
      const data = await loginUser({ email, password });
      console.log("API login response:", data);

      if (!data.access_token) {
        throw new Error("Token not received from backend");
      }

      // using AuthContext to save token + user
      login(data);
      console.log("Auth context updated with:", data);

      navigate("/dashboard");
      console.log("Navigated to /dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h1>Login</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button className="loginBtn" type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
