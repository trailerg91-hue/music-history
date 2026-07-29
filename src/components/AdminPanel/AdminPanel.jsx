import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Auth/authContext.jsx';
import { ADMIN_USERS_API } from '../../api.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import styles from './AdminPanel.module.css';
import {
  EPOCHS_API,
  INSTRUMENTS_API,
  FOLK_API,
  TRANSLATION_STATUS_API,
  emptyEpoch,
  emptyInstrument,
  emptyFolk,
  appendMedia,
  appendLocalizedFields,
  authHeaders,
  translationHintText,
} from './adminConstants.js';
import { getAdminUi } from './adminUi.js';
import UsersTab from './UsersTab.jsx';
import EpochsTab from './EpochsTab.jsx';
import InstrumentsTab from './InstrumentsTab.jsx';
import FolkloreTab from './FolkloreTab.jsx';

export default function AdminPanel({ setCurrentPage }) {
  const { user: currentUser } = useAuth();
  const { lang, t, isEnglish } = useLanguage();
  const isMainAdmin =
    currentUser?.isAdmin === true || currentUser?.email === 'saba.kapanadze22@gmail.com';
  const ui = getAdminUi({ t, isEnglish, isMainAdmin });

  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [epochs, setEpochs] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [folkList, setFolkList] = useState([]);
  const [epochForm, setEpochForm] = useState(emptyEpoch);
  const [instrumentForm, setInstrumentForm] = useState(emptyInstrument);
  const [folkForm, setFolkForm] = useState(emptyFolk);
  const [translationStatus, setTranslationStatus] = useState({
    enabled: false,
    loaded: false,
    provider: null,
    model: null,
  });

  const counts = {
    users: users.length,
    epochs: epochs.length,
    instruments: instruments.length,
    folk: folkList.length,
  };

  useEffect(() => {
    axios.get(ADMIN_USERS_API, { headers: authHeaders() }).then((res) => setUsers(res.data)).catch(() => {});
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
      await axios.put(`${ADMIN_USERS_API}/${targetUser.id}`, { isAdmin: willBeAdmin }, { headers: authHeaders() });
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, isAdmin: willBeAdmin } : u)));
    } catch {
      alert(ui.userStatusFailed);
    }
  };

  const deleteById = async (api, id, setter) => {
    if (!requireMainAdmin(ui.recordDeleteDenied)) return;
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
    ['era', 'yearRange', 'description', 'countryName', 'countryDescription', 'celebrationText', 'warText', 'mourningText'].forEach((k) =>
      appendLocalizedFields(formData, epochForm, k)
    );
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

  const translationHint = translationHintText(ui, translationStatus);
  const translationHintClass =
    translationStatus.loaded && !translationStatus.enabled
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
        <UsersTab
          ui={ui}
          users={users}
          isMainAdmin={isMainAdmin}
          onToggleAdmin={handleToggleAdmin}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {activeTab === 'epochs' && (
        <EpochsTab
          ui={ui}
          lang={lang}
          isMainAdmin={isMainAdmin}
          epochs={epochs}
          epochForm={epochForm}
          setEpochForm={setEpochForm}
          translationHint={translationHint}
          translationHintClass={translationHintClass}
          onSubmit={handleAddEpoch}
          onDelete={(api, id) => deleteById(api, id, setEpochs)}
        />
      )}

      {activeTab === 'instruments' && (
        <InstrumentsTab
          ui={ui}
          lang={lang}
          isEnglish={isEnglish}
          isMainAdmin={isMainAdmin}
          instruments={instruments}
          instrumentForm={instrumentForm}
          setInstrumentForm={setInstrumentForm}
          translationHint={translationHint}
          translationHintClass={translationHintClass}
          onSubmit={handleAddInstrument}
          onDelete={(api, id) => deleteById(api, id, setInstruments)}
        />
      )}

      {activeTab === 'folk' && (
        <FolkloreTab
          ui={ui}
          lang={lang}
          isMainAdmin={isMainAdmin}
          folkList={folkList}
          folkForm={folkForm}
          setFolkForm={setFolkForm}
          translationHint={translationHint}
          translationHintClass={translationHintClass}
          onSubmit={handleAddFolk}
          onDelete={(api, id) => deleteById(api, id, setFolkList)}
        />
      )}
    </div>
  );
}
