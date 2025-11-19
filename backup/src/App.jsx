import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Play, Home } from 'lucide-react';

// --- Constants & Game Logic Data ---
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;
const COLORS = [
  null,
  '#FF0D72', // T
  '#0DC2FF', // I
  '#0DFF72', // S
  '#F538FF', // Z
  '#FF8E0D', // L
  '#FFE138', // J
  '#3877FF', // O
];

const SHAPES = [
  [],
  [[0,0],[1,0],[2,0],[1,1]], // T
  [[0,0],[1,0],[2,0],[3,0]], // I
  [[0,0],[1,0],[1,1],[2,1]], // S
  [[1,0],[2,0],[0,1],[1,1]], // Z
  [[0,0],[0,1],[1,1],[2,1]], // L
  [[2,0],[0,1],[1,1],[2,1]], // J
  [[0,0],[1,0],[0,1],[1,1]], // O
];

// --- Helper Functions ---
function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case 'T': return [[0,1,0], [1,1,1], [0,0,0]];
    case 'O': return [[2,2], [2,2]];
    case 'L': return [[0,0,3], [3,3,3], [0,0,0]];
    case 'J': return [[4,0,0], [4,4,4], [0,0,0]];
    case 'I': return [[0,5,0,0], [0,5,0,0], [0,5,0,0], [0,5,0,0]];
    case 'S': return [[0,6,6], [6,6,0], [0,0,0]];
    case 'Z': return [[7,7,0], [0,7,7], [0,0,0]];
    default: return [[0]];
  }
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu'); // 'menu' | 'tetris'
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  
  const gamesList = ['Tetris', 'Snake', 'Minesweeper', 'Pong', '2048'];

  const handleStart = () => {
    if (gamesList[selectedGameIndex] === 'Tetris') {
      setCurrentScreen('tetris');
    } else {
      alert(`Coming Soon: ${gamesList[selectedGameIndex]} implementation!`);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center font-pixelify text-white overflow-hidden relative">
      {/* Background - Mimicking the purple.jpg */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900" 
           style={{
             backgroundImage: "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?q=80&w=2072&auto=format&fit=crop')", 
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundBlendMode: 'overlay'
           }}
      ></div>
      
      {/* Font Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap');
        .font-pixelify { font-family: 'Pixelify Sans', sans-serif; }
      `}</style>

      {currentScreen === 'menu' ? (
        <MenuScreen 
          games={gamesList} 
          currentIndex={selectedGameIndex} 
          setIndex={setSelectedGameIndex} 
          onStart={handleStart}
        />
      ) : (
        <TetrisGame onBack={() => setCurrentScreen('menu')} />
      )}
    </div>
  );
}

// --- Menu Component ---
function MenuScreen({ games, currentIndex, setIndex, onStart }) {
  const canvasRef = useRef(null);

  // Optional: Simple animation for the menu canvas to make it look alive
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frameId;
    let time = 0;

    const animate = () => {
      time += 0.05;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw some random "game-like" pixels
      ctx.fillStyle = `hsl(${time * 50}, 70%, 50%)`;
      const x = Math.sin(time) * 50 + canvas.width / 2;
      const y = Math.cos(time) * 30 + canvas.height / 2;
      ctx.fillRect(x - 10, y - 10, 20, 20);
      
      frameId = requestAnimationFrame(animate);
    };
    
    // Set explicit size for the canvas drawing buffer matches CSS aspect ratio
    canvas.width = 300;
    canvas.height = 200;
    
    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  const nextGame = () => setIndex((prev) => (prev + 1) % games.length);
  const prevGame = () => setIndex((prev) => (prev - 1 + games.length) % games.length);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md p-4 space-y-6">
      <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-md mb-4 text-center">
        Ichan Games
      </h1>

      {/* Game Preview Screen */}
      <div className="w-64 h-48 bg-black rounded-2xl border-4 border-gray-800 shadow-2xl overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between w-full px-4 mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <button 
          onClick={prevGame}
          className="p-3 hover:bg-white/20 rounded-full transition-colors active:scale-95"
        >
          <ChevronLeft size={40} color="white" />
        </button>

        <h2 className="text-3xl font-bold text-white w-40 text-center">
          {games[currentIndex]}
        </h2>

        <button 
          onClick={nextGame}
          className="p-3 hover:bg-white/20 rounded-full transition-colors active:scale-95"
        >
          <ChevronRight size={40} color="white" />
        </button>
      </div>

      <button 
        onClick={onStart}
        className="mt-8 px-12 py-4 bg-green-500 hover:bg-green-400 text-black text-2xl font-bold rounded-xl shadow-lg transform transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
      >
        <Play size={24} fill="black" /> START
      </button>
    </div>
  );
}

// --- Tetris Component ---
function TetrisGame({ onBack }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // Refs for game state to avoid closure staleness in event listeners/loops
  const gameState = useRef({
    arena: createMatrix(COLS, ROWS),
    player: { pos: { x: 0, y: 0 }, matrix: null },
    dropCounter: 0,
    dropInterval: 800,
    lastTime: 0,
    score: 0,
    running: false,
    animationId: null
  });

  const playerReset = useCallback(() => {
    const pieces = 'TJSLJOI';
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    gameState.current.player.matrix = createPiece(type);
    gameState.current.player.pos.y = 0;
    gameState.current.player.pos.x = Math.floor(COLS / 2) - Math.floor(gameState.current.player.matrix[0].length / 2);

    if (collide(gameState.current.arena, gameState.current.player)) {
      gameState.current.arena.forEach(row => row.fill(0));
      gameState.current.score = 0;
      setScore(0);
      gameState.current.running = false;
      setGameOver(true);
    }
  }, []);

  const arenaSweep = useCallback(() => {
    let rowCount = 1;
    const arena = gameState.current.arena;
    outer: for (let y = arena.length - 1; y >= 0; --y) {
      for (let x = 0; x < arena[y].length; ++x) {
        if (arena[y][x] === 0) continue outer;
      }
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      ++y;
      gameState.current.score += rowCount * 10;
      rowCount *= 2;
    }
    setScore(gameState.current.score);
  }, []);

  const playerDrop = useCallback(() => {
    const player = gameState.current.player;
    player.pos.y++;
    if (collide(gameState.current.arena, player)) {
      player.pos.y--;
      merge(gameState.current.arena, player);
      playerReset();
      arenaSweep();
    }
    gameState.current.dropCounter = 0;
  }, [arenaSweep, playerReset]);

  const playerMove = useCallback((dir) => {
    const player = gameState.current.player;
    player.pos.x += dir;
    if (collide(gameState.current.arena, player)) {
      player.pos.x -= dir;
    }
  }, []);

  const playerRotate = useCallback((dir) => {
    const player = gameState.current.player;
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(gameState.current.arena, player)) {
      player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > player.matrix[0].length) {
        rotate(player.matrix, -dir);
        player.pos.x = pos;
        return;
      }
    }
  }, []);

  // Drawing Logic
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(gameState.current.arena, { x: 0, y: 0 }, context);
    drawMatrix(gameState.current.player.matrix, gameState.current.player.pos, context);
  }, []);

  // Game Loop
  const update = useCallback((time = 0) => {
    if (!gameState.current.running) return;

    const deltaTime = time - gameState.current.lastTime;
    gameState.current.lastTime = time;

    gameState.current.dropCounter += deltaTime;
    if (gameState.current.dropCounter > gameState.current.dropInterval) {
      playerDrop();
    }

    draw();
    gameState.current.animationId = requestAnimationFrame(update);
  }, [draw, playerDrop]);

  // Initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Start Game
    gameState.current.running = true;
    gameState.current.lastTime = 0;
    gameState.current.dropCounter = 0;
    gameState.current.score = 0;
    gameState.current.arena = createMatrix(COLS, ROWS);
    setScore(0);
    setGameOver(false);
    
    playerReset();
    update();

    // Keyboard Controls
    const handleKey = (event) => {
      if (!gameState.current.running) return;
      
      // Prevent default scrolling for arrow keys
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(event.code) > -1) {
        event.preventDefault();
      }

      if (event.key === 'ArrowLeft') playerMove(-1);
      else if (event.key === 'ArrowRight') playerMove(1);
      else if (event.key === 'ArrowDown') playerDrop();
      else if (event.key === 'q' || event.key === 'ArrowUp') playerRotate(-1);
      else if (event.key === 'w') playerRotate(1);
    };

    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
      cancelAnimationFrame(gameState.current.animationId);
      gameState.current.running = false;
    };
  }, [playerMove, playerDrop, playerRotate, playerReset, update]);

  // Helper: Collide
  function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] &&
          (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  // Helper: Merge
  function merge(arena, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) arena[y + player.pos.y][x + player.pos.x] = value;
      });
    });
  }

  // Helper: Rotate
  function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
  }

  // Helper: Draw Matrix
  function drawMatrix(matrix, offset, context) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = COLORS[value];
          context.fillRect(
            (x + offset.x) * BLOCK_SIZE,
            (y + offset.y) * BLOCK_SIZE,
            BLOCK_SIZE, BLOCK_SIZE
          );
          context.strokeStyle = '#222'; // Grid line color
          context.lineWidth = 1;
          context.strokeRect(
            (x + offset.x) * BLOCK_SIZE,
            (y + offset.y) * BLOCK_SIZE,
            BLOCK_SIZE, BLOCK_SIZE
          );
          
          // Add a little shine/highlight for "look"
          context.fillStyle = 'rgba(255, 255, 255, 0.1)';
          context.fillRect(
             (x + offset.x) * BLOCK_SIZE + 2,
             (y + offset.y) * BLOCK_SIZE + 2,
             BLOCK_SIZE - 4, 4
          );
        }
      });
    });
  }

  // Restart Handler
  const handleRestart = () => {
    setGameOver(false);
    setScore(0);
    gameState.current.arena = createMatrix(COLS, ROWS);
    gameState.current.score = 0;
    gameState.current.running = true;
    playerReset();
    update();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Tetris</h1>
      
      <div className="relative p-1 bg-gray-800 rounded-lg shadow-2xl border-4 border-gray-700">
        <canvas 
          ref={canvasRef} 
          width={240} 
          height={400} 
          className="bg-black block rounded"
        />
        
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded text-white z-10">
            <h2 className="text-3xl font-bold text-red-500 mb-2">GAME OVER</h2>
            <p className="text-xl mb-4">Final Score: {score}</p>
            <button 
              onClick={handleRestart}
              className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between w-[240px] bg-black/40 p-4 rounded-lg backdrop-blur-md">
         <div className="flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" />
            <span className="text-xl font-bold">{score}</span>
         </div>
         <button 
          onClick={onBack}
          className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          title="Back to Menu"
         >
           <Home size={20} />
         </button>
      </div>

      {/* Mobile Controls (Optional, for better mobile experience) */}
      <div className="mt-8 grid grid-cols-3 gap-4 md:hidden">
        <div />
        <button className="p-4 bg-gray-700 rounded-full active:bg-gray-600" onClick={() => playerRotate(1)}>↻</button>
        <div />
        <button className="p-4 bg-gray-700 rounded-full active:bg-gray-600" onClick={() => playerMove(-1)}>←</button>
        <button className="p-4 bg-gray-700 rounded-full active:bg-gray-600" onClick={() => playerDrop()}>↓</button>
        <button className="p-4 bg-gray-700 rounded-full active:bg-gray-600" onClick={() => playerMove(1)}>→</button>
      </div>

      <div className="mt-4 text-sm text-gray-300 md:block hidden">
        Controls: Arrows to Move/Drop • Q/W or Up Arrow to Rotate
      </div>
    </div>
  );
}