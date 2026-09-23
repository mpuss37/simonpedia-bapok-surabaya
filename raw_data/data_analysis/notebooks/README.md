# 📈 Analisis Deret Waktu Harga Bahan Pokok (Bapok) Surabaya

Bagian analisis data dari **EWS (Early Warning System) Bapok Kota Surabaya** —
memantau & memprediksi harga bahan pokok, lalu menandai komoditas yang berpotensi
masuk status **Aman / Waspada / Intervensi**.

Project ini **dipakai untuk belajar sambil mengerjakan**: tiap langkah ada penjelasan,
kode, dan latihan (`# TODO`) yang kamu isi sendiri.

---

## 1. Struktur Folder

```
notebooks/
├── README.md              # ← kamu baca sekarang
├── CHECKLIST.md           # progress tracker, centang tiap selesai
├── requirements.txt       # daftar paket Python
├── check_env.py           # skrip cek environment (jalankan ini dulu)
├── 01_persiapan.ipynb     # FASE 0 — cek alat & baca data
├── 02_load_cleaning.ipynb # FASE 1 — cleaning, imputasi, HET, data dummy, status EWS
├── 03_eksplorasi.ipynb    # FASE 2 — tren, volatilitas, ADF, ACF/PACF, dekomposisi
├── 04_pemodelan.ipynb     # FASE 3 — MA, Holt, ARIMA + backtest + forecast H+7
├── .vscode/
│   ├── extensions.json    # rekomendasi ekstensi VS Code
│   └── settings.json      # setting workspace
├── data/
│   ├── het_final.csv            # HET/HAP final (22 baris) — sumber aktif
│   └── het_hapk_reference.csv   # HET/HAP referensi (arsip)
└── output/                # hasil (CSV, gambar) disimpan di sini
    ├── data_bersih_22.csv
    └── audit_22komoditas.csv
```

> Data utama **tidak disalin** ke sini. Notebook membaca langsung dari:
> `..\rekap_januari_2024_harian.csv` dan `..\rekap_januari_2024_rekap.csv`

---

## 2. Data yang Dipakai

**Sumber utama:** `..\rekap_januari_2024_rekap.csv` — agregat harian per komoditas
(60 komoditas × 31 hari = 1.855 baris). Kolom: `tanggal, kategori, komoditas, harga_rata, het_hapk, fluktuasi`.

**Scope analisis:** 22 komoditas EWS inti (kajian Bappedalitbang + Tim ITS),
dipetakan dari `seed_komoditas.json` (`is_ews_22`) → **22 komoditas** (20 asli + 2 dummy).

**Aturan EWS** (threshold HET/HAP):

| Status | Syarat |
|---|---|
| 🟢 Aman | `harga ≤ het_hapk` |
| 🟡 Waspada | `het_hapk < harga ≤ het_hapk × 1.05` |
| 🔴 Intervensi | `harga > het_hapk × 1.05` |

**Dua basis EWS:**
- **HET** — untuk 14 komoditas yang punya HET/HAP (beras, gula, minyak, daging, telur, bawang merah, cabai).
- **fluktuasi** — untuk 8 komoditas **tanpa HET resmi** (4 ikan segar, bawang putih, cabe merah besar, tepung; pakai % kenaikan dari rata-rata 7 hari).

**Sumber `het_hapk` (final, `data/het_final.csv`):**
- 11 komoditas: **CAKBAPOK Jan 2024** (periode sama dengan data).
- 1 komoditas: **regulasi** (K10 Cabe Keriting, batas atas).
- 2 komoditas: **data asli** (K14 Daging Ayam, K42 Telur).
- 8 komoditas: **tidak ada HET** → basis fluktuasi.

**🧪 Data dummy (2 komoditas):** K6 (Beras IR.64 Medium, harga asli kosong) & K8 (BERAS SPHP,
tak ada di data) diisi **harga K7** agar 22 lengkap — ditandai `is_dummy = True`. Hasilnya bukan
kondisi nyata, jangan dipakai untuk keputusan intervensi.

### 📜 Sumber Regulasi HET/HAP (verified)

| Regulasi | Isi | Berlaku |
|---|---|---|
| **Perbadan Bapanas No. 7/2023** | HET Beras (Jawa: Medium 10.900, Premium 13.900) | 31 Mar 2023 |
| **Perbadan Bapanas No. 11/2022 jo. 17/2023** | HAP Kedelai, Bawang Merah, Cabai Rawit/Keriting, Daging Sapi, Gula | Des 2022 |
| **Perbadan Bapanas No. 12/2024** | + Bawang Putih (HAP konsumen 38.000) | 26 Sep 2024 ⚠️ |
| **Permendag No. 11/2022** | HET Minyak Goreng Curah 14.000/L = 15.500/kg | Mar 2022 |

> ⚠️ **Temuan penting:** nilai `het_hapk` di data asli **berbeda** dari regulasi resmi
> untuk **Beras Premium** (data 12.800 vs regulasi 13.900) dan **Gula** (data 13.500
> vs regulasi 14.500). Perlu dikonfirmasi ke pembimbing: apakah sengaja pakai HET
> periode lain, atau ada kesalahan input.

### ⚠️ Catatan verifikasi (perlu konfirmasi pembimbing)

1. **Bawang Putih (K3/K4)** — **tidak ada** HET resmi periode Jan 2024 (Perbadan 11/2022 jo. 17/2023 tak mencakup bawang putih; Perbadan 12/2024 baru berlaku Sep 2024) → **basis fluktuasi**.
2. **Cabe Merah Besar (K9)** — **tidak diatur** regulasi (hanya Keriting & Rawit Merah).
3. **Tepung Terigu Curah (K43)** — **tidak ada HET/HAP** resmi.
4. **Beras/Gula** — nilai data ≠ regulasi (lihat di atas).
5. **K6 Beras IR.64 Medium** — harga asli kosong 31 hari → **diisi data dummy** dari K7.
6. **K8 BERAS SPHP** — tak ada di data → **diisi data dummy** dari K7.

---

## 3. Setup (sekali saja)

### Langkah 1 — Buka folder di VS Code
Buka folder `notebooks/` ini di VS Code (File → Open Folder).

### Langkah 2 — Install ekstensi
VS Code akan munculkan notifikasi *"recommended extensions"* → klik **Install**.
Kalau tidak muncul: `Ctrl+Shift+X`, lalu cari & install manual:
- Python (`ms-python.python`)
- Pylance (`ms-python.vscode-pylance`)
- Jupyter (`ms-toolsai.jupyter`)

### Langkah 3 — Pilih interpreter Python
1. `Ctrl+Shift+P`
2. Ketik & pilih: **Python: Select Interpreter**
3. Pilih: `Python 3.14.x` (path `...\Python314\python.exe`)

### Langkah 4 — Verifikasi environment
Buka terminal VS Code (`Ctrl+backtick`), lalu:

```powershell
python check_env.py
```

Kalau muncul **"HASIL: Environment SIAP"**, berarti beres. 🎉

> Environment kamu **sudah terpasang semua paket** (pandas, numpy, matplotlib,
> seaborn, statsmodels, scikit-learn, openpyxl, jupyter). Jadi biasanya tidak
> perlu install apa-apa lagi.

### Langkah 5 — Buka notebook pertama
Buka `01_persiapan.ipynb`, lalu jalankan sel satu per satu (Shift+Enter).

---

## 4. Urutan Belajar (Roadmap)

Ikuti per fase. Centang di `CHECKLIST.md` tiap selesai.

| Fase | Isi | Notebook |
|---|---|---|
| **0** | Persiapan & cek environment | `01_persiapan.ipynb` ✔ |
| **1** | Load & cleaning + HET reference | `02_load_cleaning.ipynb` ✔ |
| **1.5** | Verifikasi HET referensi (regulasi resmi) | ✔ (Perbadan 11/2022, 7/2023, Permendag 11/2022) |
| **2** | Eksplorasi & dekomposisi (tren, volatilitas, ADF, ACF/PACF) | `03_eksplorasi.ipynb` ✔ |
| **3** | Pemodelan: Moving Average, ETS/Holt, ARIMA + backtesting | `04_pemodelan.ipynb` ✔ |
| **4** | Evaluasi lanjutan (validasi out-of-sample) | (menyusul) |
| **5** | Integrasi EWS + ekspor CSV | (menyusul) |

**Catatan model:** karena tiap seri cuma **31 titik harian**, model yang dipakai
adalah yang tahan di sampel kecil: **Moving Average, Exponential Smoothing, ARIMA**.
Deep learning (LSTM) tidak dipakai — butuh data jauh lebih banyak.

---

## 5. Cara Kerja Sama (kamu & AI)

1. AI menulis notebook dengan penjelasan + kode + sel `# TODO`.
2. Kamu **jalankan** kode dan **isi** latihan `# TODO` sendiri.
3. Kalau mentok, tanya. Jangan cuma copy-paste.

> Tujuan: kamu paham alurnya, bukan cuma punya file yang jadi.

---

## 6. Troubleshooting

**❓ `python` tidak dikenali di terminal**
→ Pastikan interpreter sudah dipilih (Langkah 3), atau pakai path lengkap:
`C:\Users\LENOVO\AppData\Local\Programs\Python\Python314\python.exe check_env.py`

**❓ Ada paket bertanda `[X]` di `check_env.py`**
→ Install paketnya:
```powershell
python -m pip install pandas numpy matplotlib seaborn statsmodels scikit-learn openpyxl jupyter
```

**❓ Notebook tidak mau jalan / error "kernel"**
→ Klik kanan di notebook → **Select Kernel** → pilih `Python 3.14.x`.

**❓ `pmdarima` tidak ada**
→ Tidak masalah. Itu opsional (auto-ARIMA). Kita pakai `statsmodels` + order manual.

**❓ Angka tampil jadi notasi ilmiah (mis. `1.4e+04`)**
→ Sudah diatasi di sel opsi tampilan notebook. Kalau masih, pastikan sel 0.3 dijalankan.

**❓ Error encoding / karakter aneh di console Windows**
→ Sudah diatasi di `check_env.py` (paksa UTF-8). Kalau muncul di skrip lain,
tambahkan di baris awal:
```python
import sys
sys.stdout.reconfigure(encoding="utf-8")
```

---

## 7. Referensi Internal Project

- `..\database-ews\README.md` — schema database EWS (22 tabel)
- `..\database-ews\seed_komoditas.json` — 60 komoditas, 22 di antaranya EWS inti (`is_ews_22`)
- `..\simonpedia-bapok-surabaya\` — dashboard frontend (halaman EWS & Prediksi)

---

*Terakhir diperbarui: Fase 1–3 selesai (HET final + data dummy K6/K8 + pemodelan MA/Holt/ARIMA) — siap Fase 4.*
