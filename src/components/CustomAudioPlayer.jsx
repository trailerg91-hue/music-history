import React, { useState, useRef } from 'react';
import './CustomAudioPlayer.css';

export default function CustomAudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  const formattedSrc = src ? (src.startsWith('/') ? src.slice(1) : src) : '';
  const audioSourceUrl = `${import.meta.env.BASE_URL}${formattedSrc}`;

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // 1. ვპოულობთ გვერდზე არსებულ ყველა აუდიო ელემენტს და ვთიშავთ
      const allAudios = document.querySelectorAll('audio');
      allAudios.forEach(audio => {
        if (audio !== audioRef.current) {
          audio.pause();
        }
      });

      // 2. ვრთავთ მხოლოდ მიმდინარე აუდიოს
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("აუდიოს დაკვრის შეცდომა:", err);
      });
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    if (dur) {
      setProgress((current / dur) * 100);
      setCurrentTime(formatTime(current));
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(formatTime(audioRef.current.duration));
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const manualChange = Number(e.target.value);
    audioRef.current.currentTime = (manualChange / 100) * audioRef.current.duration;
    setProgress(manualChange);
  };

  return (
    <div className="custom-player">
      <audio 
        ref={audioRef} 
        src={audioSourceUrl} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPause={() => {
          if (audioRef.current && audioRef.current.paused) {
            setIsPlaying(false);
          }
        }}
      />
      
      <button onClick={togglePlay} className="play-btn" aria-label={isPlaying ? "პაუზა" : "დაკვრა"}>
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        )}
      </button>

      <div className="player-body">
        <div className="time-info">
          <span>{currentTime}</span>
          <span>{duration}</span>
        </div>
        <input 
          type="range" 
          className="progress-slider" 
          value={progress || 0} 
          onChange={handleSeek} 
          min="0" 
          max="100" 
        />
      </div>
    </div>
  );
}