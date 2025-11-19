import React, { useState } from 'react';
import MenuScreen from './components/menuScreen';
import TetrisGame from './components/TetrisGame';
import tetrisview from './assets/video/tetris.mp4';
import './style.css';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu'); 
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  
  const gamesList = [
    { name: 'Tetris', video: tetrisview },
    { name: 'Snake', video: '' },
    { name: 'Minesweeper', video: '' },
    { name: 'Pong', video: '' },
    { name: '2048', video: '' }
  ];

  const handleStart = () => {
    if (gamesList[selectedGameIndex].name === 'Tetris') {
      setCurrentScreen('tetris');
    } else {
      alert(`Coming Soon: ${gamesList[selectedGameIndex].name} implementation!`);
    }
  };

  return (
    <div className="app-container">
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