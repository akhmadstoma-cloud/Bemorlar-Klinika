// api.js — Google Apps Script bilan muloqot qiluvchi API moduli
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
    const res = await fetch(url.toString(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
    if (!res.ok) throw new Error('Server xatosi: ' + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  let _demoBemorlar = [
    { id: 'b1', ism: 'Aliyev Jasur', telefon: '+998901234567', tug_sana: '1990-05-15', jinsi: 'Erkak', manzil: 'Toshkent', kasallik: 'Stomatit', holat: 'Faol', izoh: '', yaratilgan: '2024-01-10' },
    { id: 'b2', ism: 'Karimova Malika', telefon: '+998931112233', tug_sana: '1985-11-22', jinsi: 'Ayol', manzil: 'Samarqand', kasallik: 'Kariyes', holat: 'Davolangan', izoh: '', yaratilgan: '2024-01-15' },
    { id: 'b3', ism: "O'rinov Dilshod", telefon: '+998901234568', tug_sana: '1978-03-08', jinsi: 'Erkak', manzil: 'Namangan', kasallik: 'Parodontit', holat: 'Faol', izoh: '', yaratilgan: '2024-02-01' },
    { id: 'b4', ism: 'Toshmatova Zulfiya', telefon: '+998991234567', tug_sana: '1995-07-30', jinsi: 'Ayol', manzil: 'Toshkent', kasallik: 'Ortodontiya', holat: 'Faol', izoh: '', yaratilgan: '2024-02-10' },
    { id: 'b5', ism: 'Xolmatov Sardor', telefon: '+998711234567', tug_sana: '2000-12-01', jinsi: 'Erkak', manzil: 'Andijon', kasallik: 'Protez', holat: 'Kutmoqda', izoh: '', yaratilgan: '2024-03-05' },
  ];
  let _demoNextId = 6;

  function _calcStats(list) {
    return {
      total: list.length,
      faol: list.filter(b => b.holat === 'Faol').length,
      davolangan: list.filter(b => b.holat === 'Davolangan').length,
      kutmoqda: list.filter(b => b.holat === 'Kutmoqda').length,
      erkak: list.filter(b => b.jinsi === 'Erkak').length,
      ayol: list.filter(b => b.jinsi === 'Ayol').length,
      bugungi: 0,
    };
  }

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
      if (_useDemo && window.__showToast) window.__showToast("Demo rejim: server ulanmadi", 'info');
    }

    return {
      async getBemorlar() {
        await _checkServer();
        if (_useDemo) return [..._demoBemorlar];
        try { const d = await request('getBemorlar'); return d.data || d || []; }
        catch { _useDemo = true; return [..._demoBemorlar]; }
      },
      async addBemor(bemor) {
        await _checkServer();
        if (_useDemo) {
          const nb = { ...bemor, id: 'b' + _demoNextId++, yaratilgan: new Date().toISOString().slice(0,10) };
          _demoBemorlar.unshift(nb); return nb;
        }
        try { const d = await postRequest('addBemor', bemor); return d.data || d; }
        catch { throw new Error('Saqlashda xato'); }
      },
      async updateBemor(id, bemor) {
        await _checkServer();
        if (_useDemo) {
          const idx = _demoBemorlar.findIndex(b => b.id === id);
          if (idx >= 0) { _demoBemorlar[idx] = { ..._demoBemorlar[idx], ...bemor }; return _demoBemorlar[idx]; }
          throw new Error('Bemor topilmadi');
        }
        try { const d = await postRequest('updateBemor', { id, ...bemor }); return d.data || d; }
        catch { throw new Error('Yangilashda xato'); }
      },
      async deleteBemor(id) {
        await _checkServer();
        if (_useDemo) { _demoBemorlar = _demoBemorlar.filter(b => b.id !== id); return { ok: true }; }
        try { return await request('deleteBemor', { id }); }
        catch { throw new Error("O'chirishda xato"); }
      },
      async getStats() {
        await _checkServer();
        if (_useDemo) return _calcStats(_demoBemorlar);
        try { const d = await request('getStats'); return d.data || d; }
        catch { return _calcStats(_demoBemorlar); }
      },
    };
  }

  let _api = null;
  window.getAPI = function () { if (!_api) _api = createAPI(); return _api; };
})();
