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
  private playerOne;
  private playerTwo;
  private currentMove: Move;
  private currentPlayer;
  private playerOneQueue;
  private playerTwoQueue;


  constructor(playerOne: WebSocket, playerTwo: WebSocket) {
    this.state = Array(9).fill(null);
    this.playerOne = playerOne;
    this.playerTwo = playerTwo;
    this.currentMove = 'X';
    this.currentPlayer = this.playerOne;
    this.playerOneQueue = new CustomQueue<number>();
    this.playerTwoQueue = new CustomQueue<number>();
  }

  makeMove(index: number): boolean {
    if (this.state[index] !== null) {
      return false;
    }

    if (this.currentMove === 'X' && this.currentPlayer === this.playerOne) {
      this.playerOneQueue.add(index);
    }
    if (this.currentMove === 'O' && this.currentPlayer === this.playerTwo) {
      this.playerTwoQueue.add(index);
    }
    const playerOneArray = this.playerOneQueue.getQueue() as (number | null)[];
    const playerTwoArray = this.playerTwoQueue.getQueue() as (number | null)[];
    const newState = this.state;
    newState.fill(null);

    playerOneArray.forEach((move) => {
      if (move !== null) {
        newState[move] === 'X';
      }
    });

    playerTwoArray.forEach((move) => {
      if (move !== null) {
        newState[move] === 'O';
      }
    });
    this.state = newState;
    if (this.currentPlayer === this.playerOne) {
      this.currentPlayer = this.playerTwo;
      this.currentMove = 'O';
    }
    if (this.currentPlayer === this.playerTwo) {
      this.currentPlayer = this.playerOne;
      this.currentMove = 'X';
    }
    
    if(this.playerOneWinnerCheck()){
      this.playerTwo.send(JSON.stringify({
        type: "won",
        message: "Congratulations"
      }))
      this.resetGame();
    }
    if (this.playerTwoWinnerCheck()) {
      this.playerOne.send(
        JSON.stringify({
          type: 'won',
          message: 'Congratulations',
        })
      );
      this.resetGame();
    }    
    return true;
  }

  getState(): CellValue[] {
    return this.state;
  }

  private resetGame(){
    this.state = Array(9).fill(null);
    this.currentMove = 'X';
    this.currentPlayer = this.playerOne;
    this.playerOneQueue = new CustomQueue<number>();
    this.playerTwoQueue = new CustomQueue<number>();
  }

  private playerOneWinnerCheck(): boolean {
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
  private playerTwoWinnerCheck(): boolean {
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
