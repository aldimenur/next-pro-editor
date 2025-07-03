#!/bin/bash

# Script untuk memulai proyek Next Pro Editor
# Script ini akan menginstal semua dependensi dan menjalankan server serta aplikasi Electron

echo "Menginstal dependensi utama proyek..."
npm install

echo "Menginstal dependensi untuk klien (frontend)..."
cd client
npm install
cd ..

echo "Menginstal dependensi untuk server (backend)..."
cd server
npm install
cd ..

echo "Memulai aplikasi Electron..."
cd electron
npm start 