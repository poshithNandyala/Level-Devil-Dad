#!/usr/bin/env bash
# Builds a sideloadable Android test APK of the current game, without Android Studio or Gradle.
# Needs Java 17+, Node 20+, curl and unzip. Tools are downloaded into android-test/.tools on first run.
# Output: android-test/build/LevelDevilDad-test.apk
set -euo pipefail
cd "$(dirname "$0")"
T=.tools
mkdir -p "$T" build
fetch() { [ -s "$T/$1" ] || curl -fsSL -o "$T/$1" "$2"; }
fetch apktool.jar https://github.com/iBotPeaches/Apktool/releases/download/v2.12.1/apktool_2.12.1.jar
fetch uber-apk-signer.jar https://github.com/patrickfav/uber-apk-signer/releases/download/v1.3.0/uber-apk-signer-1.3.0.jar
fetch android.jar https://raw.githubusercontent.com/Sable/android-platforms/master/android-34/android.jar
if [ ! -s "$T/dx.jar" ]; then
  fetch dex-tools.zip https://github.com/pxb1988/dex2jar/releases/download/v2.4/dex-tools-v2.4.zip
  unzip -p "$T/dex-tools.zip" '*/lib/dx-30.0.2.jar' > "$T/dx.jar"
fi

# the signing key is not in the repo: use yours (keep a copy!) or make a throwaway one. An APK only installs
# over the app already on the phone if both were signed with the same key.
if [ ! -s test-keystore.jks ]; then
  echo "No android-test/test-keystore.jks: making a new test key (this APK won't install over one signed with your old key)"
  keytool -genkeypair -keystore test-keystore.jks -alias ldd-test -storepass ldd-test-key -keypass ldd-test-key \
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Level Devil Dad test" >/dev/null 2>&1
fi

echo "1/5 web build"
(cd .. && npx vite build --mode single >/dev/null)

# the apk/ folder is a template: everything is assembled in build/apk, so the repo stays clean
rm -rf build/apk && cp -r apk build/apk && rm -rf build/apk/build build/apk/assets build/apk/classes.dex

echo "2/5 compile wrapper"
rm -rf build/classes && mkdir -p build/classes
javac --release 8 -Xlint:-options -nowarn -cp "$T/android.jar" -d build/classes src/com/poshith/leveldevildad/test/MainActivity.java
java -cp "$T/dx.jar" com.android.dx.command.Main --dex --min-sdk-version=26 --output=build/apk/classes.dex build/classes

echo "3/5 assets"
mkdir -p build/apk/assets
cp ../dist-single/index.html build/apk/assets/index.html
for d in mipmap-ldpi mipmap-mdpi mipmap-hdpi mipmap-xhdpi mipmap-xxhdpi mipmap-xxxhdpi mipmap-anydpi-v26; do
  mkdir -p "build/apk/res/$d" && cp ../android/app/src/main/res/$d/* "build/apk/res/$d/"
done
# every build gets a higher versionCode so it installs over the previous one
VC=$(( ($(date +%s) - 1767225600) / 60 ))
VN=$(node -p "require('../package.json').version")
sed -i -E "s/^(  versionCode: ).*/\1$VC/; s/^(  versionName: ).*/\1$VN/" build/apk/apktool.yml

echo "4/5 package"
java -jar "$T/apktool.jar" b build/apk -o build/unsigned.apk >/dev/null

echo "5/5 sign"
rm -rf build/out
java -jar "$T/uber-apk-signer.jar" -a build/unsigned.apk --ks test-keystore.jks --ksAlias ldd-test \
  --ksPass ldd-test-key --ksKeyPass ldd-test-key -o build/out >/dev/null
cp build/out/unsigned-aligned-signed.apk build/LevelDevilDad-test.apk
echo "Done: android-test/build/LevelDevilDad-test.apk (versionCode $VC)"
