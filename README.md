# VolunteerHub — User Web App

React + Vite frontend for **VolunteerHub**, a volunteer platform for Cambodia: find events, join them, post photos and stories, follow people, and track volunteer hours. Works in English and Khmer.

## Run locally

Needs Node.js 20+ and the VolunteerHub Laravel API running on `http://localhost:8000`.

```bash
npm install
cp .env.example .env     # set VITE_API_URL if your API runs elsewhere
npm run dev
```

Open http://localhost:5174

Demo login (from the API seed data): `sokha@volunteerhub.test` / `password`

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 5174 |
| `npm run build` | Build for production into `dist/` |
| `npm run lint` | Check the code with ESLint |

## Folders

```
src/
├── layouts/      UserLayout (top bar, bottom menu on phone)
├── pages/        auth, Feed, Discover, EventDetail, CreatePost, Profile, Search, Notifications, MyHours …
├── components/   ui, post, event, user
├── context/      AuthContext (login token)
├── services/     api.js (calls the Laravel API) + userService, eventService, postService
├── i18n/         en.js, km.js
└── styles/       global.css
```

## Status

- Connected to the API: login, register, profile, follow
- Still demo data: feed, events, posts, search, notifications, hours (coming in the next API phases)

login demo acc :