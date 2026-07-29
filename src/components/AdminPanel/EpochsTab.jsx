import { useMemo, useState } from 'react';
import { pickLocalized } from '../../i18n/localize.js';
import styles from './AdminPanel.module.css';
import {
  KaField,
  MediaField,
  WorkspaceHeader,
  GalleryGrid,
  ContentCard,
  AddCard,
  EmptyState,
  FormDrawer,
} from './AdminFields.jsx';
import { EPOCHS_API } from './adminConstants.js';
import { LANDMARK_BG, resolveCountryKey } from '../Timeline/CountryLandmarkAmbient.jsx';

/** Curated duo pairs — warm tones that blend on the diagonal card */
const ERA_PAIR_IMAGES = {
  ancient: [
    'https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=1200&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/c/c4/Akropolis_by_Leo_von_Klenze.jpg',
  ],
  modern: [
    'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
  ],
};

/** Fallbacks when era has no curated pair */
const TIMELINE_FALLBACK = {
  greece: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Akropolis_by_Leo_von_Klenze.jpg',
  usa: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1200&q=80',
  japan: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
  georgia: 'https://cdn.tvpirveli.ge/w/2504/43/71/79/360443be686947a6b7ec1f1cbe8e77b3/shemomkvani-turizmi.png',
  france: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  egypt: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=1200&q=80',
};

function countryImage(country) {
  if (!country) return '';
  const direct = country.image || country.img || country.imageUrl;
  if (direct) return direct;
  const key = resolveCountryKey(country) || String(country.id || '').toLowerCase();
  return LANDMARK_BG[key] || TIMELINE_FALLBACK[key] || '';
}

function epochImages(item) {
  const eraId = String(item.id || '').toLowerCase();
  if (ERA_PAIR_IMAGES[eraId]) return ERA_PAIR_IMAGES[eraId];

  const fromCountries = (item.countries || []).map(countryImage).filter(Boolean);
  if (fromCountries.length) return fromCountries.slice(0, 2);
  const single = item.image || item.imageUrl || item.img || '';
  return single ? [single] : [];
}

export default function EpochsTab({
  ui,
  lang,
  isMainAdmin,
  epochs,
  epochForm,
  setEpochForm,
  translationHint,
  translationHintClass,
  onSubmit,
  onDelete,
}) {
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return epochs;
    return epochs.filter((item) => {
      const era = pickLocalized(item.era, lang) || '';
      const years = pickLocalized(item.yearRange, lang) || '';
      const countries = (item.countries || []).map((c) => pickLocalized(c.name, lang)).join(' ');
      return `${era} ${years} ${countries}`.toLowerCase().includes(q);
    });
  }, [epochs, search, lang]);

  const handleSubmit = async (e) => {
    const ok = await onSubmit(e);
    if (ok) setDrawerOpen(false);
  };

  return (
    <div className={styles.sectionStack}>
      <WorkspaceHeader
        title={ui.existingEras}
        count={epochs.length}
        search={search}
        onSearch={setSearch}
        searchPlaceholder={ui.searchPlaceholder}
        addLabel={ui.addNew}
        onAdd={() => setDrawerOpen(true)}
      />

      {filtered.length === 0 && !search ? (
        <div className={styles.galleryGrid}>
          <AddCard label={ui.addEpoch} onClick={() => setDrawerOpen(true)} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState text={ui.emptySearch} />
      ) : (
        <GalleryGrid>
          <AddCard label={ui.addEpoch} onClick={() => setDrawerOpen(true)} />
          {filtered.map((item) => {
            const title = pickLocalized(item.era, lang);
            const years = pickLocalized(item.yearRange, lang);
            const countries = item.countries?.length
              ? item.countries.map((c) => pickLocalized(c.name, lang)).join(', ')
              : ui.noCountries;
            return (
              <ContentCard
                key={item._id || item.id}
                images={epochImages(item)}
                title={title}
                meta={`${years || '—'} · ${countries}`}
                onDelete={isMainAdmin ? () => onDelete(EPOCHS_API, item._id || item.id) : undefined}
                deleteLabel={ui.delete}
              />
            );
          })}
        </GalleryGrid>
      )}

      <FormDrawer
        open={drawerOpen}
        title={ui.addEpoch}
        hint={translationHint}
        hintClass={translationHintClass}
        onClose={() => setDrawerOpen(false)}
        closeLabel={ui.close}
      >
        <form onSubmit={handleSubmit} className={styles.addForm}>
          <KaField label={ui.eraLabel} base="era" form={epochForm} setForm={setEpochForm} required />
          <KaField label={ui.yearRangeLabel} base="yearRange" form={epochForm} setForm={setEpochForm} required />
          <KaField label={ui.eraDescriptionLabel} base="description" form={epochForm} setForm={setEpochForm} textarea />
          <KaField label={ui.countryNameLabel} base="countryName" form={epochForm} setForm={setEpochForm} />
          <KaField label={ui.countrySummaryLabel} base="countryDescription" form={epochForm} setForm={setEpochForm} textarea />
          <KaField label={ui.celebrationLabel} base="celebrationText" form={epochForm} setForm={setEpochForm} textarea />
          <KaField label={ui.warLabel} base="warText" form={epochForm} setForm={setEpochForm} textarea />
          <KaField label={ui.mourningLabel} base="mourningText" form={epochForm} setForm={setEpochForm} textarea />

          <MediaField
            label={ui.eraImage}
            mode={epochForm.imageMode}
            file={epochForm.imageFile}
            url={epochForm.imageUrl}
            accept="image/*"
            inputId="epoch-img-file"
            fileLabel={ui.imageFromComputer}
            linkPlaceholder={ui.imageUrlPlaceholder}
            fileBtnLabel={ui.fileBtn}
            linkBtnLabel={ui.linkBtn}
            selectedLabel={ui.selectedFile}
            onMode={(imageMode) => setEpochForm({ ...epochForm, imageMode })}
            onFile={(imageFile) => setEpochForm({ ...epochForm, imageFile })}
            onUrl={(imageUrl) => setEpochForm({ ...epochForm, imageUrl })}
          />

          <MediaField
            label={ui.audioSample}
            mode={epochForm.audioMode}
            file={epochForm.audioFile}
            url={epochForm.audioUrl}
            accept="audio/*"
            inputId="epoch-audio-file"
            fileLabel={ui.audioFromComputer}
            linkPlaceholder={ui.audioUrlPlaceholder}
            fileBtnLabel={ui.audioFileBtn}
            linkBtnLabel={ui.audioLinkBtn}
            selectedLabel={ui.selectedFile}
            onMode={(audioMode) => setEpochForm({ ...epochForm, audioMode })}
            onFile={(audioFile) => setEpochForm({ ...epochForm, audioFile })}
            onUrl={(audioUrl) => setEpochForm({ ...epochForm, audioUrl })}
          />

          <button type="submit" className={styles.submitBtn}>
            {ui.addEraBtn}
          </button>
        </form>
      </FormDrawer>
    </div>
  );
}
