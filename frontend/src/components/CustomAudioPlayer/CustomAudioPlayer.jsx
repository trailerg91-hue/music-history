import { useState, useRef, useEffect, useId, useCallback } from 'react';
import './CustomAudioPlayer.css';
import { useAudioSession } from '../AudioSession/audioSession.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const pad = (n) => (n < 10 ? `0${n}` : n);
const fmt = (s) => (isNaN(s) ? '0:00' : `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`);
const BAR_COUNT = 24;

export default function CustomAudioPlayer({ src, title = '' }) {
  const { t } = useLanguage();
  const audioRef = useRef(null);
  const id = useId();
  const session = useAudioSession();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [bars, setBars] = useState(() => new Array(BAR_COUNT).fill(4));
  const analyserRef = useRef(null);
  const animRef = useRef(null);
  const ctxRef = useRef(null);

  const initAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || analyserRef.current) return;
    try {
      const ctx = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
    } catch { /* ignore if already connected */ }
  }, []);

  useEffect(() => {
    if (!playing || !analyserRef.current) {
      cancelAnimationFrame(animRef.current);
      if (!playing) setBars(new Array(BAR_COUNT).fill(4));
      return;
    }
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const step = Math.max(1, Math.floor(data.length / BAR_COUNT));
      const next = Array.from({ length: BAR_COUNT }, (_, i) => {
        const val = data[i * step] || 0;
        return Math.max(4, (val / 255) * 32);
      });
      setBars(next);
      animRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

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
    initAnalyser();
    if (ctxRef.current?.state === 'suspended') ctxRef.current.resume();
    audio.play().then(() => setPlayState(true)).catch(() => {});
  };

  return (
    <div className="custom-player">
      <div className="visualizer-bars" aria-hidden="true">
        {bars.map((h, i) => (
          <div key={i} className="viz-bar" style={{ height: h }} />
        ))}
      </div>
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
