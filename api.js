// api.js — Bemorlar klinika API moduli (v4)
// Ma'lumotlar: localStorage (asosiy) + Google Sheets (server, ixtiyoriy)
// Rentgen suratlari: Google Drive (server orqali)
// getBemorlar() -> massiv qaytaradi (index.html bilan mos)
// getStats() -> statistika qaytaradi

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
	             const url = new URL(BASE_URL);
	             // POST so'rovlarida action body ichida bo'lishi kerak
	             const payload = { ...body, action: action };
	             const res = await fetch(url.toString(), {
	                         method: 'POST',
	                         headers: { 'Content-Type': 'application/json' },
	                         body: JSON.stringify(payload),
	                         signal: AbortSignal.timeout(10000)
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
             const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
             if (!res.ok) throw new Error('HTTP ' + res.status);
             const data = await res.json();
             if (data && data.error) throw new Error(data.error);
             return data;
   }

   // ── Google Drive rentgen yuklash ───────────────────────────
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
	                                                       fetch(uploadUrl.toString(), {
	                                                                         method: 'POST',
	                                                                         headers: { 'Content-Type': 'application/json' },
	                                                                         body: JSON.stringify({ action: 'uploadRentgen', fileName: fileName, mimeType: mimeType, base64: base64 })
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

   // ── Asosiy API ─────────────────────────────────────────────
   function createAPI() {
             // Serverga sinxron qilish (fon rejimda)
          async function trySyncToServer(list) {
                      if (!BASE_URL) return;
                      try {
                                    await serverPost('syncBemorlar', { bemorlar: list });
                      } catch (e) {
                                    console.warn('Serverga sinxron qilishda xato:', e.message);
                      }
          }

          // Serverdan ma'lumotlarni yuklab olish urinishi
          async function tryLoadFromServer() {
                      if (!BASE_URL) return null;
                      try {
                                    const data = await serverGet('getBemorlar');
                                    if (Array.isArray(data)) return data;
                                    if (data && Array.isArray(data.bemorlar)) return data.bemorlar;
                                    return null;
                      } catch (e) {
                                    console.warn('Serverdan yuklashda xato:', e.message);
                                    return null;
                      }
          }

          return {
                      // getBemorlar() - MASSIV qaytaradi (index.html bilan mos)
                      async getBemorlar() {
                                    // 1. Avval localStorage dan olamiz (tez)
                        const localList = lsLoad();

                        // 2. Fon rejimda serverdan yangilashga urinish
                        tryLoadFromServer().then(serverList => {
                                        if (serverList && serverList.length >= 0) {
                                                          // Server ma'lumotlari bor - localStorage ni yangilaymiz
                                          lsSave(serverList);
                                        }
                        }).catch(() => {});

                        return localList;
                      },

                      // getStats() - statistika qaytaradi
                      async getStats() {
                                    const list = lsLoad();
                                    return calcStats(list);
                      },

                      // addBemor() - yangi bemor qo'shish
                      async addBemor(bemor) {
                                    const yaratilgan = new Date().toISOString().slice(0, 10);
                                    const nb = { ...bemor, id: genId(), yaratilgan };

                        // 1. Avval localga saqlaymiz
                        const list = lsLoad();
                                    list.push(nb);
                                    lsSave(list);

                        // 2. Fon rejimda serverga saqlaymiz
                        serverPost('addBemor', nb).then(saved => {
                                        if (saved && saved.id && saved.id !== nb.id) {
                                                          // Server boshqa ID berdi - yangilaymiz
                                          const currentList = lsLoad();
                                                          const idx = currentList.findIndex(b => b.id === nb.id);
                                                          if (idx !== -1) { currentList[idx].serverId = saved.id; lsSave(currentList); }
                                        }
                        }).catch(e => console.warn('Server addBemor xato:', e.message));

                        return nb;
                      },

                      // updateBemor() - bemorni yangilash
                      async updateBemor(id, bemor) {
                                    // 1. Avval localda yangilaymiz
                        const list = lsLoad();
                                    const idx = list.findIndex(b => b.id === id);
                                    const updated = idx !== -1
                                      ? { ...list[idx], ...bemor, id }
                                                    : { ...bemor, id };
                                    if (idx !== -1) list[idx] = updated;
                                    else list.push(updated);
                                    lsSave(list);

                        // 2. Fon rejimda serverga yuboramiz
                        serverPost('updateBemor', { id, ...bemor })
                                      .catch(e => console.warn('Server updateBemor xato:', e.message));

                        return updated;
                      },

                      // deleteBemor() - bemorni o'chirish
                      async deleteBemor(id) {
                                    // 1. Avval localdan o'chiramiz
                        const list = lsLoad().filter(b => b.id !== id);
                                    lsSave(list);

                        // 2. Fon rejimda serverdan o'chiramiz
                        serverGet('deleteBemor', { id })
                                      .catch(e => console.warn('Server deleteBemor xato:', e.message));

                        return { ok: true };
                      },

                      isDemo() { return !BASE_URL; },

                      // localStorage ni tozalash
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
