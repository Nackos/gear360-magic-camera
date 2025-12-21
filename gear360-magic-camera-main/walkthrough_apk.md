# Guide de Génération de l'APK - Gear360 Magic Camera

J'ai généré avec succès l'APK de version Release pour le projet **Gear360 Magic Camera**.

## Étapes de Construction effectuées le 21/12/2025

1.  **Build des Assets Web** : `npm run build` pour compiler l'application React/Vite dans le dossier `dist`.
2.  **Sync Capacitor** : `npx cap sync android` pour synchroniser le dossier `dist` avec les assets du projet Android.
3.  **Build Android** : `./gradlew assembleRelease` dans le dossier `android`.
    *   *Note* : L'`ANDROID_HOME` a été configuré sur le chemin local du SDK (`C:\Users\Administrator\AppData\Local\Android\Sdk`).
    *   *Signature* : Le build utilise la configuration existante dans `release-key.jks` et `keystore.properties`.

## Emplacement de l'APK généré

L'APK final se trouve dans le projet local à cet emplacement (non suivi par Git) :
`android/app/build/outputs/apk/release/app-release.apk`

---
*Généré par Antigravity*
