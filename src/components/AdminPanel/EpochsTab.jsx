import { pickLocalized } from '../../i18n/localize.js';
import styles from './AdminPanel.module.css';
import { KaField, MediaField, DataTable } from './AdminFields.jsx';
import { EPOCHS_API, TABLE_GAP } from './adminConstants.js';

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
  return (
    <div className={styles.sectionStack}>
      <div className={styles.formCard}>
        <h3>{ui.addEpoch}</h3>
        <p className={translationHintClass}>{translationHint}</p>
        <form onSubmit={onSubmit} className={styles.addForm}>
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
      </div>

      <DataTable
        title={ui.existingEras}
        style={TABLE_GAP}
        headers={ui.erasHeaders}
        rows={epochs.map((item) => (
          <tr key={item._id || item.id}>
            <td>{pickLocalized(item.era, lang)}</td>
            <td>{pickLocalized(item.yearRange, lang)}</td>
            <td>
              {item.countries?.length
                ? item.countries.map((c) => pickLocalized(c.name, lang)).join(', ')
                : ui.noCountries}
            </td>
            {isMainAdmin && (
              <td>
                <button
                  onClick={() => onDelete(EPOCHS_API, item._id || item.id)}
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
