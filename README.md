# Movie Watchlist

Movie Watchlist is a React-based web application that allows users to search for movies and manage a personal watchlist, split between titles they want to watch and those they have already watched.

The project focuses on real-world frontend workflows such as authentication, API integration, persistent user data, and deployment, rather than heavy component abstraction or visual complexity.

Live demo:
https://movie-watchlist-d2dd8.web.app

## Features

**User Authentication**
- Firebase Authentication (Email/Password and Google)
- Secure login and logout flows

**Movie Search**
- Search movies via an external movie database API
- Display posters, titles, and release years

**Watchlist Management**
- Add movies to To Watch
- Move movies from To Watch to Watched
- Remove movies from the list

**Persistent User Data**
- Each user has a private watchlist stored in Firestore
- Real-time updates across sessions

**Account Deletion**
- Full account removal with Firestore data cleanup
- Handles Firebase re-authentication requirements for sensitive actions

## Tech Stack

- **Frontend:** React, JavaScript (ES6+), HTML5, CSS3
- **Backend / Services:** Firebase Authentication, Firebase Firestore
- **Build & Tooling:** Vite, Git, GitHub
- **Hosting:** Firebase Hosting

## Core Concepts Covered

- React hooks and state management
- Authentication flows and protected user data
- Integration with third-party REST APIs
- Firestore data modelling and real-time subscriptions
- Handling edge cases such as re-authentication errors
- Production builds and cloud deployment
- Environment variable management for client-side apps

**Firestore structure is user-scoped to ensure data isolation:**

```users/{uid}/movies/{movieId}```

## Architecture Notes

This application intentionally avoids heavy component decomposition.

While the UI could be refactored into multiple reusable components (cards, tabs, buttons, layouts), the project was designed to prioritise:

- Clear data flow
- Explicit authentication and Firestore logic
- Readability over abstraction
- Realistic end-to-end functionality

For a small-to-medium-sized app, this approach keeps logic easy to follow and avoids premature over-engineering. The structure can be scaled and refactored if the project grows further.

## Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/justciocan/movie-watchlist.git
```

2. **Navigate into the project folder**
```bash
cd movie-watchlist
```

3. **Install dependencies**
```bash
npm install
```

4. **Create environment variables**

Create a ```.env``` file with the following values:
```bash
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
```

5. **Start the app**
```bash
npm run dev
```

6. **Open in browser**
```bash
http://localhost:5173
```

## Author
**Cosmin Ciocan**

## Preview
<img width="1747" height="1842" alt="image" src="https://github.com/user-attachments/assets/b37c4d67-c57d-4a21-8627-cb86350aa04a" />

