import { joinedRooms } from '.';
import Game from './Game';
import { WebSocket } from 'ws';
const rooms: Map<string, { players: WebSocket[] }> = new Map();
const playingRooms: Map<string, { Game: Game }> = new Map();

export default class GameManager {
  constructor() {}

  handleClose(socket: WebSocket){
    const user = joinedRooms.get(socket)
    if(user && user.joinRooms.length !== 0){
      //handle rooms
      user.joinRooms.forEach((room) => {
        const getRoom = rooms.get(room)
        if(getRoom){
          getRoom.players = getRoom.players.filter((user) => user !== socket);
          if(getRoom.players.length === 0){
            rooms.delete(room)
          }
        }
        
      })

      //handle game rooms
      user.joinRooms.forEach((room) => {
        const getPlayingRoom = playingRooms.get(room)
        if(getPlayingRoom){
          getPlayingRoom.Game.onExit(socket)
          playingRooms.delete(room)
        }
      })

    }
  }

  makeMove(index: number, roomID: string, socket: WebSocket) {
    const room = playingRooms.get(roomID);
    if (room) {
      room.Game.makeMove(index, socket);
    } else {
      return socket.send(
        JSON.stringify({ type: 'error', message: 'invalid room' })
      );
    }
  }

  joinRoom(roomId: string, socket: WebSocket) {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { players: [] });
    }
    const room = rooms.get(roomId);

    if (room && room.players.length < 2) {
      const player = joinedRooms.get(socket)
      if(player){
        player.joinRooms.push(roomId)
      }
      room.players.push(socket);
      socket.send(JSON.stringify({ type: 'joined' }));
      if (room.players.length === 2) {
        playingRooms.set(roomId, {
          Game: new Game(room.players[0], room.players[1]),
        });
        room.players[0].send(
          JSON.stringify({ type: 'game_started', yourMove: 'X' })
        );
        room.players[1].send(
          JSON.stringify({ type: 'game_started', yourMove: 'O' })
        );
      }
      return;
    } else {
      return socket.send(
        JSON.stringify({ type: 'error', message: 'room is full' })
      );
    }
  }
}
