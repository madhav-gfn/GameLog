# GameLog Frontend - Retro Gaming Social Platform

A beautiful, retro-inspired Letterboxd-style web app for tracking video games. Built with React + Vite + Tailwind CSS.

## ✨ Features

- **Activity Feed**: See what friends are playing
- **Game Discovery**: Browse and filter games by genre, platform, and rating
- **Library Management**: Track games across multiple statuses (Playing, Completed, Backlog, Dropped)
- **Session Logging**: Log play sessions with duration, platform, and streaming details
- **Game Ratings & Reviews**: Rate and review games with detailed feedback
- **User Profiles**: View player stats, favorite genres, and recently played games
- **Wishlist**: Save games to play later
- **Retro Aesthetic**: CRT-inspired dark theme with neon accents

## 🎨 Design Features

- **Retro/Neo-retro Gaming Theme**
  - Dark backgrounds (blacks & deep purples)
  - Neon color palette (green, blue, magenta, yellow)
  - Pixel art-inspired typography
  - Subtle scanline effects
  - Smooth hover states and interactions

- **Responsive Design**
  - Mobile-first approach
  - Works on desktop, tablet, and mobile
  - Touch-friendly interactions

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── GameCard.jsx     # Game display card
│   │   ├── RatingStars.jsx  # Star rating component
│   │   ├── StatusBadge.jsx  # Status indicator
│   │   ├── FeedItem.jsx     # Activity feed item
│   │   ├── SessionModal.jsx # Play session logger
│   │   ├── LoadingSkeleton.jsx
│   │   ├── Layout.jsx       # Layout components
│   │   └── index.js
│   │
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Activity feed page
│   │   ├── Discover.jsx     # Game discovery & browsing
│   │   ├── GameDetail.jsx   # Game detail page
│   │   ├── Library.jsx      # User's game library
│   │   ├── Profile.jsx      # User profile
│   │   └── index.js
│   │
│   ├── data/
│   │   └── mockData.js      # Mock data (games, users, activities)
│   │
│   ├── store/
│   │   └── gameStore.js     # Zustand state management
│   │
│   ├── App.jsx              # Main app with routing
│   ├── App.css              # App styles
│   ├── index.css            # Global styles
│   └── main.jsx             # Entry point
│
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── index.html
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Dependencies

- **React 19.2.0**: UI framework
- **React Router DOM 6.20.0**: Routing
- **Zustand 4.4.0**: State management
- **Tailwind CSS 3.4.1**: Utility-first CSS
- **Vite 7.2.4**: Build tool

## 🎮 Pages Overview

### 1. Home / Feed
Shows a social activity feed with:
- User actions (started, completed, logged sessions)
- Game cover thumbnails
- Timestamps and duration info
- Ratings and reviews

### 2. Discover
Browse and filter games with:
- Genre filter
- Platform filter (PC, PS5, Xbox, Switch)
- Sort options (rating, release year, popularity)
- Grid view of game cards

### 3. Game Detail
Deep dive into a game:
- Hero section with game info
- Description and genres
- User actions (add to library, log session, wishlist)
- Rating and review system
- Play statistics
- Status tracking (Backlog, Playing, Completed, Dropped)

### 4. Library
Personal game collection with tabs:
- Playing (current)
- Completed
- Backlog
- Dropped
- Wishlist

Shows game cover, status, rating, and total hours played.

### 5. Profile
User profile page with:
- Avatar and username
- Bio and social stats
- Total hours played
- Games tracked count
- Favorite genres
- Recently played games grid

## 🛠 Components

### GameCard
Reusable game card with:
- Cover image with hover animation
- Title and release year
- Average rating
- Platform badges
- Genre tags
- Wishlist button

### RatingStars
Interactive star rating (0-5):
- Read-only or interactive mode
- Hover effects
- Decimal ratings (1.5, 3.5, etc.)

### StatusBadge
Color-coded status indicator:
- PLAYING (green)
- COMPLETED (magenta)
- BACKLOG (blue)
- DROPPED (red)
- PAUSED (yellow)

### SessionModal
Modal dialog for logging play sessions:
- Duration input (hours + minutes)
- Platform selector
- Optional notes
- Streaming options (Twitch, YouTube, Kick)

### FeedItem
Social activity card:
- User avatar
- Action type with icon
- Game name and action description
- Timestamp (relative format)
- Ratings when applicable

## 🎨 Color Palette

```css
--retro-dark: #0a0e27
--retro-purple: #1a1a3e
--retro-neon-green: #00ff41
--retro-neon-blue: #00d4ff
--retro-neon-magenta: #ff006e
--retro-neon-yellow: #ffbe0b
```

## 📊 State Management

Using **Zustand** for state:
- Current user
- User games (library)
- Play sessions
- Wishlist
- Following list

Example usage:
```javascript
const { currentUser, toggleWishlist, addUserGame } = useStore();
```

## 🔄 Mock Data

Complete mock dataset includes:
- **8 Games**: Elden Ring, Baldur's Gate 3, Cyberpunk 2077, etc.
- **3 Users**: With followers, bios, stats
- **5 User Games**: Different statuses and progress
- **4 Activities**: Various activity types
- **3 Play Sessions**: With duration and streaming info

## 📱 Responsive Design

- **Mobile (< 640px)**: Single column layouts
- **Tablet (640px - 1024px)**: 2-column grids
- **Desktop (> 1024px)**: 3-4 column grids, full-width navigation

## ⌨️ Keyboard Shortcuts & Accessibility

- All interactive elements are keyboard accessible
- Focus states clearly visible
- ARIA labels where needed
- Semantic HTML structure

## 🎯 Features Showcase

### Optimistic UI
- Instant feedback on user actions
- State updates before server calls (when connected to backend)

### Empty States
- Styled, retro-themed empty states
- Helpful prompts to get started

### Loading States
- Skeleton loaders for cards
- Smooth transitions

### Hover Effects
- Soft glow on interactive elements
- Scale and transform animations
- Border color changes

## 🔮 Future Enhancements

- Backend integration with Node.js/Prisma
- Real user authentication
- Social following & notifications
- Streaming platform integration
- Advanced filtering & search
- User-generated content moderation
- Analytics & statistics
- Dark/Light theme toggle

## 📄 License

MIT

## 👨‍💻 Author

Built as an MVP frontend showcase for a gaming social platform concept.

---

**Note**: This is a frontend-only MVP using mock data. When connected to the backend (Prisma + Node.js), all data will be persisted to the database.
