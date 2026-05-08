# ParkSmart — Vehicle Parking Management Frontend

React + Vite frontend for the Vehicle Parking Management System.

## Tech Stack
- React 18
- React Router v6
- Vite
- CSS Modules

## Project Structure

```
src/
├── api/
│   └── client.js          # All API calls (auth, slots, bookings)
├── components/
│   ├── Layout.jsx          # Shell with sidebar + outlet
│   ├── Layout.module.css
│   ├── Modal.jsx           # Reusable modal with ESC/backdrop close
│   ├── ProtectedRoute.jsx  # Auth guard (also adminOnly support)
│   ├── Sidebar.jsx         # Navigation sidebar
│   └── Sidebar.module.css
├── context/
│   └── AuthContext.jsx     # Global auth state + toast system
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── Auth.module.css
│   ├── DashboardPage.jsx   # Admin only — stats + all bookings
│   ├── Dashboard.module.css
│   ├── SlotsPage.jsx       # View/book slots (user) or CRUD (admin)
│   ├── SlotsPage.module.css
│   ├── BookingsPage.jsx    # My bookings (user) or all bookings (admin)
│   └── BookingsPage.module.css
├── App.jsx                 # Routes
├── main.jsx
└── index.css               # Global styles & design tokens
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and set your backend URL:
```
VITE_API_URL=http://localhost:8000
```
For production deployment on Vercel, set `VITE_API_URL` in the Vercel dashboard under Project → Settings → Environment Variables.

### 3. Run development server
```bash
npm run dev
```
Open http://localhost:5173

### 4. Build for production
```bash
npm run build
```

## Deploy to Vercel
1. Push this folder to a GitHub repo
2. Import the repo on vercel.com
3. Set `VITE_API_URL` in Vercel environment variables → your deployed FastAPI URL
4. Deploy!

## Backend (FastAPI) CORS
Make sure your FastAPI `main.py` allows the Vercel frontend URL:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-vercel-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Features

### User
- Register / Login
- View all parking slots with floor & type filters
- Book an available slot with vehicle number + duration
- View and cancel own bookings

### Admin
- Dashboard with live stats (total/available/occupied/active)
- Add, edit, delete parking slots
- View all bookings across all users
- Cancel any booking
# parking-frontend
