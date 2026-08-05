import { useMemo, useState } from 'react';
import styles from './AdminPanel.module.css';
import { WorkspaceHeader, EmptyState } from './AdminFields.jsx';

export default function UsersTab({
  ui,
  users,
  isMainAdmin,
  onToggleAdmin,
  onDeleteUser,
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const blob = `${u.id} ${u.fullName || ''} ${u.username || ''} ${u.email || ''}`.toLowerCase();
      return blob.includes(q);
    });
  }, [users, search]);

  return (
    <div className={styles.sectionStack}>
      <WorkspaceHeader
        title={ui.usersTitle}
        count={users.length}
        search={search}
        onSearch={setSearch}
        searchPlaceholder={ui.searchPlaceholder}
      />

      {filtered.length === 0 ? (
        <EmptyState text={ui.emptyUsers} />
      ) : (
        <div className={styles.userGrid}>
          {filtered.map((u) => (
            <article key={u.id} className={styles.userCard}>
              <div className={styles.userCardTop}>
                <div className={styles.userAvatar}>{(u.fullName || u.username || u.email || '?').slice(0, 1).toUpperCase()}</div>
                <div className={styles.userCardCopy}>
                  <h4>{u.fullName || u.username || u.email}</h4>
                  <p>{u.email || `ID: ${u.id}`}</p>
                </div>
                <span className={`${styles.statusPill} ${u.isAdmin ? styles.statusAdmin : styles.statusUser}`}>
                  {u.isAdmin ? ui.adminLabel : ui.userLabel}
                </span>
              </div>
              {isMainAdmin ? (
                <div className={styles.userCardActions}>
                  <button
                    type="button"
                    onClick={() => onToggleAdmin(u)}
                    className={`${styles.actionBtn} ${u.isAdmin ? styles.actionBtnDanger : styles.actionBtnWarn}`}
                  >
                    {u.isAdmin ? ui.revokeAdmin : ui.grantAdmin}
                  </button>
                  <button type="button" onClick={() => onDeleteUser(u.id)} className={styles.deleteBtn}>
                    {ui.delete}
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
