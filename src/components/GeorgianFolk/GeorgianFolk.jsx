import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../../api.js';
import { MAP_REGIONS, findFolkloreForMapRegion } from './mapRegions.js';
import { REGION_PATHS } from './regionPaths.js';
import styles from './GeorgianFolk.module.css';

export function GeorgianFolk({ onSelectRegion }) {
  const [regions, setRegions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [label, setLabel] = useState({ text: '', left: 50, top: 50 });
  const sectionRef = useRef(null);
  const leaveTimer = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/folklore`)
      .then((res) => res.json())
      .then((data) => setRegions(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const byId = Object.fromEntries(MAP_REGIONS.map((r) => [r.id, r]));

  const clearLeaveTimer = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  const activateRegion = (id) => {
    clearLeaveTimer();
    setActiveId(id);
    const mapRegion = byId[id];
    const path = REGION_PATHS.find((p) => p.id === id);
    if (mapRegion && path) {
      setLabel({
        text: path.label,
        left: mapRegion.left,
        top: mapRegion.top,
      });
    }
  };

  const scheduleDeactivate = () => {
    clearLeaveTimer();
    // რეგიონიდან რეგიონზე გადასვლისას mouseEnter ჯერ მოვა — null არ გავბრწყინდეთ
    leaveTimer.current = setTimeout(() => {
      setActiveId(null);
      leaveTimer.current = null;
    }, 140);
  };

  useEffect(() => () => clearLeaveTimer(), []);

  return (
    <section ref={sectionRef} className={styles.pageContainer}>
      <div className={styles.hero}>
        <h2 className={styles.mainTitle}>ქართული ხალხური მუსიკა</h2>
        <p className={styles.subText}>მუსიკალური მოგზაურობა საქართველოს რეგიონებში.</p>
      </div>

      <div
        className={styles.mapStage}
        onMouseLeave={scheduleDeactivate}
      >
        <svg
          className={styles.mapSvg}
          viewBox="0 0 976 499"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="საქართველოს რუკა"
        >
          <defs>
            <filter id="regionGlowSoft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feFlood floodColor="#f59e0b" floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
              </feMerge>
            </filter>

            {REGION_PATHS.map((p) => {
              const mapRegion = byId[p.id];
              const folklore = mapRegion ? findFolkloreForMapRegion(mapRegion, regions) : null;
              const img = folklore?.imageUrl;
              if (!img || !p.bbox) return null;
              const { x, y, w, h } = p.bbox;
              return (
                <pattern
                  key={`def-${p.id}`}
                  id={`pat-${p.id}`}
                  patternUnits="userSpaceOnUse"
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                >
                  <image
                    href={img}
                    x={0}
                    y={0}
                    width={w}
                    height={h}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </pattern>
              );
            })}
          </defs>

          <g className={styles.glowLayer} filter="url(#regionGlowSoft)" aria-hidden="true">
            {REGION_PATHS.map((p) => (
              <path key={`glow-${p.id}`} d={p.d} className={styles.glowPath} />
            ))}
          </g>

          {REGION_PATHS.map((p) => {
            const mapRegion = byId[p.id];
            const folklore = mapRegion ? findFolkloreForMapRegion(mapRegion, regions) : null;
            const hasPhoto = Boolean(folklore?.imageUrl);
            const hasContent = Boolean(folklore);
            const isActive = activeId === p.id;

            return (
              <g
                key={p.id}
                className={`${styles.regionGroup} ${isActive ? styles.regionGroupActive : ''}`}
                onClick={() => {
                  if (!folklore) return;
                  activateRegion(p.id);
                  onSelectRegion?.(folklore);
                }}
                onMouseEnter={() => activateRegion(p.id)}
                onMouseLeave={scheduleDeactivate}
                style={{ cursor: hasContent ? 'pointer' : 'default' }}
              >
                <path
                  d={p.d}
                  className={`${styles.regionPath} ${isActive ? styles.regionPathActive : ''} ${
                    hasContent ? '' : styles.regionPathMuted
                  }`}
                  style={{
                    fill: hasPhoto ? `url(#pat-${p.id})` : '#16120c',
                  }}
                />
              </g>
            );
          })}
        </svg>

        <div
          className={`${styles.hoverLabel} ${activeId ? styles.hoverLabelVisible : ''}`}
          style={{ left: `${label.left}%`, top: `${label.top}%` }}
        >
          {label.text}
        </div>

        {regions.length === 0 && (
          <div className={styles.empty}>კუთხეები ვერ ჩამოიტვირთა...</div>
        )}
      </div>
    </section>
  );
}
