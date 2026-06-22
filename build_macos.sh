#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

PYTHON="${PYTHON:-$ROOT_DIR/.venv-macos/bin/python}"
APP_NAME="OnXTrue"
VERSION="${ONXTRUE_VERSION:-0.1.0}"
IDENTITY="${ONXTRUE_CODESIGN_IDENTITY:--}"
export PYINSTALLER_CONFIG_DIR="$ROOT_DIR/build/pyinstaller-cache"
ARCH="$("$PYTHON" -c 'import platform; print(platform.machine())')"
DMG_PATH="dist/$APP_NAME-$VERSION-macOS-$ARCH.dmg"

if [[ ! -x "$PYTHON" ]]; then
  echo "Python environment not found at $PYTHON"
  echo "Create .venv-macos with a native Python and install requirements-macos.txt first."
  exit 1
fi

for asset in \
  static/vendor/three/three.core.js \
  static/vendor/three/three.module.js \
  static/vendor/three/addons/controls/OrbitControls.js \
  static/vendor/three/addons/loaders/STLLoader.js
do
  if [[ ! -f "$asset" ]]; then
    echo "Missing offline asset: $asset"
    exit 1
  fi
done

rm -rf build "dist/$APP_NAME.app" "$DMG_PATH"

"$PYTHON" -m PyInstaller \
  --noconfirm \
  --clean \
  --windowed \
  --name "$APP_NAME" \
  --osx-bundle-identifier "com.onxtrue.desktop" \
  --add-data "templates:templates" \
  --add-data "static:static" \
  --hidden-import webview.platforms.cocoa \
  desktop.py

/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION" "dist/$APP_NAME.app/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Add :CFBundleVersion string $VERSION" "dist/$APP_NAME.app/Contents/Info.plist"
codesign --force --deep --sign "$IDENTITY" "dist/$APP_NAME.app"

DMG_ROOT="build/dmg"
mkdir -p "$DMG_ROOT"
cp -R "dist/$APP_NAME.app" "$DMG_ROOT/"
ln -s /Applications "$DMG_ROOT/Applications"

hdiutil create \
  -volname "$APP_NAME" \
  -srcfolder "$DMG_ROOT" \
  -ov \
  -format UDZO \
  "$DMG_PATH"

echo "Built $DMG_PATH"
