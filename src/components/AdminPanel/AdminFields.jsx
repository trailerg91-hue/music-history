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

export function DataTable({ title, headers, rows, style }) {
  return (
    <div className={styles.tableWrapper} style={style}>
      <h3>{title}</h3>
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
