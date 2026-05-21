import { io } from 'socket.io-client';
import useAppStore from '../store/useAppStore';

let socket = null;

export const getSocket = () => {
    if (!socket) {
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
        
        if (token) {
            socket = io(backendUrl, {
                auth: { token },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            // Global Presence Handling
            socket.on('connect', () => {
                console.log('Global presence socket connected');
                window.dispatchEvent(new Event('socketConnected'));
            });
            
            socket.on('disconnect', () => {
                console.log('Global presence socket disconnected');
                window.dispatchEvent(new Event('socketDisconnected'));
            });

            // Global Notification Handling - mutate Zustand state directly!
            socket.on('newNotification', () => {
                useAppStore.getState().incrementUnread();
            });
        }
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
