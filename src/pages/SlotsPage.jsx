import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { slotsAPI, bookingsAPI } from '../api/client'
import Modal from '../components/Modal'
import styles from './SlotsPage.module.css'

export default function SlotsPage() {
  const { token, user, showToast } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [floorFilter, setFloorFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Modals
  const [addModal, setAddModal] = useState(false)
  const [editSlot, setEditSlot] = useState(null)
  const [bookSlot, setBookSlot] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Forms
  const [slotForm, setSlotForm] = useState({ slot_number: '', floor: '', slot_type: 'Car' })
  const [bookForm, setBookForm] = useState({ vehicle_number: '', duration_hours: 1 })
  const [formError, setFormError] = useState('')

  async function loadSlots() {
    try {
      const data = await slotsAPI.getAll(token)
      setSlots(data)
    } catch (e) { showToast(e.message, 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadSlots() }, [token])

  // Derived filters
  const floors = [...new Set(slots.map((s) => s.floor))].sort((a, b) => a - b)
  const types = [...new Set(slots.map((s) => s.slot_type))]

  const filtered = slots
    .filter((s) => !search || s.slot_number.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => floorFilter === 'all' || String(s.floor) === String(floorFilter))
    .filter((s) => typeFilter === 'all' || s.slot_type === typeFilter)

  // ---- HANDLERS ----
  async function handleAddSlot(e) {
    e.preventDefault(); setFormError('')
    try {
      await slotsAPI.create({ ...slotForm, floor: parseInt(slotForm.floor), available: true }, token)
      showToast('Slot created!'); setAddModal(false)
      setSlotForm({ slot_number: '', floor: '', slot_type: 'Car' })
      await loadSlots()
    } catch (err) { setFormError(err.message) }
  }

  async function handleEditSlot(e) {
    e.preventDefault(); setFormError('')
    try {
      await slotsAPI.update(editSlot.id, {
        slot_number: editSlot.slot_number,
        floor: parseInt(editSlot.floor),
        slot_type: editSlot.slot_type,
        available: editSlot.available,
      }, token)
      showToast('Slot updated!'); setEditSlot(null)
      await loadSlots()
    } catch (err) { setFormError(err.message) }
  }

  async function handleDeleteSlot() {
    try {
      await slotsAPI.delete(confirmDelete.id, token)
      showToast('Slot deleted.'); setConfirmDelete(null)
      await loadSlots()
    } catch (err) { showToast(err.message, 'error') }
  }

  async function handleBook(e) {
    e.preventDefault(); setFormError('')
    try {
      await bookingsAPI.create({ slot_id: bookSlot.id, ...bookForm, duration_hours: parseInt(bookForm.duration_hours) }, token)
      showToast('Slot booked successfully!'); setBookSlot(null)
      setBookForm({ vehicle_number: '', duration_hours: 1 })
      await loadSlots()
    } catch (err) { setFormError(err.message) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h2 className={styles.pageTitle}>Parking Slots</h2>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => { setSlotForm({ slot_number: '', floor: '', slot_type: 'Car' }); setFormError(''); setAddModal(true) }}>
            + Add Slot
          </button>
        )}
      </div>

      <div className={styles.content}>
        <input
          className={styles.searchBar}
          placeholder="Search slot number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className={styles.filterRow}>
          <button className={`${styles.filterBtn} ${floorFilter === 'all' ? styles.active : ''}`} onClick={() => setFloorFilter('all')}>All Floors</button>
          {floors.map((f) => (
            <button key={f} className={`${styles.filterBtn} ${String(floorFilter) === String(f) ? styles.active : ''}`} onClick={() => setFloorFilter(f)}>Floor {f}</button>
          ))}
        </div>

        <div className={styles.filterRow}>
          <button className={`${styles.filterBtn} ${typeFilter === 'all' ? styles.active : ''}`} onClick={() => setTypeFilter('all')}>All Types</button>
          {types.map((t) => (
            <button key={t} className={`${styles.filterBtn} ${typeFilter === t ? styles.active : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading slots…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            No slots found
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((slot) => (
              <div key={slot.id} className={`${styles.slotCard} ${slot.available ? styles.available : styles.unavailable}`}>
                <div className={styles.slotNum}>{slot.slot_number}</div>
                <div className={styles.slotStatus}>
                  <span className={`${styles.dot} ${slot.available ? styles.dotGreen : styles.dotRed}`} />
                  {slot.available ? 'Available' : 'Occupied'}
                </div>
                <div className={styles.slotMeta}>
                  <span className="tag">Floor {slot.floor}</span>
                  <span className="tag">{slot.slot_type}</span>
                </div>
                <div className={styles.slotActions}>
                  {!isAdmin && slot.available && (
                    <button className="btn btn-primary btn-sm" onClick={() => { setBookSlot(slot); setBookForm({ vehicle_number: '', duration_hours: 1 }); setFormError('') }}>
                      Book
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditSlot({ ...slot }); setFormError('') }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(slot)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD SLOT MODAL */}
      {addModal && (
        <Modal onClose={() => setAddModal(false)}>
          <div className="modal-title">Add Parking Slot</div>
          {formError && <div className="error-msg">{formError}</div>}
          <form onSubmit={handleAddSlot}>
            <div className="field"><label>Slot Number</label><input value={slotForm.slot_number} onChange={(e) => setSlotForm({ ...slotForm, slot_number: e.target.value })} placeholder="e.g. A-01" required /></div>
            <div className="field"><label>Floor</label><input type="number" value={slotForm.floor} onChange={(e) => setSlotForm({ ...slotForm, floor: e.target.value })} placeholder="1" required /></div>
            <div className="field"><label>Type</label>
              <select value={slotForm.slot_type} onChange={(e) => setSlotForm({ ...slotForm, slot_type: e.target.value })}>
                <option>Car</option><option>Bike</option><option>EV</option><option>Truck</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Slot</button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT SLOT MODAL */}
      {editSlot && (
        <Modal onClose={() => setEditSlot(null)}>
          <div className="modal-title">Edit Slot {editSlot.slot_number}</div>
          {formError && <div className="error-msg">{formError}</div>}
          <form onSubmit={handleEditSlot}>
            <div className="field"><label>Slot Number</label><input value={editSlot.slot_number} onChange={(e) => setEditSlot({ ...editSlot, slot_number: e.target.value })} required /></div>
            <div className="field"><label>Floor</label><input type="number" value={editSlot.floor} onChange={(e) => setEditSlot({ ...editSlot, floor: e.target.value })} required /></div>
            <div className="field"><label>Type</label>
              <select value={editSlot.slot_type} onChange={(e) => setEditSlot({ ...editSlot, slot_type: e.target.value })}>
                <option>Car</option><option>Bike</option><option>EV</option><option>Truck</option>
              </select>
            </div>
            <div className="field"><label>Available</label>
              <select value={String(editSlot.available)} onChange={(e) => setEditSlot({ ...editSlot, available: e.target.value === 'true' })}>
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditSlot(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* BOOK SLOT MODAL */}
      {bookSlot && (
        <Modal onClose={() => setBookSlot(null)}>
          <div className="modal-title">Book Slot {bookSlot.slot_number}</div>
          {formError && <div className="error-msg">{formError}</div>}
          <form onSubmit={handleBook}>
            <div className="field"><label>Vehicle Number</label><input value={bookForm.vehicle_number} onChange={(e) => setBookForm({ ...bookForm, vehicle_number: e.target.value })} placeholder="e.g. AP07CD1234" required /></div>
            <div className="field"><label>Duration (hours)</label><input type="number" min="1" max="24" value={bookForm.duration_hours} onChange={(e) => setBookForm({ ...bookForm, duration_hours: e.target.value })} required /></div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setBookSlot(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Confirm Booking</button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRM MODAL */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)}>
          <div className="modal-title">Delete Slot {confirmDelete.slot_number}?</div>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '1.5rem' }}>
            This will permanently remove the slot. Are you sure?
          </p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteSlot}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
