import { pickLocalized } from '../../i18n/localize.js';
import styles from './AdminPanel.module.css';
import { KaField, MediaField, DataTable } from './AdminFields.jsx';
import { CATEGORY_MAP, INSTRUMENTS_API, TABLE_GAP } from './adminConstants.js';

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
  return (
    <div className={styles.sectionStack}>
      <div className={styles.formCard}>
        <h3>{ui.addInstrument}</h3>
        <p className={translationHintClass}>{translationHint}</p>
        <form onSubmit={onSubmit} className={styles.addForm}>
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
      </div>

      <DataTable
        title={ui.existingInstruments}
        style={TABLE_GAP}
        headers={ui.instrumentsHeaders}
        rows={instruments.map((item) => (
          <tr key={item._id || item.id}>
            <td>{pickLocalized(item.name, lang)}</td>
            <td>{pickLocalized(item.type, lang)}</td>
            <td>{item.isFolk ? ui.yes : ui.no}</td>
            {isMainAdmin && (
              <td>
                <button
                  onClick={() => onDelete(INSTRUMENTS_API, item._id || item.id)}
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
