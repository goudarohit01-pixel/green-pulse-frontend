export default function Card({ children, style = {}, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: 'rgba(10, 25, 18, 0.9)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
