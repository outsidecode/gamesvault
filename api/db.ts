import { createClient } from "@libsql/client";

const db = createClient({
  url:       process.env.VITE_TURSO_URL!,
  authToken: process.env.VITE_TURSO_TOKEN!,
});

// Schema
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS juegos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    plataforma TEXT NOT NULL,
    progreso INTEGER NOT NULL DEFAULT 0,
    genero TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL DEFAULT '',
    favorito INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    juego_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    valor INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS notas (
    juego_id INTEGER PRIMARY KEY,
    contenido TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    plataforma TEXT NOT NULL DEFAULT '',
    precio TEXT NOT NULL DEFAULT '',
    nota TEXT NOT NULL DEFAULT '',
    obtenido INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS notas_generales (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    contenido TEXT NOT NULL DEFAULT ''
  )`,
  `INSERT OR IGNORE INTO notas_generales(id, contenido) VALUES(1, '')`,
];

let initialized = false;
async function init() {
  if (initialized) return;
  for (const stmt of SCHEMA) await db.execute(stmt);
  initialized = true;
}

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await init();
    const { action, ...params } = req.body ?? {};

    switch (action) {

      case "getJuegos": {
        const r = await db.execute("SELECT * FROM juegos ORDER BY titulo COLLATE NOCASE");
        return res.json(r.rows.map(row => ({
          id: Number(row.id), titulo: String(row.titulo),
          plataforma: String(row.plataforma), progreso: Number(row.progreso),
          genero: String(row.genero), url: String(row.url), favorito: Boolean(row.favorito),
        })));
      }

      case "addJuego": {
        const r = await db.execute({
          sql: "INSERT INTO juegos(titulo,plataforma,progreso,genero,url,favorito) VALUES(?,?,?,?,?,?)",
          args: [params.titulo, params.plataforma, params.progreso, params.genero, params.url, params.favorito ? 1 : 0],
        });
        return res.json({ id: Number(r.lastInsertRowid) });
      }

      case "updateJuego": {
        await db.execute({
          sql: "UPDATE juegos SET titulo=?,plataforma=?,progreso=?,genero=?,url=?,favorito=? WHERE id=?",
          args: [params.titulo, params.plataforma, params.progreso, params.genero, params.url, params.favorito ? 1 : 0, params.id],
        });
        return res.json({ ok: true });
      }

      case "deleteJuego": {
        await db.execute({ sql: "DELETE FROM juegos WHERE id=?", args: [params.id] });
        await db.execute({ sql: "DELETE FROM historial WHERE juego_id=?", args: [params.id] });
        await db.execute({ sql: "DELETE FROM notas WHERE juego_id=?", args: [params.id] });
        return res.json({ ok: true });
      }

      case "getHistorial": {
        const r = await db.execute({ sql: "SELECT * FROM historial WHERE juego_id=? ORDER BY id DESC", args: [params.juego_id] });
        return res.json(r.rows.map(row => ({ id: Number(row.id), juego_id: Number(row.juego_id), fecha: String(row.fecha), valor: Number(row.valor) })));
      }

      case "addHistorial": {
        const fecha = new Date().toLocaleString("es-PE");
        await db.execute({ sql: "INSERT INTO historial(juego_id,fecha,valor) VALUES(?,?,?)", args: [params.juego_id, fecha, params.valor] });
        return res.json({ ok: true });
      }

      case "getNota": {
        const r = await db.execute({ sql: "SELECT contenido FROM notas WHERE juego_id=?", args: [params.juego_id] });
        return res.json({ contenido: r.rows[0] ? String(r.rows[0].contenido) : "" });
      }

      case "setNota": {
        await db.execute({
          sql: "INSERT INTO notas(juego_id,contenido) VALUES(?,?) ON CONFLICT(juego_id) DO UPDATE SET contenido=excluded.contenido",
          args: [params.juego_id, params.contenido],
        });
        return res.json({ ok: true });
      }

      case "getWishlist": {
        const r = await db.execute("SELECT * FROM wishlist ORDER BY titulo COLLATE NOCASE");
        return res.json(r.rows.map(row => ({ id: Number(row.id), titulo: String(row.titulo), plataforma: String(row.plataforma), precio: String(row.precio), nota: String(row.nota), obtenido: Boolean(row.obtenido) })));
      }

      case "addWishlistItem": {
        await db.execute({ sql: "INSERT INTO wishlist(titulo,plataforma,precio,nota,obtenido) VALUES(?,?,?,?,?)", args: [params.titulo, params.plataforma, params.precio, params.nota, params.obtenido ? 1 : 0] });
        return res.json({ ok: true });
      }

      case "updateWishlistItem": {
        await db.execute({ sql: "UPDATE wishlist SET titulo=?,plataforma=?,precio=?,nota=?,obtenido=? WHERE id=?", args: [params.titulo, params.plataforma, params.precio, params.nota, params.obtenido ? 1 : 0, params.id] });
        return res.json({ ok: true });
      }

      case "deleteWishlistItem": {
        await db.execute({ sql: "DELETE FROM wishlist WHERE id=?", args: [params.id] });
        return res.json({ ok: true });
      }

      case "getNotasGenerales": {
        const r = await db.execute("SELECT contenido FROM notas_generales WHERE id=1");
        return res.json({ contenido: r.rows[0] ? String(r.rows[0].contenido) : "" });
      }

      case "setNotasGenerales": {
        await db.execute({ sql: "UPDATE notas_generales SET contenido=? WHERE id=1", args: [params.contenido] });
        return res.json({ ok: true });
      }

      default:
        return res.status(400).json({ error: "Acción desconocida" });
    }
  } catch (e: any) {
    console.error("DB error:", e);
    return res.status(500).json({ error: e.message });
  }
}
