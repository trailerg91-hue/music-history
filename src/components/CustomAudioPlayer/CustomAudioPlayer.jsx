import { useState, useRef, useEffect, useId } from 'react';
import './CustomAudioPlayer.css';
import { useAudioSession } from '../AudioSession/audioSession.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const pad = (n) => (n < 10 ? `0${n}` : n);
const fmt = (s) => (isNaN(s) ? '0:00' : `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`);

export default function CustomAudioPlayer({ src, title = '' }) {
  const { t } = useLanguage();
  const audioRef = useRef(null);
  const id = useId();
  const session = useAudioSession();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  const raw = String(src || '').trim();
  const url = /^https?:\/\//i.test(raw)
    ? raw
    : `${import.meta.env.BASE_URL}${raw.replace(/^\//, '')}`;

  useEffect(() => () => session?.report?.({ id, playing: false }), [id, session]);

  const setPlayState = (on) => {
    setPlaying(on);
    session?.report?.(
      on ? { id, src: url, title: title || t.common.audio, playing: true } : { id, playing: false }
    );
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlayState(false);
      return;
    }
    document.querySelectorAll('audio').forEach((el) => el !== audio && el.pause());
    audio.play().then(() => setPlayState(true)).catch(() => {});
  };

  return (
    <div className="custom-player">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (!a?.duration) return;
          setProgress((a.currentTime / a.duration) * 100);
          setCurrent(fmt(a.currentTime));
        }}
        onLoadedMetadata={() => setDuration(fmt(audioRef.current.duration))}
        onEnded={() => setPlayState(false)}
        onPause={() => {
          if (audioRef.current?.paused) setPlayState(false);
        }}
      />
      <button type="button" onClick={toggle} className="play-btn" aria-label={playing ? t.common.pause : t.common.play}>
        {playing ? (
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
          <span>{current}</span>
          <span>{duration}</span>
        </div>
        <input
          type="range"
          className="progress-slider"
          value={progress || 0}
          min="0"
          max="100"
          onChange={(e) => {
            const a = audioRef.current;
            if (!a) return;
            const v = Number(e.target.value);
            a.currentTime = (v / 100) * a.duration;
            setProgress(v);
          }}
        />
      </div>
    </div>
  );
}
