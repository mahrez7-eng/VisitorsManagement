Frontend-Backend Integration

1) Configure frontend to call backend
- Create a file `.env` in the `frontend` folder (same level as `package.json`).
- Add (adjust port if backend runs elsewhere):

VITE_API_BASE=http://localhost:8080/api

2) Run backend
- From `visitors/backend`:

```bash
./mvnw spring-boot:run
# or on Windows
mvnw.cmd spring-boot:run
```

3) Run frontend
- From `visitors/frontend`:

```bash
npm install
npm run dev
```

4) Notes
- The frontend will attempt to call `/api/auth/login`. If the backend is available it will use JWT auth and save token to `localStorage`.
- If backend isn't reachable, the app falls back to the built-in localStorage seed users (`admin`/`admin`, `receptionist`/`receptionist`).
- CORS is already configured in the backend `SecurityConfig` to allow requests from the frontend.
