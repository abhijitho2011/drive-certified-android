import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
    url?: string;
    userId?: string;
    autoConnect?: boolean;
}

interface WebSocketHook {
    socket: Socket | null;
    isConnected: boolean;
    joinRoom: (room: string) => void;
    leaveRoom: (room: string) => void;
    sendJobRequestUpdate: (payload: JobRequestUpdatePayload) => void;
    sendApplicationUpdate: (payload: ApplicationUpdatePayload) => void;
    sendNotification: (payload: NotificationPayload) => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback?: (...args: any[]) => void) => void;
}

interface JobRequestUpdatePayload {
    jobRequestId: string;
    status: string;
    driverId?: string;
    employerId?: string;
}

interface ApplicationUpdatePayload {
    applicationId: string;
    status: string;
    driverId: string;
}

interface NotificationPayload {
    userId: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    data?: any;
}

export const useWebSocket = (options: UseWebSocketOptions = {}): WebSocketHook => {
    const {
        url = import.meta.env.VITE_WS_URL || 'http://localhost:3001',
        userId,
        autoConnect = true,
    } = options;

    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!autoConnect) return;

        // Create socket connection
        const socket = io(url, {
            query: userId ? { userId } : undefined,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketRef.current = socket;

        // Connection event handlers
        socket.on('connect', () => {
            console.log('WebSocket connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            setIsConnected(false);
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [url, userId, autoConnect]);

    const joinRoom = useCallback((room: string) => {
        if (socketRef.current && userId) {
            socketRef.current.emit('joinRoom', { room, userId });
            console.log(`Joining room: ${room}`);
        }
    }, [userId]);

    const leaveRoom = useCallback((room: string) => {
        if (socketRef.current) {
            socketRef.current.emit('leaveRoom', { room });
            console.log(`Leaving room: ${room}`);
        }
    }, []);

    const sendJobRequestUpdate = useCallback((payload: JobRequestUpdatePayload) => {
        if (socketRef.current) {
            socketRef.current.emit('jobRequestUpdate', payload);
        }
    }, []);

    const sendApplicationUpdate = useCallback((payload: ApplicationUpdatePayload) => {
        if (socketRef.current) {
            socketRef.current.emit('applicationUpdate', payload);
        }
    }, []);

    const sendNotification = useCallback((payload: NotificationPayload) => {
        if (socketRef.current) {
            socketRef.current.emit('sendNotification', payload);
        }
    }, []);

    const on = useCallback((event: string, callback: (...args: any[]) => void) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
    }, []);

    const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
        if (socketRef.current) {
            if (callback) {
                socketRef.current.off(event, callback);
            } else {
                socketRef.current.off(event);
            }
        }
    }, []);

    return {
        socket: socketRef.current,
        isConnected,
        joinRoom,
        leaveRoom,
        sendJobRequestUpdate,
        sendApplicationUpdate,
        sendNotification,
        on,
        off,
    };
};
