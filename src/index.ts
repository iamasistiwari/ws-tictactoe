import { WebSocketServer, WebSocket } from 'ws';
import GameManager from './GameManager';

const wss = new WebSocketServer({ port: 8080 });

const rooms: Map<string, { players: WebSocket[] }> = new Map();
const users: Map<WebSocket, { roomId: string }> = new Map();

interface ParsedData {
  type: 'join_room' | 'leave_room' | 'played';
  roomId: string;
  move?: number;
}

interface SendData {
  type: 'joined' | 'error' | 'state';
  message: string;
}

const Manager = new GameManager();


wss.on('connection', (socket, request) => {
  socket.on('message', (messages) => {
    try {
      const data = JSON.parse(messages.toString()) as ParsedData;
      // console.log("recived",data)
      // console.log(Array.from(rooms.entries()));

      if (data.type === 'join_room') {
        const handled = Manager.joinRoom(data.roomId, socket);
        if (!handled) {
          return socket.send(
            JSON.stringify({ type: 'error', message: 'room is full' })
          );
        } else {
          return socket.send(JSON.stringify({ type: 'joined' }));
        }
      }
      if (data.type === 'played' && data.move !== undefined) {
        const state = Manager.makeMove(data.move, data.roomId);
        if(state){
          return socket.send(JSON.stringify({type: 'state', state}))
        }
        return socket.send(JSON.stringify({ type: 'error', message: "Invalid Room"}));
      }
      return socket.send("END")
  
    } catch (error) {
      console.error('Invalid JSON received:', messages.toString());
      socket.send(JSON.stringify({ error: 'Invalid JSON format' }));
    }
  });

  socket.on('close', () => {});
});

