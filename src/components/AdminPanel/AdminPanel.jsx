import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Auth/authContext.jsx';
import { ADMIN_USERS_API } from '../../api.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { useToast } from '../Toast/Toast.jsx';
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

const TAB_ICONS = {
  users: '◎',
  epochs: '◌',
  instruments: '♩',
  folk: '◈',
};

export default function AdminPanel({ setCurrentPage }) {
  const { user: currentUser } = useAuth();
  const { lang, t, isEnglish } = useLanguage();
  const isMainAdmin =
    currentUser?.isAdmin === true || currentUser?.email === 'saba.kapanadze22@gmail.com';
  const ui = getAdminUi({ t, isEnglish, isMainAdmin });

  const toast = useToast();
  const [activeTab, setActiveTab] = useState('instruments');
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

  const activeMeta = ui.tabs.find((tab) => tab.id === activeTab);

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
    toast?.show(msg, 'error');
    return false;
  };

  const handleToggleAdmin = async (targetUser) => {
    if (!requireMainAdmin(ui.userOnlyMainAdmin)) return;
    const willBeAdmin = !targetUser.isAdmin;
    try {
      await axios.put(`${ADMIN_USERS_API}/${targetUser.id}`, { isAdmin: willBeAdmin }, { headers: authHeaders() });
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, isAdmin: willBeAdmin } : u)));
      toast?.show(willBeAdmin ? 'Admin role granted' : 'Admin role revoked');
    } catch {
      toast?.show(ui.userStatusFailed, 'error');
    }
  };

  const deleteById = async (api, id, setter) => {
    if (!requireMainAdmin(ui.recordDeleteDenied)) return;
    try {
      const res = await fetch(`${api}/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setter((prev) => prev.filter((item) => item._id !== id && item.id !== id));
      toast?.show('Deleted successfully');
    } catch (error) {
      toast?.show('Delete failed', 'error');
      console.error(error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!requireMainAdmin(ui.userDeleteDenied)) return;
    try {
      await axios.delete(`${ADMIN_USERS_API}/${id}`, { headers: authHeaders() });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast?.show('Deleted successfully');
    } catch (error) {
      toast?.show('Delete failed', 'error');
      console.error(error);
    }
  };

  const postForm = async (api, formData, onSuccess) => {
    try {
      const res = await fetch(api, { method: 'POST', body: formData, headers: authHeaders() });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      onSuccess(await res.json());
      toast?.show('Saved successfully');
      return true;
    } catch (error) {
      toast?.show('Save failed', 'error');
      console.error(error);
      return false;
    }
  };

  const handleAddEpoch = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    ['era', 'yearRange', 'description', 'countryName', 'countryDescription', 'celebrationText', 'warText', 'mourningText'].forEach((k) =>
      appendLocalizedFields(formData, epochForm, k)
    );
    appendMedia(formData, epochForm, 'image', 'imageUrl', 'image');
    appendMedia(formData, epochForm, 'audio', 'audioUrl', 'audio');
    return postForm(EPOCHS_API, formData, (item) => {
      setEpochs((prev) => [...prev, item]);
      setEpochForm(emptyEpoch);
    });
  };

  const handleAddInstrument = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    ['name', 'type', 'description', 'categoryLabel'].forEach((k) => appendLocalizedFields(formData, instrumentForm, k));
    ['category', 'isFolk'].forEach((k) => formData.append(k, instrumentForm[k]));
    appendMedia(formData, instrumentForm, 'image', 'imageUrl', 'image');
    return postForm(INSTRUMENTS_API, formData, (item) => {
      setInstruments((prev) => [...prev, item]);
      setInstrumentForm(emptyInstrument);
    });
  };

  const handleAddFolk = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('id', folkForm.id);
    formData.append('youtubeUrl', folkForm.youtubeUrl);
    ['title', 'tag', 'description'].forEach((k) => appendLocalizedFields(formData, folkForm, k));
    appendMedia(formData, folkForm, 'image', 'imageUrl', 'image');
    return postForm(FOLK_API, formData, (item) => {
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
    <div className={styles.studio}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <span className={styles.headerEyebrow}>{t.navbar.admin}</span>
          <h2>{t.admin.panel}</h2>
          <p className={styles.sidebarHint}>{ui.studioHint}</p>
        </div>

        <nav className={styles.sideNav} aria-label={t.admin.panel}>
          {ui.tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.sideNavBtn} ${activeTab === tab.id ? styles.sideNavActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.sideNavIcon} aria-hidden="true">
                {TAB_ICONS[tab.id]}
              </span>
              <span className={styles.sideNavLabel}>{tab.label}</span>
              <span className={styles.sideNavCount}>{counts[tab.id]}</span>
            </button>
          ))}
        </nav>

        <button type="button" onClick={() => setCurrentPage('main')} className={styles.backBtn}>
          {t.admin.back}
        </button>
      </aside>

      <main className={styles.workspace}>
        <div className={styles.workspaceTop}>
          <div>
            <span className={styles.headerEyebrow}>{ui.studioLabel}</span>
            <h2 className={styles.workspaceHeading}>{activeMeta?.label}</h2>
          </div>
        </div>

        <div className={styles.workspaceBody}>
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
      </main>
    </div>
  );
}
