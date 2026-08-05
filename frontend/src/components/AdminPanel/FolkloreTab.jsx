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
import { FOLK_API } from './adminConstants.js';

export default function FolkloreTab({
  ui,
  lang,
  isMainAdmin,
  folkList,
  folkForm,
  setFolkForm,
  translationHint,
  translationHintClass,
  onSubmit,
  onDelete,
}) {
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return folkList;
    return folkList.filter((item) => {
      const title = pickLocalized(item.title, lang) || '';
      const tag = pickLocalized(item.tag, lang) || '';
      const description = pickLocalized(item.description, lang) || '';
      return `${title} ${tag} ${description} ${item.id || ''}`.toLowerCase().includes(q);
    });
  }, [folkList, search, lang]);

  const handleSubmit = async (e) => {
    const ok = await onSubmit(e);
    if (ok) setDrawerOpen(false);
  };

  return (
    <div className={styles.sectionStack}>
      <WorkspaceHeader
        title={ui.folkloreRegionsTitle}
        count={folkList.length}
        search={search}
        onSearch={setSearch}
        searchPlaceholder={ui.searchPlaceholder}
        addLabel={ui.addNew}
        onAdd={() => setDrawerOpen(true)}
      />

      {filtered.length === 0 && !search ? (
        <GalleryGrid>
          <AddCard label={ui.addFolklore} onClick={() => setDrawerOpen(true)} />
        </GalleryGrid>
      ) : filtered.length === 0 ? (
        <EmptyState text={ui.emptySearch} />
      ) : (
        <GalleryGrid>
          <AddCard label={ui.addFolklore} onClick={() => setDrawerOpen(true)} />
          {filtered.map((item) => (
            <ContentCard
              key={item._id || item.id}
              image={item.imageUrl || item.image || item.img || ''}
              title={pickLocalized(item.title, lang)}
              meta={pickLocalized(item.tag, lang)}
              badge={item.id}
              onDelete={isMainAdmin ? () => onDelete(FOLK_API, item._id || item.id) : undefined}
              deleteLabel={ui.delete}
            />
          ))}
        </GalleryGrid>
      )}

      <FormDrawer
        open={drawerOpen}
        title={ui.addFolklore}
        hint={translationHint}
        hintClass={translationHintClass}
        onClose={() => setDrawerOpen(false)}
        closeLabel={ui.close}
      >
        <form onSubmit={handleSubmit} className={styles.addForm}>
          <input
            type="text"
            placeholder="ID (მაგ: racha)"
            value={folkForm.id}
            onChange={(e) => setFolkForm({ ...folkForm, id: e.target.value })}
            required
          />
          <KaField label={ui.folkloreTitleLabel} base="title" form={folkForm} setForm={setFolkForm} required />
          <KaField label={ui.folkloreTagLabel} base="tag" form={folkForm} setForm={setFolkForm} required />

          <MediaField
            label={ui.folkloreImage}
            mode={folkForm.imageMode}
            file={folkForm.imageFile}
            url={folkForm.imageUrl}
            accept="image/*"
            inputId="folk-img-file"
            fileLabel={ui.imageFromComputer}
            linkPlaceholder={ui.imageUrlPlaceholder}
            fileBtnLabel={ui.fileBtn}
            linkBtnLabel={ui.linkBtn}
            selectedLabel={ui.selectedFile}
            onMode={(imageMode) => setFolkForm({ ...folkForm, imageMode })}
            onFile={(imageFile) => setFolkForm({ ...folkForm, imageFile })}
            onUrl={(imageUrl) => setFolkForm({ ...folkForm, imageUrl })}
          />

          <input
            type="text"
            placeholder="YouTube URL"
            value={folkForm.youtubeUrl}
            onChange={(e) => setFolkForm({ ...folkForm, youtubeUrl: e.target.value })}
          />
          <KaField label={ui.descriptionLabel} base="description" form={folkForm} setForm={setFolkForm} textarea required />
          <button type="submit" className={styles.submitBtn}>
            {ui.addFolkloreBtn}
          </button>
        </form>
      </FormDrawer>
    </div>
  );
}
