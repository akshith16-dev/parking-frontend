import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { slotsAPI, bookingsAPI } from '../api/client'
import styles from './Dashboard.module.css'

export default function DashboardPage() {
  const { token, showToast } = useAuth()
  const [slots, setSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, b] = await Promise.all([
          slotsAPI.getAll(token),
          bookingsAPI.getAll(token),
        ])
        setSlots(s)
        setBookings(b)
      } catch (e) {
        showToast(e.message, 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  async function handleCancel(id) {
    try {
      await bookingsAPI.cancel(id, token)
      const [s, b] = await Promise.all([slotsAPI.getAll(token), bookingsAPI.getAll(token)])
      setSlots(s); setBookings(b)
      showToast('Booking cancelled.')
    } catch (e) { showToast(e.message, 'error') }
  }

  const total = slots.length
  const available = slots.filter((s) => s.available).length
  const occupied = total - available
  const active = bookings.filter((b) => b.status === 'Active').length

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h2 className={styles.pageTitle}>Dashboard</h2>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading…</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Slots</div>
              <div className={`${styles.statVal} ${styles.blue}`}>{total}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Available</div>
              <div className={`${styles.statVal} ${styles.green}`}>{available}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Occupied</div>
              <div className={`${styles.statVal} ${styles.red}`}>{occupied}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Active Bookings</div>
              <div className={`${styles.statVal} ${styles.warn}`}>{active}</div>
            </div>
          </div>

          <div className="section-header">
            <div className="section-title">All Bookings</div>
          </div>

          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>User</th><th>Slot</th><th>Vehicle</th>
                    <th>Booked At</th><th>Duration</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No bookings yet</td></tr>
                  ) : bookings.map((b) => (
                    <tr key={b.id}>
                      <td><span className="tag">#{b.id}</span></td>
                      <td style={{ color: 'var(--muted)' }}>user_{b.user_id}</td>
                      <td><span className="tag">Slot {b.slot_id}</span></td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{b.vehicle_number}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '12px' }}>{new Date(b.booked_at).toLocaleString()}</td>
                      <td style={{ color: 'var(--muted)' }}>{b.duration_hours}h</td>
                      <td>
                        <span className={`badge ${b.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.status === 'Active' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
