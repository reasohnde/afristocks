import { useEffect, useState, useRef, useCallback } from 'react';

interface UseWebSocketOptions {
    url: string;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions) {
    const { url, reconnectInterval = 5000, maxReconnectAttempts = 5 } = options;
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const reconnectAttempts = useRef(0);

    const send = useCallback((data: any) => {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket not connected');
        }
    }, [socket]);

    useEffect(() => {
        const connect = () => {
            try {
                const ws = new WebSocket(url);

                ws.onopen = () => {
                    console.log('WebSocket connected');
                    setConnected(true);
                    reconnectAttempts.current = 0;
                };

                ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    setConnected(false);

                    if (reconnectAttempts.current < maxReconnectAttempts) {
                        setTimeout(() => {
                            reconnectAttempts.current++;
                            connect();
                        }, reconnectInterval);
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };

                setSocket(ws);

                return () => {
                    ws.close();
                };
            } catch (error) {
                console.error('Failed to create WebSocket:', error);
            }
        };

        connect();

        return () => {
            socket?.close();
        };
    }, [url, reconnectInterval, maxReconnectAttempts]);

    return { socket, connected, send };
} 