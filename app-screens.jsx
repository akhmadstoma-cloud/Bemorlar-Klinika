// app-screens.jsx — Main app screens: Sidebar, Dashboard, Bemorlar list, Form, Stats
// Uses Chart.js (loaded via CDN) for line and donut charts.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ═══════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════
window.AppSidebar = ({ active, onNav, onLogout }) => {
  const t = window.useT();
  const I = window.PremiumIcon;
  const items = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", group: "Asosiy" },
    { id: "bemorlar", label: "Bemorlar", icon: "users", group: "Asosiy" },
    { id: "form", label: "Bemor qo'shish", icon: "plus", group: "Asosiy" },
    { id: "stats", label: "Statistika", icon: "chart", group: "Asosiy" },
    { id: "terapiya", label: "Terapiya", icon: "circle", group: "Bo'limlar" },
    { id: "xirurgiya", label: "Xirurgiya", icon: "triangle", group: "Bo'limlar" },
    { id: "ortodontiya", label: "Ortodontiya", icon: "square", group: "Bo'limlar" },
    { id: "ortopediya", label: "Ortopediya", icon: "hexagon", group: "Bo'limlar" },
  ];
  const groups = [...new Set(items.map(i => i.group))];
  return (
    <aside data-app-sidebar style={{ width: window.innerWidth < 768 ? 0 : 232, flexShrink: 0, background: t.bg, borderRight: `1px solid ${t.line}`, padding: "24px 14px", display: window.innerWidth < 768 ? "none" : "flex", flexDirection: "column", fontFamily: t.fonts.sans, height: "100vh", overflowX: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 10px 26px" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(140deg, ${t.gold}, ${t.goldDim})`, display: "grid", placeItems: "center", color: t.theme === "dark" ? t.bg : "#fff", fontSize: 16, fontWeight: 700, letterSpacing: "-0.03em", flexShrink: 0 }}>B</div>
        <div data-sidebar-text style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "0.01em", color: t.ink }}>BEMORLAR</div>
          <div style={{ fontSize: 10.5, color: t.inkMute, marginTop: 2, letterSpacing: "0.04em" }}>Klinika tizimi</div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        {groups.map(g => (
          <div key={g} style={{ marginBottom: 14 }}>
            <div data-sidebar-group-label style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", color: t.inkMute, padding: "0 10px 8px", textTransform: "uppercase" }}>{g}</div>
            {items.filter(i => i.group === g).map(i => {
              const isActive = i.id === active;
              const isDept = g === "Bo'limlar";
              const deptColor = isDept ? t.dept[i.label] : null;
              return (
                <div key={i.id} data-sidebar-row onClick={() => onNav(i.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 7, background: isActive ? t.surfaceHi : "transparent", color: isActive ? t.ink : t.inkDim, fontSize: 13, fontWeight: isActive ? 500 : 400, marginBottom: 1, position: "relative", cursor: "pointer", transition: "background .15s" }}>
                  {isActive && <div style={{ position: "absolute", left: -14, top: 8, bottom: 8, width: 2, borderRadius: 1, background: t.gold }} />}
                  <I shape={i.icon} size={15} color={isActive ? (deptColor || t.gold) : (deptColor || t.inkMute)} filled={isDept} />
                  <span data-sidebar-text>{i.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div data-sidebar-row style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", background: t.surface, borderRadius: 10, border: `1px solid ${t.line}` }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${t.gold}, ${t.goldDim})`, color: t.theme === "dark" ? t.bg : "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>AS</div>
        <div data-sidebar-text style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, color: t.ink, fontWeight: 500 }}>Dr. Akmal S.</div>
          <div style={{ fontSize: 10.5, color: t.inkMute }}>Bosh shifokor</div>
        </div>
        <button data-sidebar-text onClick={onLogout} title="Chiqish" style={{ background: "transparent", border: "none", padding: 4, cursor: "pointer", display: "grid", placeItems: "center" }}>
          <I shape="logout" size={14} color={t.inkMute} />
        </button>
      </div>
    </aside>
  );
};

// ═══════════════════════════════════════════════════════════
// PAGE HEADER
// ═══════════════════════════════════════════════════════════
window.PageHeader = ({ title, subtitle, search, setSearch, action }) => {
  const t = window.useT();
  const I = window.PremiumIcon;
  return (
    <div data-page-header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "26px 36px 22px", borderBottom: `1px solid ${t.line}`, background: t.bg, gap: 12 }}>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.16em", color: t.gold, marginBottom: 8, textTransform: "uppercase" }}>{subtitle}</div>
        <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1, fontWeight: 500, letterSpacing: "-0.025em", color: t.ink }}>{title}</h1>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {setSearch !== undefined && (
          <div data-search-box style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: `1px solid ${t.line}`, borderRadius: 8, background: t.surface, fontSize: 12.5, color: t.inkMute, minWidth: 240 }}>
            <I shape="search" size={13} color={t.inkMute} />
            <input value={search || ""} onChange={e => setSearch(e.target.value)} placeholder="Qidirish: ism, telefon, ID..." style={{ flex: 1, border: "none", background: "transparent", outline: "none", color: t.ink, fontSize: 12.5, fontFamily: t.fonts.sans }} />
            <span style={{ fontSize: 10, padding: "2px 5px", border: `1px solid ${t.line}`, borderRadius: 3, color: t.inkMute }}>⌘K</span>
          </div>
        )}
        <div style={{ width: 36, height: 36, border: `1px solid ${t.line}`, borderRadius: 8, background: t.surface, display: "grid", placeItems: "center", position: "relative" }}>
          <I shape="bell" size={14} color={t.inkDim} />
          <div style={{ position: "absolute", top: 8, right: 9, width: 6, height: 6, borderRadius: "50%", background: t.gold }} />
        </div>
        <window.PremiumThemeToggle />
        {action}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════
window.DashboardPage = ({ onNav, onSelect, bemorlar, stats }) => {
  const t = window.useT();
  const I = window.PremiumIcon;
  const trendRef = useRef(null);
  const donutRef = useRef(null);
  const trendChart = useRef(null);
  const donutChart = useRef(null);
  const [period, setPeriod] = useState("bugun");

  // Today schedule from bemorlar
  const today = new Date().toISOString().slice(0, 10);
  const tashriflar = useMemo(() => {
    const all = bemorlar.slice().sort((a, b) => String(a.tashrif_sana).localeCompare(String(b.tashrif_sana)));
    if (period === "bugun") return all.filter(b => String(b.tashrif_sana || "").slice(0, 10) === today).slice(0, 8);
    if (period === "hafta") return all.slice(0, 8);
    return all.slice(0, 10);
  }, [bemorlar, period, today]);

  // Build trend chart
  useEffect(() => {
    if (!stats || !trendRef.current || !window.Chart) return;
    const data = stats.trend || [];
    if (trendChart.current) trendChart.current.destroy();
    trendChart.current = new window.Chart(trendRef.current, {
      type: "line",
      data: {
        labels: data.map(d => d.oy.slice(5)),
        datasets: [{
          data: data.map(d => d.soni),
          borderColor: t.gold,
          backgroundColor: ctx => {
            const c = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
            c.addColorStop(0, t.gold + "40");
            c.addColorStop(1, t.gold + "00");
            return c;
          },
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointBackgroundColor: t.bg,
          pointBorderColor: t.gold,
          pointBorderWidth: 1.5,
          pointRadius: 3,
          pointHoverRadius: 5,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: t.surface, borderColor: t.line, borderWidth: 1, titleColor: t.ink, bodyColor: t.inkDim, padding: 10 } },
        scales: {
          x: { grid: { display: false }, ticks: { color: t.inkMute, font: { family: t.fonts.mono, size: 10 } } },
          y: { grid: { color: t.lineSoft }, ticks: { color: t.inkMute, font: { family: t.fonts.mono, size: 10 } } },
        },
      },
    });
  }, [stats, t.theme]);

  // Build donut chart
  useEffect(() => {
    if (!stats || !donutRef.current || !window.Chart) return;
    const data = stats.bolimlar || [];
    if (donutChart.current) donutChart.current.destroy();
    donutChart.current = new window.Chart(donutRef.current, {
      type: "doughnut",
      data: {
        labels: data.map(d => d.nom),
        datasets: [{
          data: data.map(d => d.soni),
          backgroundColor: data.map(d => t.dept[d.nom]),
          borderColor: t.surface,
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "65%",
        plugins: { legend: { display: false }, tooltip: { backgroundColor: t.surface, borderColor: t.line, borderWidth: 1, titleColor: t.ink, bodyColor: t.inkDim } },
      },
    });
  }, [stats, t.theme]);

  const StatCard = ({ label, value, sub, delta, deltaType, accent }) => {
    const dc = deltaType === "up" ? t.green : deltaType === "down" ? t.red : t.inkDim;
    return (
      <div data-stat-card style={{ background: `linear-gradient(180deg, ${t.surface}, ${t.surfaceHi})`, border: `1px solid ${t.line}`, borderRadius: 12, padding: "20px 22px", position: "relative", overflow: "hidden", transition: "transform .15s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = ""}>
        {accent && <div style={{ position: "absolute", top: 0, left: 22, right: 22, height: 1, background: `linear-gradient(90deg, transparent, ${t.gold}66, transparent)` }} />}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: t.inkDim, letterSpacing: "0.02em" }}>{label}</div>
          {delta && <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: dc, fontWeight: 500 }}><I shape="trend" size={11} color={dc} />{delta}</div>}
        </div>
        <div data-stat-value style={{ fontSize: 36, lineHeight: 1, fontWeight: 500, letterSpacing: "-0.03em", color: t.ink, fontVariantNumeric: "tabular-nums" }}>{value}</div>
        {sub && <div style={{ fontSize: 11.5, color: t.inkMute, marginTop: 10 }}>{sub}</div>}
      </div>
    );
  };

  const DeptCard = ({ nom, soni, foiz }) => {
    const c = t.dept[nom];
    return (
      <div onClick={() => onNav && onNav("bemorlar")} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden", cursor: "pointer", transition: "transform .15s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = ""}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", background: `radial-gradient(circle, ${c}22, transparent 65%)` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, position: "relative" }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: `${c}18`, border: `1px solid ${c}33`, display: "grid", placeItems: "center" }}>
            <I shape={t.deptShape[nom]} size={15} color={c} filled />
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: t.ink }}>{nom}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, position: "relative" }}>
          <div style={{ fontSize: 28, lineHeight: 1, fontWeight: 500, letterSpacing: "-0.02em", color: t.ink, fontVariantNumeric: "tabular-nums" }}>{soni}</div>
          <div style={{ fontSize: 11.5, color: t.inkMute, fontFamily: t.fonts.mono }}>{foiz}%</div>
        </div>
        <div style={{ height: 3, background: t.lineSoft, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${foiz * 2.2}%`, height: "100%", background: c, borderRadius: 2, transition: "width .4s" }} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: t.bg, fontFamily: t.fonts.sans }}>
      <window.PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString("uz-UZ", { day: "2-digit", month: "long", year: "numeric", weekday: "long" }).toUpperCase()}
        action={<button onClick={() => onNav("form")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", background: t.gold, color: t.theme === "dark" ? t.bg : "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}><I shape="plus" size={14} color={t.theme === "dark" ? t.bg : "#fff"} /> Yangi bemor</button>}
      />
      <div data-page-body style={{ flex: 1, overflow: "auto", padding: "22px 36px 36px" }}>
        <div data-grid-4 style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
          <StatCard label="Jami bemorlar" value={(stats?.jami || 0).toLocaleString()} delta="+12.4%" deltaType="up" sub="Bu oy yangi yozuvlar" accent />
          <StatCard label="Bugungi tashriflar" value={stats?.bugun || 0} delta={(stats?.bugun || 0) > 0 ? "+" + stats.bugun : "0"} deltaType="up" sub={tashriflar.length + " ta rejalashtirilgan"} />
          <StatCard label="To'langan (so'm)" value={((stats?.tolangan || 0) / 1000000).toFixed(1) + "M"} delta="+8.1%" deltaType="up" sub={(stats?.tolangan || 0).toLocaleString() + " so'm"} />
          <StatCard label="Qarzdorlar" value={stats?.qarzdor || 0} delta={"−" + ((stats?.qarz || 0) / 1000).toFixed(0) + "K"} deltaType="down" sub={(stats?.qarz || 0).toLocaleString() + " so'm qarz"} />
        </div>

        <div data-grid-4 style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
          {(stats?.bolimlar || []).map(b => <DeptCard key={b.nom} {...b} />)}
        </div>

        <div data-grid-dash-main style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
          <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 12, padding: "22px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.16em", color: t.gold, textTransform: "uppercase" }}>JADVAL</div>
                <div style={{ fontSize: 17, color: t.ink, marginTop: 6, fontWeight: 500 }}>{tashriflar.length} ta tashrif</div>
              </div>
              <div style={{ display: "flex", padding: 3, background: t.bg, borderRadius: 8, border: `1px solid ${t.line}`, fontSize: 11.5 }}>
                {[{ id: "bugun", l: "Bugun" }, { id: "hafta", l: "Hafta" }, { id: "oy", l: "Oy" }].map(p => (
                  <div key={p.id} onClick={() => setPeriod(p.id)} style={{ padding: "5px 11px", background: period === p.id ? t.surfaceHi : "transparent", color: period === p.id ? t.ink : t.inkMute, borderRadius: 5, fontWeight: period === p.id ? 500 : 400, cursor: "pointer" }}>{p.l}</div>
                ))}
              </div>
            </div>
            <div style={{ maxHeight: 320, overflow: "auto" }}>
              {tashriflar.length === 0 && <div style={{ padding: "40px 20px", textAlign: "center", color: t.inkMute, fontSize: 13 }}>Bugun tashriflar yo'q</div>}
              {tashriflar.map((b, i) => {
                const c = t.dept[b.bolim] || t.gold;
                return (
                  <div key={b.id} onClick={() => onSelect(b.id)} style={{ display: "grid", gridTemplateColumns: "70px 1fr auto auto", gap: 16, alignItems: "center", padding: "12px 0", borderTop: i === 0 ? "none" : `1px solid ${t.lineSoft}`, cursor: "pointer", transition: "background .12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = t.surfaceHi}
                    onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: t.ink, fontFamily: t.fonts.mono }}>{String(b.tashrif_sana || "").slice(11, 16) || "—"}</div>
                    <div>
                      <div style={{ fontSize: 13, color: t.ink, fontWeight: 500 }}>{b.ism}</div>
                      <div style={{ fontSize: 11.5, color: t.inkMute, marginTop: 1 }}>{b.izoh || "—"} · {b.yosh} yosh</div>
                    </div>
                    <div style={{ fontSize: 11, color: c, padding: "3px 8px", background: `${c}18`, border: `1px solid ${c}33`, borderRadius: 4, fontWeight: 500 }}>{b.bolim}</div>
                    <div style={{ fontSize: 13, color: t.ink, fontFamily: t.fonts.mono }}>{(Number(b.tolov_summa) || 0).toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.16em", color: t.gold, textTransform: "uppercase" }}>OYLIK TREND</div>
                  <div style={{ fontSize: 16, color: t.ink, marginTop: 4, fontWeight: 500 }}>{(stats?.trend || []).reduce((a, b) => a + b.soni, 0)} ta tashrif</div>
                </div>
              </div>
              <div style={{ height: 130 }}><canvas ref={trendRef}></canvas></div>
            </div>
            <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 12, padding: "20px 22px", display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 110, height: 110, flexShrink: 0 }}><canvas ref={donutRef}></canvas></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.16em", color: t.gold, marginBottom: 12, textTransform: "uppercase" }}>ULUSHLAR</div>
                {(stats?.bolimlar || []).map(b => (
                  <div key={b.nom} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, marginBottom: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: 1.5, background: t.dept[b.nom] }} />
                    <div style={{ flex: 1, color: t.inkDim }}>{b.nom}</div>
                    <div style={{ color: t.ink, fontFamily: t.fonts.mono }}>{b.foiz}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// BEMORLAR LIST
// ═══════════════════════════════════════════════════════════
window.BemorlarPage = ({ onNav, onSelect, bemorlar }) => {
  const t = window.useT();
  const I = window.PremiumIcon;
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Hammasi");
  const [deptFilter, setDeptFilter] = useState("Barchasi");

  const counts = useMemo(() => ({
    Hammasi: bemorlar.length,
    Faol: bemorlar.filter(b => b.holat === "Faol").length,
    Qarzdor: bemorlar.filter(b => b.holat === "Qarzdor").length,
    Arxiv: bemorlar.filter(b => b.holat === "Arxiv").length,
  }), [bemorlar]);

  const filtered = useMemo(() => {
    let arr = bemorlar;
    if (tab !== "Hammasi") arr = arr.filter(b => b.holat === tab);
    if (deptFilter !== "Barchasi") arr = arr.filter(b => b.bolim === deptFilter);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      arr = arr.filter(b =>
        String(b.ism || "").toLowerCase().includes(q) ||
        String(b.tel || "").toLowerCase().includes(q) ||
        String(b.id || "").toLowerCase().includes(q) ||
        String(b.manzil || "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [bemorlar, tab, deptFilter, search]);

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: t.bg, fontFamily: t.fonts.sans }}>
      <window.PageHeader
        title="Bemorlar"
        subtitle={`JAMI ${bemorlar.length} TA YOZUV`}
        search={search} setSearch={setSearch}
        action={<button onClick={() => onNav("form")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", background: t.gold, color: t.theme === "dark" ? t.bg : "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}><I shape="plus" size={14} color={t.theme === "dark" ? t.bg : "#fff"} /> Yangi bemor</button>}
      />
      <div data-page-body style={{ flex: 1, overflow: "auto", padding: "20px 36px 36px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          {["Hammasi", "Faol", "Qarzdor", "Arxiv"].map(tt => (
            <div key={tt} onClick={() => setTab(tt)} style={{ padding: "7px 14px", borderRadius: 7, background: tab === tt ? t.surfaceHi : t.surface, color: tab === tt ? t.ink : t.inkDim, border: `1px solid ${tab === tt ? t.gold + "55" : t.line}`, fontSize: 12.5, fontWeight: 500, display: "flex", gap: 6, cursor: "pointer" }}>
              <span>{tt}</span><span style={{ color: t.inkMute, fontFamily: t.fonts.mono }}>{counts[tt]}</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ padding: "7px 12px", border: `1px solid ${t.line}`, borderRadius: 7, background: t.surface, fontSize: 12, color: t.ink, fontFamily: t.fonts.sans, outline: "none", cursor: "pointer" }}>
            <option>Barchasi</option>
            {["Terapiya", "Xirurgiya", "Ortodontiya", "Ortopediya"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        <div data-table-wrap style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 12, overflow: "hidden" }}>
          <div data-table-grid style={{ display: "grid", gridTemplateColumns: "80px 1.6fr 1.3fr 60px 1.2fr 1fr 100px 90px", gap: 14, padding: "13px 22px", borderBottom: `1px solid ${t.line}`, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.12em", color: t.inkMute, textTransform: "uppercase", background: t.bg }}>
            <div>ID</div><div>Bemor</div><div>Telefon</div><div>Yosh</div><div>Oxirgi tashrif</div><div>Bo'lim</div><div style={{ textAlign: "right" }}>Balans</div><div>Holat</div>
          </div>
          {filtered.length === 0 && <div style={{ padding: "60px 20px", textAlign: "center", color: t.inkMute, fontSize: 13 }}>Hech narsa topilmadi</div>}
          {filtered.map((b, i) => {
            const c = t.dept[b.bolim] || t.gold;
            const balans = b.tolov_holati === "Qarz" || b.tolov_holati === "Qisman" ? -(Number(b.tolov_summa) || 0) : 0;
            return (
              <div key={b.id} data-table-grid onClick={() => onSelect(b.id)} style={{ display: "grid", gridTemplateColumns: "80px 1.6fr 1.3fr 60px 1.2fr 1fr 100px 90px", gap: 14, padding: "13px 22px", borderBottom: i === filtered.length - 1 ? "none" : `1px solid ${t.lineSoft}`, alignItems: "center", fontSize: 12.5, cursor: "pointer", transition: "background .12s" }}
                onMouseEnter={e => e.currentTarget.style.background = t.surfaceHi}
                onMouseLeave={e => e.currentTarget.style.background = ""}>
                <div style={{ fontFamily: t.fonts.mono, fontSize: 11, color: t.inkMute }}>{b.id}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${c}22`, border: `1px solid ${c}40`, color: c, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600 }}>
                    {String(b.ism || "").split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ color: t.ink, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.ism}</div>
                </div>
                <div style={{ color: t.inkDim, fontFamily: t.fonts.mono, fontSize: 11.5, whiteSpace: "nowrap" }}>{b.tel}</div>
                <div style={{ color: t.inkDim }}>{b.yosh}</div>
                <div style={{ color: t.inkDim, fontSize: 12 }}>{String(b.tashrif_sana || "").slice(0, 10)}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <I shape={t.deptShape[b.bolim]} size={10} color={c} filled />
                  <span style={{ color: t.ink }}>{b.bolim}</span>
                </div>
                <div style={{ textAlign: "right", fontFamily: t.fonts.mono, fontSize: 13, color: balans < 0 ? t.red : t.ink }}>
                  {balans === 0 ? "—" : "−" + (Math.abs(balans) / 1000).toFixed(0) + "K"}
                </div>
                <div>
                  <span style={{ fontSize: 10.5, padding: "3px 8px", borderRadius: 4, background: b.holat === "Faol" ? t.greenSoft : b.holat === "Qarzdor" ? t.redSoft : t.lineSoft, color: b.holat === "Faol" ? t.green : b.holat === "Qarzdor" ? t.red : t.inkMute, fontWeight: 500, border: `1px solid ${b.holat === "Faol" ? t.greenLine : b.holat === "Qarzdor" ? t.redLine : t.line}` }}>{b.holat}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// STATS PAGE — extended charts
// ═══════════════════════════════════════════════════════════
window.StatsPage = ({ stats, bemorlar }) => {
  const t = window.useT();
  const I = window.PremiumIcon;
  const trendRef = useRef(null);
  const donutRef = useRef(null);
  const ageRef = useRef(null);
  const refs = { trend: useRef(null), donut: useRef(null), age: useRef(null) };
  const charts = useRef({});

  useEffect(() => {
    if (!stats || !window.Chart) return;
    Object.values(charts.current).forEach(c => c && c.destroy());

    // Trend
    if (trendRef.current) {
      const data = stats.trend || [];
      charts.current.trend = new window.Chart(trendRef.current, {
        type: "bar",
        data: { labels: data.map(d => d.oy.slice(5)), datasets: [{ data: data.map(d => d.soni), backgroundColor: t.gold + "cc", borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: t.inkMute } }, y: { grid: { color: t.lineSoft }, ticks: { color: t.inkMute } } } },
      });
    }
    if (donutRef.current) {
      const data = stats.bolimlar || [];
      charts.current.donut = new window.Chart(donutRef.current, {
        type: "doughnut",
        data: { labels: data.map(d => d.nom), datasets: [{ data: data.map(d => d.soni), backgroundColor: data.map(d => t.dept[d.nom]), borderColor: t.surface, borderWidth: 3 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: "60%", plugins: { legend: { position: "right", labels: { color: t.ink, font: { family: t.fonts.sans, size: 12 } } } } },
      });
    }
    if (ageRef.current && bemorlar) {
      const buckets = { "18-25": 0, "26-35": 0, "36-45": 0, "46-55": 0, "56+": 0 };
      bemorlar.forEach(b => {
        const a = Number(b.yosh) || 0;
        if (a < 26) buckets["18-25"]++;
        else if (a < 36) buckets["26-35"]++;
        else if (a < 46) buckets["36-45"]++;
        else if (a < 56) buckets["46-55"]++;
        else buckets["56+"]++;
      });
      charts.current.age = new window.Chart(ageRef.current, {
        type: "bar",
        data: { labels: Object.keys(buckets), datasets: [{ data: Object.values(buckets), backgroundColor: [t.gold, t.green, t.amber, t.blue, t.red], borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: t.inkMute } }, y: { grid: { color: t.lineSoft }, ticks: { color: t.inkMute } } } },
      });
    }
  }, [stats, bemorlar, t.theme]);

  const Box = ({ title, eyebrow, children, height = 280 }) => (
    <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 12, padding: "22px 24px" }}>
      <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.16em", color: t.gold, textTransform: "uppercase" }}>{eyebrow}</div>
      <div style={{ fontSize: 17, color: t.ink, marginTop: 4, marginBottom: 16, fontWeight: 500 }}>{title}</div>
      <div style={{ height }}>{children}</div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: t.bg, fontFamily: t.fonts.sans }}>
      <window.PageHeader title="Statistika" subtitle="KENGAYTIRILGAN HISOBOT" />
      <div data-page-body style={{ flex: 1, overflow: "auto", padding: "22px 36px 36px" }}>
        <div data-grid-4 style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
          {[
            { l: "Jami bemorlar", v: (stats?.jami || 0).toLocaleString(), c: t.gold },
            { l: "Faol bemorlar", v: stats?.faol || 0, c: t.green },
            { l: "Qarzdorlar", v: stats?.qarzdor || 0, c: t.red },
            { l: "Arxiv", v: stats?.arxiv || 0, c: t.inkMute },
          ].map(s => (
            <div key={s.l} data-stat-card style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 12, padding: "20px 22px", borderLeft: `3px solid ${s.c}` }}>
              <div style={{ fontSize: 11.5, color: t.inkDim, marginBottom: 10 }}>{s.l}</div>
              <div data-stat-value style={{ fontSize: 32, lineHeight: 1, fontWeight: 500, color: t.ink, fontVariantNumeric: "tabular-nums" }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div data-grid-dash-main style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginBottom: 12 }}>
          <Box eyebrow="OYLIK TRENDLAR" title="Tashriflar dinamikasi"><canvas ref={trendRef}></canvas></Box>
          <Box eyebrow="BO'LIMLAR" title="Bemorlar taqsimoti"><canvas ref={donutRef}></canvas></Box>
        </div>

        <Box eyebrow="DEMOGRAFIYA" title="Bemorlar yoshi bo'yicha taqsimot" height={240}><canvas ref={ageRef}></canvas></Box>

        <div data-grid-2 style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 12, padding: "22px 24px" }}>
            <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.16em", color: t.gold, textTransform: "uppercase" }}>MOLIYAVIY</div>
            <div style={{ fontSize: 17, color: t.ink, marginTop: 4, marginBottom: 16, fontWeight: 500 }}>To'lov ko'rsatkichlari</div>
            <div style={{ padding: "14px 16px", background: t.bg, borderRadius: 10, marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: t.inkDim, fontSize: 13 }}>To'langan</span>
              <span style={{ fontFamily: t.fonts.mono, fontSize: 15, color: t.green, fontWeight: 600 }}>{(stats?.tolangan || 0).toLocaleString()} so'm</span>
            </div>
            <div style={{ padding: "14px 16px", background: t.bg, borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: t.inkDim, fontSize: 13 }}>Qarz</span>
              <span style={{ fontFamily: t.fonts.mono, fontSize: 15, color: t.red, fontWeight: 600 }}>{(stats?.qarz || 0).toLocaleString()} so'm</span>
            </div>
          </div>
          <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 12, padding: "22px 24px" }}>
            <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "0.16em", color: t.gold, textTransform: "uppercase" }}>KUNDALIK</div>
            <div style={{ fontSize: 17, color: t.ink, marginTop: 4, marginBottom: 16, fontWeight: 500 }}>Bugungi ko'rsatkichlar</div>
            <div style={{ fontSize: 48, fontWeight: 500, color: t.ink, lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 8 }}>{stats?.bugun || 0}</div>
            <div style={{ color: t.inkMute, fontSize: 12.5 }}>Bugungi tashriflar soni</div>
          </div>
        </div>
      </div>
    </div>
  );
};
