// api.js — Bemorlar klinika API moduli (v5 - TUZATILGAN)
// Ma'lumotlar: Google Sheets (asosiy) + localStorage (kesh)
// Rentgen suratlari: Google Drive (server orqali)

(function () {
    const BASE_URL = window.__API_URL || '';
    const LS_KEY = 'bemorlar_klinika_v4';

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
            b.yaratilgan === today || (b.tashrif_sana && b.tashrif_sana.startsWith(today))
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
            if (sana) { const oy = sana.substring(0, 7); trendMap[oy] = (trendMap[oy] || 0) + 1; }
        });
        const trend = Object.entries(trendMap).sort().slice(-6).map(([oy, soni]) => ({ oy, soni }));

        return { jami, faol, davolangan, kutmoqda, arxiv, qarzdor, tolangan, qarz, bugun, bolimlar, trend };
    }

    // ── Server so'rovlari ──────────────────────────────────────
    async function serverPost(action, body) {
        if (!BASE_URL) throw new Error('API URL yoq');
        const payload = { ...body, action: action };
        const res = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (data && data.error) throw new Error(data.error);
        return data;
    }

    async function serverGet(action, params) {
        if (!BASE_URL) throw new Error('API URL yoq');
        const url = new URL(BASE_URL);
        url.searchParams.set('action', action);
        if (params) Object.entries(params).forEach(([k, v]) => {
            if (v != null) url.searchParams.set(k, String(v));
        });
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (data && data.error) throw new Error(data.error);
        return data;
    }

    // ── Asosiy API ─────────────────────────────────────────────
    window.BemorAPI = {
        uploadRentgen: function (file) {
            return new Promise(function (resolve, reject) {
                if (!file) return reject(new Error('Fayl tanlanmagan'));
                var reader = new FileReader();
                reader.onload = function (e) {
                    var base64 = e.target.result.split(',')[1];
                    serverPost('uploadRentgen', {
                        fileName: file.name,
                        mimeType: file.type,
                        base64: base64 // Backend 'base64' kutmoqda
                    }).then(resolve).catch(reject);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    function createAPI() {
        return {
            async getBemorlar(forceRefresh = false) {
                // Agar forceRefresh bo'lsa yoki local bo'sh bo'lsa, serverdan kutamiz
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
                const list = await this.getBemorlar();
                return calcStats(list);
            },

            async addBemor(bemor) {
                const nb = { ...bemor, id: genId(), yaratilgan: new Date().toISOString().slice(0, 10) };
                // 1. Serverga saqlaymiz (kutamiz, chunki qurilmalararo sinxronlik muhim)
                const res = await serverPost('addBemor', nb);
                if (res && res.success) {
                    const list = await this.getBemorlar(true); // Serverdan yangi ro'yxatni olamiz
                    return nb;
                }
                throw new Error('Serverga saqlashda xato');
            },

            async updateBemor(id, bemor) {
                const res = await serverPost('updateBemor', { id, ...bemor });
                if (res && res.success) {
                    await this.getBemorlar(true);
                    return { id, ...bemor };
                }
                throw new Error('Yangilashda xato');
            },

            async deleteBemor(id) {
                const res = await serverPost('deleteBemor', { id });
                if (res && res.success) {
                    await this.getBemorlar(true);
                    return { ok: true };
                }
                throw new Error('Ochirishda xato');
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
