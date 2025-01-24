import { WebSocketServer, WebSocket } from 'ws';
import GameManager from './GameManager';
import dotenv from 'dotenv';
import ValidateUser from './UserValidation';
dotenv.config();
import fs from 'fs'

let serverOptions;
try {
  const keyPath = process.env.SSL_KEY_PATH || '/keys/server.key';
  const certPath = process.env.SSL_CERT_PATH || '/keys/server.crt';
  serverOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
} catch (error) {
  console.error('Error reading SSL files', error);
}



const wss = new WebSocketServer({ port: 7079, host: '0.0.0.0', ...serverOptions});
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
  console.log("request came")
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
    joinedRooms.delete(socket)
  });
});
