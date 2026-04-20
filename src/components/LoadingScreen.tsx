export function LoadingScreen() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #e8e0d6 0%, #d4cdc4 100%)',
      gap: 16,
    }}>
      <div style={{ fontSize: 48, animation: 'bounce 1s ease-in-out infinite' }}>
        🦆
      </div>
      <div style={{ fontSize: 16, color: '#666', fontWeight: 500 }}>
        Waking up the platypus...
      </div>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
