import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Sidebar.module.css'

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
      <path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 4-6" />
    </svg>
  )
}
function IconBookmark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}
function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoDot}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#0f1a14" strokeWidth="2.5" width="16" height="16">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <span>ParkSmart</span>
      </div>

      <div className={styles.navSection}>Menu</div>

      {isAdmin && (
        <NavLink to="/dashboard" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <IconChart /><span>Dashboard</span>
        </NavLink>
      )}

      <NavLink to="/slots" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
        <IconGrid /><span>Parking Slots</span>
      </NavLink>

      <NavLink to="/bookings" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
        <IconBookmark /><span>{isAdmin ? 'All Bookings' : 'My Bookings'}</span>
      </NavLink>

      <div className={styles.sidebarBottom}>
        <div className={styles.userChip}>
          <div className={styles.avatar}>{user?.username?.slice(0, 2).toUpperCase()}</div>
          <div>
            <div className={styles.userName}>{user?.username}</div>
            <div className={styles.userRole}>{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className={`${styles.navItem} ${styles.logoutBtn}`}>
          <IconLogout /><span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
