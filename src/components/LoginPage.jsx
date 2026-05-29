import { useState } from "react";
import "./LoginPage.css";

const API = "http://localhost:5000/api";

export default function LoginPage({ onLoginSuccess }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, password })
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        setError("Server error: Backend not responding correctly. Make sure it's running.");
        console.error("Response not JSON:", await response.text());
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Store user in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        // Notify parent component
        onLoginSuccess(data.user);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Login error: " + err.message + ". Check if backend is running on http://localhost:5000");
      console.error("Login error details:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Resume Search System</h1>
        <h2>Login</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              className="form-control"
              placeholder="e.g., emp001"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="abc@123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-info mt-3">
          <p className="text-muted">Demo Credentials:</p>
          <ul className="text-muted small">
            <li>User ID: <strong>emp001</strong>, emp002, emp003, emp004</li>
            <li>Password: <strong>abc@123</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
