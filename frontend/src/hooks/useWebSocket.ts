import { useEffect, useState, useRef, useCallback } from 'react';

interface UseWebSocketOptions {
    url: string;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions) {
    const { url, reconnectInterval = 10000, maxReconnectAttempts = 2 } = options;
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const reconnectAttempts = useRef(0);
    const wsRef = useRef<WebSocket | null>(null);

    const send = useCallback((data: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const connect = () => {
            if (cancelled) return;
            try {
                const ws = new WebSocket(url);
                wsRef.current = ws;

                ws.onopen = () => {
                    if (!cancelled) {
                        setConnected(true);
                        setSocket(ws);
                        reconnectAttempts.current = 0;
                    }
                };

                ws.onclose = () => {
                    if (!cancelled) {
                        setConnected(false);
                        // Reconnexion silencieuse avec peu de tentatives
                        if (reconnectAttempts.current < maxReconnectAttempts) {
                            setTimeout(() => {
                                reconnectAttempts.current++;
                                connect();
                            }, reconnectInterval);
                        }
                    }
                };

                // Silencieux : pas de console.error pour éviter le spam
                ws.onerror = () => {};

            } catch {
                // Connexion WebSocket optionnelle - pas critique
            }
        };

        connect();

        return () => {
            cancelled = true;
            if (wsRef.current) {
                wsRef.current.onclose = null;
                wsRef.current.onerror = null;
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [url, reconnectInterval, maxReconnectAttempts]);

    return { socket, connected, send };
} 