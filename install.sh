npm install

cd client
npm run build

cd ..

rm -rf dist

npx electron-packager . Next-Pro-Editor --platform=win32 --arch=x64 --overwrite --out=dist --icon=icon.ico --ignore="(^/assets/sound-effects/.*|^/assets/musics/.*|^/assets/videos/.*|^client/node_modules/.*|node_modules|^node_modules/.*|client/node_modules/.*|client/node_modules)"

echo "Electron app packaged successfully!"
