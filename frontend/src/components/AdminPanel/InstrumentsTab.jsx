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
import { CATEGORY_MAP, INSTRUMENTS_API } from './adminConstants.js';

export default function InstrumentsTab({
  ui,
  lang,
  isEnglish,
  isMainAdmin,
  instruments,
  instrumentForm,
  setInstrumentForm,
  translationHint,
  translationHintClass,
  onSubmit,
  onDelete,
}) {
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return instruments;
    return instruments.filter((item) => {
      const name = pickLocalized(item.name, lang) || '';
      const type = pickLocalized(item.type, lang) || '';
      return `${name} ${type}`.toLowerCase().includes(q);
    });
  }, [instruments, search, lang]);

  const handleSubmit = async (e) => {
    const ok = await onSubmit(e);
    if (ok) setDrawerOpen(false);
  };

  return (
    <div className={styles.sectionStack}>
      <WorkspaceHeader
        title={ui.existingInstruments}
        count={instruments.length}
        search={search}
        onSearch={setSearch}
        searchPlaceholder={ui.searchPlaceholder}
        addLabel={ui.addNew}
        onAdd={() => setDrawerOpen(true)}
      />

      {filtered.length === 0 && !search ? (
        <GalleryGrid>
          <AddCard label={ui.addInstrument} onClick={() => setDrawerOpen(true)} />
        </GalleryGrid>
      ) : filtered.length === 0 ? (
        <EmptyState text={ui.emptySearch} />
      ) : (
        <GalleryGrid>
          <AddCard label={ui.addInstrument} onClick={() => setDrawerOpen(true)} />
          {filtered.map((item) => (
            <ContentCard
              key={item._id || item.id}
              image={item.imageUrl || item.image || item.img || ''}
              title={pickLocalized(item.name, lang)}
              meta={pickLocalized(item.type, lang)}
              badge={item.isFolk ? ui.folkBadge : undefined}
              onDelete={isMainAdmin ? () => onDelete(INSTRUMENTS_API, item._id || item.id) : undefined}
              deleteLabel={ui.delete}
            />
          ))}
        </GalleryGrid>
      )}

      <FormDrawer
        open={drawerOpen}
        title={ui.addInstrument}
        hint={translationHint}
        hintClass={translationHintClass}
        onClose={() => setDrawerOpen(false)}
        closeLabel={ui.close}
      >
        <form onSubmit={handleSubmit} className={styles.addForm}>
          <KaField label={ui.instrumentNameLabel} base="name" form={instrumentForm} setForm={setInstrumentForm} required />

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>{ui.chooseCategory}</label>
            <select
              value={instrumentForm.category}
              onChange={(e) => {
                const category = e.target.value;
                setInstrumentForm({
                  ...instrumentForm,
                  category,
                  typeKa: CATEGORY_MAP[category] || 'სიმებიანი',
                  categoryLabelKa: CATEGORY_MAP[category] || 'სიმებიანი',
                });
              }}
              className={styles.selectInput}
            >
              <option value="string">{isEnglish ? 'String instrument' : 'სიმებიანი საკრავი'} (String)</option>
              <option value="wind">{isEnglish ? 'Wind instrument' : 'სასულე საკრავი'} (Wind)</option>
              <option value="percussion">{isEnglish ? 'Percussion instrument' : 'დასარტყამი საკრავი'} (Percussion)</option>
              <option value="keyboard">{isEnglish ? 'Keyboard instrument' : 'კლავიშებიანი საკრავი'} (Keyboard)</option>
            </select>
          </div>

          <KaField label={ui.typeLabel} base="type" form={instrumentForm} setForm={setInstrumentForm} required />
          <KaField label={ui.categoryLabel} base="categoryLabel" form={instrumentForm} setForm={setInstrumentForm} />

          <MediaField
            label={ui.instrumentImage}
            mode={instrumentForm.imageMode}
            file={instrumentForm.imageFile}
            url={instrumentForm.imageUrl}
            accept="image/*"
            inputId="inst-img-file"
            fileLabel={ui.imageFromComputer}
            linkPlaceholder={ui.imageUrlPlaceholder}
            fileBtnLabel={ui.fileBtn}
            linkBtnLabel={ui.linkBtn}
            selectedLabel={ui.selectedFile}
            onMode={(imageMode) => setInstrumentForm({ ...instrumentForm, imageMode })}
            onFile={(imageFile) => setInstrumentForm({ ...instrumentForm, imageFile })}
            onUrl={(imageUrl) => setInstrumentForm({ ...instrumentForm, imageUrl })}
          />

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={instrumentForm.isFolk}
              onChange={(e) => setInstrumentForm({ ...instrumentForm, isFolk: e.target.checked })}
            />
            {ui.folkInstrumentQuestion}
          </label>

          <KaField label={ui.descriptionLabel} base="description" form={instrumentForm} setForm={setInstrumentForm} textarea required />
          <button type="submit" className={styles.submitBtn}>
            {ui.addInstrumentBtn}
          </button>
        </form>
      </FormDrawer>
    </div>
  );
}
