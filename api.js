// api.js — Google Apps Script bilan muloqot qiluvchi API moduli
// window.getAPI() funksiyasini eksport qiladi

(function () {
  const BASE_URL = window.__API_URL || '';

  async function request(action, params) {
    if (!BASE_URL) throw new Error('API URL topilmadi');
    const url = new URL(BASE_URL);
    url.searchParams.set('action', action);
    if (params) Object.entries(params).forEach(([k, v]) => { if (v != null) url.searchParams.set(k, String(v)); });
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Server xatosi: ' + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  async function postRequest(action, body) {
    if (!BASE_URL) throw new Error('API URL topilmadi');
    const url = new URL(BASE_URL);
    url.searchParams.set('action', action);
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    if (!res.ok) throw new Error('Server xatosi: ' + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  // ─── Demo / fallback data (to'g'ri field nomlari bilan) ────────────────────
  let _demoBemorlar = [
    {
      id: 'b1', ism: 'Aliyev Jasur', tel: '+998901234567', yosh: 34,
      manzil: 'Toshkent, Yunusobod', klinika: 'AkhmadStoma — Yunusobod',
      bolim: 'Terapiya', tashrif_sana: '2024-01-10 09:00', keyingi_tashrif: '2024-02-10 09:00',
      rentgen_url: '', tolov_summa: 350000, tolov_holati: "To'langan",
      izoh: 'Doimiy bemor', holat: 'Faol', yaratilgan: '2024-01-10'
    },
    {
      id: 'b2', ism: 'Karimova Malika', tel: '+998931112233', yosh: 39,
      manzil: 'Samarqand', klinika: 'AkhmadStoma — Yunusobod',
      bolim: 'Ortodontiya', tashrif_sana: '2024-01-15 11:00', keyingi_tashrif: '',
      rentgen_url: '', tolov_summa: 500000, tolov_holati: "To'langan",
      izoh: '', holat: 'Davolangan', yaratilgan: '2024-01-15'
    },
    {
      id: 'b3', ism: "O'rinov Dilshod", tel: '+998901234568', yosh: 46,
      manzil: 'Namangan', klinika: 'AkhmadStoma — Yunusobod',
      bolim: 'Xirurgiya', tashrif_sana: '2024-02-01 10:00', keyingi_tashrif: '2024-03-01 10:00',
      rentgen_url: '', tolov_summa: 200000, tolov_holati: 'Qarz',
      izoh: 'Urgench shahridan keldi', holat: 'Faol', yaratilgan: '2024-02-01'
    },
    {
      id: 'b4', ism: 'Toshmatova Zulfiya', tel: '+998991234567', yosh: 29,
      manzil: 'Toshkent, Chilonzor', klinika: 'AkhmadStoma — Yunusobod',
      bolim: 'Ortodontiya', tashrif_sana: '2024-02-10 14:00', keyingi_tashrif: '2024-03-10 14:00',
      rentgen_url: '', tolov_summa: 0, tolov_holati: 'Qarz',
      izoh: '', holat: 'Faol', yaratilgan: '2024-02-10'
    },
    {
      id: 'b5', ism: 'Xolmatov Sardor', tel: '+998711234567', yosh: 24,
      manzil: 'Andijon', klinika: 'AkhmadStoma — Yunusobod',
      bolim: 'Ortopediya', tashrif_sana: '2024-03-05 12:00', keyingi_tashrif: '2024-04-05 12:00',
      rentgen_url: '', tolov_summa: 150000, tolov_holati: 'Qisman',
      izoh: 'Protez uchun', holat: 'Kutmoqda', yaratilgan: '2024-03-05'
    },
  ];
  let _demoNextId = 6;

  function _calcStats(list) {
    const total = list.length;
    const faol = list.filter(b => b.holat === 'Faol').length;
    const davolangan = list.filter(b => b.holat === 'Davolangan').length;
    const kutmoqda = list.filter(b => b.holat === 'Kutmoqda').length;
    const tolangan = list.filter(b => b.tolov_holati === "To'langan").reduce((s, b) => s + (b.tolov_summa || 0), 0);
    const qarz = list.filter(b => b.tolov_holati === 'Qarz').reduce((s, b) => s + (b.tolov_summa || 0), 0);
    const bugun = list.filter(b => b.yaratilgan === new Date().toISOString().slice(0,10)).length;
    return { total, faol, davolangan, kutmoqda, tolangan, qarz, bugun };
  }

  // ─── API object ────────────────────────────────────────────────────────────
  function createAPI() {
    let _useDemo = false;
    let _checked = false;

    async function _checkServer() {
      if (_checked) return;
      _checked = true;
      if (!BASE_URL) { _useDemo = true; return; }
      try {
        const r = await fetch(BASE_URL + '?action=ping', { signal: AbortSignal.timeout(5000) });
        if (!r.ok) _useDemo = true;
      } catch { _useDemo = true; }
      if (_useDemo && window.__showToast) {
        window.__showToast("Demo rejim: ma'lumotlar qurilmada saqlanmoqda", 'info');
      }
    }

    return {
      async getBemorlar() {
        await _checkServer();
        if (_useDemo) return JSON.parse(JSON.stringify(_demoBemorlar));
        try {
          const d = await request('getBemorlar');
          return d.data || d || [];
        } catch { _useDemo = true; return JSON.parse(JSON.stringify(_demoBemorlar)); }
      },
      async addBemor(bemor) {
        await _checkServer();
        if (_useDemo) {
          const nb = { ...bemor, id: 'b' + _demoNextId++, yaratilgan: new Date().toISOString().slice(0,10) };
          _demoBemorlar.unshift(nb);
          return nb;
        }
        try {
          const d = await postRequest('addBemor', bemor);
          return d.data || d;
        } catch { throw new Error('Saqlashda xato'); }
      },
      async updateBemor(id, bemor) {
        await _checkServer();
        if (_useDemo) {
          const idx = _demoBemorlar.findIndex(b => b.id === id);
          if (idx >= 0) { _demoBemorlar[idx] = { ..._demoBemorlar[idx], ...bemor }; return _demoBemorlar[idx]; }
          throw new Error('Bemor topilmadi');
        }
        try {
          const d = await postRequest('updateBemor', { id, ...bemor });
          return d.data || d;
        } catch { throw new Error('Yangilashda xato'); }
      },
      async deleteBemor(id) {
        await _checkServer();
        if (_useDemo) {
          _demoBemorlar = _demoBemorlar.filter(b => b.id !== id);
          return { ok: true };
        }
        try { return await request('deleteBemor', { id }); }
        catch { throw new Error("O'chirishda xato"); }
      },
      async getStats() {
        await _checkServer();
        if (_useDemo) return _calcStats(_demoBemorlar);
        try {
          const d = await request('getStats');
          return d.data || d;
        } catch { return _calcStats(_demoBemorlar); }
      },
    };
  }

  let _api = null;
  window.getAPI = function () { if (!_api) _api = createAPI(); return _api; };
})();
