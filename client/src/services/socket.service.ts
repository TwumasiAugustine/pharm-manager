import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
    process.env.NODE_ENV === 'production'
        ? (process.env.REACT_APP_SOCKET_URL as string)
        : 'http://localhost:5000';

class SocketService {
    private static instance: SocketService;
    public socket: Socket;

    private constructor() {
        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            withCredentials: true,
        });

        this.setupEventListeners();
    }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    private setupEventListeners(): void {
        this.socket.on('connect', () => {
            console.log(
                `Connected to socket server with id: ${this.socket.id}`,
            );
        });

        this.socket.on('disconnect', (reason: string) => {
            console.warn(`Socket disconnected: ${reason}`);
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('Socket connection error:', error);
        });
    }

    public on(event: string, listener: (...args: any[]) => void): void {
        this.socket.on(event, listener);
    }

    public off(event: string, listener: (...args: any[]) => void): void {
        this.socket.off(event, listener);
    }

    public emit(event: string, ...args: any[]): void {
        this.socket.emit(event, ...args);
    }
}

export const socketService = SocketService.getInstance();
