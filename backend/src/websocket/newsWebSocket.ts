// backend/src/websocket/newsWebSocket.ts
import { WebSocketServer, WebSocket } from 'ws';
import { verifyToken } from '../utils/auth';

interface Client {
    ws: WebSocket;
    userId?: string;
    role?: string;
}

const clients = new Set<Client>();

export function setupNewsWebSocket(wss: WebSocketServer) {
    wss.on('connection', (ws, req) => {
        const client: Client = { ws };

        // Authentification optionnelle via query param
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const token = url.searchParams.get('token');

        if (token) {
            try {
                const decoded = verifyToken(token);
                client.userId = decoded.userId;
                client.role = decoded.role;
            } catch (error) {
                console.error('Invalid token');
            }
        }

        clients.add(client);
        console.log(`Client connected. Total: ${clients.size}`);

        ws.on('close', () => {
            clients.delete(client);
            console.log(`Client disconnected. Total: ${clients.size}`);
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });
}

// Fonction pour broadcaster les news
export function broadcastNews(type: string, payload: any) {
    const message = JSON.stringify({ type, payload });

    clients.forEach(client => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(message);
        }
    });
}

// Fonction pour envoyer aux admins seulement
export function notifyAdmins(type: string, payload: any) {
    const message = JSON.stringify({ type, payload });

    clients.forEach(client => {
        if (client.ws.readyState === WebSocket.OPEN && client.role === 'ADMIN') {
            client.ws.send(message);
        }
    });
} 