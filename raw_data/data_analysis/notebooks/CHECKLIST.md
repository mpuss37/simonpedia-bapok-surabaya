# ✅ Checklist Belajar — Analisis Deret Waktu Harga Bapok Surabaya

Centang tiap item setelah kamu benar-benar menjalankannya sendiri.
Gaya belajar: **baca penjelasan → jalankan kode → isi sel `# TODO` → cek hasil**.

---

## FASE 0 — Persiapan (alat belajar)
- [x] Folder `notebooks/` siap
- [x] Buka folder ini di VS Code
- [x] Install ekstensi yang direkomendasikan (VS Code akan menawarkan otomatis)
- [x] Pilih interpreter Python `Python 3.14.x` (Ctrl+Shift+P → "Python: Select Interpreter")
- [x] Buka terminal VS Code, jalankan: `python check_env.py`
- [x] `check_env.py` menampilkan semua paket ✅
- [x] Buka notebook `01_persiapan.ipynb` dan jalankan sel pertama sampai muncul output

## FASE 1 — Load & Cleaning  ✔ SELESAI (revisi)
Sumber: `rekap_januari_2024_rekap.csv` (agregat harian). Scope: 22 komoditas EWS inti.
- [x] Load data + inspeksi (shape, dtypes, missing, duplikat)
- [x] Parse `tanggal` jadi datetime
- [x] `fluktuasi` → numerik (`#VALUE!` → NaN)
- [x] `harga_rata` = 0 → NaN
- [x] Rapikan grid jadi lengkap 31 hari per komoditas
- [x] Imputasi `harga_rata` (ffill → median) + flag `harga_diimputasi`
- [x] Filter scope 22 komoditas (22 lengkap: 20 asli + 2 dummy)
- [x] Isi `het_hapk` dari `data/het_final.csv` (tidak dikarang dari harga)
- [x] Data dummy K6 & K8 (isi dari K7) + flag `is_dummy`
- [x] Tandai `basis_ews` (HET vs fluktuasi)
- [x] Hitung `status_ews` (Aman/Waspada/Intervensi) untuk basis HET
- [x] Simpan `output/data_bersih_22.csv` (682×12) + `output/audit_22komoditas.csv`
- [x] **HET final dari CAKBAPOK Jan 2024** (`data/het_final.csv`) — 14 HET + 8 fluktuasi
- [x] **Bawang Putih** (K3/K4): dicek → tak ada HET Jan 2024 → basis fluktuasi
- [x] **K8 BERAS SPHP** → data dummy dari K7 (sementara)
- [x] **K6 Beras IR.64 Medium** (harga kosong) → data dummy dari K7 (sementara)
- [ ] **Konfirmasi nilai asli K6 & K8** ke pemilik data (agar lepas dari dummy)

## FASE 2 — Eksplorasi & Dekomposisi  ✔ SELESAI
- [x] Ringkasan per komoditas (min, rata, max, std, CV)
- [x] Visualisasi tren (indeks & per komoditas + garis HET)
- [x] Analisis volatilitas (Koefisien Variasi)
- [x] Uji stasioneritas (ADF) + differencing
- [x] Plot ACF / PACF
- [x] Dekomposisi tren & musiman (period=7) — indikatif
- [x] Pola status EWS per komoditas
- [x] Isi ringkasan temuan (Bab 9 notebook)
- [x] Interpretasi: K5/K16/K17/K24 "selalu Intervensi" → **teratasi** (HET final → Aman)

## FASE 3 — Pemodelan & Forecasting  ✔ SELESAI
- [x] Baseline: Moving Average
- [x] Baseline: Exponential Smoothing (Holt)
- [x] Pembanding: ARIMA (grid order kecil, d=1)
- [x] Train/test split (24 hari / 7 hari)
- [x] Backtesting
- [x] Forecast H+7
- [x] Pilih model terbaik per komoditas (MAPE terkecil) → MA 13 · ARIMA 5 · Holt 2
- [x] Simpan `evaluasi_model.csv`, `model_terbaik.csv`, `forecast_h7.csv`

## FASE 4 — Evaluasi
- [ ] Validasi forecast H+7 vs harga aktual (out-of-sample)
- [ ] Tabel perbandingan antar model
- [ ] Grafik aktual vs prediksi (final)

## FASE 5 — Integrasi EWS & Output
- [ ] Tandai komoditas yang berpotensi naik ke Waspada / Intervensi
- [ ] Ekspor CSV hasil forecast
- [ ] Ekspor CSV siap-inject ke tabel `prediksi_harga`
- [ ] Ekspor CSV siap-inject ke tabel `alert`

---

## 📝 Catatan Belajar (isi sendiri)
Gunakan bagian ini untuk mencatat hal yang kamu pelajari / bingungkan tiap fase.

### Fase 0
-

### Fase 1
-
