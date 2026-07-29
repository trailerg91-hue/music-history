import { pickLocalized } from '../../i18n/localize.js';
import styles from './AdminPanel.module.css';
import { KaField, MediaField, DataTable } from './AdminFields.jsx';
import { FOLK_API, TABLE_GAP } from './adminConstants.js';

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
  return (
    <div className={styles.sectionStack}>
      <div className={styles.formCard}>
        <h3>{ui.addFolklore}</h3>
        <p className={translationHintClass}>{translationHint}</p>
        <form onSubmit={onSubmit} className={styles.addForm}>
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
      </div>

      <DataTable
        title={ui.folkloreRegionsTitle}
        style={TABLE_GAP}
        headers={ui.folkloreHeaders}
        rows={folkList.map((item) => (
          <tr key={item._id || item.id}>
            <td>{pickLocalized(item.title, lang)}</td>
            <td>{pickLocalized(item.tag, lang)}</td>
            <td
              style={{
                maxWidth: 300,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {pickLocalized(item.description, lang)}
            </td>
            {isMainAdmin && (
              <td>
                <button
                  onClick={() => onDelete(FOLK_API, item._id || item.id)}
                  className={styles.deleteBtn}
                >
                  {ui.delete}
                </button>
              </td>
            )}
          </tr>
        ))}
      />
    </div>
  );
}
