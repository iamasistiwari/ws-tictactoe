import Game from './Game';
import { WebSocket } from 'ws';
const rooms: Map<string, { players: WebSocket[] }> = new Map();
const playingRooms: Map<string, { Game: Game }> = new Map();

export default class GameManager {
  constructor() {}

  makeMove(index: number, roomID: string, socket: WebSocket) {
    const room = playingRooms.get(roomID);
    if (room) {
      room.Game.makeMove(index, socket);
    }
    return socket.close()
  }

  joinRoom(roomId: string, socket: WebSocket) {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { players: [] });
    }
    const room = rooms.get(roomId);

    if (room && room.players.length < 2) {
      room.players.push(socket);
      socket.send(JSON.stringify({ type: 'joined' }));
      if (room.players.length === 2) {
        playingRooms.set(roomId, {
          Game: new Game(room.players[0], room.players[1]),
        });
        room.players.forEach((socket) =>
          socket.send(JSON.stringify({ type: 'game_started' }))
        );
      }
      return
    } else {
      return socket.close()
    }
  }
}
