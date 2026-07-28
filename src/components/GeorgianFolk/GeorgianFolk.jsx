import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../../api.js';
import { MAP_REGIONS, findFolkloreForMapRegion } from './mapRegions.js';
import { REGION_PATHS } from './regionPaths.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { pickLocalized } from '../../i18n/localize.js';
import styles from './GeorgianFolk.module.css';

const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches;

export function GeorgianFolk({ onSelectRegion }) {
  const { t, lang } = useLanguage();
  const [regions, setRegions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showAllRegions, setShowAllRegions] = useState(false);
  const [label, setLabel] = useState({ text: '', tag: '', left: 50, top: 50 });
  const leaveTimer = useRef(null);
  const byId = Object.fromEntries(MAP_REGIONS.map((r) => [r.id, r]));

  useEffect(() => { fetch(`${API_BASE}/folklore`).then((r) => r.json()).then((d) => setRegions(Array.isArray(d) ? d : [])).catch(() => {}); }, []);
  useEffect(() => () => clearTimeout(leaveTimer.current), []);
  const clearLeave = () => { clearTimeout(leaveTimer.current); leaveTimer.current = null; };
  const regionLabel = (id) => pickLocalized(byId[id]?.labelText, lang) || byId[id]?.label || '';
  const activate = (id) => {
    clearLeave(); setActiveId(id);
    const map = byId[id]; const path = REGION_PATHS.find((p) => p.id === id); const folk = map ? findFolkloreForMapRegion(map, regions) : null;
    if (map && path) setLabel({ text: pickLocalized(folk?.title, lang) || regionLabel(id), tag: pickLocalized(folk?.tag, lang) || '', left: map.left, top: map.top });
    return folk;
  };
  const scheduleLeave = () => { if (isTouch()) return; clearLeave(); leaveTimer.current = setTimeout(() => setActiveId(null), 140); };
  const onActivate = (id) => { const folk = activate(id); if (!folk) return setPreview(null); if (isTouch()) return setPreview({ folklore: folk, name: pickLocalized(folk.title || folk.name, lang) || regionLabel(id), tag: pickLocalized(folk.tag, lang), id }); onSelectRegion?.(folk); };
  const listItems = REGION_PATHS.map((p) => { const map = byId[p.id]; const folk = map ? findFolkloreForMapRegion(map, regions) : null; return folk ? { id: p.id, label: pickLocalized(folk.title, lang) || p.label, folklore: folk, tag: pickLocalized(folk.tag, lang) || '' } : null; }).filter(Boolean);
  const visibleListItems = showAllRegions ? listItems : listItems.slice(0, 3);

  return <section className={styles.pageContainer}><div className={styles.hero}><h2 className={styles.mainTitle}>{t.folk.title}</h2><p className={styles.subText}>{t.folk.subtitle}</p><p className={styles.hint}><span className={styles.hintDot} aria-hidden="true" />{t.folk.hint}</p></div><div className={styles.mapFrame}><div className={styles.mapVignette} aria-hidden="true" /><div className={styles.mapStage} onMouseLeave={scheduleLeave}><svg className={styles.mapSvg} viewBox="0 0 976 499" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={t.folk.title}><defs><filter id="regionGlowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="blur" /><feFlood floodColor="#f59e0b" floodOpacity="0.5" result="color" /><feComposite in="color" in2="blur" operator="in" result="glow" /><feMerge><feMergeNode in="glow" /></feMerge></filter>{REGION_PATHS.map((p) => { const map = byId[p.id]; const folk = map ? findFolkloreForMapRegion(map, regions) : null; if (!folk?.imageUrl || !p.bbox) return null; const { x, y, w, h } = p.bbox; return <pattern key={`def-${p.id}`} id={`pat-${p.id}`} patternUnits="userSpaceOnUse" x={x} y={y} width={w} height={h}><image href={folk.imageUrl} x={0} y={0} width={w} height={h} preserveAspectRatio="xMidYMid slice" /></pattern>; })}</defs><g className={styles.glowLayer} filter="url(#regionGlowSoft)" aria-hidden="true">{REGION_PATHS.map((p) => <path key={`glow-${p.id}`} d={p.d} className={styles.glowPath} />)}</g>{REGION_PATHS.map((p) => { const map = byId[p.id]; const folk = map ? findFolkloreForMapRegion(map, regions) : null; const active = activeId === p.id; return <g key={p.id} className={`${styles.regionGroup} ${active ? styles.regionGroupActive : ''}`} onClick={() => folk && onActivate(p.id)} onMouseEnter={() => !isTouch() && activate(p.id)} onMouseLeave={scheduleLeave} style={{ cursor: folk ? 'pointer' : 'default' }}><path d={p.d} className={`${styles.regionPath} ${active ? styles.regionPathActive : ''} ${folk ? '' : styles.regionPathMuted}`} style={{ fill: folk?.imageUrl ? `url(#pat-${p.id})` : '#16120c' }} /></g>; })}</svg><div className={`${styles.hoverCard} ${activeId ? styles.hoverCardVisible : ''} ${styles.hoverCardDesktop}`} style={{ left: `${label.left}%`, top: `${label.top}%` }}><span className={styles.hoverName}>{label.text}</span>{label.tag ? <span className={styles.hoverTag}>{label.tag}</span> : null}</div>{!regions.length && <div className={styles.empty}>{t.folk.loadFail}</div>}</div></div><div className={styles.mobileAssist}>{preview ? <div className={styles.mobilePreview}><div className={styles.mobilePreviewText}><strong>{preview.name}</strong>{preview.tag ? <span>{preview.tag}</span> : null}</div><button type="button" className={styles.mobileOpenBtn} onClick={() => onSelectRegion?.(preview.folklore)}>{t.common.open}</button></div> : <p className={styles.mobileAssistHint}>{t.folk.listHint}</p>}<div className={styles.regionList} role="list">{visibleListItems.map((item) => <button key={item.id} type="button" role="listitem" className={`${styles.regionChip} ${activeId === item.id ? styles.regionChipActive : ''}`} onClick={() => onActivate(item.id)}>{item.label}</button>)}</div>{listItems.length > 3 ? <button type="button" className={styles.moreRegionsBtn} onClick={() => setShowAllRegions((v) => !v)}>{showAllRegions ? t.common.showLess : t.common.showMore}</button> : null}</div></section>;
}
