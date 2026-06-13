// premium-theme.jsx — UI komponentlar: Sidebar, Toast, ConfirmModal, PremiumThemeContext

const { useState, useEffect, useRef, createContext, useContext } = React;

// ────────────────────────────────────────────────────────────
// Theme Context
// ────────────────────────────────────────────────────────────
window.PremiumThemeContext = createContext({ theme: 'dark', setTheme: () => {} });

// ────────────────────────────────────────────────────────────
// Toast
// ────────────────────────────────────────────────────────────
window.Toast = function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const colors = {
    success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', text: '#10b981' },
    error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  text: '#ef4444' },
    info:    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', text: '#3b82f6' },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      padding: '12px 20px', borderRadius: 10, zIndex: 9999,
      background: c.bg, border: '1px solid ' + c.border, color: c.text,
      fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)', animation: 'toast-in .25s ease-out',
      whiteSpace: 'nowrap',
    }}>
      {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} {message}
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// Confirm Modal
// ────────────────────────────────────────────────────────────
window.ConfirmModal = function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = 'Tasdiqlash', danger = false }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 8000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 'min(420px, 90vw)', borderRadius: 16,
        background: 'var(--card-bg, rgba(22,22,26,0.98))',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '28px 28px 22px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        animation: 'fade-in .2s ease-out',
      }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 600, color: danger ? '#ef4444' : '#f5f3ed' }}>{title}</h3>
        <p style={{ margin: '0 0 22px', color: '#a0a0a8', fontSize: 14, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#a0a0a8', cursor: 'pointer', fontSize: 14,
          }}>Bekor qilish</button>
          <button onClick={onConfirm} style={{
            padding: '9px 18px', borderRadius: 8, border: 'none',
            background: danger ? '#ef4444' : 'linear-gradient(135deg,#d4a853,#a88436)',
            color: danger ? '#fff' : '#0a0a0c', cursor: 'pointer', fontSize: 14, fontWeight: 600,
          }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// Sidebar
// ────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Bosh sahifa', icon: '⌂' },
  { id: 'bemorlar',  label: 'Bemorlar',    icon: '👤' },
  { id: 'form',      label: "Qo'shish",    icon: '＋' },
  { id: 'stats',     label: 'Statistika',  icon: '▦' },
];

window.AppSidebar = function AppSidebar({ active, onNav, onLogout }) {
  const { theme, setTheme } = useContext(window.PremiumThemeContext);
  const isDark = theme === 'dark';

  const sidebarStyle = {
    width: 220, minHeight: '100vh', flexShrink: 0,
    background: isDark ? 'rgba(13,13,16,0.95)' : 'rgba(245,244,240,0.95)',
    borderRight: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column',
    backdropFilter: 'blur(20px)', padding: '20px 0',
  };

  return (
    <aside style={sidebarStyle}>
      {/* Logo */}
      <div style={{ padding: '0 16px 20px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#d4a853,#a88436)',
            display: 'grid', placeItems: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16,
          }}>B</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: isDark ? '#f5f3ed' : '#1a1815' }}>Bemorlar</div>
            <div style={{ fontSize: 11, color: isDark ? '#6b6b75' : '#8a847b' }}>Klinika v2.0</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              marginBottom: 2, textAlign: 'left', fontSize: 14,
              background: isActive ? (isDark ? 'rgba(212,168,83,0.12)' : 'rgba(168,127,53,0.1)') : 'transparent',
              color: isActive ? '#d4a853' : (isDark ? '#a0a0a8' : '#555048'),
              fontWeight: isActive ? 600 : 400,
              transition: 'all .15s',
            }}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 10px', borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={() => setTheme(isDark ? 'light' : 'dark')} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'transparent', color: isDark ? '#a0a0a8' : '#555048', fontSize: 14,
          marginBottom: 4,
        }}>
          <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{isDark ? '☀' : '☾'}</span>
          {isDark ? 'Yorug\'  : 'Qorong\'u'} rejim
        </button>
        <button onClick={onLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'transparent', color: '#ef4444', fontSize: 14,
        }}>
          <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>⏻</span>
          Chiqish
        </button>
      </div>
    </aside>
  );
};
