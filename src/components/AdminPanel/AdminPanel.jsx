import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Auth/authContext.jsx';
import { ADMIN_USERS_API, API_BASE } from '../../api.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { pickLocalized, withLangHeader } from '../../i18n/localize.js';
import styles from './AdminPanel.module.css';

const EPOCHS_API = `${API_BASE}/history`;
const INSTRUMENTS_API = `${API_BASE}/instruments`;
const FOLK_API = `${API_BASE}/folklore`;
const TRANSLATION_STATUS_API = `${API_BASE}/admin/translation-status`;

const emptyEpoch = {
  eraKa: '',
  yearRangeKa: '',
  descriptionKa: '',
  countryNameKa: '',
  countryDescriptionKa: '',
  celebrationTextKa: '',
  warTextKa: '',
  mourningTextKa: '',
  imageMode: 'file',
  imageFile: null,
  imageUrl: '',
  audioMode: 'file',
  audioFile: null,
  audioUrl: '',
};

const emptyInstrument = {
  nameKa: '',
  category: 'string',
  typeKa: 'სიმებიანი',
  categoryLabelKa: 'სიმებიანი',
  descriptionKa: '',
  imageMode: 'file',
  imageFile: null,
  imageUrl: '',
  isFolk: false,
};

const emptyFolk = {
  id: '',
  titleKa: '',
  tagKa: '',
  descriptionKa: '',
  imageMode: 'file',
  imageFile: null,
  imageUrl: '',
  youtubeUrl: '',
};

const CATEGORY_MAP = {
  string: 'სიმებიანი',
  wind: 'სასულე',
  percussion: 'დასარტყამი',
  keyboard: 'კლავიშებიანი',
};

function appendMedia(formData, form, fileKey, urlKey, fieldName) {
  if (form[`${fileKey}Mode`] === 'file' && form[`${fileKey}File`]) formData.append(fieldName, form[`${fileKey}File`]);
  else if (form[`${fileKey}Mode`] === 'link' && form[urlKey]) formData.append(urlKey, form[urlKey]);
}

function appendLocalizedFields(formData, form, key) {
  formData.append(`${key}Ka`, form[`${key}Ka`] || '');
  formData.append(`${key}En`, form[`${key}En`] || '');
}

function KaField({ label, base, form, setForm, required = false, textarea = false }) {
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

function MediaField({
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

function DataTable({ title, headers, rows, style }) {
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

export default function AdminPanel({ setCurrentPage }) {
  const { user: currentUser } = useAuth();
  const { lang, t, isEnglish } = useLanguage();
  const isMainAdmin =
    currentUser?.isAdmin === true || currentUser?.email === 'saba.kapanadze22@gmail.com';
  const ui = {
    tabs: [
      { id: 'users', label: t.admin.users },
      { id: 'epochs', label: t.admin.epochs },
      { id: 'instruments', label: t.admin.instruments },
      { id: 'folk', label: t.admin.folklore },
    ],
    userOnlyMainAdmin: isEnglish
      ? 'Only the main administrator can grant or remove admin status.'
      : 'მხოლოდ მთავარ ადმინისტრატორს შეუძლია ადმინის სტატუსის მინიჭება ან მოხსნა!',
    userStatusFailed: isEnglish ? 'Status could not be changed' : 'სტატუსი ვერ შეიცვალა',
    userDeleteDenied: isEnglish
      ? 'Only the main administrator can delete users.'
      : 'მხოლოდ მთავარ ადმინისტრატორს შეუძლია მომხმარებლების წაშლა!',
    recordDeleteDenied: isEnglish
      ? 'Only the main administrator can delete records.'
      : 'მხოლოდ მთავარ ადმინისტრატორს შეუძლია ჩანაწერების წაშლა!',
    selectedFile: isEnglish ? 'Selected' : 'არჩეულია',
    usersTitle: isEnglish ? 'Registered users' : 'რეგისტრირებული მომხმარებლები',
    usersHeaders: [
      'ID',
      isEnglish ? 'Name / Email' : 'სახელი / მეილი',
      isEnglish ? 'Status' : 'სტატუსი',
      ...(isMainAdmin
        ? [isEnglish ? 'Admin control' : 'ადმინის მართვა', isEnglish ? 'Action' : 'მოქმედება']
        : []),
    ],
    adminLabel: isEnglish ? 'Admin' : 'ადმინი',
    userLabel: isEnglish ? 'User' : 'მომხმარებელი',
    revokeAdmin: isEnglish ? 'Remove admin' : 'სტატუსის მოხსნა',
    grantAdmin: isEnglish ? 'Make admin' : 'ადმინად მინიჭება',
    delete: t.common.delete,
    addEpoch: isEnglish ? 'Add new era' : 'ახალი ეპოქის დამატება',
    eraLabel: isEnglish ? 'Era' : 'ეპოქა',
    yearRangeLabel: isEnglish ? 'Year range' : 'წლების დიაპაზონი',
    eraDescriptionLabel: isEnglish ? 'Era description' : 'ეპოქის აღწერა',
    countryNameLabel: isEnglish ? 'Country name' : 'ქვეყნის სახელი',
    countrySummaryLabel: isEnglish ? 'Country summary' : 'ქვეყნის აღწერა',
    celebrationLabel: isEnglish ? 'Golden age' : 'ოქროს ხანა',
    warLabel: isEnglish ? 'Wartime' : 'საომარი',
    mourningLabel: isEnglish ? 'Mourning' : 'სამგლოვიარო',
    eraImage: isEnglish ? 'Era image:' : 'ეპოქის სურათი:',
    imageFromComputer: isEnglish ? '📁 Choose image from computer' : '📁 აირჩიეთ სურათი კომპიუტერიდან',
    imageUrlPlaceholder: isEnglish ? 'Paste image URL...' : 'ჩააკოპირეთ სურათის URL ლინკი...',
    audioSample: isEnglish ? 'Music audio sample:' : 'მუსიკალური აუდიო ნიმუში:',
    audioFromComputer: isEnglish ? '📁 Choose audio from computer' : '📁 აირჩიეთ აუდიო კომპიუტერიდან',
    audioUrlPlaceholder: isEnglish ? 'Paste audio URL...' : 'ჩააკოპირეთ აუდიოს URL ლინკი...',
    audioFileBtn: isEnglish ? '📁 Audio file' : '📁 აუდიო ფაილიდან',
    audioLinkBtn: isEnglish ? '🔗 Audio link' : '🔗 აუდიო ლინკით',
    addEraBtn: isEnglish ? 'Add era' : 'ეპოქის დამატება',
    autoTranslateReady: isEnglish
      ? 'Fill in Georgian only. English will be generated automatically on save via {provider}.'
      : 'შეავსე მხოლოდ ქართული ველები. შენახვისას English ავტომატურად გენერირდება {provider}-ით.',
    autoTranslateOffline: isEnglish
      ? 'Free offline mode is active: known terms are translated and short names are transliterated automatically. Long descriptions may stay in Georgian.'
      : 'ჩართულია უფასო offline რეჟიმი: ცნობილი ტერმინები ითარგმნება, მოკლე სახელები კი ავტომატურად ტრანსლიტერირდება. გრძელი აღწერები შეიძლება ქართულად დარჩეს.',
    autoTranslateMissing: isEnglish
      ? 'Auto-translation is currently disabled on the server. Add a Gemini or OpenAI API key, or enter English manually.'
      : 'ავტომატური თარგმანი ამჟამად გამორთულია სერვერზე. დაამატე Gemini ან OpenAI API key, ან English ხელით შეავსე.',
    autoTranslateChecking: isEnglish
      ? 'Checking auto-translation status...'
      : 'ვამოწმებ ავტომატური თარგმანის სტატუსს...',
    existingEras: isEnglish ? 'Existing eras on the site' : 'საიტზე არსებული ეპოქები',
    erasHeaders: [
      isEnglish ? 'Era' : 'ეპოქა',
      isEnglish ? 'Year range' : 'წლების დიაპაზონი',
      isEnglish ? 'Countries' : 'ქვეყნები',
      ...(isMainAdmin ? [isEnglish ? 'Action' : 'მოქმედება'] : []),
    ],
    noCountries: isEnglish ? 'No countries' : 'ქვეყნები არ არის',
    addInstrument: isEnglish ? 'Add new instrument' : 'ახალი საკრავის დამატება',
    instrumentNameLabel: isEnglish ? 'Instrument name' : 'საკრავის სახელი',
    chooseCategory: isEnglish ? 'Choose category:' : 'აირჩიეთ კატეგორია:',
    typeLabel: isEnglish ? 'Type' : 'ტიპი',
    categoryLabel: isEnglish ? 'Category label' : 'კატეგორიის წარწერა',
    instrumentImage: isEnglish ? 'Instrument image:' : 'საკრავის სურათი:',
    folkInstrumentQuestion: isEnglish
      ? 'Is this a Georgian folk instrument?'
      : 'არის თუ არა ქართული ფოლკლორული საკრავი?',
    descriptionLabel: isEnglish ? 'Description' : 'აღწერა',
    addInstrumentBtn: isEnglish ? 'Add instrument' : 'საკრავის დამატება',
    existingInstruments: isEnglish ? 'Existing instruments on the site' : 'საიტზე არსებული საკრავები',
    instrumentsHeaders: [
      isEnglish ? 'Name' : 'სახელი',
      isEnglish ? 'Type' : 'ტიპი',
      isEnglish ? 'Folk?' : 'ფოლკლორია?',
      ...(isMainAdmin ? [isEnglish ? 'Action' : 'მოქმედება'] : []),
    ],
    addFolklore: isEnglish ? 'Add new region / folklore' : 'ახალი რეგიონის / ფოლკლორის დამატება',
    folkloreTitleLabel: isEnglish ? 'Title' : 'სათაური',
    folkloreTagLabel: isEnglish ? 'Tag' : 'თეგი',
    folkloreImage: isEnglish ? 'Folklore image:' : 'ფოლკლორის სურათი:',
    addFolkloreBtn: isEnglish ? 'Add folklore' : 'ფოლკლორის დამატება',
    folkloreRegionsTitle: isEnglish ? 'Georgian folklore regions' : 'ქართული ფოლკლორის რეგიონები',
    folkloreHeaders: [
      isEnglish ? 'Title' : 'სათაური',
      isEnglish ? 'Tag' : 'თეგი',
      isEnglish ? 'Description' : 'აღწერა',
      ...(isMainAdmin ? [isEnglish ? 'Action' : 'მოქმედება'] : []),
    ],
    yes: t.common.yes,
    no: t.common.no,
    fileBtn: t.common.file,
    linkBtn: t.common.link,
  };

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? withLangHeader({ Authorization: `Bearer ${token}` }) : withLangHeader();
  };

  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [epochs, setEpochs] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [folkList, setFolkList] = useState([]);
  const [epochForm, setEpochForm] = useState(emptyEpoch);
  const [instrumentForm, setInstrumentForm] = useState(emptyInstrument);
  const [folkForm, setFolkForm] = useState(emptyFolk);
  const [translationStatus, setTranslationStatus] = useState({ enabled: false, loaded: false, provider: null, model: null });

  const counts = {
    users: users.length,
    epochs: epochs.length,
    instruments: instruments.length,
    folk: folkList.length,
  };

  useEffect(() => {
    axios
      .get(ADMIN_USERS_API, { headers: authHeaders() })
      .then((res) => setUsers(res.data))
      .catch(() => {});
    fetch(EPOCHS_API).then((r) => r.json()).then(setEpochs).catch(() => {});
    fetch(INSTRUMENTS_API).then((r) => r.json()).then(setInstruments).catch(() => {});
    fetch(FOLK_API).then((r) => r.json()).then(setFolkList).catch(() => {});
    fetch(TRANSLATION_STATUS_API, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Status failed: ${r.status}`))))
      .then((data) =>
        setTranslationStatus({
          enabled: Boolean(data?.enabled),
          loaded: true,
          provider: data?.provider || null,
          model: data?.model || null,
        }))
      .catch(() => setTranslationStatus({ enabled: false, loaded: true, provider: null, model: null }));
  }, []);

  const requireMainAdmin = (msg) => {
    if (isMainAdmin) return true;
    alert(msg);
    return false;
  };

  const handleToggleAdmin = async (targetUser) => {
    if (!requireMainAdmin(ui.userOnlyMainAdmin)) return;
    const willBeAdmin = !targetUser.isAdmin;
    try {
      await axios.put(
        `${ADMIN_USERS_API}/${targetUser.id}`,
        { isAdmin: willBeAdmin },
        { headers: authHeaders() }
      );
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, isAdmin: willBeAdmin } : u)));
    } catch {
      alert(ui.userStatusFailed);
    }
  };

  const deleteById = async (api, id, setter, denyMsg) => {
    if (!requireMainAdmin(denyMsg)) return;
    try {
      const res = await fetch(`${api}/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setter((prev) => prev.filter((item) => item._id !== id && item.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!requireMainAdmin(ui.userDeleteDenied)) return;
    try {
      await axios.delete(`${ADMIN_USERS_API}/${id}`, { headers: authHeaders() });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const postForm = async (api, formData, onSuccess) => {
    try {
      const res = await fetch(api, { method: 'POST', body: formData, headers: authHeaders() });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      onSuccess(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddEpoch = (e) => {
    e.preventDefault();
    const formData = new FormData();
    ['era', 'yearRange', 'description', 'countryName', 'countryDescription', 'celebrationText', 'warText', 'mourningText'].forEach((k) => appendLocalizedFields(formData, epochForm, k));
    appendMedia(formData, epochForm, 'image', 'imageUrl', 'image');
    appendMedia(formData, epochForm, 'audio', 'audioUrl', 'audio');
    postForm(EPOCHS_API, formData, (item) => {
      setEpochs((prev) => [...prev, item]);
      setEpochForm(emptyEpoch);
    });
  };

  const handleAddInstrument = (e) => {
    e.preventDefault();
    const formData = new FormData();
    ['name', 'type', 'description', 'categoryLabel'].forEach((k) => appendLocalizedFields(formData, instrumentForm, k));
    ['category', 'isFolk'].forEach((k) => formData.append(k, instrumentForm[k]));
    appendMedia(formData, instrumentForm, 'image', 'imageUrl', 'image');
    postForm(INSTRUMENTS_API, formData, (item) => {
      setInstruments((prev) => [...prev, item]);
      setInstrumentForm(emptyInstrument);
    });
  };

  const handleAddFolk = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('id', folkForm.id);
    formData.append('youtubeUrl', folkForm.youtubeUrl);
    ['title', 'tag', 'description'].forEach((k) => appendLocalizedFields(formData, folkForm, k));
    appendMedia(formData, folkForm, 'image', 'imageUrl', 'image');
    postForm(FOLK_API, formData, (item) => {
      setFolkList((prev) => [...prev, item]);
      setFolkForm(emptyFolk);
    });
  };

  const denyDelete = ui.recordDeleteDenied;
  const tableGap = { marginTop: 22 };
  const providerLabel = translationStatus.provider === 'gemini'
    ? 'Gemini'
    : translationStatus.provider === 'openai'
      ? 'OpenAI'
      : translationStatus.provider === 'offline'
        ? 'offline fallback'
      : 'AI';
  const translationHint = !translationStatus.loaded
    ? ui.autoTranslateChecking
    : translationStatus.provider === 'offline'
      ? ui.autoTranslateOffline
    : translationStatus.enabled
      ? ui.autoTranslateReady.replace('{provider}', providerLabel)
      : ui.autoTranslateMissing;
  const translationHintClass = translationStatus.loaded && !translationStatus.enabled
    ? `${styles.formHint} ${styles.formHintWarning}`
    : styles.formHint;

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <div className={styles.headerCopy}>
          <span className={styles.headerEyebrow}>{t.navbar.admin}</span>
          <h2>{t.admin.panel}</h2>
        </div>
        <button onClick={() => setCurrentPage('main')} className={styles.backBtn}>
          {t.admin.back}
        </button>
      </div>

      <div className={styles.tabsMenu}>
        {ui.tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} ({counts[tab.id]})
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <DataTable
          title={ui.usersTitle}
          headers={ui.usersHeaders}
          rows={users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.fullName || u.username || u.email}</td>
              <td>
                <span className={`${styles.statusPill} ${u.isAdmin ? styles.statusAdmin : styles.statusUser}`}>
                  {u.isAdmin ? ui.adminLabel : ui.userLabel}
                </span>
              </td>
              {isMainAdmin && (
                <>
                  <td>
                    <button
                      onClick={() => handleToggleAdmin(u)}
                      className={`${styles.actionBtn} ${u.isAdmin ? styles.actionBtnDanger : styles.actionBtnWarn}`}
                    >
                      {u.isAdmin ? ui.revokeAdmin : ui.grantAdmin}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleDeleteUser(u.id)} className={styles.deleteBtn}>
                      {ui.delete}
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        />
      )}

      {activeTab === 'epochs' && (
        <div className={styles.sectionStack}>
          <div className={styles.formCard}>
            <h3>{ui.addEpoch}</h3>
            <p className={translationHintClass}>{translationHint}</p>
            <form onSubmit={handleAddEpoch} className={styles.addForm}>
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
            style={tableGap}
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
                      onClick={() => deleteById(EPOCHS_API, item._id || item.id, setEpochs, denyDelete)}
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
      )}

      {activeTab === 'instruments' && (
        <div className={styles.sectionStack}>
          <div className={styles.formCard}>
            <h3>{ui.addInstrument}</h3>
            <p className={translationHintClass}>{translationHint}</p>
            <form onSubmit={handleAddInstrument} className={styles.addForm}>
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
            style={tableGap}
            headers={ui.instrumentsHeaders}
            rows={instruments.map((item) => (
              <tr key={item._id || item.id}>
                <td>{pickLocalized(item.name, lang)}</td>
                <td>{pickLocalized(item.type, lang)}</td>
                <td>{item.isFolk ? ui.yes : ui.no}</td>
                {isMainAdmin && (
                  <td>
                    <button
                      onClick={() =>
                        deleteById(INSTRUMENTS_API, item._id || item.id, setInstruments, denyDelete)
                      }
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
      )}

      {activeTab === 'folk' && (
        <div className={styles.sectionStack}>
          <div className={styles.formCard}>
            <h3>{ui.addFolklore}</h3>
            <p className={translationHintClass}>{translationHint}</p>
            <form onSubmit={handleAddFolk} className={styles.addForm}>
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
            style={tableGap}
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
                      onClick={() => deleteById(FOLK_API, item._id || item.id, setFolkList, denyDelete)}
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
      )}
    </div>
  );
}
