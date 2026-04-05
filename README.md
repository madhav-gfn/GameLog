# GameLog 🎮

A full-stack web application that serves as a centralized hub for gamers to track their backlogs, rate games, and connect with friends. Think of it as "Letterboxd for video games." 

## Features
- **Comprehensive Database:** Searches and fetches rich game metadata using the RAWG API.
- **Library Management:** Add games to your profile with statuses like *Wishlist*, *Backlog*, *Playing*, *Completed*, or *Abandoned*.
- **Social Feed:** Follow other users, see what they are playing, and leave comments or likes on their reviews.
- **Analytics:** Visualize your gaming habits and rating distributions using dynamic charts.

## Tech Stack
- **Frontend:** React 19 (Vite), Tailwind CSS, Framer Motion, Chart.js
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Passport.js (Google OAuth) / Session Management

## Local Setup

### 1. Prerequisites
- Node.js 18+
- PostgreSQL (Ensure it is running locally)

### 2. Environment Variables
Copy `.env.example` to `.env` in the root directory and update your configuration. Make sure you set your `DATABASE_URL` pointing to your local Postgres instance and set your `RAWG_API_KEY`.

### 3. Install Dependencies
Open two terminal windows.

**Backend Setup:**
```bash
cd backend
npm install
# Set up your Prisma database schema
npx prisma generate
npx prisma db push
```

**Frontend Setup:**
```bash
cd frontend
npm install
```

### 4. Run Development Servers

**Start backend:**
```bash
cd backend
npm run dev
```

**Start frontend:**
```bash
cd frontend
npm run dev
```
Your frontend should now be running at `http://localhost:5173` and the backend at `http://localhost:3000`.
