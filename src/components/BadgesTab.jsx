import { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import { Badge, Spinner } from '../components/ui/helpers'
import badgeApi from '../api/badgeApi'

export default function BadgesTab() {
  const [badges,  setBadges]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    loadBadges()
  }, [])

  async function loadBadges() {
    try {
      setLoading(true)
      const data = await badgeApi.getAll()
      setBadges(data)
    } catch (err) {
      setError('Failed to load badges')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <Spinner size={36} />
    </div>
  )

  if (error) return (
    <div style={{ color: '#ef4444', padding: 20 }}>{error}</div>
  )

  const earnedCount = badges.filter(b => b.earned).length

  return (
    <div>
      {/* Badge grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 14,
        marginBottom: 16,
      }}>
        {badges.map((b, i) => (
          <Card
            key={i}
            className="hover-lift"
            style={{
              padding:   '24px 16px',
              textAlign: 'center',
              opacity:   b.earned ? 1 : 0.5,
              border:    `1px solid ${b.earned
                ? 'rgba(74,222,128,0.2)'
                : 'rgba(74,222,128,0.04)'}`,
              transition: 'all 0.2s',
            }}
          >
            {/* Badge icon */}
            <div style={{
              width:           54,
              height:          54,
              borderRadius:    16,
              background:      b.earned
                ? 'rgba(34,197,94,0.12)'
                : 'rgba(255,255,255,0.03)',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              fontSize:        26,
              margin:          '0 auto 12px',
              filter:          b.earned ? 'none' : 'grayscale(1)',
              boxShadow:       b.earned ? '0 0 16px rgba(34,197,94,0.15)' : 'none',
            }}>
              {b.icon}
            </div>

            {/* Label */}
            <div style={{
              fontSize:   13,
              fontWeight: 700,
              color:      b.earned ? '#d1fae5' : '#3d6b52',
              marginBottom: 4,
            }}>
              {b.label}
            </div>

            {/* Description */}
            <div style={{
              fontSize:    11,
              color:       '#3d6b52',
              marginBottom: 10,
              lineHeight:  1.4,
            }}>
              {b.desc}
            </div>

            {/* Earned / Locked badge */}
            <Badge color={b.earned ? '#4ade80' : '#2a4a38'}>
              {b.earned ? '✓ Earned' : '🔒 Locked'}
            </Badge>

            {/* Progress hint for locked badges */}
            {!b.earned && b.progress && (
              <div style={{
                marginTop:  8,
                fontSize:   10,
                color:      '#2a4a38',
                lineHeight: 1.4,
                padding:    '6px 8px',
                background: 'rgba(74,222,128,0.03)',
                borderRadius: 6,
              }}>
                {b.progress}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Summary bar */}
      <Card style={{
        padding:    '16px 20px',
        display:    'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#d1fae5' }}>
            {earnedCount} of {badges.length} badges earned
          </div>
          <div style={{ fontSize: 12, color: '#3d6b52', marginTop: 3 }}>
            {earnedCount === badges.length
              ? '🎉 You earned all badges!'
              : 'Keep logging activities to unlock more'}
          </div>
        </div>

        {/* Badge dots */}
        <div style={{ display: 'flex' }}>
          {badges.map((b, i) => (
            <div key={i} style={{
              width:        14,
              height:       14,
              borderRadius: '50%',
              background:   b.earned ? '#4ade80' : 'rgba(74,222,128,0.1)',
              border:       '2px solid #050d0a',
              marginLeft:   i > 0 ? -4 : 0,
              boxShadow:    b.earned ? '0 0 6px #4ade8055' : 'none',
              transition:   'all 0.3s',
            }} />
          ))}
        </div>
      </Card>
    </div>
  )
}
