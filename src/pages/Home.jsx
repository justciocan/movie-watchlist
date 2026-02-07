import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import {
  logout,
  deleteAccount,
  reauthWithGoogle,
  reauthWithPassword,
} from "../services/auth";
import { searchMovies, getPopularMovies, getPosterUrl } from "../services/tmdb";
import {
  subscribeToUserMovies,
  upsertMovie,
  removeMovie,
  deleteAllUserMovies,
} from "../services/watchlist";

function Home() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("search"); // "search" | "toWatch" | "watched"

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const [saved, setSaved] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Subscribe to user's saved movies (Firestore)
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToUserMovies(user.uid, setSaved);
    return () => unsub();
  }, [user?.uid]);

  const savedMap = useMemo(() => {
    const map = new Map();
    saved.forEach((x) => map.set(String(x.id), x));
    return map;
  }, [saved]);

  const toWatch = useMemo(
    () => saved.filter((m) => m.status === "toWatch"),
    [saved],
  );
  const watched = useMemo(
    () => saved.filter((m) => m.status === "watched"),
    [saved],
  );

  // Load popular movies when Search tab is used initially
  useEffect(() => {
    if (activeTab !== "search") return;

    (async () => {
      setError("");
      setIsLoading(true);
      try {
        const data = await getPopularMovies();
        setResults(data.results || []);
      } catch (e) {
        setError(e?.message || "Failed to load movies");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [activeTab]);

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const data = await searchMovies(query);
      setResults(data.results || []);
    } catch (e2) {
      setError(e2?.message || "Search failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveMovie(tmdbMovie, status) {
    if (!user?.uid) return;

    const movieDoc = {
      id: String(tmdbMovie.id),
      title: tmdbMovie.title,
      year: tmdbMovie.release_date ? tmdbMovie.release_date.slice(0, 4) : null,
      posterPath: tmdbMovie.poster_path || null,
      status, // "toWatch" | "watched"
    };

    await upsertMovie(user.uid, movieDoc);
  }

  async function handleRemove(movieId) {
    if (!user?.uid) return;
    await removeMovie(user.uid, movieId);
  }

  async function handleDeleteAccount() {
    if (!user?.uid) return;

    const ok = window.confirm(
      "This will permanently delete your account and all your movies. This cannot be undone.\n\nAre you sure?",
    );
    if (!ok) return;

    try {
      // Try delete normally first
      await deleteAllUserMovies(user.uid);
      await deleteAccount();
      return;
    } catch (err) {
      // If Firebase requires recent login, re-auth then retry
      if (err?.code === "auth/requires-recent-login") {
        try {
          const providers = user?.providerData?.map((p) => p.providerId) || [];

          if (providers.includes("google.com")) {
            await reauthWithGoogle();
          } else if (providers.includes("password")) {
            const pw = window.prompt(
              "Please re-enter your password to confirm account deletion:",
            );
            if (!pw) return; // user cancelled
            await reauthWithPassword(pw);
          } else {
            alert(
              "Please log out and log back in, then try deleting your account again.",
            );
            return;
          }

          // Retry after re-auth
          await deleteAllUserMovies(user.uid);
          await deleteAccount();
          return;
        } catch (reauthErr) {
          alert(reauthErr?.message || "Re-authentication failed");
          return;
        }
      }

      alert(err?.message || "Account deletion failed");
    }
  }

  function renderMovieCardFromTmdb(m) {
    const poster = getPosterUrl(m.poster_path);
    const year = m.release_date ? m.release_date.slice(0, 4) : "—";

    const isSaved = savedMap.has(String(m.id));
    const savedStatus = isSaved ? savedMap.get(String(m.id))?.status : null;

    return (
      <div className="card" key={m.id}>
        <div className="poster">
          {poster ? (
            <img src={poster} alt={m.title} />
          ) : (
            <div className="poster-fallback">No image</div>
          )}
        </div>

        <div className="card-body">
          <div className="card-title">{m.title}</div>
          <div className="muted">{year}</div>

          <div className="actions">
            <button
              className={`btn btn-secondary btn-small ${savedStatus === "toWatch" ? "btn-selected" : ""}`}
              type="button"
              onClick={() => saveMovie(m, "toWatch")}
              disabled={savedStatus === "toWatch"}
            >
              + To Watch
            </button>

            <button
              className={`btn btn-secondary btn-small ${savedStatus === "watched" ? "btn-selected" : ""}`}
              type="button"
              onClick={() => saveMovie(m, "watched")}
              disabled={savedStatus === "watched"}
            >
              ✓ Watched
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderMovieCardFromFirestore(m) {
    const poster = m.posterPath ? getPosterUrl(m.posterPath) : null;

    return (
      <div className="card" key={m.id}>
        <div className="poster">
          {poster ? (
            <img src={poster} alt={m.title} />
          ) : (
            <div className="poster-fallback">No image</div>
          )}
        </div>

        <div className="card-body">
          <div className="card-title">{m.title}</div>
          <div className="muted">{m.year || "—"}</div>

          <div className="actions">
            <button
              className="btn btn-secondary btn-small"
              type="button"
              onClick={() => handleRemove(m.id)}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="topbar">
        <div>
          <h1 className="page-title">Movie Watchlist</h1>
          <p className="muted">
            Signed in as <strong>{user?.email || user?.displayName}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary" onClick={logout}>
            Logout
          </button>

          <button
            className="btn btn-danger"
            onClick={handleDeleteAccount}
            title="Delete account permanently"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "search" ? "tab-active" : ""}`}
          type="button"
          onClick={() => setActiveTab("search")}
        >
          Search
        </button>

        <button
          className={`tab ${activeTab === "toWatch" ? "tab-active" : ""}`}
          type="button"
          onClick={() => setActiveTab("toWatch")}
        >
          To Watch ({toWatch.length})
        </button>

        <button
          className={`tab ${activeTab === "watched" ? "tab-active" : ""}`}
          type="button"
          onClick={() => setActiveTab("watched")}
        >
          Watched ({watched.length})
        </button>
      </div>

      {/* SEARCH TAB */}
      {activeTab === "search" && (
        <>
          <form className="searchbar" onSubmit={handleSearch}>
            <input
              className="input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies..."
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isLoading}
            >
              Search
            </button>
          </form>

          {error && <div className="notice notice-error">{error}</div>}
          {isLoading && <div className="notice">Loading...</div>}

          <h2 className="section-title">Results</h2>
          <div className="grid">{results.map(renderMovieCardFromTmdb)}</div>
        </>
      )}

      {/* TO WATCH TAB */}
      {activeTab === "toWatch" && (
        <>
          <h2 className="section-title">To Watch</h2>
          {toWatch.length === 0 ? (
            <p className="muted">No movies yet.</p>
          ) : (
            <div className="grid">
              {toWatch.map(renderMovieCardFromFirestore)}
            </div>
          )}
        </>
      )}

      {/* WATCHED TAB */}
      {activeTab === "watched" && (
        <>
          <h2 className="section-title">Watched</h2>
          {watched.length === 0 ? (
            <p className="muted">No movies yet.</p>
          ) : (
            <div className="grid">
              {watched.map(renderMovieCardFromFirestore)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
