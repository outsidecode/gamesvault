/**
 * migrate.js — Script de migración de datos desde juegos.py
 *
 * USO (en DevTools > Console con la app web abierta en http://localhost:1420):
 *
 *   1. Abre DevTools (F12) > Console
 *   2. Pega el contenido de este archivo
 *   3. Llama: migrarDesdeJuegasPy(listaJuegos, wishlist)
 *
 * PARÁMETROS:
 *   listaJuegos  → contenido de juegos_data/lista_juegos.json   (objeto {PS1:[...], PS2:[...], ...})
 *   wishlist     → contenido de juegos_data/wishlist.json        (array [{titulo, plataforma, ...}])
 *
 * EJEMPLO:
 *   const lista = { "PS1": ["Final Fantasy VII", "Crash Bandicoot"], "PS2": [...], ... }
 *   const wish  = [{ "titulo": "Elden Ring", "plataforma": "PS5", "precio": "", "nota": "", "obtenido": false }]
 *   migrarDesdeJuegasPy(lista, wish)
 */

function migrarDesdeJuegasPy(listaJuegos, wishlist = []) {
  const LS_KEY = "gamesvault_data";

  // Cargar store actual o crear uno vacío
  let store;
  try {
    store = JSON.parse(localStorage.getItem(LS_KEY) || "null");
  } catch {}

  if (!store) {
    store = {
      juegos: [], historial: [], notas: {}, wishlist: [],
      notas_generales: "",
      _nextId: { juegos: 1, historial: 1, wishlist: 1 },
    };
  }

  let importadosJuegos = 0;
  let importadosWish   = 0;
  const duplicados = [];

  // ── Migrar juegos ──────────────────────────────────────────────────────────
  for (const [plataforma, titulos] of Object.entries(listaJuegos)) {
    if (!Array.isArray(titulos)) continue;
    for (const titulo of titulos) {
      const t = String(titulo).trim();
      if (!t) continue;

      // Verificar si ya existe
      const yaExiste = store.juegos.some(
        j => j.titulo.toLowerCase() === t.toLowerCase() && j.plataforma === plataforma
      );
      if (yaExiste) {
        duplicados.push(`${t} (${plataforma})`);
        continue;
      }

      store.juegos.push({
        id: store._nextId.juegos++,
        titulo: t,
        plataforma,
        progreso: 0,
        genero: "",
        url: "",
        favorito: false,
      });
      importadosJuegos++;
    }
  }

  // ── Migrar wishlist ────────────────────────────────────────────────────────
  for (const item of wishlist) {
    const t = String(item.titulo || "").trim();
    if (!t) continue;

    const yaExiste = store.wishlist.some(
      w => w.titulo.toLowerCase() === t.toLowerCase()
    );
    if (yaExiste) {
      duplicados.push(`[Wish] ${t}`);
      continue;
    }

    store.wishlist.push({
      id: store._nextId.wishlist++,
      titulo: t,
      plataforma: item.plataforma || "",
      precio: item.precio || "",
      nota: item.nota || "",
      obtenido: !!item.obtenido,
    });
    importadosWish++;
  }

  // Guardar
  localStorage.setItem(LS_KEY, JSON.stringify(store));

  // Reporte
  console.log(`%c✅ Migración completada`, "color: #10B981; font-size: 16px; font-weight: bold;");
  console.log(`  🎮 Juegos importados: ${importadosJuegos}`);
  console.log(`  🛒 Wishlist importada: ${importadosWish}`);
  if (duplicados.length > 0) {
    console.log(`  ⚠️  Duplicados ignorados (${duplicados.length}):`, duplicados);
  }
  console.log(`\n%c🔄 Recarga la página para ver los cambios (Ctrl+R)`, "color: #6C63FF;");

  return { importadosJuegos, importadosWish, duplicados };
}

// Exportar para uso como módulo si es necesario
if (typeof module !== "undefined") {
  module.exports = { migrarDesdeJuegasPy };
}
