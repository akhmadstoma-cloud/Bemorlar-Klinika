// app-form-modals.jsx — 4-step form + Karta modal + Edit modal + Confirm + Toast

const { useState: uS2, useEffect: uE2, useMemo: uM2, useRef: uR2 } = React;

// ═══════════════════════════════════════════════════════════
// 4-STEP FORM (Add new patient)
// ═══════════════════════════════════════════════════════════
window.FormPage = ({ onCancel, onSave, initial = null, mode = "create" }) => {
  const t = window.useT();
  const I = window.PremiumIcon;
  const [step, setStep] = uS2(1);
  const [saving, setSaving] = uS2(false);
  const [error, setError] = uS2("");
  const [rentgenFile, setRentgenFile] = uS2(null);
  const [data, setData] = uS2(() => Object.assign({
    ism: "", yosh: "", tel: "", manzil: "",
    klinika: "AkhmadStoma — Yunusobod", bolim: "Terapiya",
    tashrif_sana: new Date().toISOString().slice(0, 16).replace("T", " "),
    keyingi_tashrif: "",
    rentgen_url: "", tolov_summa: "", tolov_holati: "To'langan",
    izoh: "", holat: "Faol",
  }, initial || {}));

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const validateStep = (s) => {
    if (s === 1) {
      if (!data.ism.trim()) return "Ism familiyani kiriting";
      if (!data.yosh) return "Yoshni kiriting";
      if (!data.tel.trim()) return "Telefon raqamini kiriting";
    }
    if (s === 2) {
      if (!data.klinika.trim()) return "Klinika nomini kiriting";
      if (!data.tashrif_sana) return "Tashrif sanasini kiriting";
    }
    if (s === 3) {
      if (!data.tolov_summa) return "To'lov summasini kiriting";
    }
    return "";
  };

  const next = () => {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError("");
    setStep(s => Math.min(4, s + 1));
  };
  const prev = () => { setError(""); setStep(s => Math.max(1, s - 1)); };

  const submit = async () => {
    const err = validateStep(4) || validateStep(3) || validateStep(2) || validateStep(1);
    if (err) { setError(err); return; }
    setSaving(true);
    try {
      let payload = { ...data, yosh: Number(data.yosh) || 0, tolov_summa: Number(String(data.tolov_summa).replace(/\s/g, "")) || 0 };
      if (rentgenFile && window.__API_URL) {
        try { const u = await window.BemorAPI.uploadRentgen(rentgenFile); payload.rentgen_url = u.url; } catch {}
      }
      const api = window.getAPI();
      const saved = mode === "edit" ? await api.updateBemor(data.id, payload) : await api.addBemor(payload);
      onSave(saved);
    } catch (e) { setError(String(e.message || e)); }
    finally { setSaving(false); }
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", background: t.bg, border: `1px solid ${t.line}`,
    borderRadius: 8, fontSize: 13.5, color: t.ink, fontFamily: t.fonts.sans, outline: "none",
  };

  const Field = ({ label, k, type = "text", placeholder, hint, required, icon }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11.5, fontWeight: 500, color: t.inkDim, letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        {icon && <I shape={icon} size={11} color={t.inkMute} />}
        {label}{required && <span style={{ color: t.gold }}>*</span>}
      </label>
      <input type={type} value={data[k] || ""} onChange={e => set(k, e.target.value)} placeholder={placeholder} style={inputStyle}
        onFocus={e => { e.target.style.borderColor = t.gold; }}
        onBlur={e => { e.target.style.borderColor = t.line; }} />
      {hint && <div style={{ fontSize: 11, color: t.inkMute, marginTop: 4 }}>{hint}</div>}
    </div>
  );

  const Select = ({ label, k, options, required, icon }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11.5, fontWeight: 500, color: t.inkDim, letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        {icon && <I shape={icon} size={11} color={t.inkMute} />}
        {label}{required && <span style={{ color: t.gold }}>*</span>}
      </label>
      <select value={data[k] || ""} onChange={e => set(k, e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: t.bg, fontFamily: t.fonts.sans }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 36px 18px", borderBottom: `1px solid ${t.line}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onCancel} style={{ width: 32, height: 32, borderRadius: 8, background: t.surface, border: `1px solid ${t.line}`, display: "grid", placeItems: "center", color: t.ink, cursor: "pointer", fontSize: 14 }}>←</button>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.16em", color: t.gold, textTransform: "uppercase" }}>{mode === "edit" ? "TAHRIRLASH" : "YANGI BEMOR"}</div>
            <h1 style={{ margin: "5px 0 0", fontSize: 26, fontWeight: 500, letterSpacing: "-0.025em", color: t.ink }}>{mode === "edit" ? data.ism || "Bemor" : "Bemor qo'shish"}</h1>
          </div>
        </div>
        <window.PremiumThemeToggle />
      </div>

      {/* Stepper */}
      <div style={{ padding: "22px 36px 0" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", alignItems: "center", gap: 8 }}>
          {[
            { n: 1, t: "Bemor haqida" },
            { n: 2, t: "Tashrif" },
            { n: 3, t: "Tibbiy & to'lov" },
            { n: 4, t: "Izoh" },
          ].map((s, i, arr) => {
            const active = step === s.n;
            const done = step > s.n;
            return (
              <React.Fragment key={s.n}>
                <div onClick={() => setStep(s.n)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? t.gold : (active ? `${t.gold}25` : t.surface), border: `1.5px solid ${done || active ? t.gold : t.line}`, color: done ? (t.theme === "dark" ? t.bg : "#fff") : (active ? t.gold : t.inkMute), display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 700, fontFamily: t.fonts.mono, transition: "all .2s" }}>
                    {done ? <I shape="check" size={14} color={t.theme === "dark" ? t.bg : "#fff"} /> : s.n}
                  </div>
                  <span style={{ fontSize: 12.5, color: active ? t.ink : t.inkMute, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>{s.t}</span>
                </div>
                {i < arr.length - 1 && <div style={{ flex: 1, height: 1, background: step > s.n ? t.gold : t.line, transition: "background .2s" }} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "auto", padding: "22px 36px 36px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          {error && (
            <div style={{ padding: "12px 16px", background: t.redSoft, border: `1px solid ${t.redLine}`, borderRadius: 8, color: t.red, fontSize: 13, marginBottom: 14 }}>⚠ {error}</div>
          )}

          <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14, padding: "26px 28px" }}>
            {step === 1 && (
              <>
                <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 600, color: t.ink }}>01 · Bemor haqida</h3>
                <div style={{ fontSize: 13, color: t.inkMute, marginBottom: 22 }}>Asosiy shaxsiy ma'lumotlar</div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr", gap: 14 }}>
                  <Field label="Ism familiyasi" k="ism" placeholder="Karimov Akmal" required icon="users" />
                  <Field label="Yoshi" k="yosh" type="number" placeholder="34" required icon="calendar" />
                  <Field label="Telefoni" k="tel" placeholder="+998 90 123 45 67" required icon="phone" />
                </div>
                <Field label="Manzili" k="manzil" placeholder="Toshkent, Yunusobod, Amir Temur 17-12" icon="pin" />
              </>
            )}
            {step === 2 && (
              <>
                <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 600, color: t.ink }}>02 · Tashrif tafsilotlari</h3>
                <div style={{ fontSize: 13, color: t.inkMute, marginBottom: 22 }}>Qaysi klinika, qaysi bo'lim, qachon</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Klinika" k="klinika" required icon="hexagon" />
                  <Select label="Bo'limi" k="bolim" required icon="circle" options={["Terapiya", "Xirurgiya", "Ortodontiya", "Ortopediya"]} />
                  <Field label="Tashrif sanasi" k="tashrif_sana" placeholder="2026-05-20 10:30" required icon="calendar" />
                  <Field label="Keyingi tashrif" k="keyingi_tashrif" placeholder="2026-06-03 11:00" hint="Bo'sh qoldirsa eslatma yuborilmaydi" icon="calendar" />
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 600, color: t.ink }}>03 · Tibbiy & moliyaviy</h3>
                <div style={{ fontSize: 13, color: t.inkMute, marginBottom: 22 }}>Rentgen rasm, to'lov ma'lumotlari</div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: t.inkDim, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <I shape="camera" size={11} color={t.inkMute} /> Rentgen rasm
                  </label>
                  <label style={{ padding: "14px", background: t.bg, border: `1.5px dashed ${rentgenFile ? t.gold : t.line}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
                    <div style={{ width: 64, height: 56, borderRadius: 8, background: rentgenFile ? "transparent" : t.rentgenGlow, border: `1px solid ${t.line}`, display: "grid", placeItems: "center", overflow: "hidden", flexShrink: 0 }}>
                      {rentgenFile ? <img src={URL.createObjectURL(rentgenFile)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                        <svg width="50" height="36" viewBox="0 0 50 36" style={{ opacity: 0.65 }}>
                          {[...Array(5)].map((_, i) => <ellipse key={i} cx={6 + i * 9.5} cy={18} rx="3.5" ry="7" fill="none" stroke={t.gold} strokeOpacity="0.7" strokeWidth="0.9" />)}
                        </svg>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: t.ink, fontWeight: 500 }}>{rentgenFile ? rentgenFile.name : "Rentgen rasmni tanlash"}</div>
                      <div style={{ fontSize: 11.5, color: t.inkMute, marginTop: 3 }}>{rentgenFile ? `${(rentgenFile.size / 1024 / 1024).toFixed(2)} MB` : "JPG, PNG · 20 MB gacha"}</div>
                    </div>
                    <div style={{ padding: "8px 14px", border: `1px solid ${t.line}`, borderRadius: 7, fontSize: 12, color: t.ink, fontWeight: 500 }}>{rentgenFile ? "Almashtirish" : "Tanlash"}</div>
                    <input type="file" accept="image/*" onChange={e => setRentgenFile(e.target.files[0])} style={{ display: "none" }} />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="To'lov summasi (so'm)" k="tolov_summa" type="number" placeholder="350000" required icon="wallet" />
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 500, color: t.inkDim, marginBottom: 6, display: "block" }}>To'lov holati</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[{ l: "To'langan", c: t.green }, { l: "Qisman", c: t.amber }, { l: "Qarz", c: t.red }].map(o => {
                        const active = data.tolov_holati === o.l;
                        return (
                          <div key={o.l} onClick={() => set("tolov_holati", o.l)} style={{ flex: 1, padding: "10px 8px", background: active ? `${o.c}22` : t.bg, border: `1px solid ${active ? o.c + "66" : t.line}`, borderRadius: 8, fontSize: 12, color: active ? o.c : t.inkDim, fontWeight: active ? 600 : 400, textAlign: "center", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: o.c }} />{o.l}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 600, color: t.ink }}>04 · Izoh</h3>
                <div style={{ fontSize: 13, color: t.inkMute, marginBottom: 22 }}>Shifokor uchun maxsus eslatma — faqat xodimlar ko'radi</div>
                <textarea value={data.izoh || ""} onChange={e => set("izoh", e.target.value)} placeholder="Davolash haqida shifokor eslatmasi..." style={{ ...inputStyle, minHeight: 140, resize: "vertical", lineHeight: 1.55, fontFamily: t.fonts.sans }}
                  onFocus={e => { e.target.style.borderColor = t.gold; }}
                  onBlur={e => { e.target.style.borderColor = t.line; }} />
                <div style={{ fontSize: 11, color: t.inkMute, marginTop: 6, textAlign: "right" }}>{(data.izoh || "").length} / 2000 belgi</div>
              </>
            )}
          </div>

          {/* Nav buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, paddingBottom: 20 }}>
            <button onClick={step === 1 ? onCancel : prev} disabled={saving} style={{ padding: "12px 22px", background: "transparent", border: `1px solid ${t.line}`, borderRadius: 9, fontSize: 13, color: t.inkDim, fontFamily: t.fonts.sans, fontWeight: 500, cursor: "pointer" }}>
              {step === 1 ? "Bekor qilish" : "← Orqaga"}
            </button>
            {step < 4 ? (
              <button onClick={next} disabled={saving} style={{ padding: "12px 22px", background: t.gold, color: t.theme === "dark" ? t.bg : "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, fontFamily: t.fonts.sans, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                Keyingi qadam <I shape="arrow" size={13} color={t.theme === "dark" ? t.bg : "#fff"} />
              </button>
            ) : (
              <button onClick={submit} disabled={saving} style={{ padding: "12px 22px", background: t.gold, color: t.theme === "dark" ? t.bg : "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, fontFamily: t.fonts.sans, display: "flex", alignItems: "center", gap: 8, cursor: saving ? "wait" : "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saqlanmoqda..." : (mode === "edit" ? "Yangilash" : "Bemorni saqlash")}
                {!saving && <I shape="check" size={13} color={t.theme === "dark" ? t.bg : "#fff"} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// KARTA MODAL — full patient detail
// ═══════════════════════════════════════════════════════════
window.KartaModal = ({ bemor, onClose, onEdit, onDelete, onPrint }) => {
  const t = window.useT();
  const I = window.PremiumIcon;
  if (!bemor) return null;

  const balans = bemor.tolov_holati === "Qarz" || bemor.tolov_holati === "Qisman" ? -(Number(bemor.tolov_summa) || 0) : 0;
  const c = t.dept[bemor.bolim] || t.gold;

  const Row = ({ icon, label, value, accent }) => (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14, padding: "13px 0", borderTop: `1px solid ${t.lineSoft}`, alignItems: "start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: t.inkMute, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, paddingTop: 2 }}>
        {icon && <I shape={icon} size={12} color={t.inkMute} />}
        <span>{label}</span>
      </div>
      <div style={{ fontSize: 14, color: accent ? t.gold : t.ink, fontFamily: t.fonts.sans, fontWeight: 500, lineHeight: 1.5 }}>{value || "—"}</div>
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fade-in .2s" }}>
      <div data-modal-card onClick={e => e.stopPropagation()} style={{ width: "min(1000px, 100%)", maxHeight: "92vh", background: t.bg, border: `1px solid ${t.line}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 40px 100px rgba(0,0,0,0.5)" }}>
        {/* Modal header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: `1px solid ${t.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${c}22`, border: `1px solid ${c}55`, color: c, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 700, fontFamily: t.fonts.sans }}>
              {String(bemor.ism || "").split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.16em", color: t.gold, textTransform: "uppercase", marginBottom: 5 }}>BEMOR · {bemor.id}</div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", color: t.ink, fontFamily: t.fonts.sans }}>{bemor.ism}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 4, background: bemor.holat === "Faol" ? t.greenSoft : bemor.holat === "Qarzdor" ? t.redSoft : t.lineSoft, color: bemor.holat === "Faol" ? t.green : bemor.holat === "Qarzdor" ? t.red : t.inkMute, fontWeight: 500, border: `1px solid ${bemor.holat === "Faol" ? t.greenLine : bemor.holat === "Qarzdor" ? t.redLine : t.line}` }}>{bemor.holat || "Faol"}</span>
                <span style={{ fontSize: 12, color: t.inkMute }}>{bemor.yosh} yosh · {bemor.tel}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onPrint} title="Chop etish" style={{ padding: "9px 12px", background: "transparent", border: `1px solid ${t.line}`, borderRadius: 7, color: t.inkDim, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontFamily: t.fonts.sans }}>
              <I shape="print" size={14} color={t.inkDim} />
            </button>
            <button onClick={() => onEdit(bemor)} style={{ padding: "9px 14px", background: "transparent", border: `1px solid ${t.line}`, borderRadius: 7, color: t.ink, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontFamily: t.fonts.sans }}>
              <I shape="edit" size={13} color={t.ink} /> Tahrirlash
            </button>
            <button onClick={() => onDelete(bemor)} style={{ padding: "9px 14px", background: t.redSoft, border: `1px solid ${t.redLine}`, borderRadius: 7, color: t.red, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontFamily: t.fonts.sans, fontWeight: 500 }}>
              <I shape="trash" size={13} color={t.red} /> O'chirish
            </button>
            <button onClick={onClose} style={{ width: 36, height: 36, background: "transparent", border: `1px solid ${t.line}`, borderRadius: 7, color: t.ink, cursor: "pointer", display: "grid", placeItems: "center" }}>
              <I shape="x" size={14} color={t.ink} />
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 28px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}>
            <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 12, padding: "10px 22px 16px" }}>
              <Row icon="users" label="Ism familiyasi" value={bemor.ism} />
              <Row icon="calendar" label="Yoshi" value={bemor.yosh ? bemor.yosh + " yosh" : ""} />
              <Row icon="phone" label="Telefoni" value={bemor.tel} />
              <Row icon={t.deptShape[bemor.bolim]} label="Bo'limi" value={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "3px 10px", background: `${c}18`, border: `1px solid ${c}33`, borderRadius: 4, color: c, fontWeight: 500, fontSize: 13 }}>
                  <I shape={t.deptShape[bemor.bolim]} size={11} color={c} filled />{bemor.bolim}
                </span>
              } />
              <Row icon="calendar" label="Tashrif sanasi" value={bemor.tashrif_sana} />
              <Row icon="camera" label="Rentgen" value={
                bemor.rentgen_url ? <a href={bemor.rentgen_url} target="_blank" style={{ color: t.gold, textDecoration: "underline" }}>Rentgen rasmni ko'rish</a> :
                <span style={{ color: t.inkMute }}>Rentgen yuklanmagan</span>
              } />
              <Row icon="wallet" label="To'lovi" value={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: t.fonts.mono, fontSize: 15, color: t.ink, fontWeight: 500 }}>{(Number(bemor.tolov_summa) || 0).toLocaleString()} so'm</span>
                  <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 4, background: bemor.tolov_holati === "To'langan" ? t.greenSoft : bemor.tolov_holati === "Qarz" ? t.redSoft : t.amberSoft, color: bemor.tolov_holati === "To'langan" ? t.green : bemor.tolov_holati === "Qarz" ? t.red : t.amber, border: `1px solid ${bemor.tolov_holati === "To'langan" ? t.greenLine : bemor.tolov_holati === "Qarz" ? t.redLine : t.amberLine}`, fontWeight: 500 }}>{bemor.tolov_holati}</span>
                </span>
              } />
              <Row icon="calendar" label="Keyingi tashrif" value={bemor.keyingi_tashrif || "—"} accent={!!bemor.keyingi_tashrif} />
              <Row icon="pin" label="Manzili" value={bemor.manzil} />
              <Row icon="hexagon" label="Klinika" value={bemor.klinika} />
              <Row icon="note" label="Izoh" value={
                <span style={{ color: t.inkDim, lineHeight: 1.6, display: "block", fontWeight: 400 }}>{bemor.izoh || "Izoh yo'q"}</span>
              } />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.16em", color: t.gold, marginBottom: 12, textTransform: "uppercase" }}>Tezkor amallar</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <a href={`tel:${bemor.tel}`} style={{ padding: "10px 12px", border: `1px solid ${t.line}`, borderRadius: 8, fontSize: 12.5, color: t.ink, background: t.bg, display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                    <I shape="phone" size={14} color={t.gold} /> Qo'ng'iroq qilish
                  </a>
                  <a href={`sms:${bemor.tel}`} style={{ padding: "10px 12px", border: `1px solid ${t.line}`, borderRadius: 8, fontSize: 12.5, color: t.ink, background: t.bg, display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                    <I shape="bell" size={14} color={t.gold} /> SMS yuborish
                  </a>
                  <div onClick={onPrint} style={{ padding: "10px 12px", border: `1px solid ${t.line}`, borderRadius: 8, fontSize: 12.5, color: t.ink, background: t.bg, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <I shape="print" size={14} color={t.gold} /> Reseptni chop etish
                  </div>
                </div>
              </div>

              <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.16em", color: t.gold, marginBottom: 14, textTransform: "uppercase" }}>Ma'lumotlar</div>
                <div style={{ fontSize: 12, color: t.inkMute, lineHeight: 1.6 }}>
                  Yaratilgan: {String(bemor.created_at || "").slice(0, 10) || "—"}<br />
                  Yangilangan: {String(bemor.updated_at || "").slice(0, 10) || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// CONFIRM MODAL
// ═══════════════════════════════════════════════════════════
window.ConfirmModal = ({ open, title, message, onConfirm, onCancel, confirmText = "Tasdiqlash", danger = false }) => {
  const t = window.useT();
  const I = window.PremiumIcon;
  if (!open) return null;
  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div data-modal-card onClick={e => e.stopPropagation()} style={{ width: "min(420px, 100%)", background: t.bg, border: `1px solid ${t.line}`, borderRadius: 14, padding: "26px 28px", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: danger ? t.redSoft : t.goldSoft, border: `1px solid ${danger ? t.redLine : t.gold + "55"}`, display: "grid", placeItems: "center", marginBottom: 16 }}>
          <I shape={danger ? "trash" : "check"} size={20} color={danger ? t.red : t.gold} />
        </div>
        <h3 style={{ margin: 0, fontSize: 18, color: t.ink, fontWeight: 600 }}>{title}</h3>
        <div style={{ fontSize: 13.5, color: t.inkDim, marginTop: 8, lineHeight: 1.55 }}>{message}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px", background: "transparent", border: `1px solid ${t.line}`, borderRadius: 8, fontSize: 13, color: t.inkDim, fontFamily: t.fonts.sans, fontWeight: 500, cursor: "pointer" }}>Bekor qilish</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "11px", background: danger ? t.red : t.gold, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════
window.Toast = ({ message, type = "success", onClose }) => {
  const t = window.useT();
  const I = window.PremiumIcon;
  uE2(() => {
    if (!message) return;
    const id = setTimeout(onClose, 3500);
    return () => clearTimeout(id);
  }, [message, onClose]);
  if (!message) return null;
  const colors = { success: t.green, error: t.red, info: t.gold };
  const c = colors[type] || t.gold;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", padding: "12px 18px 12px 14px", background: t.surface, color: t.ink, border: `1px solid ${t.line}`, borderLeft: `3px solid ${c}`, borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 16px 40px rgba(0,0,0,0.4)", zIndex: 500, display: "flex", alignItems: "center", gap: 12, fontFamily: t.fonts.sans, animation: "toast-in .25s" }}>
      <I shape={type === "error" ? "x" : "check"} size={16} color={c} />
      <span>{message}</span>
    </div>
  );
};
