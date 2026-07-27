import { useState, useRef } from 'react';
import './CustomAudioPlayer.css';

const pad = (n) => (n < 10 ? `0${n}` : n);
const formatTime = (secs) => {
  if (isNaN(secs)) return '0:00';
  return `${Math.floor(secs / 60)}:${pad(Math.floor(secs % 60))}`;
};

export default function CustomAudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  const formattedSrc = src ? (src.startsWith('/') ? src.slice(1) : src) : '';
  const audioSourceUrl = `${import.meta.env.BASE_URL}${formattedSrc}`;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    document.querySelectorAll('audio').forEach((el) => {
      if (el !== audio) el.pause();
    });

    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
    setCurrentTime(formatTime(audio.currentTime));
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = (value / 100) * audio.duration;
    setProgress(value);
  };

  return (
    <div className="custom-player">
      <audio
        ref={audioRef}
        src={audioSourceUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(formatTime(audioRef.current.duration))}
        onEnded={() => setIsPlaying(false)}
        onPause={() => {
          if (audioRef.current?.paused) setIsPlaying(false);
        }}
      />

      <button onClick={togglePlay} className="play-btn" aria-label={isPlaying ? 'პაუზა' : 'დაკვრა'}>
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
            <polygon points="5,3 19,12 5,21" />
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
