import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { logout } from "../services/auth";
import { searchMovies, getPopularMovies, getPosterUrl } from "../services/tmdb";
import {
  subscribeToUserMovies,
  upsertMovie,
  removeMovie,
} from "../services/watchlist";

function Home() {
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [saved, setSaved] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToUserMovies(user.uid, setSaved);
    return () => unsub();
  }, [user?.uid]);

  const savedMap = useMemo(() => {
    const m = new Map();
    saved.forEach((x) => m.set(String(x.id), x));
    return m;
  }, [saved]);

  const toWatch = saved.filter((m) => m.status === "toWatch");
  const watched = saved.filter((m) => m.status === "watched");

  useEffect(() => {
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
  }, []);

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

  return (
    <div className="app-container">
      <div className="topbar">
        <div>
          <h1 className="page-title">Movie Watchlist</h1>
          <p className="muted">
            Signed in as <strong>{user?.email || user?.displayName}</strong>
          </p>
        </div>

        <button className="btn btn-secondary" type="button" onClick={logout}>
          Logout
        </button>
      </div>

      <form className="searchbar" onSubmit={handleSearch}>
        <input
          className="input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies..."
        />
        <button className="btn btn-primary" type="submit" disabled={isLoading}>
          Search
        </button>
      </form>

      {error && <div className="notice notice-error">{error}</div>}
      {isLoading && <div className="notice">Loading...</div>}

      <h2 className="section-title">Results</h2>
      <div className="grid">
        {results.map((m) => {
          const poster = getPosterUrl(m.poster_path);
          const year = m.release_date ? m.release_date.slice(0, 4) : "—";
          const isSaved = savedMap.has(String(m.id));
          const savedStatus = isSaved
            ? savedMap.get(String(m.id))?.status
            : null;

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
                    className="btn btn-secondary btn-small"
                    type="button"
                    onClick={() => saveMovie(m, "toWatch")}
                    disabled={savedStatus === "toWatch"}
                  >
                    + To Watch
                  </button>
                  <button
                    className="btn btn-secondary btn-small"
                    type="button"
                    onClick={() => saveMovie(m, "watched")}
                    disabled={savedStatus === "watched"}
                  >
                    ✓ Watched
                  </button>
                </div>

                {isSaved && <div className="badge">Saved: {savedStatus}</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="lists">
        <div>
          <h2 className="section-title">To Watch ({toWatch.length})</h2>
          {toWatch.length === 0 ? (
            <p className="muted">No movies yet.</p>
          ) : (
            <ul className="list">
              {toWatch.map((m) => (
                <li key={m.id} className="list-item">
                  <span>{m.title}</span>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handleRemove(m.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="section-title">Watched ({watched.length})</h2>
          {watched.length === 0 ? (
            <p className="muted">No movies yet.</p>
          ) : (
            <ul className="list">
              {watched.map((m) => (
                <li key={m.id} className="list-item">
                  <span>{m.title}</span>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handleRemove(m.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
