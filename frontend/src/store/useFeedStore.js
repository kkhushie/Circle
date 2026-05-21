import { create } from 'zustand';
import api from '../lib/axios';

const useFeedStore = create((set, get) => ({
    followingStories: [],
    discoverStories: [],
    feedLoading: true,
    feedError: null,
    hasFetched: false,

    fetchFeed: async (forceRefresh = false) => {
        const { hasFetched, feedLoading } = get();
        
        // Prevent duplicate fetches unless forcing a refresh
        if (hasFetched && !forceRefresh) return;
        
        // Prevent concurrent identical requests
        if (feedLoading && hasFetched) return; 

        set({ feedLoading: true, feedError: null });

        try {
            const response = await api.get('/api/moments/feed');
            
            if (response.data.success) {
                let follows = response.data.followingMoments || [];
                const discover = response.data.discoverMoments || [];

                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;

                if (user && user.username) {
                    follows = [...follows].sort((a, b) => {
                        if (a.user?.username === user.username) return -1;
                        if (b.user?.username === user.username) return 1;
                        return 0;
                    });
                }

                set({ 
                    followingStories: follows, 
                    discoverStories: discover, 
                    feedLoading: false,
                    hasFetched: true
                });

                window._stories_list = follows.map(s => s.user?.username).filter(Boolean);
                window._discover_list = discover.map(s => s.user?.username).filter(Boolean);
            }
        } catch (error) {
            console.error('Error fetching feed:', error);
            set({ feedError: 'Failed to load feed', feedLoading: false });
        }
    },

    refreshFeed: async () => {
        await get().fetchFeed(true);
    }
}));

export default useFeedStore;
