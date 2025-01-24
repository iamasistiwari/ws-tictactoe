import { WebSocketServer, WebSocket } from 'ws';
import GameManager from './GameManager';
import dotenv from 'dotenv';
import ValidateUser from './UserValidation';
import fs from 'fs';
import https from 'https';
dotenv.config();
const PORT = 7079;  

const serverOptions = {
  key: fs.readFileSync(
    '/etc/certs/privkey.pem'
  ),
  cert: fs.readFileSync(
    '/etc/certs/fullchain.pem'
  ),
};

const httpsServer = https.createServer(serverOptions);
const wss = new WebSocketServer({server: httpsServer });

httpsServer.listen(7079, () => {
  console.log(
    'Secure WebSocket server is running on wss://tictactoews.ashishtiwari.net:7079'
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
