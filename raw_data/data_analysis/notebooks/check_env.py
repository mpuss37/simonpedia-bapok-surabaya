"""
check_env.py — Verifikasi environment untuk project analisis deret waktu.

Jalankan di terminal:  python check_env.py

Skrip ini mengecek:
1. Versi Python
2. Semua paket yang dibutuhkan sudah terpasang atau belum
3. File data yang dibutuhkan ada atau tidak

Kalau ada yang bertanda [X], lihat README.md bagian "Troubleshooting".
"""

import sys
import importlib

# Paksa output UTF-8 supaya karakter khusus aman di console Windows
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

# --- 1. Cek versi Python -------------------------------------------------
print("=" * 60)
print("CEK ENVIRONMENT — Analisis Deret Waktu Harga Bapok Surabaya")
print("=" * 60)
print(f"\n[Python] versi {sys.version.split()[0]}")
print(f"[Python] lokasi: {sys.executable}")
if sys.version_info >= (3, 10):
    print("[OK] Versi Python didukung (>= 3.10).")
else:
    print("[X ] Versi Python terlalu lama. Disarankan >= 3.10.")

# --- 2. Cek paket yang dibutuhkan ---------------------------------------
# Format: (nama_paket_import, nama_paket_pip)
PAKET = [
    ("pandas", "pandas"),
    ("numpy", "numpy"),
    ("matplotlib", "matplotlib"),
    ("seaborn", "seaborn"),
    ("statsmodels", "statsmodels"),
    ("sklearn", "scikit-learn"),
    ("openpyxl", "openpyxl"),
]

print("\n" + "-" * 60)
print("PAKET YANG DIBUTUHKAN")
print("-" * 60)

kurang = []
for modul, nama_pip in PAKET:
    try:
        m = importlib.import_module(modul)
        versi = getattr(m, "__version__", "?")
        print(f"[OK] {nama_pip:<15} terpasang (versi {versi})")
    except Exception:
        print(f"[X ] {nama_pip:<15} BELUM terpasang")
        kurang.append(nama_pip)

# Paket opsional
print("\n" + "-" * 60)
print("PAKET OPSIONAL")
print("-" * 60)
try:
    m = importlib.import_module("pmdarima")
    print(f"[OK] pmdarima        terpasang (versi {getattr(m, '__version__', '?')})")
except Exception:
    print("[--] pmdarima        tidak ada (tidak wajib — pakai grid order manual)")

# --- 3. Cek file data ----------------------------------------------------
from pathlib import Path

print("\n" + "-" * 60)
print("FILE DATA")
print("-" * 60)

BASE = Path(r"C:\Users\LENOVO\Documents\TOOUUGUAASS\SMT 5\BRIDA PROJECTS")
FILES = [
    ("Data harian per pasar", BASE / "rekap_januari_2024_harian.csv"),
    ("Data rekap + het_hapk", BASE / "rekap_januari_2024_rekap.csv"),
    ("Master komoditas EWS", BASE / "database-ews" / "seed_komoditas.json"),
]

for label, path in FILES:
    if path.exists():
        ukuran = path.stat().st_size / 1024
        print(f"[OK] {label:<24} ada ({ukuran:,.0f} KB)")
    else:
        print(f"[X ] {label:<24} TIDAK DITEMUKAN: {path}")

# --- 4. Ringkasan --------------------------------------------------------
print("\n" + "=" * 60)
if not kurang:
    print("HASIL: Environment SIAP. Semua paket wajib terpasang.")
    print("Lanjut buka notebook 01_persiapan.ipynb")
else:
    print("HASIL: Masih ada paket yang kurang. Jalankan:")
    print(f"  python -m pip install {' '.join(kurang)}")
print("=" * 60)
