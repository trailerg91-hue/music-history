import { pickLocalized } from '../../i18n/localize.js';

/** Built from Figma Untitled.svg combined export (viewBox 976×499). */
export const MAP_REGIONS = [
  {
    id: 'kakheti',
    label: 'კახეთი',
    left: 86.52,
    top: 72.07,
    keys: ['კახ', 'kakhet'],
  },
  {
    id: 'kvemo-kartli',
    label: 'ქვემო ქართლი',
    left: 66.88,
    top: 83.31,
    keys: ['ქვემო ქართლ', 'kvemo'],
  },
  {
    id: 'mtskheta',
    label: 'მცხეთა-მთიანეთი',
    left: 69.31,
    top: 50.06,
    keys: ['მცხეთ', 'ხევსურ', 'მთიან', 'khevsur', 'mtskheta'],
  },
  {
    id: 'shida-kartli',
    label: 'შიდა ქართლი',
    left: 58.53,
    top: 54.94,
    keys: ['შიდა ქართლ', 'shida'],
  },
  {
    id: 'racha',
    label: 'რაჭა',
    left: 47.81,
    top: 39.42,
    keys: ['რაჭ', 'racha'],
  },
  {
    id: 'imereti',
    label: 'იმერეთი',
    left: 43.08,
    top: 53.76,
    keys: ['იმერ', 'imeret'],
  },
  {
    id: 'samtskhe',
    label: 'სამცხე-ჯავახეთი',
    left: 47.41,
    top: 79.06,
    keys: ['მესხ', 'ჯავახ', 'samtskhe', 'meskh'],
  },
  {
    id: 'adjara',
    label: 'აჭარა',
    left: 29.72,
    top: 75.07,
    keys: ['აჭარ', 'adjara', 'ajara'],
  },
  {
    id: 'guria',
    label: 'გურია',
    left: 30.33,
    top: 61.93,
    keys: ['გური', 'guria'],
  },
  {
    id: 'samegrelo',
    label: 'სამეგრელო',
    left: 29.75,
    top: 42.97,
    keys: ['მეგრულ', 'მეგრელ', 'samegrelo', 'mingrel'],
  },
  {
    id: 'svaneti',
    label: 'სვანეთი',
    left: 38.49,
    top: 24.58,
    keys: ['სვან', 'svan'],
  },
  {
    id: 'abkhazia',
    label: 'აფხაზეთი',
    left: 17.43,
    top: 18.53,
    keys: ['აფხაზ', 'abkhaz'],
  },
];

const FOLKLORE_ID_ALIASES = {
  kakheti: ['kakheti'],
  'kvemo-kartli': ['kvemo-kartli', 'qvemo-qartli'],
  mtskheta: ['mtskheta', 'khevsureti'],
  'shida-kartli': ['shida-kartli', 'shida-qartli'],
  racha: ['racha'],
  imereti: ['imereti'],
  samtskhe: ['samtskhe', 'samtskhe-javakheti'],
  adjara: ['adjara', 'ajara'],
  guria: ['guria'],
  samegrelo: ['samegrelo', 'megrelia'],
  svaneti: ['svaneti'],
  abkhazia: ['abkhazia', 'afxazeti', 'abkhazeti'],
};

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u10a0-\u10ff]+/g, ' ')
    .trim();

export function findFolkloreForMapRegion(mapRegion, folkloreList) {
  const idAliases = FOLKLORE_ID_ALIASES[mapRegion.id] || [mapRegion.id];

  return (
    folkloreList.find((item) => {
      const itemId = normalize(item?.id);
      if (idAliases.some((alias) => itemId === normalize(alias))) return true;

      const hay = normalize(
        [
          pickLocalized(item?.title, 'ka'),
          pickLocalized(item?.title, 'en'),
          pickLocalized(item?.name, 'ka'),
          pickLocalized(item?.name, 'en'),
          pickLocalized(item?.tag, 'ka'),
          pickLocalized(item?.tag, 'en'),
          item?.id,
        ].join(' ')
      );

      return mapRegion.keys.some((key) => hay.includes(normalize(key)));
    }) || null
  );
}
