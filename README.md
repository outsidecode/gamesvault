# 🎮 GamesVault

Migración de `juegos.py` a app **multiplataforma** con:

- **Web** — corre directo en cualquier browser
- **Windows** — ejecutable nativo `.exe`
- **Android** — APK nativo

Stack: **React + TypeScript + Tailwind + Tauri v2 + SQLite**

---

## 📦 Prerequisitos

### Para Web solamente
```
Node.js 18+
```

### Para Windows + Android (Tauri)
```
Node.js 18+
Rust (https://rustup.rs)
```

### Para Android específicamente
```
Android Studio
Android SDK
NDK (instalado desde SDK Manager en Android Studio)
JDK 17+
```
Variables de entorno requeridas para Android:
```
JAVA_HOME = C:\Program Files\Android\Android Studio\jbr
ANDROID_HOME = C:\Users\<user>\AppData\Local\Android\Sdk
NDK_HOME = %ANDROID_HOME%\ndk\<version>
```

---

## 🚀 Instalación

```bash
npm install
```

---

## 🔧 Comandos

### Modo Web (browser)
```bash
npm run dev
# Abre http://localhost:1420
# Usa localStorage como base de datos
```

### Modo Desktop Windows
```bash
npm run tauri dev          # Desarrollo con hot-reload
npm run tauri build        # Compila .exe instalador
```
El .exe queda en `src-tauri/target/release/bundle/`

### Modo Android
```bash
npm run tauri android init   # Solo la primera vez
npm run tauri android dev    # Conectar dispositivo/emulador y correr
npm run tauri android build  # Genera APK
```
El APK queda en `src-tauri/gen/android/app/build/outputs/apk/`

---

## 🗄️ Base de datos

| Entorno  | Motor     | Ubicación                                           |
|----------|-----------|-----------------------------------------------------|
| Web      | localStorage | Browser local del usuario                        |
| Windows  | SQLite    | `%APPDATA%\com.gamesvault.app\gamesvault.db`        |
| Android  | SQLite    | `/data/data/com.gamesvault.app/databases/`          |

La capa `src/db/index.ts` detecta automáticamente el entorno y usa el motor correcto. **No hay Supabase, no hay servidor.**

---

## 📁 Estructura del proyecto

```
gamesvault/
├── src/
│   ├── db/index.ts          ← Capa DB isomórfica (SQLite / localStorage)
│   ├── hooks/useJuegos.ts   ← Toda la lógica de negocio
│   ├── types/index.ts       ← Tipos TypeScript
│   ├── components/
│   │   ├── ui.tsx           ← Componentes base (Btn, Input, Modal, Toast...)
│   │   ├── PlataformaTab.tsx ← CRUD por plataforma
│   │   ├── InicioPage.tsx   ← Dashboard con stats y buscador
│   │   ├── WishlistPage.tsx ← Lista de deseos
│   │   └── OtherPages.tsx   ← Favoritos + Estadísticas
│   ├── App.tsx              ← Navegación principal con sidebar
│   └── main.tsx
├── src-tauri/               ← Backend Rust (solo para desktop/Android)
│   ├── src/lib.rs
│   ├── tauri.conf.json
│   └── capabilities/
│       ├── desktop.json
│       └── mobile.json
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 🔄 Migrar datos de juegos.py

Si ya tenías datos en `juegos_data/lista_juegos.json`, puedes importarlos desde la consola del browser:

```js
// Pega esto en DevTools > Console con la app web abierta
const data = { /* pega aquí el contenido de lista_juegos.json */ };
const store = JSON.parse(localStorage.getItem('gamesvault_data') || '{}');
// Los juegos se agregan uno a uno desde la UI, o escribe un script de migración
```

---

## 🤝 Comparación con juegos.py

| Feature          | juegos.py (tkinter) | GamesVault (Tauri) |
|------------------|--------------------|--------------------|
| Plataformas      | ✅                  | ✅                  |
| PS sub-tabs      | ✅                  | ✅                  |
| Progreso         | ✅                  | ✅                  |
| Historial        | ✅                  | ✅                  |
| Favoritos        | ✅                  | ✅                  |
| Notas por juego  | ✅                  | ✅                  |
| Wishlist         | ✅                  | ✅                  |
| Estadísticas     | ✅                  | ✅                  |
| Buscador global  | ✅                  | ✅                  |
| Mover entre plat.| ✅                  | ✅                  |
| Web              | ❌                  | ✅                  |
| Android          | ❌                  | ✅                  |
| Windows nativo   | ✅ (requiere Python)| ✅ (exe standalone) |
| Base de datos    | JSON files          | SQLite / localStorage |
