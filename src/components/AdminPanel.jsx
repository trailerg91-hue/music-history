import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './authContext.jsx';
import styles from './AdminPanel.module.css';

export default function AdminPanel({ setCurrentPage }) {
  const { user: currentUser } = useAuth();
  const isMainAdmin = currentUser?.email === 'saba.kapanadze22@gmail.com';

  const [activeTab, setActiveTab] = useState('users'); // 'users', 'epochs', 'instruments', 'folk'
  
  // იუზერების სტეიტები
  const [users, setUsers] = useState([]);
  const USERS_API = "https://6a59cb2368601fc330ea1836.mockapi.io/users";

  // ეპოქების სტეიტები
  const [epochs, setEpochs] = useState([]);
  const EPOCHS_API = "http://localhost:5000/api/history";

  // საკრავების სტეიტები
  const [instruments, setInstruments] = useState([]);
  const INSTRUMENTS_API = "http://localhost:5000/api/instruments";

  // ფოლკლორის სტეიტები
  const [folkList, setFolkList] = useState([]);
  const FOLK_API = "http://localhost:5000/api/folklore";

  // ფორმების სტეიტები (ფაილის ან ლინკის მხარდაჭერით)
  const [epochForm, setEpochForm] = useState({ 
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
    audioUrl: ''
  });
  
  const [instrumentForm, setInstrumentForm] = useState({
    name: '',
    category: 'string', // დეფოლტად პირველი არჩევანი
    type: 'სიმებიანი',
    era: '',
    description: '',
    imageMode: 'file',
    imageFile: null,
    imageUrl: '',
    isFolk: false
  });

  const [folkForm, setFolkForm] = useState({
    id: '',
    title: '',
    tag: '',
    description: '',
    imageMode: 'file',
    imageFile: null,
    imageUrl: '',
    youtubeUrl: ''
  });

  // მონაცემების წამოღება
  useEffect(() => {
    axios.get(USERS_API)
      .then(res => setUsers(res.data))
      .catch(err => console.error("იუზერების შეცდომა:", err));

    fetch(EPOCHS_API)
      .then(res => res.json())
      .then(data => setEpochs(data))
      .catch(err => console.error("ეპოქების შეცდომა:", err));

    fetch(INSTRUMENTS_API)
      .then(res => res.json())
      .then(data => setInstruments(data))
      .catch(err => console.error("საკრავების შეცდომა:", err));

    fetch(FOLK_API)
      .then(res => res.json())
      .then(data => setFolkList(data))
      .catch(err => console.error("ფოლკლორის შეცდომა:", err));
  }, []);

  // ადმინის სტატუსის მართვა
  const handleToggleAdmin = async (targetUser) => {
    if (!isMainAdmin) {
      alert('მხოლოდ მთავარ ადმინისტრატორს შეუძლია ადმინის სტატუსის მინიჭება ან მოხსნა!');
      return;
    }

    const willBeAdmin = !targetUser.isAdmin;
    try {
      await axios.put(`${USERS_API}/${targetUser.id}`, { isAdmin: willBeAdmin });
      setUsers(users.map(u => u.id === targetUser.id ? { ...u, isAdmin: willBeAdmin } : u));
    } catch (error) {
      console.error("სტატუსის შეცვლის შეცდომა:", error);
      alert("სტატუსი ვერ შეიცვალა");
    }
  };

  // წაშლის ფუნქციები
  const handleDeleteUser = async (id) => {
    if (!isMainAdmin) {
      alert('მხოლოდ მთავარ ადმინისტრატორს შეუძლია მომხმარებლების წაშლა!');
      return;
    }
    try {
      await axios.delete(`${USERS_API}/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      console.error("იუზერი ვერ წაიშალა:", error);
    }
  };

  const handleDeleteEpoch = async (id) => {
    if (!isMainAdmin) {
      alert('მხოლოდ მთავარ ადმინისტრატორს შეუძლია ჩანაწერების წაშლა!');
      return;
    }
    try {
      await fetch(`${EPOCHS_API}/${id}`, { method: 'DELETE' });
      setEpochs(epochs.filter(e => e._id !== id && e.id !== id));
    } catch (error) {
      console.error("ეპოქა ვერ წაიშალა:", error);
    }
  };

  const handleDeleteInstrument = async (id) => {
    if (!isMainAdmin) {
      alert('მხოლოდ მთავარ ადმინისტრატორს შეუძლია ჩანაწერების წაშლა!');
      return;
    }
    try {
      await fetch(`${INSTRUMENTS_API}/${id}`, { method: 'DELETE' });
      setInstruments(instruments.filter(i => i._id !== id && i.id !== id));
    } catch (error) {
      console.error("საკრავი ვერ წაიშალა:", error);
    }
  };

  const handleDeleteFolk = async (id) => {
    if (!isMainAdmin) {
      alert('მხოლოდ მთავარ ადმინისტრატორს შეუძლია ჩანაწერების წაშლა!');
      return;
    }
    try {
      await fetch(`${FOLK_API}/${id}`, { method: 'DELETE' });
      setFolkList(folkList.filter(f => f._id !== id && f.id !== id));
    } catch (error) {
      console.error("ფოლკლორი ვერ წაიშალა:", error);
    }
  };

  // დამატების ფუნქციები
  const handleAddEpoch = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('era', epochForm.era);
      formData.append('yearRange', epochForm.yearRange);
      formData.append('description', epochForm.description);
      formData.append('countryName', epochForm.countryName);
      formData.append('countryDescription', epochForm.countryDescription);

      if (epochForm.imageMode === 'file' && epochForm.imageFile) {
        formData.append('image', epochForm.imageFile);
      } else if (epochForm.imageMode === 'link' && epochForm.imageUrl) {
        formData.append('imageUrl', epochForm.imageUrl);
      }

      if (epochForm.audioMode === 'file' && epochForm.audioFile) {
        formData.append('audio', epochForm.audioFile);
      } else if (epochForm.audioMode === 'link' && epochForm.audioUrl) {
        formData.append('audioUrl', epochForm.audioUrl);
      }

      const response = await fetch(EPOCHS_API, {
        method: 'POST',
        body: formData
      });
      const newEpoch = await response.json();
      setEpochs([...epochs, newEpoch]);
      setEpochForm({ 
        era: '', yearRange: '', description: '', countryName: '', countryDescription: '', 
        imageMode: 'file', imageFile: null, imageUrl: '', 
        audioMode: 'file', audioFile: null, audioUrl: '' 
      });
    } catch (error) {
      console.error("ეპოქა ვერ დაემატა:", error);
    }
  };

  const handleAddInstrument = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', instrumentForm.name);
      formData.append('category', instrumentForm.category);
      formData.append('type', instrumentForm.type);
      formData.append('era', instrumentForm.era);
      formData.append('description', instrumentForm.description);
      formData.append('isFolk', instrumentForm.isFolk);

      if (instrumentForm.imageMode === 'file' && instrumentForm.imageFile) {
        formData.append('image', instrumentForm.imageFile);
      } else if (instrumentForm.imageMode === 'link' && instrumentForm.imageUrl) {
        formData.append('imageUrl', instrumentForm.imageUrl);
      }

      const response = await fetch(INSTRUMENTS_API, {
        method: 'POST',
        body: formData
      });
      const newItem = await response.json();
      setInstruments([...instruments, newItem]);
      setInstrumentForm({ 
        name: '', category: 'string', type: 'სიმებიანი', era: '', description: '', 
        imageMode: 'file', imageFile: null, imageUrl: '', isFolk: false 
      });
    } catch (error) {
      console.error("საკრავი ვერ დაემატა:", error);
    }
  };

  const handleAddFolk = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('id', folkForm.id);
      formData.append('title', folkForm.title);
      formData.append('tag', folkForm.tag);
      formData.append('description', folkForm.description);
      formData.append('youtubeUrl', folkForm.youtubeUrl);

      if (folkForm.imageMode === 'file' && folkForm.imageFile) {
        formData.append('image', folkForm.imageFile);
      } else if (folkForm.imageMode === 'link' && folkForm.imageUrl) {
        formData.append('imageUrl', folkForm.imageUrl);
      }

      const response = await fetch(FOLK_API, {
        method: 'POST',
        body: formData
      });
      const newFolk = await response.json();
      setFolkList([...folkList, newFolk]);
      setFolkForm({ 
        id: '', title: '', tag: '', description: '', 
        imageMode: 'file', imageFile: null, imageUrl: '', youtubeUrl: '' 
      });
    } catch (error) {
      console.error("ფოლკლორი ვერ დაემატა:", error);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h2>ადმინისტრირების პანელი</h2>
        <button onClick={() => setCurrentPage('main')} className={styles.backBtn}>
          მთავარზე დაბრუნება
        </button>
      </div>

      {/* ტაბების მენიუ */}
      <div className={styles.tabsMenu}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'users' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('users')}
        >
          მომხმარებლები ({users.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'epochs' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('epochs')}
        >
          ეპოქები ({epochs.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'instruments' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('instruments')}
        >
          საკრავები ({instruments.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'folk' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('folk')}
        >
          ფოლკლორი ({folkList.length})
        </button>
      </div>

      {/* 1. იუზერების ტაბი */}
      {activeTab === 'users' && (
        <div className={styles.tableWrapper}>
          <h3>რეგისტრირებული მომხმარებლები</h3>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>სახელი / მეილი</th>
                <th>სტატუსი</th>
                {isMainAdmin && (
                  <>
                    <th>ადმინის მართვა</th>
                    <th>მოქმედება</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.fullName || u.username || u.email}</td>
                  <td>
                    <span style={{ color: u.isAdmin ? '#f59e0b' : '#888', fontWeight: '500' }}>
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
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
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
            </tbody>
          </table>
        </div>
      )}

      {/* 2. ეპოქების ტაბი */}
      {activeTab === 'epochs' && (
        <div className={styles.contentSection}>
          <div className={styles.formCard}>
            <h3>ახალი ეპოქის დამატება</h3>
            <form onSubmit={handleAddEpoch} className={styles.addForm}>
              <input 
                type="text" 
                placeholder="ეპოქა (მაგ: ანტიკური ხანა)" 
                value={epochForm.era} 
                onChange={(e) => setEpochForm({...epochForm, era: e.target.value})} 
                required 
              />
              <input 
                type="text" 
                placeholder="წლების დიაპაზონი (მაგ: ძვ.წ. 3000 - ახ.წ. 476)" 
                value={epochForm.yearRange} 
                onChange={(e) => setEpochForm({...epochForm, yearRange: e.target.value})} 
                required 
              />
              <textarea 
                placeholder="ეპოქის ზოგადი აღწერა" 
                value={epochForm.description} 
                onChange={(e) => setEpochForm({...epochForm, description: e.target.value})} 
              />
              <input 
                type="text" 
                placeholder="ქვეყნის სახელი (მაგ: ძველი საბერძნეთი)" 
                value={epochForm.countryName} 
                onChange={(e) => setEpochForm({...epochForm, countryName: e.target.value})} 
              />
              <textarea 
                placeholder="ქვეყნის მუსიკალური აღწერა ამ ეპოქაში" 
                value={epochForm.countryDescription} 
                onChange={(e) => setEpochForm({...epochForm, countryDescription: e.target.value})} 
              />

              {/* ეპოქის სურათი */}
              <div className={styles.mediaContainer}>
                <label className={styles.mediaLabel}>ეპოქის სურათი:</label>
                <div className={styles.mediaToggleRow}>
                  <button 
                    type="button" 
                    className={`${styles.toggleBtn} ${epochForm.imageMode === 'file' ? styles.activeToggle : ''}`}
                    onClick={() => setEpochForm({...epochForm, imageMode: 'file'})}
                  >
                    📁 ფაილიდან
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.toggleBtn} ${epochForm.imageMode === 'link' ? styles.activeToggle : ''}`}
                    onClick={() => setEpochForm({...epochForm, imageMode: 'link'})}
                  >
                    🔗 ლინკით
                  </button>
                </div>
                {epochForm.imageMode === 'file' ? (
                  <div className={styles.fileInputWrapper}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="epoch-img-file"
                      onChange={(e) => setEpochForm({...epochForm, imageFile: e.target.files[0]})} 
                      className={styles.hiddenFile}
                    />
                    <label htmlFor="epoch-img-file" className={styles.customFileLabel}>
                      {epochForm.imageFile ? `✅ არჩეულია: ${epochForm.imageFile.name}` : '📁 აირჩიეთ სურათი კომპიუტერიდან'}
                    </label>
                  </div>
                ) : (
                  <input 
                    type="url" 
                    placeholder="ჩააკოპირეთ სურათის URL ლინკი..." 
                    value={epochForm.imageUrl} 
                    onChange={(e) => setEpochForm({...epochForm, imageUrl: e.target.value})} 
                    className={styles.textInput}
                  />
                )}
              </div>

              {/* აუდიო ფაილი */}
              <div className={styles.mediaContainer}>
                <label className={styles.mediaLabel}>მუსიკალური აუდიო ნიმუში:</label>
                <div className={styles.mediaToggleRow}>
                  <button 
                    type="button" 
                    className={`${styles.toggleBtn} ${epochForm.audioMode === 'file' ? styles.activeToggle : ''}`}
                    onClick={() => setEpochForm({...epochForm, audioMode: 'file'})}
                  >
                    📁 აუდიო ფაილიდან
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.toggleBtn} ${epochForm.audioMode === 'link' ? styles.activeToggle : ''}`}
                    onClick={() => setEpochForm({...epochForm, audioMode: 'link'})}
                  >
                    🔗 აუდიო ლინკით
                  </button>
                </div>
                {epochForm.audioMode === 'file' ? (
                  <div className={styles.fileInputWrapper}>
                    <input 
                      type="file" 
                      accept="audio/*" 
                      id="epoch-audio-file"
                      onChange={(e) => setEpochForm({...epochForm, audioFile: e.target.files[0]})} 
                      className={styles.hiddenFile}
                    />
                    <label htmlFor="epoch-audio-file" className={styles.customFileLabel}>
                      {epochForm.audioFile ? `✅ არჩეულია: ${epochForm.audioFile.name}` : '📁 აირჩიეთ აუდიო კომპიუტერიდან'}
                    </label>
                  </div>
                ) : (
                  <input 
                    type="url" 
                    placeholder="ჩააკოპირეთ აუდიოს URL ლინკი..." 
                    value={epochForm.audioUrl} 
                    onChange={(e) => setEpochForm({...epochForm, audioUrl: e.target.value})} 
                    className={styles.textInput}
                  />
                )}
              </div>

              <button type="submit" className={styles.submitBtn}>ეპოქის დამატება</button>
            </form>
          </div>

          <div className={styles.tableWrapper} style={{ marginTop: '30px' }}>
            <h3>საიტზე არსებული ეპოქები</h3>
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>ეპოქა</th>
                  <th>წლების დიაპაზონი</th>
                  <th>ქვეყნები</th>
                  {isMainAdmin && <th>მოქმედება</th>}
                </tr>
              </thead>
              <tbody>
                {epochs.map(item => (
                  <tr key={item._id || item.id}>
                    <td>{item.era}</td>
                    <td>{item.yearRange}</td>
                    <td>
                      {item.countries && item.countries.length > 0 
                        ? item.countries.map(c => c.name).join(', ') 
                        : "ქვეყნები არ არის"}
                    </td>
                    {isMainAdmin && (
                      <td>
                        <button onClick={() => handleDeleteEpoch(item._id || item.id)} className={styles.deleteBtn}>
                          წაშლა
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. საკრავების ტაბი */}
      {activeTab === 'instruments' && (
        <div className={styles.contentSection}>
          <div className={styles.formCard}>
            <h3>ახალი საკრავის დამატება</h3>
            <form onSubmit={handleAddInstrument} className={styles.addForm}>
              <input 
                type="text" 
                placeholder="საკრავის სახელი (მაგ: ფანდური)" 
                value={instrumentForm.name} 
                onChange={(e) => setInstrumentForm({...instrumentForm, name: e.target.value})} 
                required 
              />
              
              {/* ჩამოშლადი კატეგორიები */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.9rem', color: '#aaa' }}>აირჩიეთ კატეგორია:</label>
                <select 
                  value={instrumentForm.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    let typeName = 'სიმებიანი';
                    if (cat === 'wind') typeName = 'სასულე';
                    else if (cat === 'percussion') typeName = 'დასარტყამი';
                    else if (cat === 'keyboard') typeName = 'კლავიშებიანი';
                    else if (cat === 'string') typeName = 'სიმებიანი';
                    setInstrumentForm({ ...instrumentForm, category: cat, type: typeName });
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
                onChange={(e) => setInstrumentForm({...instrumentForm, type: e.target.value})} 
                required 
              />

              <input 
                type="text" 
                placeholder="ეპოქა / პერიოდი" 
                value={instrumentForm.era} 
                onChange={(e) => setInstrumentForm({...instrumentForm, era: e.target.value})} 
                required 
              />
              
              {/* საკრავის სურათი */}
              <div className={styles.mediaContainer}>
                <label className={styles.mediaLabel}>საკრავის სურათი:</label>
                <div className={styles.mediaToggleRow}>
                  <button 
                    type="button" 
                    className={`${styles.toggleBtn} ${instrumentForm.imageMode === 'file' ? styles.activeToggle : ''}`}
                    onClick={() => setInstrumentForm({...instrumentForm, imageMode: 'file'})}
                  >
                    📁 ფაილიდან
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.toggleBtn} ${instrumentForm.imageMode === 'link' ? styles.activeToggle : ''}`}
                    onClick={() => setInstrumentForm({...instrumentForm, imageMode: 'link'})}
                  >
                    🔗 ლინკით
                  </button>
                </div>
                {instrumentForm.imageMode === 'file' ? (
                  <div className={styles.fileInputWrapper}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="inst-img-file"
                      onChange={(e) => setInstrumentForm({...instrumentForm, imageFile: e.target.files[0]})} 
                      className={styles.hiddenFile}
                    />
                    <label htmlFor="inst-img-file" className={styles.customFileLabel}>
                      {instrumentForm.imageFile ? `✅ არჩეულია: ${instrumentForm.imageFile.name}` : '📁 აირჩიეთ სურათი კომპიუტერიდან'}
                    </label>
                  </div>
                ) : (
                  <input 
                    type="url" 
                    placeholder="ჩააკოპირეთ სურათის URL ლინკი..." 
                    value={instrumentForm.imageUrl} 
                    onChange={(e) => setInstrumentForm({...instrumentForm, imageUrl: e.target.value})} 
                    className={styles.textInput}
                  />
                )}
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e5e7eb' }}>
                <input 
                  type="checkbox" 
                  checked={instrumentForm.isFolk} 
                  onChange={(e) => setInstrumentForm({...instrumentForm, isFolk: e.target.checked})} 
                />
                არის თუ არა ქართული ფოლკლორული საკრავი?
              </label>

              <textarea 
                placeholder="აღწერა" 
                value={instrumentForm.description} 
                onChange={(e) => setInstrumentForm({...instrumentForm, description: e.target.value})} 
                required 
              />
              <button type="submit" className={styles.submitBtn}>საკრავის დამატება</button>
            </form>
          </div>

          <div className={styles.tableWrapper} style={{ marginTop: '30px' }}>
            <h3>საიტზე არსებული საკრავები</h3>
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>სახელი</th>
                  <th>ტიპი</th>
                  <th>ეპოქა</th>
                  <th>ფოლკლორია?</th>
                  {isMainAdmin && <th>მოქმედება</th>}
                </tr>
              </thead>
              <tbody>
                {instruments.map(item => (
                  <tr key={item._id || item.id}>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>{item.era}</td>
                    <td>{item.isFolk ? 'დიახ' : 'არა'}</td>
                    {isMainAdmin && (
                      <td>
                        <button onClick={() => handleDeleteInstrument(item._id || item.id)} className={styles.deleteBtn}>
                          წაშლა
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ფოლკლორის ტაბი */}
      {activeTab === 'folk' && (
        <div className={styles.contentSection}>
          <div className={styles.formCard}>
            <h3>ახალი რეგიონის / ფოლკლორის დამატება</h3>
            <form onSubmit={handleAddFolk} className={styles.addForm}>
              <input 
                type="text" 
                placeholder="ID (მაგ: racha)" 
                value={folkForm.id} 
                onChange={(e) => setFolkForm({...folkForm, id: e.target.value})} 
                required 
              />
              <input 
                type="text" 
                placeholder="სათაური (მაგ: რაჭული ფოლკლორი)" 
                value={folkForm.title} 
                onChange={(e) => setFolkForm({...folkForm, title: e.target.value})} 
                required 
              />
              <input 
                type="text" 
                placeholder="თეგი / წარწერა (მაგ: ფერხული & სტვირი)" 
                value={folkForm.tag} 
                onChange={(e) => setFolkForm({...folkForm, tag: e.target.value})} 
                required 
              />
              
              {/* ფოლკლორის სურათი */}
              <div className={styles.mediaContainer}>
                <label className={styles.mediaLabel}>ფოლკლორის სურათი:</label>
                <div className={styles.mediaToggleRow}>
                  <button 
                    type="button" 
                    className={`${styles.toggleBtn} ${folkForm.imageMode === 'file' ? styles.activeToggle : ''}`}
                    onClick={() => setFolkForm({...folkForm, imageMode: 'file'})}
                  >
                    📁 ფაილიდან
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.toggleBtn} ${folkForm.imageMode === 'link' ? styles.activeToggle : ''}`}
                    onClick={() => setFolkForm({...folkForm, imageMode: 'link'})}
                  >
                    🔗 ლინკით
                  </button>
                </div>
                {folkForm.imageMode === 'file' ? (
                  <div className={styles.fileInputWrapper}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="folk-img-file"
                      onChange={(e) => setFolkForm({...folkForm, imageFile: e.target.files[0]})} 
                      className={styles.hiddenFile}
                    />
                    <label htmlFor="folk-img-file" className={styles.customFileLabel}>
                      {folkForm.imageFile ? `✅ არჩეულია: ${folkForm.imageFile.name}` : '📁 აირჩიეთ სურათი კომპიუტერიდან'}
                    </label>
                  </div>
                ) : (
                  <input 
                    type="url" 
                    placeholder="ჩააკოპირეთ სურათის URL ლინკი..." 
                    value={folkForm.imageUrl} 
                    onChange={(e) => setFolkForm({...folkForm, imageUrl: e.target.value})} 
                    className={styles.textInput}
                  />
                )}
              </div>

              <input 
                type="text" 
                placeholder="YouTube URL" 
                value={folkForm.youtubeUrl} 
                onChange={(e) => setFolkForm({...folkForm, youtubeUrl: e.target.value})} 
              />
              <textarea 
                placeholder="აღწერა" 
                value={folkForm.description} 
                onChange={(e) => setFolkForm({...folkForm, description: e.target.value})} 
                required 
              />
              <button type="submit" className={styles.submitBtn}>ფოლკლორის დამატება</button>
            </form>
          </div>

          <div className={styles.tableWrapper} style={{ marginTop: '30px' }}>
            <h3>ქართული ფოლკლორის რეგიონები</h3>
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>სათაური</th>
                  <th>თეგი</th>
                  <th>აღწერა</th>
                  {isMainAdmin && <th>მოქმედება</th>}
                </tr>
              </thead>
              <tbody>
                {folkList.map(item => (
                  <tr key={item._id || item.id}>
                    <td>{item.title}</td>
                    <td>{item.tag}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.description}
                    </td>
                    {isMainAdmin && (
                      <td>
                        <button onClick={() => handleDeleteFolk(item._id || item.id)} className={styles.deleteBtn}>
                          წაშლა
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}