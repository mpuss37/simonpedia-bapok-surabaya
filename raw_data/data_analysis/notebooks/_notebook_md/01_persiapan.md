# 01 — Persiapan & Cek Environment

**Project:** Analisis Deret Waktu Harga Bahan Pokok (Bapok) Surabaya  
**Konteks:** Bagian dari EWS (Early Warning System) Bapok Surabaya  

---

## Tujuan notebook ini

Fase 0 = memastikan semua **alat belajar** siap sebelum masuk ke analisis data.

Kamu akan:
1. Cek versi Python & paket
2. Import semua library
3. Set opsi tampilan
4. Cek file data ada
5. Tes baca data + lihat 5 baris pertama

> **Cara pakai:** baca penjelasan tiap sel, jalankan kode (Shift+Enter), lalu isi sel bertanda `# TODO`.

## 0.1 — Cek versi Python

Kita cek dulu Python mana yang dipakai notebook ini. Pastikan interpreter-nya sama dengan yang lolos di `check_env.py`.


```python
import sys

print("Versi Python :", sys.version.split()[0])
print("Lokasi       :", sys.executable)
```

    Versi Python : 3.13.9
    Lokasi       : c:\Users\LENOVO\anaconda3\python.exe
    

## 0.2 — Import library

Semua library inti untuk analisis deret waktu:

| Library | Kegunaan |
|---|---|
| `pandas` | olah tabel data |
| `numpy` | hitungan angka |
| `matplotlib` / `seaborn` | gambar grafik |
| `statsmodels` | model deret waktu (ARIMA, ETS, ADF, ACF/PACF) |
| `sklearn` | metrik evaluasi (MAE, RMSE, MAPE) |


```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# statsmodels dipakai nanti di Fase 2 & 3, kita cek importnya sudah jalan
import statsmodels.api as sm
from statsmodels.tsa.stattools import adfuller

from sklearn.metrics import mean_absolute_error, mean_squared_error

from pathlib import Path

print("Semua library berhasil di-import.")
```

    Semua library berhasil di-import.
    

## 0.3 — Opsi tampilan

Supaya output tabel enak dibaca (angka tidak jadi notasi ilmiah, kolom tidak terpotong).


```python
pd.set_option("display.max_columns", 50)
pd.set_option("display.width", 120)
pd.set_option("display.float_format", lambda x: f"{x:,.2f}")

# Pengaturan grafik default
sns.set_theme(style="whitegrid")
plt.rcParams["figure.figsize"] = (12, 4)
plt.rcParams["figure.dpi"] = 100

print("Opsi tampilan diset.")
```

    Opsi tampilan diset.
    

## 0.4 — Tentukan lokasi file data

Kita pakai `pathlib.Path` supaya path aman di Windows.

> **Penting:** kita **tidak menyalin** file data. Notebook hanya membaca dari lokasi asli.


```python
# Folder induk project (tempat file CSV berada)
BASE = Path(r"C:\Users\LENOVO\Documents\TOOUUGUAASS\SMT 5\BRIDA PROJECTS")

# Dua file data utama
FILE_HARIAN = BASE / "rekap_januari_2024_harian.csv"   # data mentah per pasar
FILE_REKAP  = BASE / "rekap_januari_2024_rekap.csv"    # agregat + kolom het_hapk

# Folder output (untuk simpan hasil nanti)
OUTPUT = Path(r"C:\Users\LENOVO\Documents\TOOUUGUAASS\SMT 5\BRIDA PROJECTS\notebooks\output")
OUTPUT.mkdir(exist_ok=True)

print("BASE  :", BASE)
print("OUTPUT:", OUTPUT)
```

    BASE  : C:\Users\LENOVO\Documents\TOOUUGUAASS\SMT 5\BRIDA PROJECTS
    OUTPUT: C:\Users\LENOVO\Documents\TOOUUGUAASS\SMT 5\BRIDA PROJECTS\notebooks\output
    

## 0.5 — Cek file data ada atau tidak


```python
for label, f in [("HARIAN (per pasar)", FILE_HARIAN), ("REKAP (agregat)", FILE_REKAP)]:
    status = "ADA" if f.exists() else "TIDAK ADA"
    print(f"[{status}] {label} -> {f.name}")
```

    [ADA] HARIAN (per pasar) -> rekap_januari_2024_harian.csv
    [ADA] REKAP (agregat) -> rekap_januari_2024_rekap.csv
    

## 0.6 — Tes baca data

Kalau dua sel berikut jalan tanpa error, berarti environment **lengkap & siap**.


```python
df_harian = pd.read_csv(FILE_HARIAN)
df_rekap  = pd.read_csv(FILE_REKAP)

print("Data harian :", df_harian.shape, "(baris, kolom)")
print("Data rekap  :", df_rekap.shape, "(baris, kolom)")
```

    Data harian : (13020, 9) (baris, kolom)
    Data rekap  : (1855, 6) (baris, kolom)
    


```python
df_harian.head()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>tanggal</th>
      <th>kategori</th>
      <th>komoditas</th>
      <th>satuan</th>
      <th>pasar</th>
      <th>harga</th>
      <th>rata_harian</th>
      <th>rata_hitung</th>
      <th>selisih_rata</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2024-01-01</td>
      <td>BERAS</td>
      <td>Beras Premium</td>
      <td>Kg</td>
      <td>Pasar Tambahrejo</td>
      <td>14,000.00</td>
      <td>13,985.71</td>
      <td>13,985.71</td>
      <td>0.00</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2024-01-01</td>
      <td>BERAS</td>
      <td>Beras Premium</td>
      <td>Kg</td>
      <td>Pasar Pucang Anom</td>
      <td>14,000.00</td>
      <td>13,985.71</td>
      <td>13,985.71</td>
      <td>0.00</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2024-01-01</td>
      <td>BERAS</td>
      <td>Beras Premium</td>
      <td>Kg</td>
      <td>Pasar Wonokromo</td>
      <td>13,900.00</td>
      <td>13,985.71</td>
      <td>13,985.71</td>
      <td>0.00</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2024-01-01</td>
      <td>BERAS</td>
      <td>Beras Premium</td>
      <td>Kg</td>
      <td>Pasar Genteng Baru</td>
      <td>14,000.00</td>
      <td>13,985.71</td>
      <td>13,985.71</td>
      <td>0.00</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2024-01-01</td>
      <td>BERAS</td>
      <td>Beras Premium</td>
      <td>Kg</td>
      <td>Pasar Pabean</td>
      <td>14,000.00</td>
      <td>13,985.71</td>
      <td>13,985.71</td>
      <td>0.00</td>
    </tr>
  </tbody>
</table>
</div>




```python
df_rekap.head()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>tanggal</th>
      <th>kategori</th>
      <th>komoditas</th>
      <th>harga_rata</th>
      <th>het_hapk</th>
      <th>fluktuasi</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2024-01-01</td>
      <td>BERAS</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
      <td>14.28571429</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2024-01-02</td>
      <td>BERAS</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
      <td>14.28571429</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2024-01-03</td>
      <td>BERAS</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
      <td>14.28571429</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2024-01-04</td>
      <td>BERAS</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
      <td>14.28571429</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2024-01-05</td>
      <td>BERAS</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
      <td>14.28571429</td>
    </tr>
  </tbody>
</table>
</div>



---

## 📝 LATIHAN (isi sendiri)

Sel di bawah ini bertanda `# TODO`. Coba isi & jalankan. Kalau bingung, lihat lagi sel-sel di atas.

**Latihan 1:** Tampilkan hanya kolom `tanggal`, `komoditas`, `harga` dari `df_harian` untuk 10 baris pertama.

**Petunjuk:** `.head(10)` dan bisa pilih kolom pakai `df[['kolom1', 'kolom2']]`.


```python
# TODO: tulis kode di bawah ini
# Contoh awal:
# df_harian[['tanggal', 'komoditas', 'harga']].head(10)
    
df_rekap[['tanggal', 'komoditas', 'harga_rata', 'het_hapk']].head(50)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>tanggal</th>
      <th>komoditas</th>
      <th>harga_rata</th>
      <th>het_hapk</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2024-01-01</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2024-01-02</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2024-01-03</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2024-01-04</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2024-01-05</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>5</th>
      <td>2024-01-06</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>6</th>
      <td>2024-01-07</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>7</th>
      <td>2024-01-08</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>8</th>
      <td>2024-01-09</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>9</th>
      <td>2024-01-10</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>10</th>
      <td>2024-01-11</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>11</th>
      <td>2024-01-12</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>12</th>
      <td>2024-01-13</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>13</th>
      <td>2024-01-14</td>
      <td>Beras Premium</td>
      <td>13,985.71</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>14</th>
      <td>2024-01-15</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>15</th>
      <td>2024-01-16</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>16</th>
      <td>2024-01-17</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>17</th>
      <td>2024-01-18</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>18</th>
      <td>2024-01-19</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>19</th>
      <td>2024-01-20</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>20</th>
      <td>2024-01-21</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>21</th>
      <td>2024-01-22</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>22</th>
      <td>2024-01-23</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>23</th>
      <td>2024-01-24</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>24</th>
      <td>2024-01-25</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>25</th>
      <td>2024-01-26</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>26</th>
      <td>2024-01-27</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>27</th>
      <td>2024-01-28</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>28</th>
      <td>2024-01-29</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>29</th>
      <td>2024-01-30</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>30</th>
      <td>2024-01-31</td>
      <td>Beras Premium</td>
      <td>14,000.00</td>
      <td>12,800.00</td>
    </tr>
    <tr>
      <th>31</th>
      <td>2024-01-01</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>32</th>
      <td>2024-01-02</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>33</th>
      <td>2024-01-03</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>34</th>
      <td>2024-01-04</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>35</th>
      <td>2024-01-05</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>36</th>
      <td>2024-01-06</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>37</th>
      <td>2024-01-07</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>38</th>
      <td>2024-01-08</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>39</th>
      <td>2024-01-09</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>40</th>
      <td>2024-01-10</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>41</th>
      <td>2024-01-11</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>42</th>
      <td>2024-01-12</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>43</th>
      <td>2024-01-13</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>44</th>
      <td>2024-01-14</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>45</th>
      <td>2024-01-15</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>46</th>
      <td>2024-01-16</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>47</th>
      <td>2024-01-17</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>48</th>
      <td>2024-01-18</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>49</th>
      <td>2024-01-19</td>
      <td>Beras IR.64 Medium Bulog</td>
      <td>10,900.00</td>
      <td>NaN</td>
    </tr>
  </tbody>
</table>
</div>



**Latihan 2:** Ada berapa **pasar unik** di `df_harian`?

**Petunjuk:** coba `df_harian['pasar'].nunique()` atau `df_harian['pasar'].unique()`.


```python
# TODO: tulis kode di bawah ini
df_rekap['fluktuasi'].unique()
```




    array(['14.28571429', '0', '#VALUE!', '-66.66666667', '1200',
           '-71.42857143', '428.5714286', '2100', '714.2857143', '-1000',
           '1000', '-1285.714286', '357.1428571', '-857.1428571',
           '-83.33333333', '857.1428571', '-571.4285714', '-416.6666667',
           '-333.3333333', '571.4285714', '11857.14286', '-285.7142857',
           '-33857.14286', '-428.5714286', '-4714.285714', '333.3333333',
           '142.8571429', '-833.3333333', '-2714.285714', '4000',
           '285.7142857', '-142.8571429'], dtype=object)



**Latihan 3:** Tampilkan jumlah baris data `df_rekap` untuk komoditas `'Beras Premium'`.

**Petunjuk:** filter dulu -> `df_rekap[df_rekap['komoditas'] == 'Beras Premium']`, lalu hitung jumlah barisnya dengan `len(...)` atau `.shape`.


```python
# TODO: tulis kode di bawah ini

```

---

### ✅ Selesai Fase 0 kalau:
- [ ] Semua sel di atas jalan tanpa error
- [ ] Kamu sudah coba 3 latihan tadi
- [ ] `check_env.py` di terminal juga sudah lolos

Kalau sudah, lanjut ke **Fase 1 (Load & Cleaning)** — kita akan bersihkan data ini dan menambah kolom `het_hapk`.
