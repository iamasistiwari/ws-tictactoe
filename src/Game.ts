import CustomQueue from './Queue';
import { WebSocket } from 'ws';

type Move = 'X' | 'O';
export type CellValue = 'X' | 'O' | null;
const winingCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export default class Game {
  private state: CellValue[];
  private playerOne: WebSocket;
  private playerTwo: WebSocket;
  private currentMove: Move;
  private currentPlayer: WebSocket;
  private playerOneQueue: CustomQueue<number>;
  private playerTwoQueue: CustomQueue<number>;

  constructor(playerOne: WebSocket, playerTwo: WebSocket) {
    this.state = Array(9).fill(null);
    this.playerOne = playerOne;
    this.playerTwo = playerTwo;
    this.currentMove = 'X';
    this.currentPlayer = this.playerOne;
    this.playerOneQueue = new CustomQueue<number>();
    this.playerTwoQueue = new CustomQueue<number>();
  }

  makeMove(index: number, socket: WebSocket) {
    if (this.state[index] !== null) {
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid Move' }));
      return;
    }
    if(socket !== this.currentPlayer){
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid Player' }));
      return;
    }

    if (this.currentPlayer === this.playerOne) {
      this.playerOneQueue.add(index);
    }else {
      this.playerTwoQueue.add(index);
    }
    const playerOneArray = this.playerOneQueue.getQueue() as (number | null)[];
    const playerTwoArray = this.playerTwoQueue.getQueue() as (number | null)[];

    const newState = this.state;
    newState.fill(null);

    playerOneArray.forEach((move) => {
      if (move !== null) {
        newState[move] = 'X';
      }
    });

    playerTwoArray.forEach((move) => {
      if (move !== null) {
        newState[move] = 'O';
      }
    });
    this.state = newState;

    if (this.currentPlayer === this.playerOne) {
      this.currentPlayer = this.playerTwo;
      this.currentMove = 'O';
    } else {
      this.currentPlayer = this.playerOne;
      this.currentMove = 'X';
    }

    this.playerOne.send(JSON.stringify({ type: 'state', state: this.state }));
    this.playerTwo.send(JSON.stringify({ type: 'state', state: this.state }));

    const isPlayerOneQueueFull = this.playerOneQueue.isFull()
    if(isPlayerOneQueueFull){
      const firstElement = this.playerOneQueue.getFirstElement();
      this.playerOne.send(
        JSON.stringify({ type: 'queue', firstElement })
      );
    }

    const isPlayerTwoQueueFull = this.playerTwoQueue.isFull()
    if(isPlayerTwoQueueFull){
      const firstElement = this.playerTwoQueue.getFirstElement();
      this.playerTwo.send(JSON.stringify({ type: 'queue', firstElement }));
    }

    if (this.isPlayerOneWinner()) {
      this.playerOne.send(
        JSON.stringify({
          type: 'gameEnd',
          message: 'Congratulations',
        })
      );
      this.playerTwo.send(
        JSON.stringify({
          type: 'gameEnd',
          message: 'OOH! you loose',
        })
      );
      this.resetGame();
    }
    if (this.isPlayerTwoWinner()) {
      this.playerTwo.send(
        JSON.stringify({
          type: 'gameEnd',
          message: 'Congratulations',
        })
      );
      this.playerOne.send(
        JSON.stringify({
          type: 'gameEnd',
          message: 'OOH! you loose',
        })
      );
      this.resetGame();
    }
    return true;
  }

  private getState(): CellValue[] {
    return this.state;
  }

  private resetGame() {
    this.state = Array(9).fill(null);
    this.currentMove = 'X';
    this.currentPlayer = this.playerOne;
    this.playerOneQueue = new CustomQueue<number>();
    this.playerTwoQueue = new CustomQueue<number>();
  }

  private isPlayerOneWinner(): boolean {
    const xCombination = this.playerOneQueue.getQueue().sort();
    const xWinner = winingCombinations.some(
      (combination) =>
        combination.length === xCombination.length &&
        combination.every((value, index) => value === xCombination[index])
    );
    if (xWinner) {
      return true;
    }
    return false;
  }
  private isPlayerTwoWinner(): boolean {
    const yCombination = this.playerTwoQueue.getQueue().sort();
    const yWinner = winingCombinations.some(
      (combination) =>
        combination.length === yCombination.length &&
        combination.every((value, index) => value === yCombination[index])
    );
    if (yWinner) {
      return true;
    }
    return false;
  }
}
