@echo off
setlocal enabledelayedexpansion

:: Script untuk memulai proyek Next Pro Editor
:: Script ini akan menginstal semua dependensi dan menjalankan server serta aplikasi Electron

echo Menginstal dependensi utama proyek...
call npm install

echo Menginstal dependensi untuk klien (frontend)...
cd client
call npm install
cd ..

echo Menginstal dependensi untuk server (backend)...
cd server
call npm install
cd ..

echo Memulai aplikasi Electron...
cd electron
call npm start
cd .. 