import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import Card from '../components/ui/Card'
import { Spinner } from '../components/ui/helpers'
import dashboardApi from '../api/dashboardApi'

function AreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0d2218', border: '1px solid rgba(74,222,128,0.35)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: '#3d6b52', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#4ade80' }}>{Number(payload[0].value).toFixed(2)} kg</div>
      <div style={{ fontSize: 11, color: '#3d6b52' }}>CO₂ equivalent</div>
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div style={{ background: '#0d2218', border: `1px solid ${item.color}60`, borderRadius: 12, padding: '12px 16px', minWidth: 130 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#d1fae5' }}>{item.name}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ fontSize: 12, color: '#3d6b52' }}>Share</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}%</span>
      </div>
    </div>
  )
}

const CAT_COLORS = {
  TRANSPORT: '#4ade80',
  ENERGY:    '#22d3ee',
  FOOD:      '#a78bfa',
  SHOPPING:  '#fb923c',
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      setData(await dashboardApi.getSummary())
    } catch {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <Spinner size={40} />
    </div>
  )

  if (error) return (
    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 24, textAlign: 'center', color: '#ef4444' }}>
      {error}
      <button onClick={loadDashboard} style={{ display: 'block', margin: '12px auto 0', background: 'none', border: '1px solid #ef4444', borderRadius: 8, padding: '8px 16px', color: '#ef4444', cursor: 'pointer' }}>
        Try Again
      </button>
    </div>
  )

  const kpis = [
    { label: "Today's CO₂",  value: `${Number(data?.todayCo2eKg || 0).toFixed(1)} kg`,  color: '#4ade80', icon: '🌍' },
    { label: 'vs Avg',       value: `${data?.savingsVsNationalPct >= 0 ? '−' : '+'}${Math.abs(data?.savingsVsNationalPct || 0).toFixed(0)}%`, color: '#22d3ee', icon: '📊' },
    { label: 'This Week',    value: `${Number(data?.weekCo2eKg || 0).toFixed(1)} kg`,    color: '#a78bfa', icon: '📅' },
    { label: 'Streak',       value: `${data?.currentStreakDays || 0} days`,              color: '#fb923c', icon: '⚡' },
  ]

  const totalCat = Object.values(data?.categoryBreakdown || {}).reduce((s, v) => s + Number(v), 0)
  const catData  = Object.entries(data?.categoryBreakdown || {}).map(([name, value]) => ({
    name,
    value: totalCat > 0 ? Math.round((Number(value) / totalCat) * 100) : 0,
    color: CAT_COLORS[name] || '#4ade80',
  }))

  const weeklyData = (data?.weeklyTrend || []).map(point => ({
    day: new Date(point.date).toLocaleDateString('en-GB', { weekday: 'short' }),
    co2: Number(point.co2eKg).toFixed(2),
  }))

  return (
    <div>

      {/* KPI Cards — 4 cols desktop, 2 cols mobile */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {kpis.map((k, i) => (
          <Card key={i} className="hover-lift" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, color: '#3d6b52', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.color, fontFamily: "'Righteous', cursive", lineHeight: 1 }}>{k.value}</div>
              </div>
              <span style={{ fontSize: 18 }}>{k.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts — side by side desktop, stacked mobile */}
      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 20 }}>

        {/* Area chart */}
        <Card style={{ padding: '20px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#8ab89a' }}>
            Weekly CO₂ Trend <span style={{ fontSize: 12, color: '#3d6b52', fontWeight: 400 }}>(kg)</span>
          </div>
          {weeklyData.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3d6b52', fontSize: 13 }}>
              No data yet — log some activities!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.05)" />
                <XAxis dataKey="day" stroke="#2a4a38" tick={{ fontSize: 11, fill: '#3d6b52' }} />
                <YAxis              stroke="#2a4a38" tick={{ fontSize: 11, fill: '#3d6b52' }} width={35} />
                <Tooltip content={<AreaTooltip />} />
                <Area type="monotone" dataKey="co2" stroke="#4ade80" strokeWidth={2.5} fill="url(#ag)"
                  dot={{ fill: '#4ade80', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#4ade80', stroke: '#d1fae5', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Pie chart */}
        <Card style={{ padding: '20px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: '#8ab89a' }}>By Category</div>
          <div style={{ fontSize: 11, color: '#3d6b52', marginBottom: 10 }}>Hover a slice</div>
          {catData.length === 0 ? (
            <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3d6b52', fontSize: 13 }}>No data yet</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={38} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip content={<PieTooltip />} wrapperStyle={{ zIndex: 999 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flexShrink: 0, width: 100 }}>
                {catData.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                      <span style={{ fontSize: 11, color: '#8ab89a' }}>{c.name.charAt(0) + c.name.slice(1).toLowerCase()}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginTop: 10, padding: '9px 12px', background: 'rgba(74,222,128,0.06)', borderRadius: 9, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#3d6b52' }}>Month total</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#4ade80', fontFamily: "'Righteous', cursive" }}>
              {Number(data?.monthCo2eKg || 0).toFixed(1)} kg
            </span>
          </div>
        </Card>

      </div>

      {/* Recent Activities */}
      <Card style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#8ab89a' }}>Recent Activities</div>
          <button onClick={() => navigate('/history')}
            style={{ background: 'none', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 8, padding: '5px 12px', color: '#4ade80', fontSize: 12, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            View All
          </button>
        </div>

        {(!data?.recentActivities || data.recentActivities.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#3d6b52', fontSize: 13 }}>
            No activities yet — go to Log Activity!
          </div>
        ) : (
          data.recentActivities.map((a, i) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < data.recentActivities.length - 1 ? '1px solid rgba(74,222,128,0.05)' : 'none', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${CAT_COLORS[a.category] || '#4ade80'}15`, border: `1px solid ${CAT_COLORS[a.category] || '#4ade80'}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {a.category === 'TRANSPORT' ? '🚗' : a.category === 'ENERGY' ? '⚡' : a.category === 'FOOD' ? '🍽' : '🛍'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#d1fae5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.subType.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: 11, color: '#3d6b52' }}>{a.category} · {Number(a.quantity).toFixed(1)} {a.unit}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fb923c' }}>{Number(a.co2eKg).toFixed(2)} kg</div>
                <div style={{ fontSize: 11, color: '#3d6b52' }}>
                  {new Date(a.activityDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            </div>
          ))
        )}
      </Card>

    </div>
  )
}
