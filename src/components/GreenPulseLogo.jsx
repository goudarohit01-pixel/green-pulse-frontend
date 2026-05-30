// Green Pulse SVG Logo Component
// Usage: <GreenPulseLogo size={40} showText={true} textSize={20} />

export default function GreenPulseLogo({
  size      = 40,
  showText  = true,
  textSize  = 20,
  className = '',
}) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* SVG Icon — leaf with pulse line */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Green Pulse logo"
      >
        {/* Outer ring */}
        <circle
          cx="50" cy="50" r="46"
          stroke="url(#gpRing)"
          strokeWidth="3"
          fill="none"
          opacity="0.6"
        />

        {/* Leaf body */}
        <path
          d="M50 18C50 18 22 30 22 54C22 70 34 82 50 82C66 82 78 70 78 54C78 30 50 18 50 18Z"
          fill="url(#gpLeaf)"
          opacity="0.95"
        />

        {/* Pulse / ECG line inside leaf */}
        <path
          d="M28 54L38 54L43 42L50 66L57 38L62 54L72 54"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Stem */}
        <path
          d="M50 82L50 92"
          stroke="url(#gpStem)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <defs>
          <linearGradient id="gpLeaf" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#4ade80" />
            <stop offset="50%"  stopColor="#16a34a" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
          <linearGradient id="gpRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#4ade80" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="gpStem" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#16a34a" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
        </defs>
      </svg>

      {/* Text lockup */}
      {showText && (
        <div>
          <div
            style={{
              fontFamily:              'var(--font-display)',
              fontSize:                textSize,
              background:              'linear-gradient(135deg, #4ade80, #22d3ee)',
              WebkitBackgroundClip:    'text',
              WebkitTextFillColor:     'transparent',
              backgroundClip:          'text',
              lineHeight:              1.1,
              letterSpacing:           '0.02em',
              userSelect:              'none',
            }}
          >
            Green<span style={{ fontWeight: 900 }}>Pulse</span>
          </div>
          <div
            style={{
              fontSize:       10,
              color:          'var(--color-text-dim)',
              letterSpacing:  '0.15em',
              textTransform:  'uppercase',
              marginTop:      2,
              userSelect:     'none',
            }}
          >
            Carbon Tracker
          </div>
        </div>
      )}
    </div>
  )
}