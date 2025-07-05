cd client && npm install && npm run build && cd ..

npm install && npx electron-packager . Next-Pro-Editor --platform=win32 --arch=x64 --overwrite --out=dist --icon=icon.ico --ignore="^/assets/sound-effects/.*|^/assets/musics/.*|^/assets/videos/.*|client/node_modules/.*"
