import { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
interface Agent {
  id: number;
  name: string;
  description: string;
  avatar: string;
  tags: string[];
  rating: number;
  users: number;
  price: string;
  industry: string;
  voiceProvider: string;
  creator?: string;
  personality?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  agents: Agent[];
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  favoriteAgents: number[];
  cart: Agent[];
  searchQuery: string;
  recentSearches: string[];
  filters: {
    industry: string;
    voiceProvider: string;
    pricing: string;
  };
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'ADD_FAVORITE'; payload: number }
  | { type: 'REMOVE_FAVORITE'; payload: number }
  | { type: 'ADD_TO_CART'; payload: Agent }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'ADD_RECENT_SEARCH'; payload: string }
  | { type: 'CLEAR_RECENT_SEARCHES' }
  | { type: 'SET_FILTERS'; payload: Partial<AppState['filters']> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  favoriteAgents: JSON.parse(localStorage.getItem('agentica_favorites') || '[]'),
  cart: JSON.parse(localStorage.getItem('agentica_cart') || '[]'),
  searchQuery: '',
  recentSearches: JSON.parse(localStorage.getItem('agentica_recent_searches') || '[]'),
  filters: {
    industry: 'All Industries',
    voiceProvider: 'All Providers',
    pricing: 'All Pricing'
  },
  isLoading: false,
  error: null
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    case 'ADD_FAVORITE':
      const newFavorites = [...state.favoriteAgents, action.payload];
      localStorage.setItem('agentica_favorites', JSON.stringify(newFavorites));
      return { ...state, favoriteAgents: newFavorites };
    
    case 'REMOVE_FAVORITE':
      const filteredFavorites = state.favoriteAgents.filter(id => id !== action.payload);
      localStorage.setItem('agentica_favorites', JSON.stringify(filteredFavorites));
      return { ...state, favoriteAgents: filteredFavorites };
    
    case 'ADD_TO_CART':
      const newCart = [...state.cart, action.payload];
      localStorage.setItem('agentica_cart', JSON.stringify(newCart));
      return { ...state, cart: newCart };
    
    case 'REMOVE_FROM_CART':
      const filteredCart = state.cart.filter(agent => agent.id !== action.payload);
      localStorage.setItem('agentica_cart', JSON.stringify(filteredCart));
      return { ...state, cart: filteredCart };
    
    case 'CLEAR_CART':
      localStorage.removeItem('agentica_cart');
      return { ...state, cart: [] };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'ADD_RECENT_SEARCH':
      const newRecentSearches = [
        action.payload,
        ...state.recentSearches.filter(search => search !== action.payload)
      ].slice(0, 5);
      localStorage.setItem('agentica_recent_searches', JSON.stringify(newRecentSearches));
      return { ...state, recentSearches: newRecentSearches };
    
    case 'CLEAR_RECENT_SEARCHES':
      localStorage.removeItem('agentica_recent_searches');
      return { ...state, recentSearches: [] };
    
    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload }
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    login: (user: User) => void;
    logout: () => void;
    toggleFavorite: (agentId: number) => void;
    addToCart: (agent: Agent) => void;
    removeFromCart: (agentId: number) => void;
    setSearch: (query: string) => void;
    addRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;
    setFilters: (filters: Partial<AppState['filters']>) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
  };
} | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    login: (user: User) => {
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    },
    
    logout: () => {
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      dispatch({ type: 'CLEAR_CART' });
    },
    
    toggleFavorite: (agentId: number) => {
      if (state.favoriteAgents.includes(agentId)) {
        dispatch({ type: 'REMOVE_FAVORITE', payload: agentId });
      } else {
        dispatch({ type: 'ADD_FAVORITE', payload: agentId });
      }
    },
    
    addToCart: (agent: Agent) => {
      if (!state.cart.find(item => item.id === agent.id)) {
        dispatch({ type: 'ADD_TO_CART', payload: agent });
      }
    },
    
    removeFromCart: (agentId: number) => {
      dispatch({ type: 'REMOVE_FROM_CART', payload: agentId });
    },
    
    setSearch: (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    },
    
    addRecentSearch: (query: string) => {
      if (query.trim()) {
        dispatch({ type: 'ADD_RECENT_SEARCH', payload: query.trim() });
      }
    },
    
    clearRecentSearches: () => {
      dispatch({ type: 'CLEAR_RECENT_SEARCHES' });
    },
    
    setFilters: (filters: Partial<AppState['filters']>) => {
      dispatch({ type: 'SET_FILTERS', payload: filters });
    },
    
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    
    setError: (error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Selectors
export const useAuth = () => {
  const { state } = useApp();
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated
  };
};

export const useCart = () => {
  const { state, actions } = useApp();
  return {
    cart: state.cart,
    addToCart: actions.addToCart,
    removeFromCart: actions.removeFromCart,
    cartCount: state.cart.length,
    cartTotal: state.cart.reduce((total, agent) => {
      const price = parseFloat(agent.price.replace(/[^0-9.]/g, '')) || 0;
      return total + price;
    }, 0)
  };
};

export const useFavorites = () => {
  const { state, actions } = useApp();
  return {
    favorites: state.favoriteAgents,
    toggleFavorite: actions.toggleFavorite,
    isFavorite: (agentId: number) => state.favoriteAgents.includes(agentId)
  };
};

export const useSearch = () => {
  const { state, actions } = useApp();
  return {
    searchQuery: state.searchQuery,
    recentSearches: state.recentSearches,
    filters: state.filters,
    setSearch: actions.setSearch,
    addRecentSearch: actions.addRecentSearch,
    clearRecentSearches: actions.clearRecentSearches,
    setFilters: actions.setFilters
  };
};