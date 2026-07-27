import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Auth/authContext.jsx';
import { ADMIN_USERS_API, API_BASE } from '../../api.js';
import styles from './AdminPanel.module.css';

const EPOCHS_API = `${API_BASE}/history`;
const INSTRUMENTS_API = `${API_BASE}/instruments`;
const FOLK_API = `${API_BASE}/folklore`;

const emptyEpoch = {
  era: '',
  yearRange: '',
  description: '',
  countryName: '',
  countryDescription: '',
  imageMode: 'file',
  imageFile: null,
  imageUrl: '',
  audioMode: 'file',
  audioFile: null,
  audioUrl: '',
};

const emptyInstrument = {
  name: '',
  category: 'string',
  type: 'სიმებიანი',
  era: '',
  description: '',
  imageMode: 'file',
  imageFile: null,
  imageUrl: '',
  isFolk: false,
};

const emptyFolk = {
  id: '',
  title: '',
  tag: '',
  description: '',
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

const TABS = [
  { id: 'users', label: 'მომხმარებლები' },
  { id: 'epochs', label: 'ეპოქები' },
  { id: 'instruments', label: 'საკრავები' },
  { id: 'folk', label: 'ფოლკლორი' },
];

function appendMedia(formData, form, fileKey, urlKey, fieldName) {
  if (form[`${fileKey}Mode`] === 'file' && form[`${fileKey}File`]) {
    formData.append(fieldName, form[`${fileKey}File`]);
  } else if (form[`${fileKey}Mode`] === 'link' && form[urlKey]) {
    formData.append(urlKey, form[urlKey]);
  }
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
            {file ? `✅ არჩეულია: ${file.name}` : fileLabel}
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
  const isMainAdmin =
    currentUser?.isAdmin === true || currentUser?.email === 'saba.kapanadze22@gmail.com';

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [epochs, setEpochs] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [folkList, setFolkList] = useState([]);
  const [epochForm, setEpochForm] = useState(emptyEpoch);
  const [instrumentForm, setInstrumentForm] = useState(emptyInstrument);
  const [folkForm, setFolkForm] = useState(emptyFolk);

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
  }, []);

  const requireMainAdmin = (msg) => {
    if (isMainAdmin) return true;
    alert(msg);
    return false;
  };

  const handleToggleAdmin = async (targetUser) => {
    if (!requireMainAdmin('მხოლოდ მთავარ ადმინისტრატორს შეუძლია ადმინის სტატუსის მინიჭება ან მოხსნა!')) return;
    const willBeAdmin = !targetUser.isAdmin;
    try {
      await axios.put(
        `${ADMIN_USERS_API}/${targetUser.id}`,
        { isAdmin: willBeAdmin },
        { headers: authHeaders() }
      );
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, isAdmin: willBeAdmin } : u)));
    } catch {
      alert('სტატუსი ვერ შეიცვალა');
    }
  };

  const deleteById = async (api, id, setter, denyMsg) => {
    if (!requireMainAdmin(denyMsg)) return;
    try {
      await fetch(`${api}/${id}`, { method: 'DELETE', headers: authHeaders() });
      setter((prev) => prev.filter((item) => item._id !== id && item.id !== id));
    } catch {}
  };

  const handleDeleteUser = async (id) => {
    if (!requireMainAdmin('მხოლოდ მთავარ ადმინისტრატორს შეუძლია მომხმარებლების წაშლა!')) return;
    try {
      await axios.delete(`${ADMIN_USERS_API}/${id}`, { headers: authHeaders() });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {}
  };

  const postForm = async (api, formData, onSuccess) => {
    try {
      const res = await fetch(api, { method: 'POST', body: formData, headers: authHeaders() });
      onSuccess(await res.json());
    } catch {}
  };

  const handleAddEpoch = (e) => {
    e.preventDefault();
    const formData = new FormData();
    ['era', 'yearRange', 'description', 'countryName', 'countryDescription'].forEach((k) =>
      formData.append(k, epochForm[k])
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
    ['name', 'category', 'type', 'era', 'description', 'isFolk'].forEach((k) =>
      formData.append(k, instrumentForm[k])
    );
    appendMedia(formData, instrumentForm, 'image', 'imageUrl', 'image');
    postForm(INSTRUMENTS_API, formData, (item) => {
      setInstruments((prev) => [...prev, item]);
      setInstrumentForm(emptyInstrument);
    });
  };

  const handleAddFolk = (e) => {
    e.preventDefault();
    const formData = new FormData();
    ['id', 'title', 'tag', 'description', 'youtubeUrl'].forEach((k) => formData.append(k, folkForm[k]));
    appendMedia(formData, folkForm, 'image', 'imageUrl', 'image');
    postForm(FOLK_API, formData, (item) => {
      setFolkList((prev) => [...prev, item]);
      setFolkForm(emptyFolk);
    });
  };

  const denyDelete = 'მხოლოდ მთავარ ადმინისტრატორს შეუძლია ჩანაწერების წაშლა!';

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h2>ადმინისტრირების პანელი</h2>
        <button onClick={() => setCurrentPage('main')} className={styles.backBtn}>
          მთავარზე დაბრუნება
        </button>
      </div>

      <div className={styles.tabsMenu}>
        {TABS.map((tab) => (
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
          title="რეგისტრირებული მომხმარებლები"
          headers={[
            'ID',
            'სახელი / მეილი',
            'სტატუსი',
            ...(isMainAdmin ? ['ადმინის მართვა', 'მოქმედება'] : []),
          ]}
          rows={users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.fullName || u.username || u.email}</td>
              <td>
                <span style={{ color: u.isAdmin ? '#f59e0b' : '#888', fontWeight: 500 }}>
                  {u.isAdmin ? 'ადმინი' : 'მომხმარებელი'}
                </span>
              </td>
              {isMainAdmin && (
                <>
                  <td>
                    <button
                      onClick={() => handleToggleAdmin(u)}
                      style={{
                        background: u.isAdmin ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: u.isAdmin ? '#ef4444' : '#f59e0b',
                        border: `1px solid ${u.isAdmin ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        padding: '6px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      {u.isAdmin ? 'სტატუსის მოხსნა' : 'ადმინად მინიჭება'}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleDeleteUser(u.id)} className={styles.deleteBtn}>
                      წაშლა
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        />
      )}

      {activeTab === 'epochs' && (
        <div>
          <div className={styles.formCard}>
            <h3>ახალი ეპოქის დამატება</h3>
            <form onSubmit={handleAddEpoch} className={styles.addForm}>
              <input
                type="text"
                placeholder="ეპოქა (მაგ: ანტიკური ხანა)"
                value={epochForm.era}
                onChange={(e) => setEpochForm({ ...epochForm, era: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="წლების დიაპაზონი (მაგ: ძვ.წ. 3000 - ახ.წ. 476)"
                value={epochForm.yearRange}
                onChange={(e) => setEpochForm({ ...epochForm, yearRange: e.target.value })}
                required
              />
              <textarea
                placeholder="ეპოქის ზოგადი აღწერა"
                value={epochForm.description}
                onChange={(e) => setEpochForm({ ...epochForm, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="ქვეყნის სახელი (მაგ: ძველი საბერძნეთი)"
                value={epochForm.countryName}
                onChange={(e) => setEpochForm({ ...epochForm, countryName: e.target.value })}
              />
              <textarea
                placeholder="ქვეყნის მუსიკალური აღწერა ამ ეპოქაში"
                value={epochForm.countryDescription}
                onChange={(e) => setEpochForm({ ...epochForm, countryDescription: e.target.value })}
              />

              <MediaField
                label="ეპოქის სურათი:"
                mode={epochForm.imageMode}
                file={epochForm.imageFile}
                url={epochForm.imageUrl}
                accept="image/*"
                inputId="epoch-img-file"
                fileLabel="📁 აირჩიეთ სურათი კომპიუტერიდან"
                linkPlaceholder="ჩააკოპირეთ სურათის URL ლინკი..."
                onMode={(imageMode) => setEpochForm({ ...epochForm, imageMode })}
                onFile={(imageFile) => setEpochForm({ ...epochForm, imageFile })}
                onUrl={(imageUrl) => setEpochForm({ ...epochForm, imageUrl })}
              />

              <MediaField
                label="მუსიკალური აუდიო ნიმუში:"
                mode={epochForm.audioMode}
                file={epochForm.audioFile}
                url={epochForm.audioUrl}
                accept="audio/*"
                inputId="epoch-audio-file"
                fileLabel="📁 აირჩიეთ აუდიო კომპიუტერიდან"
                linkPlaceholder="ჩააკოპირეთ აუდიოს URL ლინკი..."
                fileBtnLabel="📁 აუდიო ფაილიდან"
                linkBtnLabel="🔗 აუდიო ლინკით"
                onMode={(audioMode) => setEpochForm({ ...epochForm, audioMode })}
                onFile={(audioFile) => setEpochForm({ ...epochForm, audioFile })}
                onUrl={(audioUrl) => setEpochForm({ ...epochForm, audioUrl })}
              />

              <button type="submit" className={styles.submitBtn}>
                ეპოქის დამატება
              </button>
            </form>
          </div>

          <DataTable
            title="საიტზე არსებული ეპოქები"
            style={{ marginTop: 30 }}
            headers={['ეპოქა', 'წლების დიაპაზონი', 'ქვეყნები', ...(isMainAdmin ? ['მოქმედება'] : [])]}
            rows={epochs.map((item) => (
              <tr key={item._id || item.id}>
                <td>{item.era}</td>
                <td>{item.yearRange}</td>
                <td>
                  {item.countries?.length
                    ? item.countries.map((c) => c.name).join(', ')
                    : 'ქვეყნები არ არის'}
                </td>
                {isMainAdmin && (
                  <td>
                    <button
                      onClick={() => deleteById(EPOCHS_API, item._id || item.id, setEpochs, denyDelete)}
                      className={styles.deleteBtn}
                    >
                      წაშლა
                    </button>
                  </td>
                )}
              </tr>
            ))}
          />
        </div>
      )}

      {activeTab === 'instruments' && (
        <div>
          <div className={styles.formCard}>
            <h3>ახალი საკრავის დამატება</h3>
            <form onSubmit={handleAddInstrument} className={styles.addForm}>
              <input
                type="text"
                placeholder="საკრავის სახელი (მაგ: ფანდური)"
                value={instrumentForm.name}
                onChange={(e) => setInstrumentForm({ ...instrumentForm, name: e.target.value })}
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: '0.9rem', color: '#aaa' }}>აირჩიეთ კატეგორია:</label>
                <select
                  value={instrumentForm.category}
                  onChange={(e) => {
                    const category = e.target.value;
                    setInstrumentForm({
                      ...instrumentForm,
                      category,
                      type: CATEGORY_MAP[category] || 'სიმებიანი',
                    });
                  }}
                  className={styles.selectInput}
                >
                  <option value="string">სიმებიანი საკრავი (String)</option>
                  <option value="wind">სასულე საკრავი (Wind)</option>
                  <option value="percussion">დასარტყამი საკრავი (Percussion)</option>
                  <option value="keyboard">კლავიშებიანი საკრავი (Keyboard)</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="ტიპი (სიმებიანი, სასულე...)"
                value={instrumentForm.type}
                onChange={(e) => setInstrumentForm({ ...instrumentForm, type: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="ეპოქა / პერიოდი"
                value={instrumentForm.era}
                onChange={(e) => setInstrumentForm({ ...instrumentForm, era: e.target.value })}
                required
              />

              <MediaField
                label="საკრავის სურათი:"
                mode={instrumentForm.imageMode}
                file={instrumentForm.imageFile}
                url={instrumentForm.imageUrl}
                accept="image/*"
                inputId="inst-img-file"
                fileLabel="📁 აირჩიეთ სურათი კომპიუტერიდან"
                linkPlaceholder="ჩააკოპირეთ სურათის URL ლინკი..."
                onMode={(imageMode) => setInstrumentForm({ ...instrumentForm, imageMode })}
                onFile={(imageFile) => setInstrumentForm({ ...instrumentForm, imageFile })}
                onUrl={(imageUrl) => setInstrumentForm({ ...instrumentForm, imageUrl })}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#e5e7eb' }}>
                <input
                  type="checkbox"
                  checked={instrumentForm.isFolk}
                  onChange={(e) => setInstrumentForm({ ...instrumentForm, isFolk: e.target.checked })}
                />
                არის თუ არა ქართული ფოლკლორული საკრავი?
              </label>

              <textarea
                placeholder="აღწერა"
                value={instrumentForm.description}
                onChange={(e) => setInstrumentForm({ ...instrumentForm, description: e.target.value })}
                required
              />
              <button type="submit" className={styles.submitBtn}>
                საკრავის დამატება
              </button>
            </form>
          </div>

          <DataTable
            title="საიტზე არსებული საკრავები"
            style={{ marginTop: 30 }}
            headers={['სახელი', 'ტიპი', 'ეპოქა', 'ფოლკლორია?', ...(isMainAdmin ? ['მოქმედება'] : [])]}
            rows={instruments.map((item) => (
              <tr key={item._id || item.id}>
                <td>{item.name}</td>
                <td>{item.type}</td>
                <td>{item.era}</td>
                <td>{item.isFolk ? 'დიახ' : 'არა'}</td>
                {isMainAdmin && (
                  <td>
                    <button
                      onClick={() =>
                        deleteById(INSTRUMENTS_API, item._id || item.id, setInstruments, denyDelete)
                      }
                      className={styles.deleteBtn}
                    >
                      წაშლა
                    </button>
                  </td>
                )}
              </tr>
            ))}
          />
        </div>
      )}

      {activeTab === 'folk' && (
        <div>
          <div className={styles.formCard}>
            <h3>ახალი რეგიონის / ფოლკლორის დამატება</h3>
            <form onSubmit={handleAddFolk} className={styles.addForm}>
              <input
                type="text"
                placeholder="ID (მაგ: racha)"
                value={folkForm.id}
                onChange={(e) => setFolkForm({ ...folkForm, id: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="სათაური (მაგ: რაჭული ფოლკლორი)"
                value={folkForm.title}
                onChange={(e) => setFolkForm({ ...folkForm, title: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="თეგი / წარწერა (მაგ: ფერხული & სტვირი)"
                value={folkForm.tag}
                onChange={(e) => setFolkForm({ ...folkForm, tag: e.target.value })}
                required
              />

              <MediaField
                label="ფოლკლორის სურათი:"
                mode={folkForm.imageMode}
                file={folkForm.imageFile}
                url={folkForm.imageUrl}
                accept="image/*"
                inputId="folk-img-file"
                fileLabel="📁 აირჩიეთ სურათი კომპიუტერიდან"
                linkPlaceholder="ჩააკოპირეთ სურათის URL ლინკი..."
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
              <textarea
                placeholder="აღწერა"
                value={folkForm.description}
                onChange={(e) => setFolkForm({ ...folkForm, description: e.target.value })}
                required
              />
              <button type="submit" className={styles.submitBtn}>
                ფოლკლორის დამატება
              </button>
            </form>
          </div>

          <DataTable
            title="ქართული ფოლკლორის რეგიონები"
            style={{ marginTop: 30 }}
            headers={['სათაური', 'თეგი', 'აღწერა', ...(isMainAdmin ? ['მოქმედება'] : [])]}
            rows={folkList.map((item) => (
              <tr key={item._id || item.id}>
                <td>{item.title}</td>
                <td>{item.tag}</td>
                <td
                  style={{
                    maxWidth: 300,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.description}
                </td>
                {isMainAdmin && (
                  <td>
                    <button
                      onClick={() => deleteById(FOLK_API, item._id || item.id, setFolkList, denyDelete)}
                      className={styles.deleteBtn}
                    >
                      წაშლა
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
