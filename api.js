// api.js — Bemorlar klinika API moduli
// Ma'lumotlar: Google Sheets (server) + localStorage (offline backup)
// Rentgen suratlari: Google Drive (server orqali)
(function () {
      const BASE_URL = window.__API_URL || '';
      const LS_KEY = 'bemorlar_klinika_v3';

   // ── localStorage yordamchilari ──────────────────────────────
   function lsLoad() {
           try {
                     const raw = localStorage.getItem(LS_KEY);
                     return raw ? JSON.parse(raw) : [];
           } catch { return []; }
   }

   function lsSave(list) {
           try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
   }

   function genId() {
           return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
   }

   // ── Server so'rovlari ──────────────────────────────────────
   async function serverGet(action, params) {
           const url = new URL(BASE_URL);
           url.searchParams.set('action', action);
           if (params) Object.entries(params).forEach(([k, v]) => {
                     if (v != null) url.searchParams.set(k, String(v));
           });
           const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
           if (!res.ok) throw new Error('HTTP ' + res.status);
           const data = await res.json();
           if (data && data.error) throw new Error(data.error);
           return data;
   }

   async function serverPost(action, body) {
           const url = new URL(BASE_URL);
           url.searchParams.set('action', action);
           const res = await fetch(url.toString(), {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(body || {}),
                     signal: AbortSignal.timeout(10000)
           });
           if (!res.ok) throw new Error('HTTP ' + res.status);
           const data = await res.json();
           if (data && data.error) throw new Error(data.error);
           return data;
   }

   // ── Rentgen yuklash (Google Drive) ─────────────────────────
   window.BemorAPI = {
           uploadRentgen: function (file) {
                     return new Promise(function (resolve, reject) {
                                 if (!file) return reject(new Error('Fayl tanlanmagan'));
                                 if (!BASE_URL) return reject(new Error('API URL topilmadi'));
                                 if (file.size > 20 * 1024 * 1024) return reject(new Error('Fayl 20 MB dan katta bolmasligi kerak'));
                                 var reader = new FileReader();
                                 reader.onerror = function () { reject(new Error('Faylni oqishda xato')); };
                                 reader.onload = function (e) {
                                               var base64 = e.target.result.split(',')[1];
                                               var mimeType = file.type || 'image/jpeg';
                                               var fileName = file.name || ('rentgen_' + Date.now() + '.jpg');
                                               var uploadUrl = new URL(BASE_URL);
                                               uploadUrl.searchParams.set('action', 'uploadRentgen');
                                               fetch(uploadUrl.toString(), {
                                                               method: 'POST',
                                                               headers: { 'Content-Type': 'application/json' },
                                                               body: JSON.stringify({ fileName: fileName, mimeType: mimeType, base64: base64 })
                                               })
                                                 .then(function (res) {
                                                                   if (!res.ok) throw new Error('HTTP ' + res.status);
                                                                   return res.json();
                                                 })
                                                 .then(function (data) {
                                                                   if (data && data.error) throw new Error(data.error);
                                                                   var fileId = data.fileId || data.id || '';
                                                                   var publicUrl = data.url || (fileId ? 'https://drive.google.com/uc?export=view&id=' + fileId : '');
                                                                   if (!publicUrl) throw new Error('Drive URL qaytmadi');
                                                                   resolve({ url: publicUrl, fileId: fileId });
                                                 })
                                                 .catch(reject);
                                 };
                                 reader.readAsDataURL(file);
                     });
           }
   };

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

   // ── Asosiy API ─────────────────────────────────────────────
   function createAPI() {
           let _serverOk = null; // null=tekshirilmagan, true=ishlaydi, false=ishlamaydi
        let _serverCheckPromise = null;

        async function checkServer() {
                  if (_serverOk !== null) return _serverOk;
                  if (_serverCheckPromise) return _serverCheckPromise;
                  if (!BASE_URL) { _serverOk = false; return false; }
                  _serverCheckPromise = (async () => {
                              try {
                                            // Server URL mavjud bo'lsa, oddiy ping
                                const r = await fetch(BASE_URL + '?action=ping', { signal: AbortSignal.timeout(4000) });
                                            // Har qanday HTTP 200 javob - server ishlayapti
                                if (r.ok) { _serverOk = true; }
                                            else { _serverOk = false; }
                              } catch { _serverOk = false; }
                              return _serverOk;
                  })();
                  return _serverCheckPromise;
        }

        // Server sinxronizatsiyasi: localStorage -> Google Sheets
        async function syncToServer(list) {
                  if (!BASE_URL) return;
                  try {
                              await serverPost('syncBemorlar', { bemorlar: list });
                  } catch (e) {
                              // Sinxron qilolmadik - bu kritik emas
                    console.warn('Server sync xato:', e.message);
                  }
        }

        return {
                  async getBemorlar() {
                              const serverUp = await checkServer();

                    if (serverUp) {
                                  // Server bilan ishlashga urinish
                                try {
                                                const data = await serverGet('getBemorlar');
                                                const list = Array.isArray(data) ? data
                                                                  : (Array.isArray(data.bemorlar) ? data.bemorlar : null);
                                                if (list !== null) {
                                                                  // Server ma'lumotlarini localStorage ga ham saqlaymiz (backup)
                                                  lsSave(list);
                                                                  return { bemorlar: list, stats: calcStats(list), source: 'server' };
                                                }
                                } catch (e) {
                                                console.warn('Server getBemorlar xato, localStorage dan olamiz:', e.message);
                                }
                    }

                    // localStorage dan olish (server ishlamasa yoki xato bo'lsa)
                    const list = lsLoad();
                              return { bemorlar: list, stats: calcStats(list), source: 'local' };
                  },

                  async addBemor(bemor) {
                              const serverUp = await checkServer();
                              const yaratilgan = new Date().toISOString().slice(0, 10);

                    if (serverUp) {
                                  try {
                                                  const saved = await serverPost('addBemor', { ...bemor, yaratilgan });
                                                  // Serverdan qaytgan ma'lumotni localStorage ga ham saqlaymiz
                                    const list = lsLoad();
                                                  const nb = saved.id ? saved : { ...bemor, id: genId(), yaratilgan };
                                                  const existing = list.findIndex(b => b.id === nb.id);
                                                  if (existing === -1) list.push(nb);
                                                  else list[existing] = nb;
                                                  lsSave(list);
                                                  return nb;
                                  } catch (e) {
                                                  console.warn('Server addBemor xato, localga saqlaymiz:', e.message);
                                  }
                    }

                    // localStorage ga saqlash
                    const list = lsLoad();
                              const nb = { ...bemor, id: genId(), yaratilgan };
                              list.push(nb);
                              lsSave(list);

                    // Fon rejimda serverga sinxronlashga urinish
                    if (serverUp) syncToServer(list);

                    return nb;
                  },

                  async updateBemor(id, bemor) {
                              const serverUp = await checkServer();

                    if (serverUp) {
                                  try {
                                                  const saved = await serverPost('updateBemor', { id, ...bemor });
                                                  const list = lsLoad();
                                                  const idx = list.findIndex(b => b.id === id);
                                                  const updated = saved && saved.id ? saved : { ...bemor, id };
                                                  if (idx !== -1) list[idx] = updated;
                                                  else list.push(updated);
                                                  lsSave(list);
                                                  return updated;
                                  } catch (e) {
                                                  console.warn('Server updateBemor xato, localda yangilaymiz:', e.message);
                                  }
                    }

                    // localStorage da yangilash
                    const list = lsLoad();
                              const idx = list.findIndex(b => b.id === id);
                              const updated = idx !== -1
                                ? { ...list[idx], ...bemor, id }
                                            : { ...bemor, id };
                              if (idx !== -1) list[idx] = updated;
                              else list.push(updated);
                              lsSave(list);

                    if (serverUp) syncToServer(list);
                              return updated;
                  },

                  async deleteBemor(id) {
                              const serverUp = await checkServer();

                    if (serverUp) {
                                  try {
                                                  await serverGet('deleteBemor', { id });
                                  } catch (e) {
                                                  console.warn('Server deleteBemor xato:', e.message);
                                  }
                    }

                    // localStorage dan o'chirish
                    const list = lsLoad().filter(b => b.id !== id);
                              lsSave(list);

                    if (serverUp) syncToServer(list);
                              return { ok: true };
                  },

                  async getStats() {
                              const data = await this.getBemorlar();
                              return data.stats;
                  },

                  isDemo() { return _serverOk === false; },

                  // localStorage ni tozalash (kerak bo'lganda)
                  clearLocal() { localStorage.removeItem(LS_KEY); }
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
