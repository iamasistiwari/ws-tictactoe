import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
const rooms: Map<string, { players: WebSocket[] }> = new Map();

interface ParsedData {
  type: 'join_room' | 'leave_room' | 'played';
  roomId: string;
  move?: number;
}

wss.on('connection', (socket, request) => {

  socket.on('message', (messages) => {
    try {
      const data = (JSON.parse(messages.toString())) as ParsedData;
      // console.log("recived",data)
      // console.log(Array.from(rooms.entries()));


      if(data.type === "join_room"){
        handleJoinRoom(socket, data.roomId)
      }

      if(data.type === "played" && data.move !== undefined){
        broadCastMove(data.roomId, data.move)
      }

    } catch (error) {
      
      console.error("Invalid JSON received:", messages.toString());
      socket.send(JSON.stringify({ error: "Invalid JSON format" }));
    }
  });

  socket.on('close', () => {
    removePlayerFromRooms(socket)
  });


});

function broadCastMove(roomId: string, move: number) {
  const room = rooms.get(roomId)
  if(room){
    room.players.forEach((player) => {
      player.send(JSON.stringify({type: "move", move}))
    })
  }
}

function removePlayerFromRooms(socket: WebSocket){
  rooms.forEach((room, roomId) => {
    room.players = room.players.filter((player) => player !== socket)
    if(room.players.length === 0){
      rooms.delete(roomId)
    }
  })
}


function handleJoinRoom (socket: WebSocket, roomId: string){
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { players: [] });
  }

  const room = rooms.get(roomId)

  if(room && room.players.length < 2){
    room.players.push(socket)

    const role = room.players.length === 1 ? "O" : "X"
    socket.send(JSON.stringify({type: "role", role}))

    if(room.players.length === 2){
      socket.send(JSON.stringify({ type: 'game_start' }));
      return;
    }
    return 
  }
  else{
    socket.send(JSON.stringify({ type: "error" }));
    return
  }
}