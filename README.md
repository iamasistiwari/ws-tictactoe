# WebSocket for Real-Time Advanced Tic-Tac-Toe ⚡

This repository contains the WebSocket server implementation for **Advanced Tic-Tac-Toe**, enabling real-time multiplayer gameplay. 🕹️

With WebSockets, the game updates instantly between players, allowing them to make moves, see their opponents' actions, and detect wins in real-time.

---

## 🚀 **Features:**

- **Real-Time Communication**: Ensures that player moves are synchronized across all connected clients without delay.
- **Player Matching**: Players are matched with each other and can start the game immediately once both are ready.
- **Game State Sync**: Synchronizes the game state, including player moves and game status (win, draw, reset), across all clients.
- **Efficient Data Handling**: The WebSocket server ensures that data is transmitted with minimal overhead, ensuring smooth gameplay.
- **Authentication using hashing**: Uses Custom token validation using hashing with current TIME DD/MM/YY, HH:MM am/pm with secret both on this backend and frotend which use it.

---

## ⚙️ **How It Works:**

1. **WebSocket Connection**: The server establishes a WebSocket connection between the players, allowing them to communicate in real-time.
2. **Game Updates**: As players make their moves, the game state (3x3 grid) is updated and pushed to the clients.
3. **Special Rule Sync**: After the 4th move, the first move is automatically erased, and the server ensures this rule is reflected in real-time.
4. **Winner Detection**: The server continuously checks for a winner and notifies both players as soon as someone wins or the game is drawn.
5. **Game Reset**: After a win or draw, the game is automatically reset, and the new round starts with synchronized clients.

---

## 🛠️ **Setup & Installation:**

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/realtime-advance-tictactoe-websocket.git
