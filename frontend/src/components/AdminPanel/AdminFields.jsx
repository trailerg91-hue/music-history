import styles from './AdminPanel.module.css';

export function KaField({ label, base, form, setForm, required = false, textarea = false }) {
  const Input = textarea ? 'textarea' : 'input';
  const extra = textarea ? {} : { type: 'text' };
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>{label}</label>
      <Input
        {...extra}
        placeholder={label}
        value={form[`${base}Ka`] || ''}
        onChange={(e) => setForm({ ...form, [`${base}Ka`]: e.target.value })}
        required={required}
      />
    </div>
  );
}

export function MediaField({
  label,
  mode,
  file,
  url,
  accept,
  inputId,
  fileLabel,
  linkPlaceholder,
  onMode,
  onFile,
  onUrl,
  fileBtnLabel = '📁 ფაილიდან',
  linkBtnLabel = '🔗 ლინკით',
  selectedLabel = 'არჩეულია',
}) {
  return (
    <div className={styles.mediaContainer}>
      <label className={styles.mediaLabel}>{label}</label>
      <div className={styles.mediaToggleRow}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${mode === 'file' ? styles.activeToggle : ''}`}
          onClick={() => onMode('file')}
        >
          {fileBtnLabel}
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${mode === 'link' ? styles.activeToggle : ''}`}
          onClick={() => onMode('link')}
        >
          {linkBtnLabel}
        </button>
      </div>
      {mode === 'file' ? (
        <div className={styles.fileInputWrapper}>
          <input
            type="file"
            accept={accept}
            id={inputId}
            onChange={(e) => onFile(e.target.files[0])}
            className={styles.hiddenFile}
          />
          <label htmlFor={inputId} className={styles.customFileLabel}>
            {file ? `✅ ${selectedLabel}: ${file.name}` : fileLabel}
          </label>
        </div>
      ) : (
        <input
          type="url"
          placeholder={linkPlaceholder}
          value={url}
          onChange={(e) => onUrl(e.target.value)}
          className={styles.textInput}
        />
      )}
    </div>
  );
}

export function WorkspaceHeader({ title, count, search, onSearch, searchPlaceholder, addLabel, onAdd }) {
  return (
    <div className={styles.workspaceHeader}>
      <div className={styles.workspaceTitleBlock}>
        <h3 className={styles.workspaceTitle}>{title}</h3>
        <span className={styles.countBadge}>{count}</span>
      </div>
      <div className={styles.workspaceActions}>
        {onSearch ? (
          <input
            type="search"
            className={styles.searchInput}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
          />
        ) : null}
        {onAdd ? (
          <button type="button" className={styles.addBtn} onClick={onAdd}>
            {addLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function GalleryGrid({ children }) {
  return <div className={styles.galleryGrid}>{children}</div>;
}

export function ContentCard({ image, images, title, meta, badge, onDelete, deleteLabel }) {
  const pics = (images?.filter(Boolean)?.length ? images.filter(Boolean) : [image].filter(Boolean)).slice(0, 2);

  return (
    <article className={styles.contentCard}>
      <div className={`${styles.cardMedia} ${pics.length > 1 ? styles.cardMediaDuo : ''}`}>
        {pics.length === 0 ? (
          <div className={styles.cardImgFallback} />
        ) : pics.length === 1 ? (
          <img src={pics[0]} alt="" className={styles.cardImg} />
        ) : (
          <>
            <img src={pics[0]} alt="" className={`${styles.cardImg} ${styles.cardImgLeft}`} />
            <img src={pics[1]} alt="" className={`${styles.cardImg} ${styles.cardImgRight}`} />
            <div className={styles.cardBlend} aria-hidden="true" />
          </>
        )}
        <div className={styles.cardOverlay} />
        {badge ? <span className={styles.cardBadge}>{badge}</span> : null}
      </div>
      <div className={styles.cardBody}>
        <h4 className={styles.cardTitle}>{title}</h4>
        {meta ? <p className={styles.cardMeta}>{meta}</p> : null}
        {onDelete ? (
          <button type="button" className={styles.cardDelete} onClick={onDelete}>
            {deleteLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function AddCard({ label, onClick }) {
  return (
    <button type="button" className={styles.addCard} onClick={onClick}>
      <span className={styles.addCardPlus}>+</span>
      <span>{label}</span>
    </button>
  );
}

export function EmptyState({ text }) {
  return <div className={styles.emptyState}>{text}</div>;
}

export function FormDrawer({ open, title, hint, hintClass, onClose, closeLabel, children }) {
  if (!open) return null;
  return (
    <div className={styles.drawerRoot} role="dialog" aria-modal="true">
      <button type="button" className={styles.drawerBackdrop} aria-label={closeLabel} onClick={onClose} />
      <aside className={styles.drawerPanel}>
        <div className={styles.drawerHead}>
          <h3>{title}</h3>
          <button type="button" className={styles.drawerClose} onClick={onClose}>
            {closeLabel}
          </button>
        </div>
        {hint ? <p className={hintClass}>{hint}</p> : null}
        <div className={styles.drawerBody}>{children}</div>
      </aside>
    </div>
  );
}

export function DataTable({ title, headers, rows, style }) {
  return (
    <div className={styles.tableWrapper} style={style}>
      {title ? <h3>{title}</h3> : null}
      <table className={styles.userTable}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}
