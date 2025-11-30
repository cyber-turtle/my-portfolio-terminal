'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, RefreshCw } from 'lucide-react';
import FaultyTerminal from './FaultyTerminal';
import RetroLoader from './RetroLoader';
import RetroGameOverlay from './RetroGameOverlay';
import Pong from './games/Pong';
import Snake from './games/Snake';
import SpaceInvaders from './games/SpaceInvaders';
import Tetris from './games/Tetris';
import Breakout from './games/Breakout';
import KongClimb from './games/KongClimb';
import FlappyTerminal from './games/FlappyTerminal';
import CyberConnect4 from './games/CyberConnect4';
import TicTacToe from './games/TicTacToe';
import RetroRacing from './games/RetroRacing';
import Pacman from './games/Pacman';
import DriveXS from './games/DriveXS';
import GlitchBuster from './games/GlitchBuster';
import OhFlip from './games/OhFlip';
import WayOut from './games/WayOut';



// --- Static Game Data ---

const HANGMAN_WORDS = ['REACT', 'JAVASCRIPT', 'TAILWIND', 'FIREBASE', 'MOBILE', 'ARCHITECT'];

// Rock Paper Scissors choices
const RPS_CHOICES = ['rock', 'paper', 'scissors'];
const RPS_EMOJIS = { rock: '🪨', paper: '📄', scissors: '✂️' };

// Snake game constants
const SNAKE_GRID_SIZE = 10;
const SNAKE_DIRECTIONS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };

// Quiz questions
const QUIZ_QUESTIONS = [
  { q: 'What does HTML stand for?', a: 'hypertext markup language', options: ['A) Hypertext Markup Language', 'B) Home Tool Markup Language', 'C) Hyperlinks and Text Markup Language'] },
  { q: 'Which company created JavaScript?', a: 'netscape', options: ['A) Microsoft', 'B) Netscape', 'C) Google'] },
  { q: 'What does CSS stand for?', a: 'cascading style sheets', options: ['A) Computer Style Sheets', 'B) Cascading Style Sheets', 'C) Creative Style Sheets'] },
  { q: 'What year was React released?', a: '2013', options: ['A) 2012', 'B) 2013', 'C) 2014'] }
];

const HANGMAN_ASCII = [
    `
  +---+
  |   |
      |
      |
      |
      |
=========`,
    `
  +---+
  |   |
  O   |
      |
      |
      |
=========`,
    `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
    `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
    `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
    `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
    `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
========= (GAME OVER)`
];

const renderBoard = (board) => {
    // Board is 9 elements: [X, O, _, X, _, O, _, X, O]
    return `
 ${board[0]} | ${board[1]} | ${board[2]}
---+---+---
 ${board[3]} | ${board[4]} | ${board[5]}
---+---+---
 ${board[6]} | ${board[7]} | ${board[8]}
(Enter cell number 1-9)`;
};

const checkTictactoeWinner = (board) => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6],           // Diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (board[a] !== ' ' && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // Returns 'X' or 'O'
        }
    }
    if (board.every(cell => cell !== ' ')) {
        return 'Draw';
    }
    return null;
};


// --- CSS Keyframes for Animations (Embedded in JS) ---
const terminalStyles = `
/* Global Terminal Styles */
.terminal-bg {
    background-color: #0b0f0c; /* Very dark green/black */
    color: #38ef7d; /* Bright neon green */
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    min-height: 100vh;
    padding: 1rem;
    overflow-x: hidden;
}

/* Typing Animation Keyframes */
@keyframes typing {
    from { width: 0 }
    to { width: 100% }
}

@keyframes blink-caret {
    from, to { border-color: transparent }
    50% { border-color: #38ef7d; }
}

/* Line that is currently typing */
.typing-line {
    overflow: hidden; 
    white-space: pre; 
    width: 0; 
    animation: 
      typing 0.03s steps(40, end) forwards, 
      blink-caret 0.75s step-end infinite; 
}

/* Once typing is finished, remove cursor and allow full width */
.finished-typing {
    animation: none;
    border-right: none;
    white-space: pre-wrap; 
    width: 100% !important;
}

/* Pre-Boot Text */
.boot-text {
    font-size: 1.1rem;
}

/* Custom Scrollbar for Terminal Feel - Fixed overlap */
.terminal-output-scroll {
    padding-right: 25px;
    margin-right: -25px;
}

.terminal-output-scroll::-webkit-scrollbar {
    width: 14px;
}

.terminal-output-scroll::-webkit-scrollbar-thumb {
    background-color: #38ef7d;
    border-radius: 0;
    border: 2px solid #0b0f0c;
    box-shadow: inset 0 0 0 1px #2dd865;
}
.terminal-output-scroll::-webkit-scrollbar-track {
    background-color: #0b0f0c;
    border-radius: 0;
    border: 1px solid #1a5e35;
    margin: 4px 0;
}

/* Input Styles */
#terminal-input:enabled {
    caret-color: #38ef7d;
}

/* FIX: Barely Visible Placeholder Style */
#terminal-input::placeholder {
    color: #1a5e35; /* Dark, barely visible green */
    font-size: 0.9rem; /* Smaller size */
    opacity: 0.8; /* Ensure it's not too bright */
}
`;

// Animated Profile Image Component
const AnimatedProfileImage = ({ onComplete }) => {
    const [visibleLines, setVisibleLines] = useState(0);
    const imageHeight = 200; // Total image height
    const totalLines = 20; // Number of lines to reveal
    
    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleLines(prev => {
                if (prev >= totalLines) {
                    clearInterval(interval);
                    onComplete && onComplete();
                    return prev;
                }
                return prev + 1;
            });
        }, 100); // Reveal a line every 100ms
        
        return () => clearInterval(interval);
    }, [onComplete, totalLines]);
    
    const clipHeight = (visibleLines / totalLines) * imageHeight;
    
    return (
        <div className="my-4 flex justify-center">
            <div 
                className="relative overflow-hidden border border-green-500"
                style={{ width: '150px', height: `${imageHeight}px` }}
            >
                <img 
                    src="/profile-me.jpg" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    style={{
                        clipPath: `inset(0 0 ${imageHeight - clipHeight}px 0)`
                    }}
                />
                {visibleLines < totalLines && (
                    <div 
                        className="absolute bottom-0 left-0 right-0 bg-green-500 opacity-50"
                        style={{ height: '2px' }}
                    />
                )}
            </div>
        </div>
    );
};


// --- Helper Component: Typing Effect for Initial Boot Lines ---

const Typewriter = ({ text, onFinish }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        if (!text) return;
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(prev => prev + text[i]);
                i++;
            } else {
                clearInterval(typingInterval);
                setCursorVisible(false);
                onFinish && onFinish();
            }
        }, 30); 

        return () => clearInterval(typingInterval);
    }, [text, onFinish]);

    return (
        <span className="whitespace-pre-wrap">
            {displayedText}
            {cursorVisible && <span className="animate-pulse">|</span>}
        </span>
    );
};


// --- Main App Component ---

const MobilePortfolio = () => {
    const [isBooted, setIsBooted] = useState(false);
    const [showInitialLoading, setShowInitialLoading] = useState(true);
    const [showLoader, setShowLoader] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState('');
    const [currentLoaderText, setCurrentLoaderText] = useState('');
    const terminalRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimeoutsRef = useRef([]);
    const [terminalDisabled, setTerminalDisabled] = useState(false); 
    
    // Game States
    const [numberGameActive, setNumberGameActive] = useState(false);
    const [secretNumber, setSecretNumber] = useState(null);
    const [numberAttempts, setNumberAttempts] = useState(0);

    const [hangmanActive, setHangmanActive] = useState(false);
    const [hangmanWord, setHangmanWord] = useState('');
    const [hangmanGuessedLetters, setHangmanGuessedLetters] = useState(new Set());
    const [hangmanMistakes, setHangmanMistakes] = useState(0);
    const HANGMAN_MAX_MISTAKES = HANGMAN_ASCII.length - 1;

    const [tictactoeActive, setTictactoeActive] = useState(false);
    const [tictactoeBoard, setTictactoeBoard] = useState(Array(9).fill(' '));
    const [tictactoeCurrentPlayer, setTictactoeCurrentPlayer] = useState('X');

    // Rock Paper Scissors state
    const [rpsActive, setRpsActive] = useState(false);
    const [rpsScore, setRpsScore] = useState({ player: 0, computer: 0 });

    // Snake game state
    const [snakeActive, setSnakeActive] = useState(false);
    const [snake, setSnake] = useState([[5, 5]]);
    const [food, setFood] = useState([7, 7]);
    const [direction, setDirection] = useState('right');
    const [snakeScore, setSnakeScore] = useState(0);

    // Quiz game state
    const [quizActive, setQuizActive] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [quizScore, setQuizScore] = useState(0);

    // Memory game state
    const [memoryActive, setMemoryActive] = useState(false);
    const [memorySequence, setMemorySequence] = useState([]);
    const [memoryUserInput, setMemoryUserInput] = useState([]);
    const [memoryLevel, setMemoryLevel] = useState(1);
    const [memoryShowingSequence, setMemoryShowingSequence] = useState(false);

    // YouTube video state
    const [showVideo, setShowVideo] = useState(false);
    
    // Retro Games State
    const [activeGame, setActiveGame] = useState(null); // 'pong', 'snake', 'spaceinvaders', etc.
    const [showDriveXSSettings, setShowDriveXSSettings] = useState(false);


    const [bootLines] = useState([
        { text: 'STARTING ANDREW DOSUMU OS V2.1', delay: 0 },
        { text: 'INITIALIZING MODULES AND DEPENDENCIES...', delay: 1500 },
        { text: 'DEVICE: Mobile display detected. For the full immersive experience, please visit on a larger screen.', delay: 3000 },
        { text: 'VERIFYING USER PROFILE DATA... [ OK ]', delay: 4500 },
        { text: 'WELCOME, MOBILE VISITOR. TYPE \'help\' TO BEGIN.', delay: 6000 }
    ]);

    const [currentBootLineIndex, setCurrentBootLineIndex] = useState(0);

    // --- Command Handling Definitions ---
    
    const closeAllGames = useCallback(() => {
        setNumberGameActive(false);
        setHangmanActive(false);
        setTictactoeActive(false);
        setRpsActive(false);
        setSnakeActive(false);
        setQuizActive(false);
        setMemoryActive(false);
    }, []);

    // Helper to print game messages
    const printOutput = useCallback((text) => {
        setHistory(prev => [...prev, { type: 'output', text }]);
    }, [setHistory]);

    // Function to embed ASCII animation directly in terminal
    const handleClearAnimation = useCallback((setHistory) => {
        setTerminalDisabled(true);
        
        // Add the embedded animation as terminal output
        setHistory(prev => [...prev, { 
            type: 'animation', 
            text: 'INITIATING CLEANUP SEQUENCE...' 
        }]);
        
        // Listen for animation completion
        const handleAnimationComplete = () => {
            setHistory([]);
            printOutput('HISTORY WIPED. Terminal Ready.');
            setTerminalDisabled(false);
            if (inputRef.current) inputRef.current.focus();
            window.removeEventListener('message', handleAnimationComplete);
        };
        
        window.addEventListener('message', (event) => {
            if (event.data === 'animationComplete') {
                handleAnimationComplete();
            }
        });
        
        // Fallback timeout in case message doesn't work
        setTimeout(handleAnimationComplete, 8000);
    }, [printOutput, setTerminalDisabled, inputRef]);


    // --- Game Logic Handlers ---

    // 1. Guess the Number Logic
    const handleNumberGuess = useCallback((guessStr) => {
        const guess = parseInt(guessStr.trim(), 10);
        
        if (guessStr.toLowerCase() === 'quit') {
            closeAllGames();
            printOutput('Game terminated. Welcome back to the portfolio terminal.');
        } else if (isNaN(guess) || guess < 1 || guess > 100) {
            printOutput('Invalid input. Please enter a number between 1 and 100, or type \'quit\'.');
        } else {
            const newAttempts = numberAttempts + 1;
            setNumberAttempts(newAttempts);
            
            if (guess === secretNumber) {
                printOutput(`!! CONGRATULATIONS !! The secret number was ${secretNumber}. You guessed it in ${newAttempts} attempts! Type 'guessthenumber' to play again.`);
                closeAllGames();
            } else if (guess < secretNumber) {
                printOutput(`Too low. Try again! (Attempt ${newAttempts})`);
            } else {
                printOutput(`Too high. Try again! (Attempt ${newAttempts})`);
            }
        }
    }, [secretNumber, numberAttempts, closeAllGames, printOutput]);

    // 2. Hangman Logic
    const handleHangmanGuess = useCallback((guessStr) => {
        const guess = guessStr.toUpperCase().trim();
        
        if (guess === 'QUIT') {
            closeAllGames();
            printOutput('Hangman terminated. The word was **' + hangmanWord + '**.');
            return;
        }

        if (guess.length !== 1 || !/[A-Z]/.test(guess)) {
            printOutput('Invalid input. Please enter a single letter, or type \'quit\'.');
            return;
        }

        if (hangmanGuessedLetters.has(guess)) {
            printOutput(`You already guessed '${guess}'. Try a different letter.`);
            printOutput(HANGMAN_ASCII[hangmanMistakes]);
            return;
        }

        const newGuessedLetters = new Set(hangmanGuessedLetters).add(guess);
        setHangmanGuessedLetters(newGuessedLetters);

        if (hangmanWord.includes(guess)) {
            printOutput(`Correct guess: '${guess}'.`);
        } else {
            const newMistakes = hangmanMistakes + 1;
            setHangmanMistakes(newMistakes);
            printOutput(`Incorrect guess: '${guess}'.`);

            if (newMistakes === HANGMAN_MAX_MISTAKES) {
                printOutput(HANGMAN_ASCII[newMistakes]);
                printOutput(`Game over! The word was **${hangmanWord}**. Type 'hangman' to play again.`);
                closeAllGames();
                return;
            }
        }

        // Check for win
        const currentMaskedWord = hangmanWord.split('').map(letter => newGuessedLetters.has(letter) ? letter : '_').join(' ');
        if (!currentMaskedWord.includes('_')) {
            printOutput(`!! VICTORY !! The word was **${hangmanWord}**. You won in ${hangmanMistakes} mistakes! Type 'hangman' to play again.`);
            closeAllGames();
            return;
        }
        
        printOutput(HANGMAN_ASCII[hangmanMistakes]);
        printOutput(`Word: ${currentMaskedWord}`);
        printOutput(`Incorrect guesses: ${Array.from(newGuessedLetters).filter(l => !hangmanWord.includes(l)).join(', ')}`);

    }, [hangmanWord, hangmanGuessedLetters, hangmanMistakes, closeAllGames, printOutput]);

    // 3. Tic-Tac-Toe Logic
    const handleTictactoeMove = useCallback((moveStr) => {
        const moveIndex = parseInt(moveStr.trim(), 10) - 1; // 1-9 to 0-8 index

        if (moveStr.toLowerCase() === 'quit') {
            closeAllGames();
            printOutput('Tic-Tac-Toe terminated.');
            return;
        }

        if (isNaN(moveIndex) || moveIndex < 0 || moveIndex > 8 || tictactoeBoard[moveIndex] !== ' ') {
            printOutput(`Invalid move. Enter a number between 1 and 9 for an empty cell. Current Player: ${tictactoeCurrentPlayer}`);
            printOutput(renderBoard(tictactoeBoard));
            return;
        }

        const newBoard = [...tictactoeBoard];
        newBoard[moveIndex] = tictactoeCurrentPlayer;
        setTictactoeBoard(newBoard);
        
        const winner = checkTictactoeWinner(newBoard);

        if (winner === 'X' || winner === 'O') {
            printOutput(renderBoard(newBoard));
            printOutput(`Player **${winner}** wins! Type 'tictactoe' to play again.`);
            closeAllGames();
        } else if (winner === 'Draw') {
            printOutput(renderBoard(newBoard));
            printOutput(`Game is a Draw! Type 'tictactoe' to play again.`);
            closeAllGames();
        } else {
            const nextPlayer = tictactoeCurrentPlayer === 'X' ? 'O' : 'X';
            setTictactoeCurrentPlayer(nextPlayer);
            printOutput(renderBoard(newBoard));
            printOutput(`It's Player **${nextPlayer}**'s turn.`);
        }

    }, [tictactoeBoard, tictactoeCurrentPlayer, closeAllGames, printOutput]);

    // 4. Rock Paper Scissors Logic
    const handleRpsMove = useCallback((playerChoice) => {
        if (playerChoice.toLowerCase() === 'quit') {
            closeAllGames();
            printOutput('Rock Paper Scissors terminated.');
            return;
        }

        const choice = playerChoice.toLowerCase();
        if (!RPS_CHOICES.includes(choice)) {
            printOutput(`Invalid choice. Enter 'rock', 'paper', 'scissors', or 'quit'.`);
            return;
        }

        const computerChoice = RPS_CHOICES[Math.floor(Math.random() * 3)];
        let result = '';
        let newScore = { ...rpsScore };

        if (choice === computerChoice) {
            result = "It's a tie!";
        } else if (
            (choice === 'rock' && computerChoice === 'scissors') ||
            (choice === 'paper' && computerChoice === 'rock') ||
            (choice === 'scissors' && computerChoice === 'paper')
        ) {
            result = 'You win this round!';
            newScore.player++;
        } else {
            result = 'Computer wins this round!';
            newScore.computer++;
        }

        setRpsScore(newScore);
        printOutput(`You: ${RPS_EMOJIS[choice]} ${choice} | Computer: ${RPS_EMOJIS[computerChoice]} ${computerChoice}`);
        printOutput(result);
        printOutput(`Score - You: ${newScore.player} | Computer: ${newScore.computer}`);
        printOutput('Enter your next choice or \'quit\' to exit.');
    }, [rpsScore, closeAllGames, printOutput]);

    // 5. Quiz Logic
    const handleQuizAnswer = useCallback((answer) => {
        if (answer.toLowerCase() === 'quit') {
            closeAllGames();
            printOutput('Quiz terminated.');
            return;
        }

        const question = QUIZ_QUESTIONS[currentQuestion];
        const isCorrect = answer.toLowerCase().includes(question.a.toLowerCase()) || 
                         answer.toLowerCase() === 'b' || answer.toLowerCase() === 'a' || answer.toLowerCase() === 'c';
        
        let newScore = quizScore;
        if (isCorrect) {
            newScore++;
            setQuizScore(newScore);
            printOutput('**Correct!** ✅');
        } else {
            printOutput(`**Wrong!** ❌ The answer was: ${question.a}`);
        }

        const nextQuestion = currentQuestion + 1;
        if (nextQuestion >= QUIZ_QUESTIONS.length) {
            printOutput(`\n**Quiz Complete!** Final Score: ${newScore}/${QUIZ_QUESTIONS.length}`);
            if (newScore === QUIZ_QUESTIONS.length) {
                printOutput('Perfect score! 🎉');
            } else if (newScore >= QUIZ_QUESTIONS.length / 2) {
                printOutput('Good job! 👍');
            } else {
                printOutput('Better luck next time! 📚');
            }
            closeAllGames();
        } else {
            setCurrentQuestion(nextQuestion);
            const next = QUIZ_QUESTIONS[nextQuestion];
            printOutput(`\nQuestion ${nextQuestion + 1}: ${next.q}`);
            next.options.forEach(opt => printOutput(opt));
        }
    }, [currentQuestion, quizScore, closeAllGames, printOutput]);

    // 6. Memory Game Logic
    const handleMemoryInput = useCallback((input) => {
        if (input.toLowerCase() === 'quit') {
            closeAllGames();
            printOutput('Memory game terminated.');
            return;
        }

        if (memoryShowingSequence) {
            printOutput('Wait for the sequence to finish!');
            return;
        }

        const numbers = input.split('').map(n => parseInt(n)).filter(n => !isNaN(n) && n >= 1 && n <= 4);
        if (numbers.length === 0) {
            printOutput('Enter numbers 1-4 in sequence, or \'quit\'.');
            return;
        }

        const newUserInput = [...memoryUserInput, ...numbers];
        setMemoryUserInput(newUserInput);

        if (newUserInput.length === memorySequence.length) {
            if (JSON.stringify(newUserInput) === JSON.stringify(memorySequence)) {
                printOutput(`**Correct!** Level ${memoryLevel} complete! 🎉`);
                const newLevel = memoryLevel + 1;
                const newSequence = [...memorySequence, Math.floor(Math.random() * 4) + 1];
                setMemoryLevel(newLevel);
                setMemorySequence(newSequence);
                setMemoryUserInput([]);
                setMemoryShowingSequence(true);
                
                setTimeout(() => {
                    printOutput(`\nLevel ${newLevel} - Memorize this sequence:`);
                    newSequence.forEach((num, i) => {
                        setTimeout(() => {
                            printOutput(`${num}`);
                            if (i === newSequence.length - 1) {
                                setTimeout(() => {
                                    printOutput('Now enter the sequence:');
                                    setMemoryShowingSequence(false);
                                }, 1000);
                            }
                        }, i * 800);
                    });
                }, 1000);
            } else {
                printOutput(`**Wrong!** ❌ The sequence was: ${memorySequence.join('')}`);
                printOutput(`You reached level ${memoryLevel}. Type 'memory' to play again.`);
                closeAllGames();
            }
        } else {
            printOutput(`Entered: ${newUserInput.join('')} (${memorySequence.length - newUserInput.length} more needed)`);
        }
    }, [memorySequence, memoryUserInput, memoryLevel, memoryShowingSequence, closeAllGames, printOutput]);

    // --- Special Animation Handler: sudo rm -rf / ---
    const handleSudoRm = useCallback(() => {
        const lines = [
            "ATTENTION: Unauthorized command detected. Initiating Emergency Deletion Sequence.",
            "SYSTEM WARNING: The 'sudo rm -rf /' command has been accepted.",
            "EXECUTING PRIMARY DIRECTIVE: RECURSIVE DELETE STARTED.",
            "[1/15] Deleting /usr/bin/portfolio_core... [ OK ]",
            "[2/15] Deleting /etc/config/auth_tokens... [ OK ]",
            "[3/15] Deleting /var/log/session_history... [ OK ]",
            "[4/15] Deleting /home/user/important_docs... [ FAILED: Permission Denied ]",
            "[5/15] Retrying /home/user/important_docs... [ OK ] **(Data Loss: 100%)**",
            "[6/15] Deleting /kernel/mobile_optimization... [ OK ]",
            "[7/15] Deleting /dev/graphics/neon_green_theme... [ OK ] (Visual fidelity dropping)",
            "[8/15] Deleting /dev/audio/boot_sequence.wav... [ ERROR: Critical File ]",
            "[9/15] Forcing deletion of /dev/audio/boot_sequence.wav... [ OK ]",
            "[10/15] Deleting /usr/lib/react_native_core... [ OK ]",
            "[11/15] Deleting /etc/nginx/mobile_proxy.conf... [ OK ]",
            "SYSTEM ANNOUNCEMENT: Irreversible data loss imminent. Estimated time to critical failure: 5 seconds...",
            "**5**...",
            "**4**...",
            "**3**...",
            "**2**...",
            "**1**...",
            "**CRITICAL FAILURE. SYSTEM DELETED. THANK YOU FOR PLAYING.**",
            "",
            "***Wait... what's this hidden payload?***"
        ];

        // Recursive function to print lines sequentially with increasing delays
        const updateHistorySequentially = (lineIndex) => {
            if (lineIndex >= lines.length) {
                // Animation complete
                setTimeout(() => {
                    setShowVideo(true);
                    setTimeout(() => {
                        setTerminalDisabled(false);
                        if (inputRef.current) inputRef.current.focus();
                    }, 2000);
                }, 1000); // 1 second delay after the last line prints
                return;
            }

            const line = lines[lineIndex];
            let delayBetween = 500; // Default pause

            // Adjust delay for dramatic effect
            if (line.includes("EXECUTING PRIMARY DIRECTIVE")) {
                delayBetween = 800; 
            } else if (line.includes("FAILED:")) {
                delayBetween = 1500;
            } else if (line.includes("Data Loss") || line.includes("CRITICAL FAILURE")) {
                delayBetween = 2500;
            } else if (line.match(/\*\*(\d)\*\*/)) { // Countdown
                 delayBetween = 1000;
            } else if (line.includes("SYSTEM ANNOUNCEMENT")) {
                delayBetween = 2000;
            }
            
            // If the line is short (like [ OK ]) or very short (countdown), print faster
            if (line.length < 30 && delayBetween < 1000) {
                delayBetween = 500;
            }


            setTimeout(() => {
                // Add the current line to history
                setHistory(prev => [...prev, { type: 'output', text: line }]);
                
                // Scroll to bottom
                if (terminalRef.current) {
                    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
                }
                
                // Process the next line
                updateHistorySequentially(lineIndex + 1);

            }, delayBetween); 
        };
        
        // Start the sequence
        updateHistorySequentially(0);
        
    }, [setHistory, setTerminalDisabled, terminalRef, inputRef]);


    // --- Terminal Data/Commands ---

    const COMMANDS = {
        'help': { 
            output: (setHistory, printOutput) => {
                const fullText = "Available commands:\n- **about**\n- **skills**\n- **projects**\n- **contact**\n- **myapproach** (Development process)\n- **fun_fact** (Whacky trivia)\n\n**GAMES:**\n- **guessthenumber** (Guess 1-100)\n- **hangman** (Word guessing)\n- **rockpaperscissors** (Classic RPS)\n- **quiz** (Tech trivia)\n- **memory** (Sequence memory)\n\n**RETRO GAMES (GUI):**\n- **pong** (Classic Pong)\n- **snake** (Snake Game)\n- **spaceinvaders** (Shooter)\n- **tetris** (Block Puzzle)\n- **breakout** (Brick Breaker)\n- **kong** (Platform Climber)\n- **flappy** (Infinite Runner)\n- **connect4** (vs AI)\n- **tictactoe** (vs MinMax AI)\n- **racing** (Retro Asphalt)\n- **pacman** (Pac-Man Classic)\n- **glitchbuster** (Terminal Defense)\n- **ohflip** (Backflip Challenge)\n- **wayout** (Puzzle Platformer)\n\n**SYSTEM:**\n- **clear** (ASCII animation)\n- **/bye** (Exit terminal)\n- **sudo rm -rf /** (Try it... 😈)";
                
                let currentText = '';
                let index = 0;
                
                const typeChar = () => {
                    if (index < fullText.length) {
                        currentText += fullText[index];
                        setHistory(prev => {
                            const newHistory = [...prev];
                            if (newHistory[newHistory.length - 1]?.type === 'typing') {
                                newHistory[newHistory.length - 1] = { type: 'typing', text: currentText };
                            } else {
                                newHistory.push({ type: 'typing', text: currentText });
                            }
                            return newHistory;
                        });
                        index++;
                        const timeoutId = setTimeout(typeChar, 20);
                        typingTimeoutsRef.current.push(timeoutId);
                    } else {
                        setHistory(prev => {
                            const newHistory = [...prev];
                            newHistory[newHistory.length - 1] = { type: 'output', text: fullText };
                            return newHistory;
                        });
                    }
                };
                typeChar();
                return "";
            }
        },
        'about': {
            output: (setHistory, printOutput) => {
                // Add the profile image first
                setHistory(prev => [...prev, { type: 'profile-image', text: '**[PROFILE: ANDREW_DOSUMU_DEV]**' }]);
                
                // Then add the text content after image animation
                setTimeout(() => {
                    const textContent = `Hey, I'm **Dosumu Andrew**, a **Full-Stack Software Engineer** with over **3 years of experience** crafting scalable systems and sleek interfaces that occasionally work on the first try.\n\nI'm a **First-Class Computer Science graduate** fluent in **C#, Java, Python, PHP, JavaScript, TypeScript, C, and C++**. From building REST APIs with **Node.js, Express.js, Spring Boot, Laravel, FastAPI, Flask, and .NET** to crafting mobile experiences with **React Native and SwiftUI**, I love building things that don't break (most of the time).\n\nWhether it's deploying on **AWS or Vercel**, containerizing with **Docker**, or managing databases with **MySQL, MongoDB, and PostgreSQL**, I believe great software isn't just written, it's crafted. Every line of code carries a bit of thought, frustration, and intention.\n\n**Built with react and unresolved trauma.**\n\nType **'skills'** or **'projects'** for details.`;
                    
                    let currentText = '';
                    let index = 0;
                    
                    const typeChar = () => {
                        if (index < textContent.length) {
                            currentText += textContent[index];
                            setHistory(prev => {
                                const newHistory = [...prev];
                                if (newHistory[newHistory.length - 1]?.type === 'typing') {
                                    newHistory[newHistory.length - 1] = { type: 'typing', text: currentText };
                                } else {
                                    newHistory.push({ type: 'typing', text: currentText });
                                }
                                return newHistory;
                            });
                            index++;
                            const timeoutId = setTimeout(typeChar, 20);
                            typingTimeoutsRef.current.push(timeoutId);
                        } else {
                            setHistory(prev => {
                                const newHistory = [...prev];
                                newHistory[newHistory.length - 1] = { type: 'output', text: textContent };
                                return newHistory;
                            });
                        }
                    };
                    typeChar();
                }, 2200); // Wait for image animation to complete
                
                return "";
            }
        },
        'skills': {
            output: (setHistory, printOutput) => {
                const fullText = `**PROGRAMMING LANGUAGES**:\n` +
                        `> JavaScript (ES6+), TypeScript, Python, PHP, Java, C#, C, C++\n\n` +
                        `**FRONTEND & FRAMEWORKS**:\n` +
                        `> React, Next.js, React Native, SwiftUI\n` +
                        `> HTML5, CSS3, Tailwind CSS, GSAP, Framer Motion\n\n` +
                        `**BACKEND & APIs**:\n` +
                        `> Node.js, Express.js, Spring Boot, Laravel, FastAPI, Flask, .NET\n` +
                        `> REST APIs, Postman\n\n` +
                        `**DATABASES**:\n` +
                        `> MySQL, MongoDB, PostgreSQL, Firebase\n\n` +
                        `**CLOUD & DEPLOYMENT**:\n` +
                        `> AWS, Vercel, Docker\n\n` +
                        `**TOOLS & TESTING**:\n` +
                        `> Git, Webpack, Jest, Canva, SEO Optimization`;
                
                let currentText = '';
                let index = 0;
                
                const typeChar = () => {
                    if (index < fullText.length) {
                        currentText += fullText[index];
                        setHistory(prev => {
                            const newHistory = [...prev];
                            if (newHistory[newHistory.length - 1]?.type === 'typing') {
                                newHistory[newHistory.length - 1] = { type: 'typing', text: currentText };
                            } else {
                                newHistory.push({ type: 'typing', text: currentText });
                            }
                            return newHistory;
                        });
                        index++;
                        setTimeout(typeChar, 15);
                    } else {
                        setHistory(prev => {
                            const newHistory = [...prev];
                            newHistory[newHistory.length - 1] = { type: 'output', text: fullText };
                            return newHistory;
                        });
                    }
                };
                typeChar();
                return "";
            }
        },
        'projects': {
            output: (setHistory, printOutput) => {
                const fullText = "1. **Portfolio V2** (Interactive Web Experience): A high-performance React app with GSAP animations. **Status: Current Project**\n2. **University Health Management Platform** (Full-Stack): Comprehensive digital health system for university students, doctors, and administrators. Features symptom checker, secure file management, real-time communication, appointment booking, and admin dashboard. **Tech: React, TypeScript, Tailwind CSS, Firebase, Supabase, Ollama**\n3. **AI Coding Assistant V1** (VSCode Extension): Intelligent code analysis and patch generation extension with multi-provider LLM support. Features agent mode for automated fixes, chat assistance, and workspace-aware context gathering. **Status: Deprecated due to AI hallucination issues** **Tech: TypeScript, Python, Ollama, Gemini API**\n4. **AI Coding Assistant V2** (VSCode Extension): Enhanced intelligent code analysis extension with improved function calling, AI context management, conversation history, and refined agent/chat modes. Fixes hallucination issues from V1 with better LLM integration. **Tech: TypeScript, Python, Ollama, Gemini API**\n5. **Mobile Terminal Portfolio** (Interactive Terminal): Retro terminal interface with 6 built-in games, animated profile loading, command system, and easter eggs. Features typewriter effects, ASCII animations, and responsive mobile design. **Tech: React, JavaScript, CSS3 Animations**\n6. **Smart Attendance System** (Final Year Project): Biometric attendance system using facial recognition with xbox KinectV2 sensors. Features real-time monitoring, anti-spoofing detection, automated lecture tracking, and passive attendance management. **Tech: Python, Flask, OpenCV, Kinect SDK, SQLite, C#, .NET**";
                
                let currentText = '';
                let index = 0;
                
                const typeChar = () => {
                    if (index < fullText.length) {
                        currentText += fullText[index];
                        setHistory(prev => {
                            const newHistory = [...prev];
                            if (newHistory[newHistory.length - 1]?.type === 'typing') {
                                newHistory[newHistory.length - 1] = { type: 'typing', text: currentText };
                            } else {
                                newHistory.push({ type: 'typing', text: currentText });
                            }
                            return newHistory;
                        });
                        index++;
                        const timeoutId = setTimeout(typeChar, 15);
                        typingTimeoutsRef.current.push(timeoutId);
                    } else {
                        setHistory(prev => {
                            const newHistory = [...prev];
                            newHistory[newHistory.length - 1] = { type: 'output', text: fullText };
                            return newHistory;
                        });
                    }
                };
                typeChar();
                return "";
            }
        },
        'contact': {
            output: (setHistory, printOutput) => {
                const fullText = "Email: **<u><a href='mailto:dev@andrewdosumu.com' style='color: #38ef7d; text-decoration: underline;'>dev@andrewdosumu.com</a></u>**\nLinkedIn: **<u><a href='https://www.linkedin.com/in/andrew-dosumu-491094255?utm_source=share_via&utm_content=profile&utm_medium=member_ios' target='_blank' style='color: #38ef7d; text-decoration: underline;'>linkedin.com/in/andrew-dosumu</a></u>**\nGitHub: **<u><a href='https://github.com/cyber-turtle' target='_blank' style='color: #38ef7d; text-decoration: underline;'>github.com/cyber-turtle</a></u>**\nPortfolio: **well youre here already, what else you expecting, a cookie?**";
                
                let currentText = '';
                let index = 0;
                
                const typeChar = () => {
                    if (index < fullText.length) {
                        currentText += fullText[index];
                        setHistory(prev => {
                            const newHistory = [...prev];
                            if (newHistory[newHistory.length - 1]?.type === 'typing') {
                                newHistory[newHistory.length - 1] = { type: 'typing', text: currentText };
                            } else {
                                newHistory.push({ type: 'typing', text: currentText });
                            }
                            return newHistory;
                        });
                        index++;
                        const timeoutId = setTimeout(typeChar, 25);
                        typingTimeoutsRef.current.push(timeoutId);
                    } else {
                        setHistory(prev => {
                            const newHistory = [...prev];
                            newHistory[newHistory.length - 1] = { type: 'output', text: fullText };
                            return newHistory;
                        });
                    }
                };
                typeChar();
                return "";
            }
        },
        'fun_fact': {
            output: () => {
                const facts = [
                    "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible.",
                    "A group of flamingos is called a 'flamboyance'.",
                    "Bananas are berries, but strawberries aren't.",
                    "The shortest war in history lasted only 38-45 minutes between Britain and Zanzibar in 1896.",
                    "Octopuses have three hearts and blue blood.",
                    "A shrimp's heart is in its head.",
                    "Elephants are afraid of bees and will avoid them at all costs.",
                    "The Great Wall of China isn't visible from space with the naked eye.",
                    "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid of Giza.",
                    "There are more possible games of chess than atoms in the observable universe.",
                    "A day on Venus is longer than its year.",
                    "Wombat poop is cube-shaped.",
                    "The unicorn is Scotland's national animal.",
                    "A group of pandas is called an 'embarrassment'.",
                    "Sharks have been around longer than trees.",
                    "The human brain uses about 20% of the body's total energy.",
                    "Dolphins have names for each other.",
                    "A bolt of lightning is five times hotter than the surface of the sun.",
                    "The longest recorded flight of a chicken is 13 seconds.",
                    "Butterflies taste with their feet.",
                    "A group of owls is called a 'parliament'.",
                    "The dot over a lowercase 'i' or 'j' is called a tittle.",
                    "Penguins can jump as high as 6 feet in the air.",
                    "The average person walks past 36 murderers in their lifetime.",
                    "A crocodile cannot stick its tongue out.",
                    "Sea otters hold hands when they sleep to keep from drifting apart.",
                    "The fingerprints of a koala are so indistinguishable from humans that they have on occasion been confused at a crime scene.",
                    "A group of crows is called a 'murder'.",
                    "The longest place name in the world has 85 letters.",
                    "Lobsters were once considered poor people's food.",
                    "The human nose can detect over 1 trillion different scents.",
                    "A group of jellyfish is called a 'smack'.",
                    "The average person spends 6 months of their lifetime waiting for red lights to turn green.",
                    "Cats have 32 muscles in each ear.",
                    "The world's oldest known living tree is over 4,800 years old.",
                    "A group of hedgehogs is called a 'prickle'.",
                    "The human eye can distinguish about 10 million colors.",
                    "Sloths only defecate once a week.",
                    "The longest hiccupping fit lasted 68 years.",
                    "A group of ferrets is called a 'business'.",
                    "The average cloud weighs about 1.1 million pounds.",
                    "Giraffes only need 5 to 30 minutes of sleep per day.",
                    "A group of pugs is called a 'grumble'.",
                    "The human heart beats about 100,000 times per day.",
                    "Polar bears have black skin under their white fur.",
                    "A group of rhinoceroses is called a 'crash'.",
                    "The average person produces about 25,000 quarts of saliva in their lifetime.",
                    "Hummingbirds are the only birds that can fly backwards.",
                    "A group of zebras is called a 'dazzle'.",
                    "The human body contains enough iron to make a 3-inch nail.",
                    "Kangaroos can't walk backwards.",
                    "A group of hippos is called a 'bloat'.",
                    "The average person blinks about 17,000 times per day.",
                    "Snails can sleep for up to 3 years.",
                    "A group of lemurs is called a 'conspiracy'.",
                    "The human stomach gets an entirely new lining every 3-4 days.",
                    "Goldfish have a memory span of at least 3 months, not 3 seconds.",
                    "A group of baboons is called a 'troop'.",
                    "The average person laughs about 17 times per day.",
                    "Camels have three eyelids to protect against blowing sand.",
                    "A group of gorillas is called a 'band'.",
                    "The human body produces about 1.5 liters of saliva per day.",
                    "Dragonflies have been around for 300 million years.",
                    "A group of meerkats is called a 'mob'.",
                    "The average person dreams for about 2 hours each night.",
                    "Bees communicate through dancing.",
                    "A group of otters is called a 'romp'.",
                    "The human brain is about 75% water.",
                    "Spiders are found on every continent except Antarctica.",
                    "A group of wolves is called a 'pack'.",
                    "The average person takes about 23,000 breaths per day.",
                    "Frogs don't drink water; they absorb it through their skin.",
                    "A group of lions is called a 'pride'.",
                    "The human body has about 37.2 trillion cells.",
                    "Chameleons can move their eyes independently of each other.",
                    "A group of elephants is called a 'herd'.",
                    "The average person's hair grows about 6 inches per year.",
                    "Owls can rotate their heads 270 degrees.",
                    "A group of whales is called a 'pod'.",
                    "The human body produces about 1.5 liters of mucus per day.",
                    "Peacocks are male; peahens are female.",
                    "A group of fish is called a 'school'.",
                    "The average person walks about 7,500 steps per day.",
                    "Turtles can breathe through their butts.",
                    "A group of geese is called a 'gaggle' on land and a 'skein' in flight.",
                    "The human body has 206 bones at birth but only 206 in adulthood.",
                    "Woodpeckers don't get headaches despite hitting trees 20 times per second.",
                    "A group of ducks is called a 'raft' on water and a 'team' on land.",
                    "The average person spends about 26 years sleeping.",
                    "Seahorses are the only species where males give birth.",
                    "A group of swans is called a 'bevy'.",
                    "The human body replaces itself every 7-10 years at the cellular level.",
                    "Axolotls can regenerate entire limbs.",
                    "A group of ravens is called an 'unkindness'.",
                    "The average person eats about 35 tons of food in their lifetime.",
                    "Mantis shrimp have the most complex eyes in the animal kingdom.",
                    "A group of starlings is called a 'murmuration'.",
                    "The human body produces about 300 billion new cells every day.",
                    "Tardigrades can survive in space.",
                    "A group of turkeys is called a 'rafter'.",
                    "The average person spends about 5 years eating.",
                    "Cuttlefish can change color and texture instantly.",
                    "A group of peacocks is called an 'ostentation'.",
                    "The human body has enough carbon to make 900 pencils.",
                    "Pistol shrimp can create bubbles that reach 4,700°C.",
                    "A group of vultures is called a 'wake'.",
                    "The average person produces about 40 pounds of dead skin cells per year.",
                    "Archerfish can shoot water to knock insects into the water.",
                    "A group of storks is called a 'mustering'.",
                    "The human body has about 2-4 million sweat glands."
                ];
                return facts[Math.floor(Math.random() * facts.length)];
            }
        },
        '/bye': {
            output: "Logging out...\nSession terminated.\n[Connection closed]",
            action: (setTerminalDisabled) => {
                setTerminalDisabled(true);
                setTimeout(() => {
                    document.body.style.cssText = `
                        animation: crtShutdown 1s ease-out forwards;
                        overflow: hidden;
                        background: black;
                    `;
                    const style = document.createElement('style');
                    style.textContent = `
                        @keyframes crtShutdown {
                            0% { transform: scale(1); filter: brightness(1); }
                            60% { transform: scaleY(0.003) scaleX(1); filter: brightness(2); }
                            80% { transform: scaleY(0.003) scaleX(0.05); filter: brightness(4); }
                            100% { transform: scale(0); filter: brightness(0); }
                        }
                        body::before {
                            content: '';
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: radial-gradient(circle at center, white 0%, transparent 30%);
                            opacity: 0;
                            animation: whiteBloom 1s ease-out forwards;
                            z-index: 9998;
                        }
                        body::after {
                            content: '';
                            position: fixed;
                            top: 50%;
                            left: 50%;
                            width: 3px;
                            height: 3px;
                            background: white;
                            border-radius: 50%;
                            transform: translate(-50%, -50%);
                            animation: centerDot 1s ease-out forwards;
                            z-index: 9999;
                        }
                        @keyframes whiteBloom {
                            0% { opacity: 0; }
                            70% { opacity: 0; }
                            85% { opacity: 0.3; }
                            100% { opacity: 0; }
                        }
                        @keyframes centerDot {
                            0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
                            70% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
                            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 30px white; }
                            90% { opacity: 1; transform: translate(-50%, -50%) scale(0.8); box-shadow: 0 0 15px white; }
                            100% { opacity: 0; transform: translate(-50%, -50%) scale(0); box-shadow: none; }
                        }
                    `;
                    document.head.appendChild(style);
                    setTimeout(() => {
                        document.body.innerHTML = '<div style="background:black;color:#38ef7d;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;font-size:1.5rem;">Terminal session ended</div>';
                    }, 1000);
                }, 500);
            }
        },
        'myapproach': {
            output: (setHistory, printOutput) => {
                const fullText = `**My Development Approach** 🚀

**1) Planning & Strategy** 📋
We'll collaborate to map out your website's goals, target audience, and key functionalities. We'll discuss things like site structure, navigation, and content requirements.

**2) Development & Progress Updates** 💻
Once we agree on the plan, I cue my lofi playlist and dive into coding. From initial sketches to polished code, I keep you updated every step of the way.

**3) Development & Launch** 🎯
This is where the magic happens! Based on the approved design, I'll translate everything into functional code, building your website from the ground up.`;
                
                let currentText = '';
                let index = 0;
                
                const typeChar = () => {
                    if (index < fullText.length) {
                        currentText += fullText[index];
                        setHistory(prev => {
                            const newHistory = [...prev];
                            if (newHistory[newHistory.length - 1]?.type === 'typing') {
                                newHistory[newHistory.length - 1] = { type: 'typing', text: currentText };
                            } else {
                                newHistory.push({ type: 'typing', text: currentText });
                            }
                            return newHistory;
                        });
                        index++;
                        setTimeout(typeChar, 30);
                    } else {
                        setHistory(prev => {
                            const newHistory = [...prev];
                            newHistory[newHistory.length - 1] = { type: 'output', text: fullText };
                            return newHistory;
                        });
                    }
                };
                typeChar();
                return "";
            }
        },
        'clear': { 
            output: handleClearAnimation
        },
        'default': {
            output: (cmd) => `Error: Command not found: **${cmd}**. Type **'help'** for a list of commands.`
        },
        // Renamed command
        'guessthenumber': {
            output: () => {
                closeAllGames(); // Close others first
                const secret = Math.floor(Math.random() * 100) + 1;
                setSecretNumber(secret);
                setNumberAttempts(0);
                setNumberGameActive(true);
                return `Game Started! I'm thinking of a number between 1 and 100. Type your guess and press Enter. (Type 'quit' to exit game)`;
            }
        },
        // New Hangman Command
        'hangman': {
            output: () => {
                closeAllGames();
                const word = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
                setHangmanWord(word);
                setHangmanGuessedLetters(new Set());
                setHangmanMistakes(0);
                setHangmanActive(true);
                const maskedWord = Array(word.length).fill('_').join(' ');
                return `Hangman Started! Word length: ${word.length}.\n${HANGMAN_ASCII[0]}\nWord: ${maskedWord}\n(Enter a letter or 'quit')`;
            }
        },
        // Tic-Tac-Toe (GUI Version)
        'tictactoe': {
            output: () => {
                setActiveGame('tictactoe');
                return "Launching TIC-TAC-TOE_AI.EXE...";
            }
        },
        // Retro Racing
        'racing': {
            output: () => {
                setActiveGame('racing');
                return "Launching RETRO_RACING.EXE...";
            }
        },
        // Pacman
        'pacman': {
            output: () => {
                setActiveGame('pacman');
                return "Launching PACMAN.EXE...";
            }
        },
        // Rock Paper Scissors
        'rockpaperscissors': {
            output: () => {
                closeAllGames();
                setRpsScore({ player: 0, computer: 0 });
                setRpsActive(true);
                return `Rock Paper Scissors Started! 🪨📄✂️\nEnter 'rock', 'paper', or 'scissors' to play. Type 'quit' to exit.`;
            }
        },
        'rps': {
            output: () => {
                closeAllGames();
                setRpsScore({ player: 0, computer: 0 });
                setRpsActive(true);
                return `Rock Paper Scissors Started! 🪨📄✂️\nEnter 'rock', 'paper', or 'scissors' to play. Type 'quit' to exit.`;
            }
        },
        // Quiz Game
        'quiz': {
            output: () => {
                closeAllGames();
                setCurrentQuestion(0);
                setQuizScore(0);
                setQuizActive(true);
                const first = QUIZ_QUESTIONS[0];
                return `Tech Quiz Started! 🧠\n\nQuestion 1: ${first.q}\n${first.options.join('\n')}\n\nEnter A, B, C or type the full answer. Type 'quit' to exit.`;
            }
        },
        // Memory Game
        'memory': {
            output: () => {
                closeAllGames();
                const sequence = [Math.floor(Math.random() * 4) + 1];
                setMemorySequence(sequence);
                setMemoryUserInput([]);
                setMemoryLevel(1);
                setMemoryActive(true);
                setMemoryShowingSequence(true);
                
                setTimeout(() => {
                    printOutput('Level 1 - Memorize this sequence:');
                    printOutput(sequence[0].toString());
                    setTimeout(() => {
                        printOutput('Now enter the sequence (numbers 1-4):');
                        setMemoryShowingSequence(false);
                    }, 1500);
                }, 500);
                
                return `Memory Game Started! 🧠\nWatch the sequence and repeat it back.\nNumbers represent: 1=🔴 2=🔵 3=🟢 4=🟡`;
            }
        },
        // Retro GUI Games
        'pong': {
            output: () => {
                setActiveGame('pong');
                return "Launching PONG.EXE...";
            }
        },
        'snake': {
            output: () => {
                setActiveGame('snake');
                return "Launching SNAKE.EXE...";
            }
        },
        'spaceinvaders': {
            output: () => {
                setActiveGame('spaceinvaders');
                return "Launching SPACE_INVADERS.EXE...";
            }
        },
        'tetris': {
            output: () => {
                setActiveGame('tetris');
                return "Launching TETRIS.EXE...";
            }
        },
        'breakout': {
            output: () => {
                setActiveGame('breakout');
                return "Launching BREAKOUT.EXE...";
            }
        },
        'kong': {
            output: () => {
                setActiveGame('kong');
                return "Launching KONG_CLIMB.EXE...";
            }
        },
        'flappy': {
            output: () => {
                setActiveGame('flappy');
                return "Launching FLAPPY_TERMINAL.EXE...";
            }
        },
        'connect4': {
            output: () => {
                setActiveGame('connect4');
                return "Initializing Cyber Connect 4 AI...";
            }
        },
        'drivexs': {
            output: () => {
                setActiveGame('drivexs');
                return "Launching DRIVEXS.EXE...";
            }
        },
        'glitchbuster': {
            output: () => {
                setActiveGame('glitchbuster');
                return "Initializing GLITCH_BUSTER.EXE...";
            }
        },
        'ohflip': {
            output: () => {
                setActiveGame('ohflip');
                return "Launching OH_FLIP.EXE...";
            }
        },
        'wayout': {
            output: () => {
                setActiveGame('wayout');
                return "Launching WAY_OUT.EXE...";
            }
        },
        'games': {
            output: (setHistory, printOutput) => {
                const fullText = "**AVAILABLE GAMES:**\n\n**TEXT-BASED GAMES:**\n- **guessthenumber** - Guess a number between 1-100\n- **hangman** - Word guessing game\n- **rockpaperscissors** - Classic RPS\n- **quiz** - Tech trivia questions\n- **memory** - Sequence memory game\n\n**RETRO GUI GAMES:**\n- **pong** - Classic Pong\n- **snake** - Snake Game\n- **spaceinvaders** - Space shooter\n- **tetris** - Block puzzle\n- **breakout** - Brick breaker\n- **kong** - Platform climber\n- **flappy** - Infinite runner\n- **connect4** - Connect 4 vs AI\n- **tictactoe** - Tic-Tac-Toe vs AI\n- **racing** - Retro racing\n- **pacman** - Pac-Man classic\n- **drivexs** - Terminal racing with settings\n- **glitchbuster** - Terminal defense system\n- **ohflip** - Backflip challenge game\n- **wayout** - Puzzle platformer adventure\n\nType any game name to start playing!";
                
                let currentText = '';
                let index = 0;
                
                const typeChar = () => {
                    if (index < fullText.length) {
                        currentText += fullText[index];
                        setHistory(prev => {
                            const newHistory = [...prev];
                            if (newHistory[newHistory.length - 1]?.type === 'typing') {
                                newHistory[newHistory.length - 1] = { type: 'typing', text: currentText };
                            } else {
                                newHistory.push({ type: 'typing', text: currentText });
                            }
                            return newHistory;
                        });
                        index++;
                        const timeoutId = setTimeout(typeChar, 20);
                        typingTimeoutsRef.current.push(timeoutId);
                    } else {
                        setHistory(prev => {
                            const newHistory = [...prev];
                            newHistory[newHistory.length - 1] = { type: 'output', text: fullText };
                            return newHistory;
                        });
                    }
                };
                typeChar();
                return "";
            }
        }
    };


    const processCommand = useCallback((cmd) => {
        const command = cmd.toLowerCase();
        
        // Cancel all ongoing typing animations
        typingTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
        typingTimeoutsRef.current = [];
        
        // Convert any typing entries to output entries immediately
        setHistory(prev => prev.map(entry => 
            entry.type === 'typing' ? { ...entry, type: 'output' } : entry
        ));
        
        // 1. Add command to history
        setHistory(prev => [...prev, { type: 'command', text: cmd }]);

        // 1.1. Special game handling: redirect input if a game is active
        if (numberGameActive || hangmanActive || tictactoeActive || rpsActive || quizActive || memoryActive) {
            if (numberGameActive) handleNumberGuess(cmd.trim());
            else if (hangmanActive) handleHangmanGuess(cmd.trim());
            else if (tictactoeActive) handleTictactoeMove(cmd.trim());
            else if (rpsActive) handleRpsMove(cmd.trim());
            else if (quizActive) handleQuizAnswer(cmd.trim());
            else if (memoryActive) handleMemoryInput(cmd.trim());
            return;
        }

        // 1.2. Process special animated command
        if (command === 'sudo rm -rf /') {
            setTerminalDisabled(true); // Lock input immediately
            handleSudoRm(); 
            return;
        }
        
        // 1.3. Process standard commands
        const commandData = COMMANDS[command] || COMMANDS['default'];
        let outputText;
        let action = null;
        
        if (command === 'clear') {
            commandData.output(setHistory); 
            return;
        } else if (command === '/bye') {
            outputText = commandData.output;
            action = commandData.action;
        } else if (['help', 'skills', 'contact', 'myapproach', 'about', 'projects'].includes(command)) {
            commandData.output(setHistory, printOutput);
            return;
        } else if (['guessthenumber', 'hangman', 'rockpaperscissors', 'rps', 'quiz', 'memory', 'pong', 'snake', 'spaceinvaders', 'tetris', 'breakout', 'kong', 'flappy', 'connect4', 'tictactoe', 'racing', 'pacman', 'drivexs', 'glitchbuster', 'ohflip', 'wayout'].includes(command)) {
            // These commands trigger game setup via their 'output' function
            outputText = commandData.output();
        } else if (command === 'games') {
            commandData.output(setHistory, printOutput);
            return;
        } else if (typeof commandData.output === 'function') {
            outputText = commandData.output(command);
        } else {
            outputText = commandData.output;
        }
        
        // 2. Add output to history and execute action
        setTimeout(() => {
            printOutput(outputText);
            if (action) action(setTerminalDisabled);
        }, 150);
        
    }, [numberGameActive, hangmanActive, tictactoeActive, rpsActive, quizActive, memoryActive, handleNumberGuess, handleHangmanGuess, handleTictactoeMove, handleRpsMove, handleQuizAnswer, handleMemoryInput, setTerminalDisabled, COMMANDS, printOutput, handleSudoRm]);


    const handleKeyDown = (e) => {
        // Don't process terminal input if a game is active
        if (activeGame) return;
        
        if (e.key === 'Enter' && !terminalDisabled) {
            if (input.trim() === '') {
                setHistory(prev => [...prev, { type: 'command', text: '' }]);
            } else {
                processCommand(input.trim());
            }
            setInput('');
        }
    };
    
    // --- Lifecycle Effects (Boot, Scroll, Focus) ---

    useEffect(() => {
        setMounted(true);
        
        // Hide loader after 3 seconds
        setTimeout(() => {
            setShowLoader(false);
        }, 3000);
        
        // Hide FaultyTerminal after 6 seconds total (3s loader + 3s terminal)
        setTimeout(() => {
            setShowInitialLoading(false);
        }, 6000);
    }, []);

    useEffect(() => {
        let loaderInterval;
        let frame = 0;
        
        if (!isBooted && !showInitialLoading && !showLoader && currentBootLineIndex === 0) {
            loaderInterval = setInterval(() => {
                const frames = ['/', '-', '\\', '|'];
                const asterisks = '*'.repeat((frame % 10) + 1);
                setCurrentLoaderText(`[ ${frames[frame % frames.length]} ] Processing mobile assets: ${asterisks}`);
                frame++;
                
                if (frame > 20) { 
                    clearInterval(loaderInterval);
                    setCurrentLoaderText('SYSTEM READY.');
                    setTimeout(() => setCurrentBootLineIndex(1), 500); 
                }
            }, 250);
        }
        
        return () => clearInterval(loaderInterval);
    }, [isBooted, showInitialLoading, showLoader, currentBootLineIndex]);
    
    // Handler for when a boot line finishes typing
    const handleLineFinished = useCallback(() => {
        if (currentBootLineIndex < bootLines.length) {
            setTimeout(() => setCurrentBootLineIndex(prev => prev + 1), 500);
        } else {
            setTimeout(() => setIsBooted(true), 500);
        }
    }, [currentBootLineIndex, bootLines.length]);


    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [history, isBooted]);
    
    useEffect(() => {
        if (isBooted && inputRef.current && !terminalDisabled && !activeGame) {
            inputRef.current.focus();
        }
        
        const refocus = () => {
            if (isBooted && inputRef.current && !terminalDisabled && !activeGame) {
                inputRef.current.focus();
            }
        };
        document.addEventListener('click', refocus);
        document.addEventListener('touchstart', refocus); 
        
        return () => {
            document.removeEventListener('click', refocus);
            document.removeEventListener('touchstart', refocus);
        };
        
    }, [isBooted, terminalDisabled, activeGame]);


    // --- Render Functions ---

    const renderOutputText = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const content = part.slice(2, -2);
                // Check if content contains HTML links
                if (content.includes('<a href=')) {
                    return <span key={index} className="text-green-300 font-bold" dangerouslySetInnerHTML={{__html: content}} />;
                }
                return <span key={index} className="text-green-300 font-bold">{content}</span>;
            }
            return part; 
        });
        
        return <>{parts}</>;
    };

    const renderHistory = () => {
        return history.map((entry, index) => (
            <div key={index} className="mb-1">
                {entry.type === 'command' ? (
                    <div className="flex">
                        <span className="text-green-500 font-bold mr-2 flex-shrink-0">USER@PORTFOLIO:~$</span>
                        <span className="text-green-200">{entry.text}</span>
                    </div>
                ) : entry.type === 'animation' ? (
                    <div className="pl-4">
                        <div className="text-green-400 mb-2">{entry.text}</div>
                        <iframe
                            src="/animation/index.html"
                            className="w-full border border-green-500 bg-black overflow-hidden"
                            style={{ height: 'min(400px, 50vh)', aspectRatio: '16/9' }}
                            title="ASCII Clear Animation"
                        />
                    </div>
                ) : entry.type === 'profile-image' ? (
                    <div className="pl-4">
                        <div className="text-green-300 font-bold mb-2">{renderOutputText(entry.text)}</div>
                        <AnimatedProfileImage />
                    </div>
                ) : entry.type === 'typing' ? (
                    <div className="pl-4 leading-relaxed whitespace-pre-wrap select-none">
                        {renderOutputText(entry.text)}<span className="animate-pulse">|</span>
                    </div>
                ) : (
                    <div className="pl-4 leading-relaxed whitespace-pre-wrap select-none">
                        {renderOutputText(entry.text)}
                    </div>
                )}
            </div>
        ));
    };
    
    // Determine the current placeholder message
    let placeholderText = "";
    if (terminalDisabled) {
        placeholderText = "System locked (animation running)...";
    } else if (numberGameActive) {
        placeholderText = "Enter your guess (1-100) or 'quit'...";
    } else if (hangmanActive) {
        placeholderText = "Enter a letter or 'quit'...";
    } else if (tictactoeActive) {
        placeholderText = "Enter cell number (1-9) or 'quit'...";
    } else if (rpsActive) {
        placeholderText = "Enter 'rock', 'paper', 'scissors' or 'quit'...";
    } else if (quizActive) {
        placeholderText = "Enter A, B, C or full answer, or 'quit'...";
    } else if (memoryActive) {
        placeholderText = "Enter the sequence (1-4) or 'quit'...";
    } else {
        placeholderText = "Type 'help' to begin...";
    }

    if (!mounted) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-green-400 text-xl font-mono">LOADING...</div>
            </div>
        );
    }

    return (
        <div className="terminal-bg w-full max-w-full overflow-hidden">
            <style>{terminalStyles}</style>

            {/* HEADER/MOCK STATUS BAR */}
            <div className="flex justify-between items-center text-xs py-1 px-2 border-b border-green-900 mb-2 font-mono text-green-500">
                <div className="flex items-center space-x-2">
                    <Terminal size={12} />
                    <span>ANDREW_DOSUMU_V2.1</span>
                </div>
                <div className="flex items-center space-x-3">
                    <RefreshCw 
                        size={12} 
                        className="cursor-pointer hover:text-green-300 transition-colors" 
                        title="Refresh Terminal" 
                        onClick={() => window.location.reload()}
                    />
                </div>
            </div>
            
            {/* LOADING SCREEN */}
            {showLoader && <RetroLoader />}
            
            {/* FAULTY TERMINAL INTRO */}
            {showInitialLoading && (
                <div className="fixed inset-0 w-full h-full bg-black">
                    <FaultyTerminal
                        scale={1.5}
                        gridMul={[2, 1]}
                        digitSize={1.2}
                        timeScale={1}
                        pause={false}
                        scanlineIntensity={1}
                        glitchAmount={1}
                        flickerAmount={1}
                        noiseAmp={1}
                        chromaticAberration={0}
                        dither={0}
                        curvature={0}
                        tint="#38ef7d"
                        mouseReact={true}
                        mouseStrength={0.5}
                        pageLoadAnimation={false}
                        brightness={1}
                    />
                </div>
            )}

            {/* BOOT SCREEN (After Initial Loading) */}
            {!isBooted && !showInitialLoading && (
                <div className="fixed inset-0 w-full h-full bg-black">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-xl text-left border border-green-500 p-4 rounded">
                            <p className="text-sm text-green-500 mb-4">{currentLoaderText}</p>
                            {bootLines.map((lineData, index) => (
                                <p key={index} className="boot-text my-1">
                                    {index + 1 < currentBootLineIndex ? (
                                        <span className="text-green-500">{lineData.text}</span>
                                    ) : index + 1 === currentBootLineIndex ? (
                                        <Typewriter text={lineData.text} onFinish={handleLineFinished} />
                                    ) : (
                                        <span className="invisible">{lineData.text}</span>
                                    )}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN TERMINAL (Interactive) */}
            {isBooted && (
                <div 
                    ref={terminalRef} 
                    className="terminal-output-scroll w-full overflow-y-auto h-[calc(100vh-3rem)] pb-2"
                >
                    {renderHistory()}

                    {/* Current Input Line */}
                    <div className="flex flex-col sm:flex-row items-baseline mt-1 pb-4">
                        <span className={`font-bold mr-2 flex-shrink-0 ${terminalDisabled ? 'text-gray-500' : 'text-green-500'}`}>
                            {terminalDisabled ? 'SYSTEM_LOCKED:~$ ' : 'USER@PORTFOLIO:~$'}
                        </span>
                        <input
                            id="terminal-input"
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={terminalDisabled}
                            className={`flex-grow bg-transparent border-none outline-none p-0 w-full font-mono text-base ${terminalDisabled ? 'text-gray-400' : 'text-green-300'}`}
                            autoFocus
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck="false"
                            placeholder={placeholderText}
                        />
                    </div>
                </div>
            )}
            

            
            {/* YouTube Video Modal */}
            {showVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-4 rounded-lg max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-green-400 font-bold">SYSTEM RECOVERY INITIATED</h3>
                            <button 
                                onClick={() => setShowVideo(false)}
                                className="text-green-400 hover:text-green-300"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="aspect-video">
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&start=0"
                                title="System Recovery"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="rounded"
                            ></iframe>
                        </div>
                        <p className="text-green-400 text-sm mt-2 text-center">
                            Emergency backup protocol activated... 😏
                        </p>
                    </div>
                </div>
            )}

            {/* Retro Game Overlay */}
            {activeGame && (
                <RetroGameOverlay 
                    title={activeGame.toUpperCase()} 
                    onClose={() => {
                        setActiveGame(null);
                        setShowDriveXSSettings(false);
                    }}
                    showGameControls={activeGame === 'pacman' || activeGame === 'glitchbuster'}
                    showMuteButton={activeGame === 'drivexs'}
                    onSettingsToggle={activeGame === 'drivexs' ? () => setShowDriveXSSettings(!showDriveXSSettings) : null}
                >
                    {activeGame === 'pong' && <Pong />}
                    {activeGame === 'snake' && <Snake />}
                    {activeGame === 'spaceinvaders' && <SpaceInvaders />}
                    {activeGame === 'tetris' && <Tetris />}
                    {activeGame === 'breakout' && <Breakout />}
                    {activeGame === 'kong' && <KongClimb />}
                    {activeGame === 'flappy' && <FlappyTerminal />}
                    {activeGame === 'connect4' && <CyberConnect4 />}
                    {activeGame === 'tictactoe' && <TicTacToe />}
                    {activeGame === 'racing' && <RetroRacing />}
                    {activeGame === 'pacman' && <Pacman />}
                    {activeGame === 'drivexs' && <DriveXS showSettings={showDriveXSSettings} onSettingsToggle={() => setShowDriveXSSettings(!showDriveXSSettings)} />}
                    {activeGame === 'glitchbuster' && <GlitchBuster />}
                    {activeGame === 'ohflip' && <OhFlip />}
                    {activeGame === 'wayout' && <WayOut />}
                </RetroGameOverlay>
            )}
        </div>
    );
};

export default MobilePortfolio;