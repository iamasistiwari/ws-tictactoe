import Game, { CellValue } from "./Game";
import { WebSocket } from 'ws';
const rooms: Map<string, { players: WebSocket[] }> = new Map();
const playingRooms: Map<string, {Game: Game}> = new Map();

export default class GameManager {
    constructor(){}

    joinRoom(roomId: string, socket: WebSocket): boolean{
        const handle = this.handleJoinRoom(roomId, socket);
        return handle
    }

    makeMove(index: number, roomID: string): CellValue[] | null {
        const room = playingRooms.get(roomID)
        if(room){
            room.Game.makeMove(index)
            return room.Game.getState();
        }
        return null
    }

    private handleJoinRoom(roomId: string, socket: WebSocket): boolean{
        if(!rooms.has(roomId)){
            rooms.set(roomId, { players: [] })
        }
        const room = rooms.get(roomId);

        if (room && room.players.length < 2) {
          room.players.push(socket);
          if (room.players.length === 2) {
            playingRooms.set(roomId, {Game: new Game(room.players[0], room.players[1])})
          }
          return true
        }
        else{
            return false
        }
    }
}