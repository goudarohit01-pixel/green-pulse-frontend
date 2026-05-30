import { useState, useEffect } from 'react'
import Card   from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'
import { Badge, Toast, Spinner } from '../components/ui/helpers'
import activityApi from '../api/activityApi'

const LOCAL_FACTORS = {
  TRANSPORT: {
    'car_petrol':   { label: 'Car (Petrol)',   factor: 0.21,  unit: 'km'   },
    'car_diesel':   { label: 'Car (Diesel)',   factor: 0.195, unit: 'km'   },
    'car_electric': { label: 'Car (Electric)', factor: 0.053, unit: 'km'   },
    'bus':          { label: 'Bus',            factor: 0.089, unit: 'km'   },
    'train':        { label: 'Train',          factor: 0.041, unit: 'km'   },
    'flight_short': { label: 'Flight (Short)', factor: 0.255, unit: 'km'   },
    'flight_long':  { label: 'Flight (Long)',  factor: 0.195, unit: 'km'   },
    'taxi':         { label: 'Taxi',           factor: 0.149, unit: 'km'   },
  },
  ENERGY: {
    'electricity_uk': { label: 'Electricity (UK)', factor: 0.233, unit: 'kwh' },
    'electricity_us': { label: 'Electricity (US)', factor: 0.386, unit: 'kwh' },
    'natural_gas':    { label: 'Natural Gas',       factor: 0.202, unit: 'kwh' },
    'heating_oil':    { label: 'Heating Oil',       factor: 0.265, unit: 'kwh' },
    'lpg':            { label: 'LPG',               factor: 0.214, unit: 'kwh' },
  },
  FOOD: {
    'beef':       { label: 'Beef',       factor: 27,   unit: 'kg' },
    'lamb':       { label: 'Lamb',       factor: 39.2, unit: 'kg' },
    'chicken':    { label: 'Chicken',    factor: 6.9,  unit: 'kg' },
    'pork':       { label: 'Pork',       factor: 7.6,  unit: 'kg' },
    'fish':       { label: 'Fish',       factor: 6.1,  unit: 'kg' },
    'dairy_milk': { label: 'Dairy Milk', factor: 3.2,  unit: 'kg' },
    'vegetables': { label: 'Vegetables', factor: 2.0,  unit: 'kg' },
    'rice':       { label: 'Rice',       factor: 2.7,  unit: 'kg' },
  },
  SHOPPING: {
    'clothing_new': { label: 'Clothing', factor: 10,  unit: 'item' },
    'phone':        { label: 'Phone',    factor: 70,  unit: 'item' },
    'laptop':       { label: 'Laptop',   factor: 300, unit: 'item' },
    'tablet':       { label: 'Tablet',   factor: 100, unit: 'item' },
    'furniture':    { label: 'Furniture',factor: 30,  unit: 'item' },
  },
}

const CAT_ICONS = { TRANSPORT: '🚗', ENERGY: '⚡', FOOD: '🍽', SHOPPING: '🛍' }

function toLocalDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function LogActivityPage() {
  const [cat,     setCat]     = useState('TRANSPORT')
  const [subType, setSubType] = useState('car_petrol')
  const [qty,     setQty]     = useState('')
  const [date,    setDate]    = useState(toLocalDate(new Date()))
  const [notes,   setNotes]   = useState('')
  const [logged,  setLogged]  = useState([])
  const [toast,   setToast]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => { loadHistory() }, [])

  async function loadHistory() {
    try {
      setLoadingHistory(true)
      const data = await activityApi.getAll()
      setHistory(data.slice(0, 8))
    } catch { /* ignore */ }
    finally { setLoadingHistory(false) }
  }

  const types   = LOCAL_FACTORS[cat]
  const current = types[subType]
  const estimate = qty && !isNaN(qty) && +qty > 0
    ? (+qty * current.factor).toFixed(2)
    : null

  function changeCategory(c) {
    setCat(c)
    setSubType(Object.keys(LOCAL_FACTORS[c])[0])
    setQty('')
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  async function handleLog() {
    if (!estimate) { showToast('Enter a valid quantity', 'error'); return }
    setLoading(true)
    try {
      const saved = await activityApi.log({
        category:     cat,
        subType,
        quantity:     parseFloat(qty),
        activityDate: date,
        notes:        notes || null,
      })
      setLogged(prev => [{ id: saved.id, cat, label: current.label, qty, unit: current.unit, co2: Number(saved.co2eKg).toFixed(2) }, ...prev])
      showToast(`Logged ${Number(saved.co2eKg).toFixed(2)} kg CO₂e ✅`)
      setQty('')
      setNotes('')
      loadHistory()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to log activity', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    try {
      await activityApi.delete(id)
      setHistory(prev => prev.filter(a => a.id !== id))
      showToast('Deleted')
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  const lbl = { display: 'block', fontSize: 12, fontWeight: 700, color: '#3d6b52', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }
  const sel = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: 10, padding: '11px 14px', color: '#d1fae5', fontSize: 14, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", appearance: 'none' }

  return (
    <div>
      {/* Two column on desktop, one column on mobile */}
      <div className="log-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>

        {/* ── Log Form ── */}
        <Card style={{ padding: 22 }}>
          <h2 style={{ fontFamily: "'Righteous', cursive", fontSize: 18, color: '#d1fae5', margin: '0 0 20px' }}>
            New Activity
          </h2>

          {/* Category */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {Object.keys(LOCAL_FACTORS).map(c => (
                <button key={c} onClick={() => changeCategory(c)}
                  style={{ background: cat===c ? 'rgba(34,197,94,0.15)':'rgba(255,255,255,0.02)', border: `1px solid ${cat===c ? 'rgba(74,222,128,0.5)':'rgba(74,222,128,0.08)'}`, borderRadius: 9, padding: '10px 8px', color: cat===c ? '#4ade80':'#3d6b52', fontSize: 13, fontWeight: cat===c ? 700:500, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {CAT_ICONS[c]} {c.charAt(0) + c.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Activity Type</label>
            <select value={subType} onChange={e => setSubType(e.target.value)} style={sel}>
              {Object.entries(types).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <Input
            label={`Quantity (${current.unit})`}
            type="number"
            placeholder="e.g. 42"
            value={qty}
            onChange={e => setQty(e.target.value)}
          />

          {/* Date */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ ...sel, colorScheme: 'dark' }} />
          </div>

          {/* CO2 estimate */}
          {estimate && (
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, padding: '11px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#3d6b52' }}>Estimated</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#4ade80', fontFamily: "'Righteous', cursive" }}>
                {estimate} kg CO₂e
              </span>
            </div>
          )}

          <Button onClick={handleLog} loading={loading} style={{ width: '100%' }}>
            + Log Activity
          </Button>
        </Card>

        {/* ── Right panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Session log */}
          {logged.length > 0 && (
            <Card style={{ padding: 20 }}>
              <h3 style={{ fontFamily: "'Righteous', cursive", fontSize: 15, color: '#d1fae5', margin: '0 0 12px' }}>
                Session Log
              </h3>
              {logged.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(74,222,128,0.05)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#d1fae5' }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: '#3d6b52' }}>{a.qty} {a.unit}</div>
                  </div>
                  <Badge color="#4ade80">{a.co2} kg</Badge>
                </div>
              ))}
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(74,222,128,0.1)', paddingTop: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#8ab89a' }}>Total</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#fb923c', fontFamily: "'Righteous', cursive" }}>
                  {logged.reduce((s, a) => s + parseFloat(a.co2), 0).toFixed(2)} kg
                </span>
              </div>
            </Card>
          )}

          {/* Recent from DB */}
          <Card style={{ padding: 20 }}>
            <h3 style={{ fontFamily: "'Righteous', cursive", fontSize: 15, color: '#d1fae5', margin: '0 0 12px' }}>
              Recent
            </h3>
            {loadingHistory ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}><Spinner /></div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#3d6b52', fontSize: 13 }}>
                No activities yet
              </div>
            ) : (
              history.map((a, i) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < history.length - 1 ? '1px solid rgba(74,222,128,0.05)' : 'none' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#d1fae5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.subType.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: 11, color: '#3d6b52' }}>{a.category}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fb923c' }}>{Number(a.co2eKg).toFixed(2)} kg</span>
                    <button onClick={() => handleDelete(a.id)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '3px 7px', color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </Card>

        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
