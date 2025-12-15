# Frontend → Backend Integration Guide

When your Node.js backend is ready, follow this guide to integrate it with the frontend.

## 📡 API Configuration

### 1. Create API Client (`src/api/client.js`)

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = {
  async get(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async put(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async delete(endpoint) {
    await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
  }
};
```

### 2. Update `.env.example`

```env
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

### 3. Update Store (`src/store/gameStore.js`)

Replace mock data with API calls:

```javascript
import { apiClient } from '../api/client';

export const useStore = create((set) => ({
  // ... existing state ...

  // Replace mock loading with API calls
  fetchGames: async () => {
    try {
      const games = await apiClient.get('/api/games');
      set({ games });
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  },

  fetchUserGames: async (userId) => {
    try {
      const userGames = await apiClient.get(`/api/users/${userId}/games`);
      set({ userGames });
    } catch (error) {
      console.error('Failed to fetch user games:', error);
    }
  },

  addUserGame: async (userGame) => {
    try {
      const newGame = await apiClient.post('/api/user-games', userGame);
      set((state) => ({ userGames: [...state.userGames, newGame] }));
    } catch (error) {
      console.error('Failed to add game:', error);
    }
  },

  updateUserGame: async (id, updates) => {
    try {
      await apiClient.put(`/api/user-games/${id}`, updates);
      set((state) => ({
        userGames: state.userGames.map((ug) =>
          ug.id === id ? { ...ug, ...updates } : ug
        ),
      }));
    } catch (error) {
      console.error('Failed to update game:', error);
    }
  },

  addPlaySession: async (session) => {
    try {
      const newSession = await apiClient.post('/api/sessions', session);
      set((state) => ({
        playSessions: [...state.playSessions, newSession],
      }));
    } catch (error) {
      console.error('Failed to add session:', error);
    }
  },
}));
```

## 🔐 Authentication Flow

### 1. Add Auth Store (`src/store/authStore.js`)

```javascript
import { create } from 'zustand';
import { apiClient } from '../api/client';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.token);
      set({ user: response.user, token: response.token });
      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email, username, password) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post('/api/auth/register', {
        email,
        username,
        password,
      });
      localStorage.setItem('token', response.token);
      set({ user: response.user, token: response.token });
      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
```

### 2. Add Protected Route Component

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};
```

## 🔄 Data Flow Updates

### Current (Mock)
```
Components → Store (Zustand) → Mock Data
```

### After Integration
```
Components → Store (Zustand) ↔ API Client → Backend (Node.js)
                                              ↓
                                         Database (Prisma)
```

## 📝 Page-by-Page Integration Checklist

### Home Page
- [ ] Replace mock activities with `/api/activities` endpoint
- [ ] Add real-time updates via WebSocket (optional)
- [ ] Filter activities by followed users

### Discover Page
- [ ] Load games from `/api/games`
- [ ] Use `/api/games?genre=X&platform=Y` for filters
- [ ] Load user ratings from `/api/games/:id/stats`

### GameDetail Page
- [ ] Load game from `/api/games/:id`
- [ ] Load user game progress from `/api/games/:id/user-game`
- [ ] Post rating/review to `/api/games/:id/review`
- [ ] Log sessions to `/api/sessions`

### Library Page
- [ ] Load user games from `/api/users/:id/games`
- [ ] Filter by status from store
- [ ] Update status via PUT `/api/user-games/:id`

### Profile Page
- [ ] Load user from `/api/users/:id`
- [ ] Load user stats from `/api/users/:id/stats`
- [ ] Load recent games from `/api/users/:id/games?limit=4`

## 🚀 Environment Setup

### Development (.env.local)
```env
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

### Production (.env.production)
```env
VITE_API_URL=https://api.gamelog.com
VITE_ENV=production
```

## 🧪 Testing the Integration

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend (with API_URL env var)
```bash
cd frontend
VITE_API_URL=http://localhost:3000 npm run dev
```

### 3. Test Endpoints
Use browser DevTools or Postman:
- GET `/api/games` - Get all games
- GET `/api/games/:id` - Get single game
- POST `/api/user-games` - Add game to library
- PUT `/api/user-games/:id` - Update user game
- POST `/api/sessions` - Log play session

## 🔗 Expected API Endpoints

Based on your Prisma schema, implement these endpoints:

```
Games
GET    /api/games                 # List all games
GET    /api/games/:id             # Get game details
GET    /api/games?genre=X         # Filter by genre
GET    /api/games?platform=X      # Filter by platform

User Games
POST   /api/user-games            # Add game to library
GET    /api/user-games/:id        # Get user game
PUT    /api/user-games/:id        # Update user game
DELETE /api/user-games/:id        # Remove from library

Sessions
POST   /api/sessions              # Log play session
GET    /api/sessions/:gameId      # Get game sessions

Users
GET    /api/users/:id             # Get user profile
GET    /api/users/:id/games       # Get user's games
PUT    /api/users/:id             # Update profile

Activities
GET    /api/activities            # Get activity feed
GET    /api/activities?userId=X   # Get user activities
```

## 💡 Best Practices

1. **Error Handling**: Wrap API calls in try-catch
2. **Loading States**: Show loaders while fetching
3. **Caching**: Implement response caching
4. **Retry Logic**: Auto-retry failed requests
5. **Timeouts**: Set request timeouts
6. **Validation**: Validate data before sending
7. **Security**: Use environment variables for API URL
8. **CORS**: Ensure backend CORS is configured

## 🐛 Troubleshooting

### "Cannot reach API"
- Check backend is running on correct port
- Check VITE_API_URL is set correctly
- Check CORS headers on backend

### "401 Unauthorized"
- Check token is saved to localStorage
- Check token format in Authorization header
- Check token expiration

### "404 Not Found"
- Check endpoint path is correct
- Check backend route is implemented
- Check HTTP method (GET vs POST)

## 📚 References

- Backend Prisma schema: `/backend/prisma/schema.prisma`
- Existing store: `/frontend/src/store/gameStore.js`
- Example component: `/frontend/src/pages/Discover.jsx`

---

**Next Steps:**
1. Implement backend API endpoints
2. Deploy backend
3. Update frontend environment variables
4. Replace mock data with API calls
5. Test integration thoroughly

Good luck! 🚀
