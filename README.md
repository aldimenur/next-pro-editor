# 🎬 Next Pro Editor

## 📋 TODO List

- [x] **yt-dlp Integration**: Download videos dan audio dari YouTube, TikTok, Instagram, dan platform lainnya
- [ ] Tambahkan fitur scan asset otomatis: Bisa add asset dengan scan seluruh folder jika memiliki ekstensi yang didukung akan langsung bisa ter-import

## 🆕 Fitur Terbaru - YouTube & Video Downloader

Aplikasi sekarang mendukung download video dan audio dari berbagai platform menggunakan **yt-dlp + FFmpeg** yang sudah dibundel:

### 🎯 Platform yang Didukung
- YouTube
- TikTok  
- Instagram
- Twitter/X
- Vimeo
- Facebook
- Dan 1000+ situs lainnya

### ⚡ Fitur Download
- Download video dalam berbagai kualitas (720p, 1080p, 4K)
- Extract audio saja (MP3) dengan FFmpeg
- Auto-import ke kategori asset yang sesuai
- Progress tracking real-time
- Batch downloads
- Thumbnail preview sebelum download
- **No external dependencies** - semua tools sudah dibundel!

Next Pro Editor adalah aplikasi desktop inovatif yang dirancang untuk memudahkan pengeditan dan manajemen multimedia. Dengan menggunakan teknologi terkini, aplikasi ini menawarkan pengalaman pengguna yang mulus dan powerful.

---

## ✨ Fitur Utama

- 🎥 **Pemutaran Video Canggih**
- 🎵 **Pemutar Audio Terintegrasi**
- 📥 **YouTube & Video Downloader (yt-dlp Integration)**
- 💻 **Antarmuka Responsif dan Modern**
- 🖥️ **Kompatibilitas Lintas Platform**
- 🔧 **Konfigurasi Fleksibel**

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React  
- **Desktop Framework**: Electron  
- **Styling**: Tailwind CSS  
- **Backend**: Node.js  
- **Bahasa Pemrograman**: JavaScript / TypeScript

---

## 🚦 Prasyarat

Pastikan Anda telah menginstal:

- [Node.js](https://nodejs.org/) (v14 atau lebih baru)  
- [npm](https://www.npmjs.com/) (v6 atau lebih baru)  
- [Git](https://git-scm.com/)

---

## 🔧 Instalasi

### 1. Clone repositori

```bash
git clone https://github.com/aldimenur/next-pro-editor.git
cd next-pro-editor
```

### 2. Instal dependensi

```bash
npm install
```

### 3. Setup yt-dlp & FFmpeg (Otomatis)

yt-dlp dan FFmpeg sudah **dibundel langsung** dengan aplikasi! Tidak perlu instalasi manual.

**yt-dlp (Video Downloader):**
- ✅ **Windows**: yt-dlp.exe (18MB)
- ✅ **Linux**: yt-dlp binary (3MB)  
- ✅ **macOS**: yt-dlp binary (34MB)

**FFmpeg (Video Processing):**
- ✅ **Windows**: ffmpeg.exe (172MB)
- ✅ **Linux**: ffmpeg binary (76MB)
- ✅ **macOS**: ffmpeg binary (76MB)

Binaries akan diunduh otomatis saat pertama kali menjalankan `npm install`.

---

## 🏃‍♂️ Menjalankan Aplikasi

### ▶ Mode Pengembangan

```bash
npm run dev
```

### 🛠 Build Aplikasi

```bash
# Build React client saja
npm run build

# Build aplikasi lengkap (dengan yt-dlp binaries)
npm run build-app
```

**Build aplikasi lengkap** akan:
- ✅ Download yt-dlp & FFmpeg binaries terbaru
- ✅ Build React frontend
- ✅ Package Electron app
- ✅ Include semua dependencies
- 🚀 **Hasil akhir**: Aplikasi siap distribusi tanpa perlu instalasi external tools!

---

## 📦 Struktur Proyek

```
next-pro-editor/
├── public/             # Berkas statis
├── src/
│   ├── assets/         # Gambar dan media
│   ├── components/     # Komponen UI
│   ├── main/           # Entry point Electron
│   ├── renderer/       # Halaman React
│   └── styles/         # Tailwind & CSS
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 🤝 Kontribusi

Kami sangat terbuka terhadap kontribusi! Untuk berkontribusi:

1. Fork repositori ini  
2. Buat branch fitur baru  
   ```bash
   git checkout -b fitur/AmazingFeature
   ```
3. Commit perubahan Anda  
   ```bash
   git commit -m "Tambahkan fitur keren"
   ```
4. Push ke branch  
   ```bash
   git push origin fitur/AmazingFeature
   ```
5. Buka **Pull Request**

---

## 🐛 Melaporkan Masalah

Jika Anda menemukan bug, silakan buka [Issue baru](https://github.com/aldimenur/next-pro-editor/issues) di repositori.

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah [Lisensi MIT](LICENSE).

---

## 📞 Kontak

**Aldiansyah** – [aldimenur@gmail.com](mailto:aldimenur@gmail.com)  
GitHub: [https://github.com/aldimenur](https://github.com/aldimenur)  
Proyek: [https://github.com/aldimenur/next-pro-editor](https://github.com/aldimenur/next-pro-editor)

---

## ⭐ Dukung Proyek Ini

Berikan ⭐ di GitHub jika proyek ini membantu Anda!