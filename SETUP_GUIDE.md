# GameLog Backend + Frontend Setup

## ✅ What's Done

- **Backend API** is running on `http://localhost:5000`
- **Frontend** is set up to fetch games from the backend
- **RAWG API Integration** is ready to use
- **Routes**: `/api/games`, `/api/games/genres`, `/api/games/platforms`

## 🔑 Get Your RAWG API Key

1. Go to https://rawg.io/api
2. Sign up for free
3. Copy your API key from the dashboard
4. Paste it in `backend/.env`:

```env
RAWG_API_KEY=YOUR_KEY_HERE
```

5. The backend will automatically restart and start fetching games!

## 🚀 To Run

**Terminal 1 - Backend (already running on port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (port 5173):**
```bash
cd frontend
npm run dev
```

Then open http://localhost:5173 and go to the Discover page. You should see games from RAWG!

## 📝 Features Implemented

✅ Games fetched from RAWG API
✅ Genre filtering
✅ Platform filtering
✅ Sort by rating/year/popularity
✅ Loading states
✅ Error handling
✅ Responsive design (kept existing)
✅ Real-time updates when filters change

## 🎮 Try These Filters

- **Genre**: Action, RPG, Strategy, etc.
- **Platform**: PC, PlayStation, Nintendo, Xbox, etc.
- **Sort**: Rating, Release Year, Popularity
