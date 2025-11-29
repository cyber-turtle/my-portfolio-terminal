'use client';

import React, { useState, useEffect, useRef } from 'react';

const CyberConnect4 = () => {
  const ROWS = 6;
  const COLS = 7;
  const EMPTY = 0;
  const PLAYER = 1;
  const AI = 2;
  const DEPTH = 5; // Search depth for Minimax

  const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY)));
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER);
  const [winner, setWinner] = useState(null);
  const [isThinking, setIsThinking] = useState(false);

  // --- Game Logic ---

  const checkWin = (board, player) => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (board[r][c] === player && board[r][c+1] === player && board[r][c+2] === player && board[r][c+3] === player) return true;
      }
    }
    // Vertical
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] === player && board[r+1][c] === player && board[r+2][c] === player && board[r+3][c] === player) return true;
      }
    }
    // Diagonal /
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (board[r][c] === player && board[r-1][c+1] === player && board[r-2][c+2] === player && board[r-3][c+3] === player) return true;
      }
    }
    // Diagonal \
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (board[r][c] === player && board[r+1][c+1] === player && board[r+2][c+2] === player && board[r+3][c+3] === player) return true;
      }
    }
    return false;
  };

  const getValidMoves = (board) => {
    const moves = [];
    for (let c = 0; c < COLS; c++) {
      if (board[0][c] === EMPTY) moves.push(c);
    }
    return moves;
  };

  const makeMove = (board, col, player) => {
    const newBoard = board.map(row => [...row]);
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newBoard[r][col] === EMPTY) {
        newBoard[r][col] = player;
        return newBoard;
      }
    }
    return null;
  };

  // --- AI (Minimax with Alpha-Beta Pruning) ---

  const evaluateWindow = (window, piece) => {
    let score = 0;
    const oppPiece = piece === PLAYER ? AI : PLAYER;
    let countPiece = window.filter(p => p === piece).length;
    let countEmpty = window.filter(p => p === EMPTY).length;
    let countOpp = window.filter(p => p === oppPiece).length;

    if (countPiece === 4) score += 100;
    else if (countPiece === 3 && countEmpty === 1) score += 5;
    else if (countPiece === 2 && countEmpty === 2) score += 2;

    if (countOpp === 3 && countEmpty === 1) score -= 4;

    return score;
  };

  const scorePosition = (board, piece) => {
    let score = 0;

    // Center Column Preference
    const centerArray = board.map(row => row[Math.floor(COLS/2)]);
    const centerCount = centerArray.filter(p => p === piece).length;
    score += centerCount * 3;

    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const window = [board[r][c], board[r][c+1], board[r][c+2], board[r][c+3]];
        score += evaluateWindow(window, piece);
      }
    }
    // Vertical
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS; c++) {
        const window = [board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]];
        score += evaluateWindow(window, piece);
      }
    }
    // Diagonal /
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const window = [board[r][c], board[r-1][c+1], board[r-2][c+2], board[r-3][c+3]];
        score += evaluateWindow(window, piece);
      }
    }
    // Diagonal \
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const window = [board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]];
        score += evaluateWindow(window, piece);
      }
    }

    return score;
  };

  const minimax = (board, depth, alpha, beta, maximizingPlayer) => {
    const validMoves = getValidMoves(board);
    const isTerminal = checkWin(board, PLAYER) || checkWin(board, AI) || validMoves.length === 0;

    if (depth === 0 || isTerminal) {
      if (checkWin(board, AI)) return [null, 1000000];
      if (checkWin(board, PLAYER)) return [null, -1000000];
      if (validMoves.length === 0) return [null, 0];
      return [null, scorePosition(board, AI)];
    }

    if (maximizingPlayer) {
      let value = -Infinity;
      let column = validMoves[Math.floor(Math.random() * validMoves.length)];
      for (const col of validMoves) {
        const newBoard = makeMove(board, col, AI);
        const newScore = minimax(newBoard, depth - 1, alpha, beta, false)[1];
        if (newScore > value) {
          value = newScore;
          column = col;
        }
        alpha = Math.max(alpha, value);
        if (alpha >= beta) break;
      }
      return [column, value];
    } else {
      let value = Infinity;
      let column = validMoves[Math.floor(Math.random() * validMoves.length)];
      for (const col of validMoves) {
        const newBoard = makeMove(board, col, PLAYER);
        const newScore = minimax(newBoard, depth - 1, alpha, beta, true)[1];
        if (newScore < value) {
          value = newScore;
          column = col;
        }
        beta = Math.min(beta, value);
        if (alpha >= beta) break;
      }
      return [column, value];
    }
  };

  // --- Interaction ---

  const handleColumnClick = async (col) => {
    if (winner || currentPlayer !== PLAYER || isThinking) return;

    // Player Move
    const newBoard = makeMove(board, col, PLAYER);
    if (!newBoard) return; // Invalid move (column full)

    setBoard(newBoard);
    if (checkWin(newBoard, PLAYER)) {
      setWinner(PLAYER);
      return;
    }
    setCurrentPlayer(AI);
    setIsThinking(true);

    // AI Move (Delayed for realism)
    setTimeout(() => {
      const [aiCol, _] = minimax(newBoard, DEPTH, -Infinity, Infinity, true);
      if (aiCol !== null) {
        const aiBoard = makeMove(newBoard, aiCol, AI);
        setBoard(aiBoard);
        if (checkWin(aiBoard, AI)) {
          setWinner(AI);
        } else {
          setCurrentPlayer(PLAYER);
        }
      }
      setIsThinking(false);
    }, 500);
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY)));
    setWinner(null);
    setCurrentPlayer(PLAYER);
    setIsThinking(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 font-mono text-xl">
        {winner === PLAYER && <span className="text-green-400">YOU WIN!</span>}
        {winner === AI && <span className="text-red-500">AI WINS!</span>}
        {!winner && isThinking && <span className="text-red-400 animate-pulse">AI THINKING...</span>}
        {!winner && !isThinking && <span className="text-green-400">YOUR TURN</span>}
      </div>

      <div className="bg-blue-900 p-4 rounded-lg border-4 border-blue-500 shadow-[0_0_20px_rgba(0,0,255,0.5)]">
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <div
                key={c}
                className="w-10 h-10 m-1 rounded-full border border-blue-800 cursor-pointer relative"
                style={{
                  backgroundColor: '#000033',
                }}
                onClick={() => handleColumnClick(c)}
              >
                {cell === PLAYER && (
                  <div className="absolute inset-1 rounded-full bg-green-500 shadow-[0_0_10px_#00ff00] animate-bounce-short" />
                )}
                {cell === AI && (
                  <div className="absolute inset-1 rounded-full bg-red-500 shadow-[0_0_10px_#ff0000] animate-bounce-short" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 text-green-600 text-sm">
        Click columns to drop chips. Connect 4 to win.
      </div>

      {winner && (
        <button
          onClick={resetGame}
          className="mt-6 px-6 py-2 bg-green-600 text-black font-bold rounded hover:bg-green-500"
        >
          PLAY AGAIN
        </button>
      )}
    </div>
  );
};

export default CyberConnect4;
