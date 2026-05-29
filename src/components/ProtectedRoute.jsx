import "./ProtectedRoute.css";

export default function ProtectedRoute({ user, onLogout, children }) {
  if (!user) {
    return null;
  }

  return (
    <>
      <nav className="protected-navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <h2>Resume Search System</h2>
          </div>
          <div className="navbar-user">
            <span className="user-info">
              👤 {user.user_name} ({user.user_id})
            </span>
            <button className="btn btn-sm btn-outline-danger" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="protected-content">
        {children}
      </div>
    </>
  );
}
