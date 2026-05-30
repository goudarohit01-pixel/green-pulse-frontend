import { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import { Badge, Toast, Spinner } from '../components/ui/helpers'
import activityApi from '../api/activityApi'

const CAT_COLORS = {
  TRANSPORT: '#4ade80',
  ENERGY:    '#22d3ee',
  FOOD:      '#a78bfa',
  SHOPPING:  '#fb923c',
}

const CAT_ICONS = {
  TRANSPORT: '🚗',
  ENERGY:    '⚡',
  FOOD:      '🍽',
  SHOPPING:  '🛍',
}

const FILTERS = ['All', 'TRANSPORT', 'ENERGY', 'FOOD', 'SHOPPING']

// ── Use local date NOT toISOString() which shifts date in IST timezone ──
function toLocalDate(date) {
  const year  = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day   = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`   // returns YYYY-MM-DD
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// Calculate default dates using local time
function getDefaultDates() {
  const today = new Date()
  const sixMonthsAgo = new Date(
    today.getFullYear(),
    today.getMonth() - 6,
    today.getDate()
  )
  return {
    from: toLocalDate(sixMonthsAgo),
    to:   toLocalDate(today),
  }
}

export default function HistoryPage() {
  const defaults = getDefaultDates()

  const [activities, setActivities] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('All')
  const [toast,      setToast]      = useState(null)
  const [fromDate,   setFromDate]   = useState(defaults.from)
  const [toDate,     setToDate]     = useState(defaults.to)

  useEffect(() => {
    loadActivities()
  }, [filter, fromDate, toDate])

  async function loadActivities() {
    try {
      setLoading(true)
      const params = {}
      if (filter !== 'All') params.category = filter
      if (fromDate)         params.from      = fromDate
      if (toDate)           params.to        = toDate

      const data = await activityApi.getAll(params)
      setActivities(data)
    } catch (err) {
      showToast('Failed to load activities', 'error')
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  async function handleDelete(id) {
    try {
      await activityApi.delete(id)
      setActivities(prev => prev.filter(a => a.id !== id))
      showToast('Activity deleted')
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  // Quick preset buttons
  function setPreset(preset) {
    const now = new Date()
    let from  = new Date()

    if (preset === 'today') {
      setFromDate(toLocalDate(now))
      setToDate(toLocalDate(now))
    } else if (preset === 'week') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
      setFromDate(toLocalDate(from))
      setToDate(toLocalDate(now))
    } else if (preset === 'month') {
      from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      setFromDate(toLocalDate(from))
      setToDate(toLocalDate(now))
    } else if (preset === 'all') {
      from = new Date(2000, 0, 1)
      setFromDate(toLocalDate(from))
      setToDate(toLocalDate(now))
    }
  }

  function clearFilters() {
    const d = getDefaultDates()
    setFilter('All')
    setFromDate(d.from)
    setToDate(d.to)
  }

  const totalCo2 = activities.reduce((s, a) => s + Number(a.co2eKg), 0)

  const dateInp = {
    background:   'rgba(255,255,255,0.03)',
    border:       '1px solid rgba(74,222,128,0.12)',
    borderRadius: 8,
    padding:      '8px 12px',
    color:        '#d1fae5',
    fontSize:     13,
    outline:      'none',
    fontFamily:   "'Plus Jakarta Sans', sans-serif",
    colorScheme:  'dark',
  }

  return (
    <div>

      {/* ── Category Filter Pills ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              background:   filter === f ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.02)',
              border:       `1px solid ${filter === f ? 'rgba(74,222,128,0.4)' : 'rgba(74,222,128,0.08)'}`,
              borderRadius: 99,
              padding:      '7px 16px',
              color:        filter === f ? '#4ade80' : '#3d6b52',
              fontSize:     13,
              fontWeight:   filter === f ? 700 : 500,
              cursor:       'pointer',
              fontFamily:   "'Plus Jakarta Sans', sans-serif",
              transition:   'all 0.15s',
            }}>
            {f === 'All'       ? '🌍 All'        :
             f === 'TRANSPORT' ? '🚗 Transport'  :
             f === 'ENERGY'    ? '⚡ Energy'     :
             f === 'FOOD'      ? '🍽 Food'       : '🛍 Shopping'}
          </button>
        ))}
      </div>

      {/* ── Date Range Row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>

        {/* From date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#3d6b52' }}>From</span>
          <input
            type="date"
            value={fromDate}
            max={toDate}
            onChange={e => setFromDate(e.target.value)}
            style={dateInp}
          />
          <span style={{ fontSize: 12, color: '#3d6b52' }}>To</span>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            onChange={e => setToDate(e.target.value)}
            style={dateInp}
          />
        </div>

        {/* Quick presets */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: 'Today',   key: 'today' },
            { label: '7 Days',  key: 'week'  },
            { label: '1 Month', key: 'month' },
            { label: 'All',     key: 'all'   },
          ].map(p => (
            <button key={p.key} onClick={() => setPreset(p.key)}
              style={{
                background:   'rgba(74,222,128,0.06)',
                border:       '1px solid rgba(74,222,128,0.12)',
                borderRadius: 7,
                padding:      '6px 12px',
                color:        '#3d6b52',
                fontSize:     12,
                cursor:       'pointer',
                fontFamily:   "'Plus Jakarta Sans', sans-serif",
                transition:   'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#4ade80'}
              onMouseLeave={e => e.currentTarget.style.color = '#3d6b52'}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Reset */}
        <button onClick={clearFilters}
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 7, padding: '6px 12px', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", marginLeft: 'auto' }}>
          Reset
        </button>
      </div>

      {/* ── Summary bar ── */}
      {!loading && activities.length > 0 && (
        <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: 10, padding: '12px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#3d6b52' }}>
            Showing{' '}
            <strong style={{ color: '#d1fae5' }}>{activities.length}</strong>
            {' '}activities
            <span style={{ marginLeft: 10, color: '#2a4a38' }}>
              {formatDate(fromDate)} → {formatDate(toDate)}
            </span>
          </span>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#fb923c', fontFamily: "'Righteous', cursive" }}>
            Total: {totalCo2.toFixed(2)} kg CO₂e
          </span>
        </div>
      )}

      {/* ── Table ── */}
      <Card style={{ padding: 0 }}>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 40px', padding: '14px 20px', borderBottom: '1px solid rgba(74,222,128,0.07)' }}>
          {['Activity', 'Category', 'Quantity', 'CO₂e', 'Date', ''].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#3d6b52', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {h}
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
            <Spinner size={36} />
          </div>

        /* Empty */
        ) : activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#3d6b52' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, color: '#d1fae5', fontWeight: 600, marginBottom: 6 }}>
              No activities found
            </div>
            <div style={{ fontSize: 13 }}>
              {filter !== 'All'
                ? 'Try selecting All categories or change the date range'
                : 'Go to Log Activity to start tracking your carbon footprint'}
            </div>
          </div>

        /* Rows */
        ) : (
          activities.map((a, i) => {
            const color = CAT_COLORS[a.category] || '#4ade80'
            return (
              <div key={a.id}
                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 40px', padding: '13px 20px', borderBottom: i < activities.length - 1 ? '1px solid rgba(74,222,128,0.04)' : 'none', alignItems: 'center' }}>

                {/* Activity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {CAT_ICONS[a.category] || '📌'}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#d1fae5' }}>
                    {a.subType.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Category */}
                <Badge color={color}>
                  {a.category.charAt(0) + a.category.slice(1).toLowerCase()}
                </Badge>

                {/* Quantity */}
                <span style={{ fontSize: 13, color: '#8ab89a' }}>
                  {Number(a.quantity).toFixed(1)} {a.unit}
                </span>

                {/* CO2e */}
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fb923c' }}>
                  {Number(a.co2eKg).toFixed(2)} kg
                </span>

                {/* Date — formatted properly */}
                <span style={{ fontSize: 12, color: '#8ab89a' }}>
                  {formatDate(a.activityDate)}
                </span>

                {/* Delete */}
                <button onClick={() => handleDelete(a.id)}
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 6, padding: '4px 8px', color: '#ef4444', fontSize: 11, cursor: 'pointer', width: 32 }}>
                  ✕
                </button>

              </div>
            )
          })
        )}
      </Card>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
