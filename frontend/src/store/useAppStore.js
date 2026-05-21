import { create } from 'zustand';
import api from '../lib/axios';

const useAppStore = create((set, get) => ({
    user: null,
    unreadCount: 0,
    circles: [],
    
    appLoading: true,
    appError: null,

    setUser: (user) => set({ user }),
    setUnreadCount: (count) => set({ unreadCount: count }),
    setCircles: (circles) => set({ circles }),
    incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
    decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
    
    bootstrapApp: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ appLoading: false, user: null });
            return;
        }

        try {
            set({ appLoading: true, appError: null });

            // Fetch core data simultaneously
            const [meRes, notifRes, circlesRes] = await Promise.allSettled([
                api.get('/api/auth/me'),
                api.get('/api/notifications/unread-count'),
                api.get('/api/circles/my-circles/list')
            ]);

            const updates = {};

            if (meRes.status === 'fulfilled' && meRes.value.data.success) {
                const fetchedUser = meRes.value.data.user;
                updates.user = fetchedUser;
                localStorage.setItem('user', JSON.stringify(fetchedUser));
            } else {
                throw new Error("Auth failed"); // Re-throw to handle logout if /me fails
            }

            if (notifRes.status === 'fulfilled' && notifRes.value.data.success) {
                updates.unreadCount = notifRes.value.data.count;
            }

            if (circlesRes.status === 'fulfilled' && circlesRes.value.data.success) {
                updates.circles = circlesRes.value.data.circles || [];
            }

            set({ ...updates, appLoading: false });
        } catch (error) {
            console.error('App Bootstrap failed:', error);
            set({ appError: 'Failed to initialize app', appLoading: false, user: null });
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
}));

export default useAppStore;
