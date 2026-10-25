# Physik Lernapp – Elektrostatik

Interaktive Lern-App zu den Notizen (Elektrisches Feld, Kondensator, Reihen-/Parallelschaltung,
Arbeitsdiagramm, RC-Kreis, Millikan, Formelsammlung, Aufgaben und Quiz).
Reines HTML/CSS/JavaScript (Ordner `www/`), per Capacitor als Android-App verpackt (`android/`).

## APK bauen

### Variante A: GitHub (kein Android Studio nötig)
1. Diesen Ordner als neues Repository auf github.com hochladen.
2. Reiter **Actions** → „APK bauen“ → **Run workflow** (läuft auch bei jedem Push).
3. Nach ca. 5 Minuten unter **Artifacts** die Datei `physik-lernapp-apk` laden, darin liegt `app-debug.apk`.
4. APK aufs Handy kopieren, antippen, „Installation aus unbekannten Quellen“ für den Dateimanager erlauben.

### Variante B: Android Studio
1. `npm install`
2. `npx cap sync android`
3. `npx cap open android` und in Android Studio **Build → Build APK(s)**.
   (Oder im Terminal: `cd android && ./gradlew assembleDebug`, die APK liegt dann in
   `android/app/build/outputs/apk/debug/app-debug.apk`.)

Voraussetzungen: Node 20+, JDK 21, Android SDK (kommt mit Android Studio).
Zielversion: Android 16 (API 36), mindestens Android 7 (API 24).

## Ohne Installation testen
`physik-lernapp.html` im Browser öffnen (alles in einer Datei).
