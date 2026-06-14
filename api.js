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
                                                         if (!res.ok) throw new Error('Server xatosi: ' + res.status);
                                                         return res.json();
                                         })
                                         .then(function (data) {
                                                         if (data.error) throw new Error(data.error);
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

   let _demoBemorlar = [
     { id:'b1', ism:'Aliyev Jasur', tel:'+998901234567', yosh:34, manzil:'Toshkent, Yunusobod', klinika:'AkhmadStoma', bolim:'Terapiya', tashrif_sana:'2024-01-10 09:00', keyingi_tashrif:'2024-02-10 09:00', rentgen_url:'', tolov_summa:350000, tolov_holati:"To'langan", izoh:'Doimiy bemor', holat:'Faol', yaratilgan:'2024-01-10' },
     { id:'b2', ism:'Karimova Malika', tel:'+998931112233', yosh:39, manzil:'Samarqand', klinika:'AkhmadStoma', bolim:'Ortodontiya', tashrif_sana:'2024-01-15 11:00', keyingi_tashrif:'', rentgen_url:'', tolov_summa:500000, tolov_holati:"To'langan", izoh:'', holat:'Davolangan', yaratilgan:'2024-01-15' },
     { id:'b3', ism:"O'rinov Dilshod", tel:'+998901234568', yosh:46, manzil:'Namangan', klinika:'AkhmadStoma', bolim:'Xirurgiya', tashrif_sana:'2024-02-01 10:00', keyingi_tashrif:'2024-03-01 10:00', rentgen_url:'', tolov_summa:200000, tolov_holati:'Qarz', izoh:'', holat:'Faol', yaratilgan:'2024-02-01' },
       ];
    let _demoNextId = 4;

   function _calcStats(list) {
         const today = new Date().toISOString().slice(0, 10);
         const jami = list.length;
         const faol = list.filter(b => b.holat === 'Faol').length;
         const davolangan = list.filter(b => b.holat === 'Davolangan').length;
         const kutmoqda = list.filter(b => b.holat === 'Kutmoqda').length;
         const arxiv = list.filter(b => b.holat === 'Arxiv').length;
         const qarzdor = list.filter(b => b.tolov_holati === 'Qarz').length;
         const tolangan = list.filter(b => b.tolov_holati === "To'langan").reduce((s, b) => s + (b.tolov_summa || 0), 0);
         const qarz = list.filter(b => b.tolov_holati === 'Qarz').reduce((s, b) => s + (b.tolov_summa || 0), 0);
         const bugun = list.filter(b => b.yaratilgan === today || (b.tashrif_sana && b.tashrif_sana.startsWith(today))).length;
         const bolimMap = {};
         list.forEach(b => { const bolim = b.bolim || 'Boshqa'; bolimMap[bolim] = (bolimMap[bolim] || 0) + 1; });
         const bolimlar = Object.entries(bolimMap).map(([nom, soni]) => ({ nom, soni }));
         const trendMap = {};
         list.forEach(b => { const sana = b.yaratilgan || b.tashrif_sana; if (sana) { const oy = sana.substring(0, 7); trendMap[oy] = (trendMap[oy] || 0) + 1; } });
         const trend = Object.entries(trendMap).sort().slice(-6).map(([oy, soni]) => ({ oy, soni }));
         return { jami, faol, davolangan, kutmoqda, arxiv, qarzdor, tolangan, qarz, bugun, bolimlar, trend };
   }

   function createAPI() {
         let _useDemo = false;
         let _checkPromise = null;
         let _cachedBemorlar = null;

      // SERVER TEKSHIRUVI: ping emas, getBemorlar bilan tekshiramiz
      // Agar server javob bersa -> real rejim, aks holda -> demo rejim
      function _checkServer() {
              if (_checkPromise) return _checkPromise;
              _checkPromise = (async () => {
                        if (!BASE_URL) { _useDemo = true; return; }
                        try {
                                    const r = await fetch(BASE_URL + '?action=getBemorlar', { signal: AbortSignal.timeout(5000) });
                                    if (!r.ok) { _useDemo = true; return; }
                                    const txt = await r.text();
                                    // Agar javob JSON array yoki object bo'lsa - server ishlayapti
                          if (!txt) { _useDemo = true; return; }
                                    try {
                                                  const parsed = JSON.parse(txt);
                                                  // Server ishlayapti va bemorlar ro'yxatini qaytardi
                                      if (parsed && (Array.isArray(parsed) || Array.isArray(parsed.bemorlar) || parsed.ok !== undefined)) {
                                                      _useDemo = false;
                                                      // Cache bemorlarni
                                                    if (Array.isArray(parsed)) _cachedBemorlar = parsed;
                                                      else if (Array.isArray(parsed.bemorlar)) _cachedBemorlar = parsed.bemorlar;
                                                      else _cachedBemorlar = [];
                                      } else if (parsed && parsed.error) {
                                                      // Server ishlayapti lekin xato qaytardi - demo rejim
                                                    _useDemo = true;
                                      } else {
                                                      _useDemo = false;
                                                      _cachedBemorlar = [];
                                      }
                                    } catch {
                                                  _useDemo = true;
                                    }
                        } catch { _useDemo = true; }
                        if (_useDemo && window.__showToast) window.__showToast("Demo rejim: server bilan aloqa yo'q", 'info');
              })();
              return _checkPromise;
      }

      return {
              async getBemorlar() {
                        await _checkServer();
                        if (_useDemo) return { bemorlar: _demoBemorlar, stats: _calcStats(_demoBemorlar) };
                        // Agar cache bo'lsa qaytaramiz
                if (_cachedBemorlar !== null) {
                            return { bemorlar: _cachedBemorlar, stats: _calcStats(_cachedBemorlar) };
                }
                        try {
                                    const data = await request('getBemorlar');
                                    const list = Array.isArray(data) ? data : (data.bemorlar || []);
                                    _cachedBemorlar = list;
                                    return { bemorlar: list, stats: _calcStats(list) };
                        } catch (e) {
                                    console.error('getBemorlar xato:', e);
                                    return { bemorlar: _demoBemorlar, stats: _calcStats(_demoBemorlar) };
                        }
              },

              async addBemor(bemor) {
                        await _checkServer();
                        if (_useDemo) {
                                    const nb = { ...bemor, id: 'b' + (_demoNextId++), yaratilgan: new Date().toISOString().slice(0, 10) };
                                    _demoBemorlar.push(nb);
                                    _cachedBemorlar = null;
                                    return nb;
                        }
                        try {
                                    const saved = await postRequest('addBemor', bemor);
                                    _cachedBemorlar = null; // cache ni tozalash
                          return saved;
                        } catch (e) {
                                    console.error('addBemor xato:', e);
                                    throw e;
                        }
              },

              async updateBemor(id, bemor) {
                        await _checkServer();
                        if (_useDemo) {
                                    const idx = _demoBemorlar.findIndex(b => b.id === id);
                                    if (idx !== -1) _demoBemorlar[idx] = { ..._demoBemorlar[idx], ...bemor };
                                    _cachedBemorlar = null;
                                    return _demoBemorlar[idx] || bemor;
                        }
                        try {
                                    const saved = await postRequest('updateBemor', { id, ...bemor });
                                    _cachedBemorlar = null;
                                    return saved;
                        } catch (e) {
                                    console.error('updateBemor xato:', e);
                                    throw e;
                        }
              },

              async deleteBemor(id) {
                        await _checkServer();
                        if (_useDemo) {
                                    _demoBemorlar = _demoBemorlar.filter(b => b.id !== id);
                                    _cachedBemorlar = null;
                                    return { ok: true };
                        }
                        try {
                                    const result = await request('deleteBemor', { id });
                                    _cachedBemorlar = null;
                                    return result;
                        } catch (e) {
                                    console.error('deleteBemor xato:', e);
                                    throw e;
                        }
              },

              async getStats() {
                        const data = await this.getBemorlar();
                        return data.stats;
              },

              isDemo() { return _useDemo; }
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
