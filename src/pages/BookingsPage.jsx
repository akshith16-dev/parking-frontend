import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { bookingsAPI, slotsAPI } from '../api/client'
import Modal from '../components/Modal'
import styles from './BookingsPage.module.css'

export default function BookingsPage() {
  const { token, user, showToast } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmCancel, setConfirmCancel] = useState(null)

  async function load() {
    try {
      const data = isAdmin ? await bookingsAPI.getAll(token) : await bookingsAPI.getMine(token)
      setBookings(data)
    } catch (e) { showToast(e.message, 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [token])

  async function handleCancel() {
    try {
      await bookingsAPI.cancel(confirmCancel.id, token)
      showToast('Booking cancelled.')
      setConfirmCancel(null)
      await load()
    } catch (e) { showToast(e.message, 'error') }
  }

  const active = bookings.filter((b) => b.status === 'Active').length
  const cancelled = bookings.filter((b) => b.status === 'Cancelled').length

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h2 className={styles.pageTitle}>{isAdmin ? 'All Bookings' : 'My Bookings'}</h2>
        <div className={styles.summary}>
          <span className="badge badge-green">{active} Active</span>
          <span className="badge badge-red">{cancelled} Cancelled</span>
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading bookings…</div>
        ) : bookings.length === 0 ? (
          <div className="empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
            No bookings found
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    {isAdmin && <th>User</th>}
                    <th>Slot</th>
                    <th>Vehicle</th>
                    <th>Booked At</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td><span className="tag">#{b.id}</span></td>
                      {isAdmin && <td style={{ color: 'var(--muted)' }}>user_{b.user_id}</td>}
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
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmCancel(b)}>
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
        )}
      </div>

      {confirmCancel && (
        <Modal onClose={() => setConfirmCancel(null)}>
          <div className="modal-title">Cancel Booking #{confirmCancel.id}?</div>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '1.5rem' }}>
            This will cancel the booking for vehicle <strong style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>{confirmCancel.vehicle_number}</strong> and free up the slot.
          </p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setConfirmCancel(null)}>Keep it</button>
            <button className="btn btn-danger" onClick={handleCancel}>Yes, Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
