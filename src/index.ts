import { WebSocketServer, WebSocket } from 'ws';
import GameManager from './GameManager';
import dotenv from 'dotenv';
import ValidateUser from './UserValidation';
dotenv.config(); 

const wss = new WebSocketServer({ port: 8080 });

interface ParsedData {
  type: 'join_room' | 'leave_room' | 'played';
  roomId: string;
  move?: number;
}

interface SendData {
  type: 'joined' | 'error' | 'state' | 'game_started' | 'queue' | 'gameEnd';
  state?: string;
  message?: string;
  firstElement?: number
}

const Manager = new GameManager();

wss.on('connection', (socket, request) => {
  const queryParams = new URLSearchParams(request.url?.split('?')[1])
  const token = queryParams.get('token')
  if(!token){
    socket.send(JSON.stringify({type: 'error', message: "invalid token"}))
    return socket.close();
  }
  const validatedRequest = ValidateUser(token)
  if(!validatedRequest){
    socket.send(JSON.stringify({ type: 'error', message: 'invalid token' }));
    return socket.close();
  }

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
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid JSON format' }));
      return socket.close()
    }
  });

  socket.on('close', () => {});
});
