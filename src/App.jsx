import { useState, useEffect } from "react";
import "./App.css";
import LoginPage from "./components/LoginPage";
import SearchPage from "./components/SearchPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";

const API = "/api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= CHECK IF USER IS LOGGED IN ================= */

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  /* ================= HANDLE LOGIN SUCCESS ================= */

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  /* ================= HANDLE LOGOUT ================= */

  const handleLogout = async () => {
    try {
      // Send logout request to backend
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id })
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    // Clear local state
    localStorage.removeItem("user");
    setUser(null);
  };

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        fontSize: "18px"
      }}>
        Loading...
      </div>
    );
  }

  /* ================= RENDER ================= */

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <ProtectedRoute user={user} onLogout={handleLogout}>
      <SearchPage user={user} />
    </ProtectedRoute>
  );
}

export default App;

