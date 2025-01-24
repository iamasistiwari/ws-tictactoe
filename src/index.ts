import { WebSocketServer, WebSocket } from 'ws';
import GameManager from './GameManager';
import dotenv from 'dotenv';
import ValidateUser from './UserValidation';
import fs from 'fs';
import https from 'https';
dotenv.config();

const PORT = process.env.PORT || 7079;
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || '/etc/certs/privkey.pem';
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || '/etc/certs/fullchain.pem';

let serverOptions: { key: string | Buffer; cert: string | Buffer } = {
  key: '',
  cert: '',
};

try {
  if (fs.existsSync(SSL_KEY_PATH) && fs.existsSync(SSL_CERT_PATH)) {
    serverOptions.key = fs.readFileSync(SSL_KEY_PATH);
    serverOptions.cert = fs.readFileSync(SSL_CERT_PATH);
  } else {
    console.error(
      'SSL certificate files are missing. Continuing with HTTP server.'
    );
    serverOptions.key = '';
    serverOptions.cert = '';
  }
} catch (error) {
  console.error('Error reading SSL certificates:', error);
  serverOptions.key = '';
  serverOptions.cert = '';
}

const httpsServer =
  serverOptions.key && serverOptions.cert
    ? https.createServer(serverOptions)
    : https.createServer(); // Fallback to HTTP if SSL files are missing

const wss = new WebSocketServer({ server: httpsServer });

httpsServer.listen(PORT, () => {
  console.log(
    serverOptions.key && serverOptions.cert
      ? `Secure WebSocket server is running on wss://tictactoews.ashishtiwari.net:${PORT}`
      : `WebSocket server is running on ws://tictactoews.ashishtiwari.net:${PORT}`
  );
});

export const joinedRooms: Map<WebSocket, { joinRooms: string[] }> = new Map();

interface ParsedData {
  type: 'join_room' | 'leave_room' | 'played';
  roomId: string;
  move?: number;
}

interface SendData {
  type:
    | 'joined'
    | 'error'
    | 'state'
    | 'game_started'
    | 'queueFull'
    | 'gameEnd'
    | 'currentMove';
  state?: string;
  message?: string;
  playerOneLastEle?: number | null;
  playerTwoLastEle?: number | null;
  totalMoves?: number;
  currentMove: 'X' | 'O';
  yourMove: 'X' | 'O';
}

const Manager = new GameManager();

wss.on('connection', (socket, request) => {
  console.log('request came');
  try {
    const queryParams = new URLSearchParams(request.url?.split('?')[1]);
    const token = queryParams.get('token');
    if (!token) {
      socket.send(JSON.stringify({ type: 'error', message: 'invalid token' }));
      return;
    }
    const validatedRequest = ValidateUser(token);
    if (!validatedRequest) {
      socket.send(JSON.stringify({ type: 'error', message: 'invalid token' }));
      return;
    }
  } catch (error) {
    console.log();
  }

  joinedRooms.set(socket, { joinRooms: [] });

  socket.on('message', (messages) => {
    try {
      const data = JSON.parse(messages.toString()) as ParsedData;

      if (data.type === 'join_room') {
        Manager.joinRoom(data.roomId, socket);
        return;
      }

      if (data.type === 'played' && data.move !== undefined) {
        Manager.makeMove(data.move, data.roomId, socket);
        return;
      }
    } catch (error) {
      return socket.send(
        JSON.stringify({
          type: 'error',
          message: 'Invalid JSON format. Try again with correct JSON',
        })
      );
    }
  });

  socket.on('close', () => {
    Manager.handleClose(socket);
    joinedRooms.delete(socket);
  });
});
