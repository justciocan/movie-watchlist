const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status}`);
  }
  return res.json();
}

export function getPosterUrl(path, size = "w342") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export async function searchMovies(query) {
  if (!query?.trim()) return { results: [] };

  const url =
    `${BASE_URL}/search/movie` +
    `?api_key=${API_KEY}` +
    `&language=en-US` +
    `&include_adult=false` +
    `&query=${encodeURIComponent(query.trim())}`;

  return fetchJson(url);
}

export async function getPopularMovies() {
  const url =
    `${BASE_URL}/movie/popular` +
    `?api_key=${API_KEY}` +
    `&language=en-US` +
    `&page=1`;

  return fetchJson(url);
}
