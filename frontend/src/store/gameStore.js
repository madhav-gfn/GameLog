import { create } from 'zustand';
import { MOCK_USERS, MOCK_USER_GAMES, MOCK_PLAY_SESSIONS } from '../data/mockData';

export const useStore = create((set) => ({
  currentUser: MOCK_USERS[0],
  userGames: MOCK_USER_GAMES,
  playSessions: MOCK_PLAY_SESSIONS,
  wishlist: ['5', '7'],
  following: ['3'],

  // User actions
  setCurrentUser: (user) => set({ currentUser: user }),
  
  // Game actions
  addUserGame: (userGame) =>
    set((state) => ({
      userGames: [...state.userGames, userGame],
    })),
  
  updateUserGame: (id, updates) =>
    set((state) => ({
      userGames: state.userGames.map((ug) =>
        ug.id === id ? { ...ug, ...updates } : ug
      ),
    })),
  
  // Wishlist actions
  toggleWishlist: (gameId) =>
    set((state) => ({
      wishlist: state.wishlist.includes(gameId)
        ? state.wishlist.filter((id) => id !== gameId)
        : [...state.wishlist, gameId],
    })),
  
  isInWishlist: (gameId) => {
    const state = useStore.getState();
    return state.wishlist.includes(gameId);
  },

  // Follow actions
  toggleFollow: (userId) =>
    set((state) => ({
      following: state.following.includes(userId)
        ? state.following.filter((id) => id !== userId)
        : [...state.following, userId],
    })),

  isFollowing: (userId) => {
    const state = useStore.getState();
    return state.following.includes(userId);
  },

  // Session actions
  addPlaySession: (session) =>
    set((state) => ({
      playSessions: [...state.playSessions, session],
    })),
}));
