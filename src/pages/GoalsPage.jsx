import { useState, useEffect } from 'react'
import Card   from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Badge, Toast, Spinner } from '../components/ui/helpers'
import goalApi from '../api/goalApi'

export default function GoalsPage() {
  const [goals,   setGoals]   = useState([])
  const [loading, setLoading] = useState(true)
  const [toast,   setToast]   = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', targetCo2eKg: '', period: 'WEEKLY',
    startDate: new Date().toISOString().slice(0,10),
    endDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10),
    category: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadGoals() }, [])

  async function loadGoals() {
    try {
      setLoading(true)
      const data = await goalApi.getAll()
      setGoals(data)
    } catch (err) {
      showToast('Failed to load goals', 'error')
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  async function handleCreate() {
    if (!form.title.trim() || !form.targetCo2eKg) {
      showToast('Title and target are required', 'error')
      return
    }
    setSaving(true)
    try {
      await goalApi.create({
        title:         form.title,
        targetCo2eKg:  parseFloat(form.targetCo2eKg),
        period:        form.period,
        startDate:     form.startDate,
        endDate:       form.endDate,
        category:      form.category || null,
      })
      showToast('Goal created!')
      setShowForm(false)
      setForm({ title: '', targetCo2eKg: '', period: 'WEEKLY', startDate: new Date().toISOString().slice(0,10), endDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10), category: '' })
      loadGoals()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create goal', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await goalApi.delete(id)
      setGoals(prev => prev.filter(g => g.goalId !== id))
      showToast('Goal deleted')
    } catch {
      showToast('Failed to delete goal', 'error')
    }
  }

  const lbl = { display: 'block', fontSize: 12, fontWeight: 700, color: '#3d6b52', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }
  const sel = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: 10, padding: '11px 14px', color: '#d1fae5', fontSize: 14, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", appearance: 'none' }
  const inp = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: 10, padding: '11px 14px', color: '#d1fae5', fontSize: 14, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' }

  const CAT_COLORS = { TRANSPORT: '#4ade80', ENERGY: '#22d3ee', FOOD: '#a78bfa', SHOPPING: '#fb923c' }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <Spinner size={40} />
    </div>
  )

  return (
    <div>
      {/* Add Goal Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Button onClick={() => setShowForm(s => !s)} variant={showForm ? 'secondary' : 'primary'}>
          {showForm ? '✕ Cancel' : '+ Add Goal'}
        </Button>
      </div>

      {/* Create Goal Form */}
      {showForm && (
        <Card style={{ padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Righteous', cursive", fontSize: 18, color: '#d1fae5', margin: '0 0 20px' }}>
            Create New Goal
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={lbl}>Goal Title</label>
              <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                placeholder="e.g. Weekly Carbon Budget" style={inp} />
            </div>
            <div>
              <label style={lbl}>Target CO2e (kg)</label>
              <input type="number" value={form.targetCo2eKg} onChange={e => setForm(f => ({...f, targetCo2eKg: e.target.value}))}
                placeholder="e.g. 100" style={inp} />
            </div>
            <div>
              <label style={lbl}>Period</label>
              <select value={form.period} onChange={e => setForm(f => ({...f, period: e.target.value}))} style={sel}>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Category (optional)</label>
              <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} style={sel}>
                <option value="">All Categories</option>
                <option value="TRANSPORT">Transport</option>
                <option value="ENERGY">Energy</option>
                <option value="FOOD">Food</option>
                <option value="SHOPPING">Shopping</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))}
                style={{ ...inp, colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={lbl}>End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({...f, endDate: e.target.value}))}
                style={{ ...inp, colorScheme: 'dark' }} />
            </div>
          </div>
          <Button onClick={handleCreate} loading={saving} style={{ marginTop: 20, width: '100%' }}>
            Create Goal 🎯
          </Button>
        </Card>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 16, color: '#d1fae5', fontWeight: 600, marginBottom: 8 }}>No goals yet</div>
          <div style={{ fontSize: 14, color: '#3d6b52' }}>Click Add Goal to set your first carbon reduction target</div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {goals.map((g, i) => {
            const pct  = Math.min(g.percentUsed, 100)
            const near = pct >= 80
            const color = g.category ? CAT_COLORS[g.category] : '#4ade80'

            return (
              <Card key={g.goalId || i} className="hover-lift" style={{ padding: '26px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}12`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                      🎯
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#d1fae5' }}>{g.title}</div>
                      <div style={{ fontSize: 11, color: '#3d6b52', marginTop: 2 }}>{g.period} · {g.category || 'All Categories'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge color={near ? '#fb923c' : '#4ade80'}>
                      {near ? '⚠ Near Limit' : 'On Track'}
                    </Badge>
                    <button onClick={() => handleDelete(g.goalId)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '3px 8px', color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'Righteous', cursive", lineHeight: 1 }}>
                    {Number(g.usedCo2eKg).toFixed(1)}
                  </span>
                  <span style={{ fontSize: 14, color: '#3d6b52', marginBottom: 2 }}>
                    / {Number(g.targetCo2eKg).toFixed(0)} kg CO2e
                  </span>
                </div>

                <div style={{ height: 8, background: 'rgba(74,222,128,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: near ? 'linear-gradient(90deg,#fb923c,#ef4444)' : `linear-gradient(90deg,${color},${color}90)`, borderRadius: 99, transition: 'width 0.5s' }} />
                </div>

                <div style={{ fontSize: 12, color: '#3d6b52', marginTop: 8 }}>
                  {pct.toFixed(0)}% used · {Number(g.remainingCo2eKg).toFixed(1)} kg remaining
                </div>

                <div style={{ fontSize: 11, color: '#2a4a38', marginTop: 4 }}>
                  {new Date(g.startDate).toLocaleDateString()} → {new Date(g.endDate).toLocaleDateString()}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
