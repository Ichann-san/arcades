import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LEFT_ARROW_PATH = "../src/assets/favicon/left_arrow.svg"; 
const RIGHT_ARROW_PATH = "../src/assets/favicon/right_arrow.svg";

export default function MenuScreen({ games, currentIndex, setIndex, onStart }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && games[currentIndex].video) {
      videoRef.current.load();
      videoRef.current.play().catch(err => console.log('Video play failed:', err));
    }
  }, [currentIndex, games]);

  const nextGame = () => setIndex((prev) => (prev + 1) % games.length);
  const prevGame = () => setIndex((prev) => (prev - 1 + games.length) % games.length);

  return (
    <div className="menu-container">
      
      <h1 className="main-title">Ichan Games</h1>

      <div className="game-preview-box">
        {games[currentIndex].video ? (
          <video 
            ref={videoRef}
            className="preview-video"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={games[currentIndex].video} type="video/mp4" />
            Your browser doesn't support video.
          </video>
        ) : (
          <div className="no-preview">
            <p style={{ color: 'white', fontSize: '1.5rem' }}>Preview Coming Soon</p>
          </div>
        )}
      </div>

      <div className="controls-wrapper">
        <button onClick={prevGame} className="nav-button">
          {LEFT_ARROW_PATH ? (
            <img src={LEFT_ARROW_PATH} alt="Left" style={{width: 60, height: 60}} />
          ) : (
            <ChevronLeft size={60} className="nav-icon" />
          )}
        </button>

        <div className="game-label-pill">
          {games[currentIndex].name}
        </div>

        <button onClick={nextGame} className="nav-button">
          {RIGHT_ARROW_PATH ? (
            <img src={RIGHT_ARROW_PATH} alt="Right" style={{width: 60, height: 60}} />
          ) : (
            <ChevronRight size={60} className="nav-icon" />
          )}
        </button>
      </div>

      <button onClick={onStart} className="start-button">
        Start
      </button>

    </div>
  );
}