# 03 — Eksplorasi & Dekomposisi (Fase 2)

**Input:** `output/data_bersih_22.csv` (hasil Fase 1).
**Tujuan:** memahami pola data sebelum pemodelan.

### Catatan realistis
Tiap seri cuma **31 titik harian**. Jadi:
- Dekomposisi musiman (period 7) **terbatas** — kita lihat, tapi jangan over-interpretasi.
- Fokus ke: gambaran tren, volatilitas, stasioneritas (ADF), ACF/PACF, dan pola status EWS.

### Bab
1. Load data bersih
2. Ringkasan per komoditas (rata-rata, min, max, volatilitas)
3. Visualisasi tren semua komoditas
4. Analisis volatilitas (Koefisien Variasi)
5. Uji stasioneritas (ADF) + differencing
6. ACF / PACF
7. Dekomposisi (tren & musiman, period=7)
8. Pola status EWS (kapan Waspada/Intervensi)
9. Ringkasan temuan


```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

from statsmodels.tsa.stattools import adfuller
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
from statsmodels.tsa.seasonal import seasonal_decompose

pd.set_option("display.max_columns", 60)
pd.set_option("display.width", 150)
sns.set_theme(style="whitegrid")
plt.rcParams["figure.figsize"] = (12, 5)

NOTE = Path(r"C:\Users\LENOVO\Documents\TOOUUGUAASS\SMT 5\BRIDA PROJECTS\notebooks")
OUTPUT = NOTE / "output"
df = pd.read_csv(OUTPUT / "data_bersih_22.csv", parse_dates=["tanggal"])
print("Shape:", df.shape)
print("Komoditas:", df["komoditas"].nunique())
print("Rentang:", df["tanggal"].min().date(), "s/d", df["tanggal"].max().date())
```

    Shape: (651, 10)
    Komoditas: 21
    Rentang: 2024-01-01 s/d 2024-01-31
    

## Bab 2 — Ringkasan per komoditas


```python
def cv(x):
    x = x.dropna()
    return x.std() / x.mean() if x.mean() else np.nan

ringkas = (
    df.groupby(["kode_ews", "komoditas", "basis_ews"])
      .agg(
          harga_min=("harga_rata", "min"),
          harga_rata=("harga_rata", "mean"),
          harga_max=("harga_rata", "max"),
          harga_std=("harga_rata", "std"),
          het=("het_hapk", "first"),
          n_harga=("harga_rata", "count"),
      )
      .reset_index()
)
ringkas["rentang"] = ringkas["harga_max"] - ringkas["harga_min"]
ringkas["cv"] = ringkas.apply(lambda r: cv(df[df["kode_ews"] == r["kode_ews"]]["harga_rata"]), axis=1)
ringkas["pct_di_atas_het"] = ringkas.apply(
    lambda r: (df[(df["kode_ews"] == r["kode_ews"]) & df["het_hapk"].notna()]["harga_rata"]
               > r["het"]).mean() * 100 if pd.notna(r["het"]) else np.nan, axis=1)

ringkas = ringkas.sort_values("cv", ascending=False)
print("Ringkasan per komoditas (urut volatilitas tertinggi):")
print(ringkas.to_string(index=False, float_format=lambda x: f"{x:,.2f}"))
ringkas.to_csv(OUTPUT / "ringkasan_eksplorasi.csv", index=False)
```


    ---------------------------------------------------------------------------

    KeyError                                  Traceback (most recent call last)

    Cell In[2], line 6
          2     x = x.dropna()
          3     return x.std() / x.mean() if x.mean() else np.nan
          5 ringkas = (
    ----> 6     df.groupby(["kode_ews", "komoditas", "basis_ews"])
          7       .agg(
          8           harga_min=("harga_rata", "min"),
          9           harga_rata=("harga_rata", "mean"),
         10           harga_max=("harga_rata", "max"),
         11           harga_std=("harga_rata", "std"),
         12           het=("het_hapk", "first"),
         13           n_harga=("harga_rata", "count"),
         14       )
         15       .reset_index()
         16 )
         17 ringkas["rentang"] = ringkas["harga_max"] - ringkas["harga_min"]
         18 ringkas["cv"] = ringkas.apply(lambda r: cv(df[df["kode_ews"] == r["kode_ews"]]["harga_rata"]), axis=1)
    

    File c:\Users\LENOVO\anaconda3\Lib\site-packages\pandas\core\frame.py:9210, in DataFrame.groupby(self, by, axis, level, as_index, sort, group_keys, observed, dropna)
       9207 if level is None and by is None:
       9208     raise TypeError("You have to supply one of 'by' and 'level'")
    -> 9210 return DataFrameGroupBy(
       9211     obj=self,
       9212     keys=by,
       9213     axis=axis,
       9214     level=level,
       9215     as_index=as_index,
       9216     sort=sort,
       9217     group_keys=group_keys,
       9218     observed=observed,
       9219     dropna=dropna,
       9220 )
    

    File c:\Users\LENOVO\anaconda3\Lib\site-packages\pandas\core\groupby\groupby.py:1331, in GroupBy.__init__(self, obj, keys, axis, level, grouper, exclusions, selection, as_index, sort, group_keys, observed, dropna)
       1328 self.dropna = dropna
       1330 if grouper is None:
    -> 1331     grouper, exclusions, obj = get_grouper(
       1332         obj,
       1333         keys,
       1334         axis=axis,
       1335         level=level,
       1336         sort=sort,
       1337         observed=False if observed is lib.no_default else observed,
       1338         dropna=self.dropna,
       1339     )
       1341 if observed is lib.no_default:
       1342     if any(ping._passed_categorical for ping in grouper.groupings):
    

    File c:\Users\LENOVO\anaconda3\Lib\site-packages\pandas\core\groupby\grouper.py:1043, in get_grouper(obj, key, axis, level, sort, observed, validate, dropna)
       1041         in_axis, level, gpr = False, gpr, None
       1042     else:
    -> 1043         raise KeyError(gpr)
       1044 elif isinstance(gpr, Grouper) and gpr.key is not None:
       1045     # Add key to exclusions
       1046     exclusions.add(gpr.key)
    

    KeyError: 'basis_ews'


## Bab 3 — Visualisasi tren semua komoditas


```python
# Karena skala harga beda jauh (Rp 3.000 vs Rp 120.000), pakai indeks 100 = hari pertama
fig, ax = plt.subplots(figsize=(13, 6))
for kode, g in df.groupby("kode_ews"):
    g = g.sort_values("tanggal")
    if g["harga_rata"].notna().sum() == 0:
        continue
    dasar = g["harga_rata"].dropna().iloc[0]
    ax.plot(g["tanggal"], g["harga_rata"] / dasar * 100, marker="o", ms=3, lw=1, label=kode)
ax.axhline(100, color="gray", ls="--", lw=1)
ax.set_title("Tren harga (indeks: hari-1 = 100) — 22 komoditas EWS inti")
ax.set_xlabel("Tanggal"); ax.set_ylabel("Indeks harga")
ax.legend(ncol=4, fontsize=7, loc="upper left", bbox_to_anchor=(1.0, 1.0))
plt.tight_layout(); plt.savefig(OUTPUT / "tren_indeks.png", dpi=110); plt.close("all")
print("Disimpan: tren_indeks.png")
```

    Disimpan: tren_indeks.png
    


```python
# Grafik harga absolut per komoditas (semua panel terpisah)
kodes = sorted(df["kode_ews"].dropna().unique())
fig, axes = plt.subplots(7, 3, figsize=(15, 20))
axes = axes.ravel()
for i, kode in enumerate(kodes):
    g = df[df["kode_ews"] == kode].sort_values("tanggal")
    ax = axes[i]
    ax.plot(g["tanggal"], g["harga_rata"], marker="o", ms=3, lw=1.2, color="steelblue")
    if g["het_hapk"].notna().any():
        ax.axhline(g["het_hapk"].iloc[0], color="red", ls="--", lw=1.2)
        ax.axhline(g["het_hapk"].iloc[0] * 1.05, color="orange", ls=":", lw=1)
    ax.set_title(f"{kode}: {g['komoditas'].iloc[0][:28]}", fontsize=9)
    ax.tick_params(labelsize=7)
for j in range(len(kodes), len(axes)):
    axes[j].axis("off")
plt.tight_layout(); plt.savefig(OUTPUT / "tren_per_komoditas.png", dpi=110); plt.close("all")
print("Disimpan: tren_per_komoditas.png (garis merah = HET, oranye = HET+5%)")
```

    Disimpan: tren_per_komoditas.png (garis merah = HET, oranye = HET+5%)
    

## Bab 4 — Volatilitas (Koefisien Variasi)

CV = std / mean. Makin besar → makin fluktuatif. Berguna untuk prioritas EWS.


```python
v = ringkas[ringkas["n_harga"] > 0].sort_values("cv", ascending=False)
plt.figure(figsize=(12, 6))
sns.barplot(data=v, y="kode_ews", x="cv", hue="basis_ews", dodge=False)
plt.title("Volatilitas (Koefisien Variasi) per komoditas")
plt.xlabel("CV (std/mean)"); plt.ylabel("Kode EWS")
plt.tight_layout(); plt.savefig(OUTPUT / "volatilitas.png", dpi=110); plt.close("all")
print("Top 5 paling fluktuatif:")
print(v[["kode_ews", "komoditas", "cv", "rentang"]].head(5).to_string(index=False))
```

    Top 5 paling fluktuatif:
    kode_ews                       komoditas       cv     rentang
         K11          Cabe Merah Kecil-Rawit 0.281512 34857.14286
          K9                Cabe Merah Besar 0.106297 17428.57142
          K2   Bawang Merah (Kualitas Lokal) 0.053525  5714.28572
         K10              Cabe Merah Kriting 0.043038  7714.28571
         K30 Ikan Tongkol Segar (Uk. Sedang) 0.019516  2000.00000
    

## Bab 5 — Uji stasioneritas (ADF)

- **p-value < 0.05** → stasioner (sudah baik untuk ARIMA).
- Kalau tidak stasioner → perlu differencing.

> Hati-hati: dengan 31 titik, hasil ADF kurang kuat. Ini indikasi awal saja.


```python
hasil_adf = []
for kode, g in df.groupby("kode_ews"):
    s = g.sort_values("tanggal")["harga_rata"].dropna()
    if len(s) < 8:
        continue
    try:
        p = adfuller(s, autolag="AIC")[1]
        # differencing 1x
        p_diff = adfuller(s.diff().dropna(), autolag="AIC")[1]
    except Exception as e:
        p, p_diff = np.nan, np.nan
    hasil_adf.append({
        "kode_ews": kode,
        "n": len(s),
        "adf_p": round(p, 4) if pd.notna(p) else np.nan,
        "stasioner": "Ya" if pd.notna(p) and p < 0.05 else "Tidak",
        "adf_p_diff": round(p_diff, 4) if pd.notna(p_diff) else np.nan,
        "stasioner_setelah_diff": "Ya" if pd.notna(p_diff) and p_diff < 0.05 else "Tidak",
        "d": 0 if pd.notna(p) and p < 0.05 else 1,
    })
adf_df = pd.DataFrame(hasil_adf).sort_values("kode_ews")
print(adf_df.to_string(index=False))
adf_df.to_csv(OUTPUT / "hasil_adf.csv", index=False)
```

    kode_ews  n  adf_p stasioner  adf_p_diff stasioner_setelah_diff  d
         K10 31 0.0840     Tidak      0.0000                     Ya  1
         K11 31 0.0024        Ya      0.6615                  Tidak  0
         K14 31 0.4724     Tidak      0.0000                     Ya  1
         K16 31    NaN     Tidak         NaN                  Tidak  1
         K17 31    NaN     Tidak         NaN                  Tidak  1
          K2 31 0.9978     Tidak      0.0000                     Ya  1
         K24 31 0.2044     Tidak      0.1870                  Tidak  1
         K26 31 0.5255     Tidak      0.0018                     Ya  1
         K28 31 0.4964     Tidak      0.0360                     Ya  1
         K29 31 0.2875     Tidak      0.0000                     Ya  1
          K3 31 0.8901     Tidak      0.0000                     Ya  1
         K30 31 0.6113     Tidak      0.0000                     Ya  1
         K34 31 0.3974     Tidak      0.0000                     Ya  1
         K36 31    NaN     Tidak         NaN                  Tidak  1
          K4 31 0.5095     Tidak      0.0000                     Ya  1
         K42 31 0.4967     Tidak      0.2212                  Tidak  1
         K43 31    NaN     Tidak         NaN                  Tidak  1
          K5 31 0.7262     Tidak      0.0000                     Ya  1
          K7 31    NaN     Tidak         NaN                  Tidak  1
          K9 31 0.7890     Tidak      0.0000                     Ya  1
    

    c:\Users\LENOVO\anaconda3\Lib\site-packages\statsmodels\regression\linear_model.py:955: RuntimeWarning: divide by zero encountered in log
      llf = -nobs2*np.log(2*np.pi) - nobs2*np.log(ssr / nobs) - nobs2
    c:\Users\LENOVO\anaconda3\Lib\site-packages\statsmodels\regression\linear_model.py:955: RuntimeWarning: divide by zero encountered in log
      llf = -nobs2*np.log(2*np.pi) - nobs2*np.log(ssr / nobs) - nobs2
    

## Bab 6 — ACF / PACF

ACF/PACF membantu menentukan orde ARIMA (p, q). Kita lihat 3 komoditas contoh.


```python
contoh = ["K5", "K10", "K2"]  # Beras Premium, Cabe Kriting, Bawang Merah
fig, axes = plt.subplots(len(contoh), 2, figsize=(13, 9))
for i, kode in enumerate(contoh):
    s = df[df["kode_ews"] == kode].sort_values("tanggal")["harga_rata"].dropna()
    plot_acf(s, ax=axes[i, 0], lags=min(12, len(s) // 2 - 1), title=f"ACF — {kode}")
    plot_pacf(s, ax=axes[i, 1], lags=min(12, len(s) // 2 - 1), title=f"PACF — {kode}", method="ywm")
plt.tight_layout(); plt.savefig(OUTPUT / "acf_pacf.png", dpi=110); plt.close("all")
print("Disimpan: acf_pacf.png")
```

    Disimpan: acf_pacf.png
    

## Bab 7 — Dekomposisi (tren & musiman, period=7)

> 31 titik ÷ 7 ≈ 4 siklus mingguan. Hasilnya **indikatif**, bukan konklusif.


```python
contoh2 = ["K5", "K9", "K24"]  # Beras Premium, Cabe Merah Besar, Gula
for kode in contoh2:
    s = df[df["kode_ews"] == kode].sort_values("tanggal").set_index("tanggal")["harga_rata"].dropna()
    if len(s) < 14:
        print(f"{kode}: data < 14, skip dekomposisi")
        continue
    res = seasonal_decompose(s, model="additive", period=7, extrapolate_trend="freq")
    fig = res.plot(); fig.set_size_inches(12, 8)
    plt.suptitle(f"Dekomposisi — {kode}", y=1.02)
    plt.tight_layout(); plt.savefig(OUTPUT / f"dekomposisi_{kode}.png", dpi=110); plt.close("all")
print("Dekomposisi disimpan untuk:", contoh2)
```

    Dekomposisi disimpan untuk: ['K5', 'K9', 'K24']
    

## Bab 8 — Pola status EWS

Kapan saja komoditas masuk Waspada / Intervensi?


```python
basis_het = df[(df["basis_ews"] == "HET") & df["status_ews"].notna()]

# Matriks: komoditas x status
mat = basis_het.pivot_table(index="kode_ews", columns="status_ews", values="tanggal", aggfunc="count", fill_value=0)
print("Jumlah hari per status (basis HET):")
print(mat.to_string())

plt.figure(figsize=(11, 5))
mat.plot(kind="bar", stacked=True, ax=plt.gca(), color={"Aman": "#4caf50", "Waspada": "#ff9800", "Intervensi": "#f44336"})
plt.title("Distribusi status EWS per komoditas (basis HET)")
plt.ylabel("Jumlah hari"); plt.xlabel("Kode EWS")
plt.tight_layout(); plt.savefig(OUTPUT / "status_ews_per_komoditas.png", dpi=110); plt.close("all")
print("Disimpan: status_ews_per_komoditas.png")
```

    Jumlah hari per status (basis HET):
    status_ews  Aman  Intervensi  Waspada
    kode_ews                             
    K10           27           0        4
    K11           28           3        0
    K14           31           0        0
    K16            0          31        0
    K17            0          31        0
    K2            31           0        0
    K24            0          31        0
    K3            31           0        0
    K34           31           0        0
    K36           31           0        0
    K4            31           0        0
    K42           31           0        0
    K5             0          31        0
    Disimpan: status_ews_per_komoditas.png
    

## Bab 9 — Ringkasan temuan

Isi manual setelah melihat semua output di atas.



```python
print("=== RINGKASAN FASE 2 ===")
print("Total komoditas  :", df["kode_ews"].nunique())
print("Basis HET        :", df[df['basis_ews']=='HET']['kode_ews'].nunique())
print("Basis fluktuasi  :", df[df['basis_ews']=='fluktuasi']['kode_ews'].nunique())
print("Paling fluktuatif:", v.iloc[0]['kode_ews'], "-", v.iloc[0]['komoditas'])
print("Selalu Intervensi:", sorted(mat[mat.get('Intervensi', 0) == mat.sum(axis=1)].index.tolist()))
print("Stasioner (alpha .05):", (adf_df['stasioner']=='Ya').sum(), "dari", len(adf_df))
```

    === RINGKASAN FASE 2 ===
    Total komoditas  : 21
    Basis HET        : 14
    Basis fluktuasi  : 7
    Paling fluktuatif: K11 - Cabe Merah Kecil-Rawit
    Selalu Intervensi: ['K16', 'K17', 'K24', 'K5']
    Stasioner (alpha .05): 1 dari 20
    
