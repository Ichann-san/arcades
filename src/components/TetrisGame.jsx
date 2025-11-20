import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Home } from 'lucide-react';
import { 
  COLS, ROWS, BLOCK_SIZE, COLORS, 
  createMatrix, createPiece 
} from '../utils/gameLogic';
import replay from '../assets/favicon/replay.svg';
import leftArrow from '../assets/favicon/left_arrow.svg';
import rightArrow from '../assets/favicon/right_arrow.svg';
import downArrow from '../assets/favicon/down_arrow.svg';

export default function TetrisGame({ onBack }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
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

  function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) return true;
      }
    }
    return false;
  }

  function merge(arena, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) arena[y + player.pos.y][x + player.pos.x] = value;
      });
    });
  }

  function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
  }

  // --- GAMEPLAY LOGIC ---
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

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const drawM = (matrix, offset) => {
      matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            context.fillStyle = COLORS[value];
            context.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            context.strokeStyle = '#222'; 
            context.lineWidth = 1;
            context.strokeRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            context.fillStyle = 'rgba(255, 255, 255, 0.1)';
            context.fillRect((x + offset.x) * BLOCK_SIZE + 2, (y + offset.y) * BLOCK_SIZE + 2, BLOCK_SIZE - 4, 4);
          }
        });
      });
    };

    drawM(gameState.current.arena, { x: 0, y: 0 });
    drawM(gameState.current.player.matrix, gameState.current.player.pos);
  }, []);

  const update = useCallback((time = 0) => {
    if (!gameState.current.running) return;
    const deltaTime = time - gameState.current.lastTime;
    gameState.current.lastTime = time;
    gameState.current.dropCounter += deltaTime;
    if (gameState.current.dropCounter > gameState.current.dropInterval) playerDrop();
    draw();
    gameState.current.animationId = requestAnimationFrame(update);
  }, [draw, playerDrop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    gameState.current.running = true;
    gameState.current.lastTime = 0;
    gameState.current.dropCounter = 0;
    gameState.current.score = 0;
    gameState.current.arena = createMatrix(COLS, ROWS);
    setScore(0);
    setGameOver(false);
    playerReset();
    update();

    const handleKey = (event) => {
      if (!gameState.current.running) return;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(event.code) > -1) event.preventDefault();
      if (event.key === 'ArrowLeft' || event.key == 'a') playerMove(-1);
      else if (event.key === 'ArrowRight' || event.key == 'd') playerMove(1);
      else if (event.key === 'ArrowDown' || event.key == 's') playerDrop();
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
    <div className="tetris-container">
      <h1 className="main-title" style={{fontSize: '3rem', color: 'white'}}>Tetris</h1>
      
      <div className="game-frame">
        <canvas ref={canvasRef} width={COLS * BLOCK_SIZE} height={ROWS * BLOCK_SIZE} className="game-canvas" />
        
        {gameOver && (
          <div className="game-over-overlay">
            <h2 className="game-over-title">GAME OVER</h2>
            <p className="game-over-score">Final Score: {score}</p>
            <div>
              <button onClick={handleRestart} className="btn-retry">Try Again</button>
              <button onClick={onBack} className="btn-exit">Exit</button>
            </div>
          </div>
        )}
      </div>

      <div className="score-board">
         <div className="score-wrapper">
            <Trophy size={24} className="text-yellow-400" />
            <span className="score-text">{score}</span>
         </div>
         <button onClick={onBack} className="btn-back" title="Back to Menu">
           <Home size={20} color="white" />
         </button>
      </div>

      <div className="mobile-controls">
        <div />
        <button className="control-btn" onClick={() => playerRotate(1)}><img src={replay} alt="replay" style={{width: 60, height: 60}} /></button>
        <div />
        <button className="control-btn" onClick={() => playerMove(-1)}><img src={leftArrow} alt="left" style={{width: 60, height: 60}} /></button>
        <button className="control-btn" onClick={() => playerDrop()}><img src={downArrow} alt="down" style={{width: 60, height: 60}} /></button>
        <button className="control-btn" onClick={() => playerMove(1)}><img src={rightArrow} alt="right" style={{width: 60, height: 60}} /></button>
      </div>
    </div>
  );
}