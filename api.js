// ═══════════════════════════════════════════════════════════════════════
// api.js — Bemorlar klinika API moduli (v6 - TO'LIQ TUZATILGAN)
//
// O'zgarishlar (v5 → v6):
// ✅ Content-Type: text/plain — CORS preflight muammosini hal qiladi (ENG MUHIM!)
// ✅ Timeout qo'shildi (har bir so'rovga 30 soniya)
// ✅ getStats force qiladi — eski cache'dan stats olmaydi
// ✅ uploadRentgen ga bemorId parametri (ixtiyoriy)
// ✅ ping() funksiyasi — server ulanishini tekshirish
// ✅ Yaxshilangan xato xabarlari
// ═══════════════════════════════════════════════════════════════════════

(function () {
    const BASE_URL = window.__API_URL || '';
    const LS_KEY = 'bemorlar_klinika_v4';
    const TIMEOUT_MS = 30000;

    // ── localStorage ──────────────────────────────────────────
    function lsLoad() {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
    }

    function lsSave(list) {
        try { localStorage.setItem(LS_KEY, JSON.stringify(Array.isArray(list) ? list : [])); } catch {}
    }

    function genId() {
        return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }

    // ── Statistika hisoblash ───────────────────────────────────
    function calcStats(list) {
        const today = new Date().toISOString().slice(0, 10);
        const jami = list.length;
        const faol = list.filter(b => b.holat === 'Faol').length;
        const davolangan = list.filter(b => b.holat === 'Davolangan').length;
        const kutmoqda = list.filter(b => b.holat === 'Kutmoqda').length;
        const arxiv = list.filter(b => b.holat === 'Arxiv').length;
        const qarzdor = list.filter(b => b.tolov_holati === 'Qarz').length;

        const tolangan = list.filter(b => b.tolov_holati === "To'langan")
            .reduce((s, b) => s + (Number(b.tolov_summa) || 0), 0);
        const qarz = list.filter(b => b.tolov_holati === 'Qarz')
            .reduce((s, b) => s + (Number(b.tolov_summa) || 0), 0);

        const bugun = list.filter(b =>
            (b.yaratilgan && String(b.yaratilgan).startsWith(today)) ||
            (b.tashrif_sana && String(b.tashrif_sana).startsWith(today))
        ).length;

        const bolimMap = {};
        list.forEach(b => {
            const bolim = b.bolim || 'Boshqa';
            bolimMap[bolim] = (bolimMap[bolim] || 0) + 1;
        });
        const bolimlar = Object.entries(bolimMap).map(([nom, soni]) => ({ nom, soni }));

        const trendMap = {};
        list.forEach(b => {
            const sana = b.yaratilgan || b.tashrif_sana;
            if (sana) { const oy = String(sana).substring(0, 7); trendMap[oy] = (trendMap[oy] || 0) + 1; }
        });
        const trend = Object.entries(trendMap).sort().slice(-6).map(([oy, soni]) => ({ oy, soni }));

        return { jami, faol, davolangan, kutmoqda, arxiv, qarzdor, tolangan, qarz, bugun, bolimlar, trend };
    }

    // ── Fetch with timeout ─────────────────────────────────────
    function fetchWithTimeout(url, options) {
        options = options || {};
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
        return fetch(url, { ...options, signal: controller.signal })
            .finally(() => clearTimeout(id));
    }

    // ── Server so'rovlari ──────────────────────────────────────
    async function serverPost(action, body) {
        if (!BASE_URL) throw new Error('API URL yo\'q');
        const payload = { ...body, action: action };
        // ✅ ENG MUHIM: text/plain — CORS preflight'ni chetlab o'tadi
        const res = await fetchWithTimeout(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (data && data.error) throw new Error(data.error);
        return data;
    }

    async function serverGet(action, params) {
        if (!BASE_URL) throw new Error('API URL yo\'q');
        const url = new URL(BASE_URL);
        url.searchParams.set('action', action);
        if (params) Object.entries(params).forEach(([k, v]) => {
            if (v != null) url.searchParams.set(k, String(v));
        });
        const res = await fetchWithTimeout(url.toString(), { redirect: 'follow' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (data && data.error) throw new Error(data.error);
        return data;
    }

    // ── Server ulanishini tekshirish ───────────────────────────
    async function ping() {
        try {
            const res = await serverGet('ping');
            return res && res.success;
        } catch { return false; }
    }

    // ── Asosiy API ─────────────────────────────────────────────
    window.BemorAPI = {
        uploadRentgen: function (file, bemorId) {
            return new Promise(function (resolve, reject) {
                if (!file) return reject(new Error('Fayl tanlanmagan'));
                var reader = new FileReader();
                reader.onload = function (e) {
                    var base64 = e.target.result.split(',')[1];
                    var payload = {
                        fileName: file.name,
                        mimeType: file.type,
                        base64: base64
                    };
                    if (bemorId) payload.bemorId = bemorId;
                    serverPost('uploadRentgen', payload).then(resolve).catch(reject);
                };
                reader.onerror = function () { reject(new Error('Fayl o\'qishda xato')); };
                reader.readAsDataURL(file);
            });
        },
        ping: ping
    };

    function createAPI() {
        return {
            async getBemorlar(forceRefresh = false) {
                const local = lsLoad();
                if (!forceRefresh && local.length > 0) {
                    // Fon rejimda serverdan yangilab qo'yamiz
                    serverGet('getBemorlar').then(res => {
                        if (res && res.success && Array.isArray(res.data)) {
                            lsSave(res.data);
                        }
                    }).catch(() => {});
                    return local;
                }

                // Serverdan kutib olamiz
                const res = await serverGet('getBemorlar');
                if (res && res.success && Array.isArray(res.data)) {
                    lsSave(res.data);
                    return res.data;
                }
                return local;
            },

            async getStats() {
                // ✅ force=true — har doim yangi ma'lumotdan stats
                const list = await this.getBemorlar(true);
                return calcStats(list);
            },

            async addBemor(bemor) {
                const nb = { ...bemor, id: genId(), yaratilgan: new Date().toISOString().slice(0, 10) };
                const res = await serverPost('addBemor', nb);
                if (res && res.success) {
                    await this.getBemorlar(true);
                    return { ...nb, id: res.id || nb.id };
                }
                throw new Error(res && res.error ? res.error : 'Serverga saqlashda xato');
            },

            async updateBemor(id, bemor) {
                const res = await serverPost('updateBemor', { id, ...bemor });
                if (res && res.success) {
                    await this.getBemorlar(true);
                    return { id, ...bemor };
                }
                throw new Error(res && res.error ? res.error : 'Yangilashda xato');
            },

            async deleteBemor(id) {
                const res = await serverPost('deleteBemor', { id });
                if (res && res.success) {
                    await this.getBemorlar(true);
                    return { ok: true };
                }
                throw new Error(res && res.error ? res.error : 'O\'chirishda xato');
            }
        };
    }

    window.getAPI = (function () {
        let _api = null;
        return function () {
            if (!_api) _api = createAPI();
            return _api;
        };
    })();
})();
