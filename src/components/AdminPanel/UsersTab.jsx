import styles from './AdminPanel.module.css';
import { DataTable } from './AdminFields.jsx';

export default function UsersTab({
  ui,
  users,
  isMainAdmin,
  onToggleAdmin,
  onDeleteUser,
}) {
  return (
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
                  onClick={() => onToggleAdmin(u)}
                  className={`${styles.actionBtn} ${u.isAdmin ? styles.actionBtnDanger : styles.actionBtnWarn}`}
                >
                  {u.isAdmin ? ui.revokeAdmin : ui.grantAdmin}
                </button>
              </td>
              <td>
                <button onClick={() => onDeleteUser(u.id)} className={styles.deleteBtn}>
                  {ui.delete}
                </button>
              </td>
            </>
          )}
        </tr>
      ))}
    />
  );
}
