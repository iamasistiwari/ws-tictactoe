import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const rooms: Map<string, { players: WebSocket[] }> = new Map();

interface ParsedData {
  type: 'join_room' | 'leave_room' | 'played';
  roomId: string;
  move?: string;
}

wss.on('connection', (socket, request) => {
  socket.on('message', (messages) => {
    try {
      const data = (JSON.parse(messages.toString())) as ParsedData;
      

      if(data.type === "join_room"){
        handleJoinRoom(socket, data.roomId)
      }

    } catch (error) {
      console.error("Invalid JSON received:", messages.toString());
      socket.send(JSON.stringify({ error: "Invalid JSON format" }));
    }
  });



  socket.on('close', () => {
  });


});



function handleJoinRoom (socket: WebSocket, roomId: string){
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { players: [] });
  }

  const room = rooms.get(roomId)

  if(room && room.players.length < 2){
    room.players.push(socket)
    
    const role = room.players.length === 1 ? "X" : "O"
    socket.send(JSON.stringify({type: "role", role}))

    if(room.players.length === 2){
      socket.send(JSON.stringify({ type: 'game_start' }));
      return;
    }
    return 
  }
  else{
    socket.send(JSON.stringify({ error: 'Room is full' }));
    return
  }
}