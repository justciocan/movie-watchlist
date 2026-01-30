import { useAuth } from "../lib/AuthContext";
import { logout } from "../services/auth";

function Home() {
  const { user } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="app-container">
      <h1>Movie Watchlist</h1>
      <p>
        You are signed in as:{" "}
        <strong>{user?.email || user?.displayName}</strong>
      </p>

      <button className="auth-google" type="button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Home;
