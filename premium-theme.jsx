// Premium theme — Dark + Light tokens with user-specified color palette
// Tokens: bg #0a0a0c, surface #111113, border #1e1e22, gold #d4a853
// Dept: Terapiya #f59e0b · Xirurgiya #ef4444 · Ortodontiya #10b981 · Ortopediya #3b82f6

window.darkTokens = {
  mode: "dark",
  bg: "#0a0a0c",
  surface: "#111113",
  surfaceHi: "#16161a",
  surfaceLo: "#0c0c0e",
  ink: "#f5f3ed",
  inkDim: "#a0a0a8",
  inkMute: "#6b6b75",
  line: "#1e1e22",
  lineSoft: "#17171b",
  gold: "#d4a853",
  goldDim: "#a88436",
  goldSoft: "rgba(212,168,83,0.10)",
  green: "#10b981",
  greenSoft: "rgba(16,185,129,0.12)",
  greenLine: "rgba(16,185,129,0.30)",
  amber: "#f59e0b",
  amberSoft: "rgba(245,158,11,0.12)",
  amberLine: "rgba(245,158,11,0.30)",
  red: "#ef4444",
  redSoft: "rgba(239,68,68,0.12)",
  redLine: "rgba(239,68,68,0.30)",
  blue: "#3b82f6",
  blueSoft: "rgba(59,130,246,0.12)",
  rentgenGlow: "radial-gradient(circle at 30% 40%, #2a2620, #0a0a0c 70%)",
};

window.lightTokens = {
  mode: "light",
  bg: "#f7f6f2",
  surface: "#ffffff",
  surfaceHi: "#fbfaf6",
  surfaceLo: "#efece4",
  ink: "#1a1815",
  inkDim: "#555048",
  inkMute: "#8a847b",
  line: "#e6e2d6",
  lineSoft: "#efeae0",
  gold: "#a87f35",
  goldDim: "#8a6628",
  goldSoft: "rgba(168,127,53,0.10)",
  green: "#0e9a6b",
  greenSoft: "#e8f4ee",
  greenLine: "#c5e3d3",
  amber: "#c47a08",
  amberSoft: "#fbf0db",
  amberLine: "#ecd1a8",
  red: "#c63a3a",
  redSoft: "#fbe6e6",
  redLine: "#eec1c1",
  blue: "#2c66c5",
  blueSoft: "#e1ecf9",
  rentgenGlow: "radial-gradient(circle at 30% 40%, #2a2620, #1A1815 70%)",
};

window.deptColors = { Terapiya: "#f59e0b", Xirurgiya: "#ef4444", Ortodontiya: "#10b981", Ortopediya: "#3b82f6" };
window.deptShape = { Terapiya: "circle", Xirurgiya: "triangle", Ortodontiya: "square", Ortopediya: "hexagon" };

window.premiumFonts = {
  sans: '"Schibsted Grotesk", "Manrope", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

window.PremiumThemeContext = React.createContext({ theme: "dark", setTheme: () => {} });
window.useT = () => {
  const ctx = React.useContext(window.PremiumThemeContext);
  const tokens = ctx.theme === "light" ? window.lightTokens : window.darkTokens;
  return {
    ...tokens, fonts: window.premiumFonts,
    dept: window.deptColors, deptShape: window.deptShape,
    theme: ctx.theme, setTheme: ctx.setTheme,
    toggleTheme: () => ctx.setTheme(ctx.theme === "light" ? "dark" : "light"),
  };
};

window.PremiumIcon = ({ shape, size = 18, color = "currentColor", filled = false }) => {
  const stroke = filled ? "none" : color;
  const fill = filled ? color : "none";
  const sw = 1.5;
  const s = size;
  if (shape === "circle") return <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill={fill} stroke={stroke} strokeWidth={sw}/></svg>;
  if (shape === "triangle") return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 4 L20 19 L4 19 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/></svg>;
  if (shape === "square") return <svg width={s} height={s} viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill={fill} stroke={stroke} strokeWidth={sw}/></svg>;
  if (shape === "hexagon") return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 3 L20 7.5 L20 16.5 L12 21 L4 16.5 L4 7.5 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/></svg>;
  if (shape === "dashboard") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>;
  if (shape === "users") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}><circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15 20c0-2.5 1.5-5 4-5s4 2 4 5"/></svg>;
  if (shape === "plus") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
  if (shape === "chart") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"><path d="M4 19h16M7 16V9M12 16V5M17 16v-7"/></svg>;
  if (shape === "logout") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2"/><path d="M17 8l4 4-4 4M21 12H9"/></svg>;
  if (shape === "search") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg>;
  if (shape === "bell") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
  if (shape === "arrow") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
  if (shape === "trend") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></svg>;
  if (shape === "sun") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;
  if (shape === "moon") return <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
  if (shape === "phone") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
  if (shape === "calendar") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>;
  if (shape === "pin") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s7-7.5 7-12.5a7 7 0 0 0-14 0C5 14.5 12 22 12 22z"/><circle cx="12" cy="9.5" r="2.5"/></svg>;
  if (shape === "camera") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
  if (shape === "wallet") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 12h.01"/></svg>;
  if (shape === "note") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>;
  if (shape === "edit") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>;
  if (shape === "trash") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>;
  if (shape === "print") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
  if (shape === "x") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;
  if (shape === "check") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
  return null;
};

window.PremiumThemeToggle = ({ size = "md" }) => {
  const t = window.useT();
  const isDark = t.theme === "dark";
  const w = size === "sm" ? 52 : 60;
  const h = size === "sm" ? 28 : 32;
  const knob = h - 6;
  return (
    <button onClick={t.toggleTheme} style={{ width: w, height: h, padding: 3, borderRadius: h / 2, background: isDark ? t.surfaceHi : t.surfaceLo, border: `1px solid ${t.line}`, position: "relative", cursor: "pointer", display: "flex", alignItems: "center", transition: "background 0.25s" }} aria-label={isDark ? "Kunduzgi rejim" : "Kechgi rejim"}>
      <div style={{ width: knob, height: knob, borderRadius: "50%", background: isDark ? t.gold : t.surface, boxShadow: isDark ? `0 1px 4px ${t.gold}55` : `0 1px 3px rgba(0,0,0,0.15)`, display: "grid", placeItems: "center", transform: `translateX(${isDark ? w - knob - 8 : 0}px)`, transition: "transform 0.25s cubic-bezier(.4,0,.2,1), background 0.25s" }}>
        <window.PremiumIcon shape={isDark ? "moon" : "sun"} size={knob - 10} color={isDark ? t.bg : t.gold} />
      </div>
    </button>
  );
};
