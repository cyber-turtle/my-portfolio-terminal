'use client';

import React, { useState, useEffect } from 'react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null); // 'X', 'O', 'Draw', or null
  const [difficulty, setDifficulty] = useState('hard'); // 'easy', 'medium', 'hard'

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.includes(null) ? null : 'Draw';
  };

  const minMax = (squares, depth, isMaximizing) => {
    const result = checkWinner(squares);
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'Draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'O';
          const score = minMax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'X';
          const score = minMax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (squares) => {
    let bestScore = -Infinity;
    let move = -1;
    
    // Randomness for lower difficulties
    if (difficulty === 'easy' && Math.random() < 0.7) {
        const available = squares.map((v, i) => v === null ? i : null).filter(v => v !== null);
        return available[Math.floor(Math.random() * available.length)];
    }
    if (difficulty === 'medium' && Math.random() < 0.3) {
        const available = squares.map((v, i) => v === null ? i : null).filter(v => v !== null);
        return available[Math.floor(Math.random() * available.length)];
    }

    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = 'O';
        const score = minMax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      // AI Turn
      const timer = setTimeout(() => {
        const nextBoard = [...board];
        const move = getBestMove(nextBoard);
        if (move !== -1) {
          nextBoard[move] = 'O';
          setBoard(nextBoard);
          const result = checkWinner(nextBoard);
          if (result) setWinner(result);
          else setIsPlayerTurn(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner, board]);

  const handleClick = (i) => {
    if (board[i] || winner || !isPlayerTurn) return;
    const nextBoard = [...board];
    nextBoard[i] = 'X';
    setBoard(nextBoard);
    const result = checkWinner(nextBoard);
    if (result) setWinner(result);
    else setIsPlayerTurn(false);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsPlayerTurn(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-green-500 font-mono p-4">
      <h2 className="text-2xl mb-4 font-bold tracking-widest">TIC-TAC-TOE_AI.EXE</h2>
      
      <div className="mb-4 flex gap-4">
          {['easy', 'medium', 'hard'].map(d => (
              <button 
                key={d}
                onClick={() => { setDifficulty(d); resetGame(); }}
                className={`px-3 py-1 border ${difficulty === d ? 'bg-green-900 border-green-400 text-white' : 'border-green-700 text-green-700'} uppercase text-xs transition-colors`}
              >
                  {d}
              </button>
          ))}
      </div>

      <div className="grid grid-cols-3 gap-2 bg-green-900/20 p-2 border-2 border-green-600 rounded">
        {board.map((square, i) => (
          <button
            key={i}
            className={`w-20 h-20 flex items-center justify-center text-4xl font-bold border border-green-800 hover:bg-green-800/50 transition-colors ${
                square === 'X' ? 'text-blue-400' : square === 'O' ? 'text-red-400' : ''
            }`}
            onClick={() => handleClick(i)}
            disabled={!!square || !!winner || !isPlayerTurn}
          >
            {square}
          </button>
        ))}
      </div>

      <div className="mt-6 h-8 text-center">
        {winner ? (
          <div className="animate-pulse text-xl font-bold">
            {winner === 'Draw' ? 'GAME DRAW - AI CALCULATED OPTIMALITY' : `${winner} WINS! SYSTEM ${winner === 'O' ? 'SUPERIOR' : 'COMPROMISED'}`}
          </div>
        ) : (
          <div className="text-sm opacity-75">
            {isPlayerTurn ? "> AWAITING PLAYER INPUT..." : "> AI COMPUTING NEXT MOVE..."}
          </div>
        )}
      </div>

      {winner && (
        <button
          onClick={resetGame}
          className="mt-4 px-6 py-2 border-2 border-green-500 hover:bg-green-500 hover:text-black transition-colors font-bold"
        >
          REBOOT SYSTEM
        </button>
      )}
    </div>
  );
};

export default TicTacToe;
