/**
 * db/index.ts
 *
 * Web (Vercel + localhost) → Supabase
 * Tauri desktop/Android   → SQLite local
 */

import type { Juego, WishlistItem, HistorialEntry, Plataforma } from "../types";

const IS_TAURI = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

// ════════════════════════════════════════════════════════════════════════════
//  SUPABASE (web — funciona en localhost Y producción sin CORS)
// ════════════════════════════════════════════════════════════════════════════
async function makeSupabaseDB() {
  const { createClient } = await import("@supabase/supabase-js");

  const url = (import.meta as any).env.VITE_SUPABASE_URL as string;
  const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;

  const sb = createClient(url, key);

  return {
    async getJuegos(): Promise<Juego[]> {
      const { data, error } = await sb.from("juegos").select("*").order("titulo");
      if (error) throw error;
      return (data ?? []).map(r => ({ ...r, favorito: !!r.favorito }));
    },

    async addJuego(j: Omit<Juego, "id">): Promise<number> {
      const { data, error } = await sb.from("juegos").insert({
        titulo: j.titulo, plataforma: j.plataforma, progreso: j.progreso,
        genero: j.genero, url: j.url, favorito: j.favorito,
      }).select("id").single();
      if (error) throw error;
      return data.id;
    },

    async updateJuego(j: Juego): Promise<void> {
      const { error } = await sb.from("juegos").update({
        titulo: j.titulo, plataforma: j.plataforma, progreso: j.progreso,
        genero: j.genero, url: j.url, favorito: j.favorito,
      }).eq("id", j.id);
      if (error) throw error;
    },

    async deleteJuego(id: number): Promise<void> {
      const { error } = await sb.from("juegos").delete().eq("id", id);
      if (error) throw error;
    },

    async getHistorial(juego_id: number): Promise<HistorialEntry[]> {
      const { data, error } = await sb.from("historial")
        .select("*").eq("juego_id", juego_id).order("id", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },

    async addHistorial(juego_id: number, valor: number): Promise<void> {
      const fecha = new Date().toLocaleString("es-PE");
      const { error } = await sb.from("historial").insert({ juego_id, fecha, valor });
      if (error) throw error;
    },

    async getNota(juego_id: number): Promise<string> {
      const { data } = await sb.from("notas").select("contenido").eq("juego_id", juego_id).single();
      return data?.contenido ?? "";
    },

    async setNota(juego_id: number, contenido: string): Promise<void> {
      const { error } = await sb.from("notas").upsert({ juego_id, contenido });
      if (error) throw error;
    },

    async getWishlist(): Promise<WishlistItem[]> {
      const { data, error } = await sb.from("wishlist").select("*").order("titulo");
      if (error) throw error;
      return (data ?? []).map(r => ({ ...r, obtenido: !!r.obtenido }));
    },

    async addWishlistItem(item: Omit<WishlistItem, "id">): Promise<void> {
      const { error } = await sb.from("wishlist").insert(item);
      if (error) throw error;
    },

    async updateWishlistItem(item: WishlistItem): Promise<void> {
      const { error } = await sb.from("wishlist").update({
        titulo: item.titulo, plataforma: item.plataforma,
        precio: item.precio, nota: item.nota, obtenido: item.obtenido,
      }).eq("id", item.id);
      if (error) throw error;
    },

    async deleteWishlistItem(id: number): Promise<void> {
      const { error } = await sb.from("wishlist").delete().eq("id", id);
      if (error) throw error;
    },

    async getNotasGenerales(): Promise<string> {
      const { data } = await sb.from("notas_generales").select("contenido").eq("id", 1).single();
      return data?.contenido ?? "";
    },

    async setNotasGenerales(contenido: string): Promise<void> {
      const { error } = await sb.from("notas_generales").upsert({ id: 1, contenido });
      if (error) throw error;
    },
  };
}

// ════════════════════════════════════════════════════════════════════════════
//  SQLite Tauri (desktop + Android)
// ════════════════════════════════════════════════════════════════════════════
const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS juegos (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, plataforma TEXT NOT NULL, progreso INTEGER NOT NULL DEFAULT 0, genero TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '', favorito INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS historial (id INTEGER PRIMARY KEY AUTOINCREMENT, juego_id INTEGER NOT NULL, fecha TEXT NOT NULL, valor INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS notas (juego_id INTEGER PRIMARY KEY, contenido TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS wishlist (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, plataforma TEXT NOT NULL DEFAULT '', precio TEXT NOT NULL DEFAULT '', nota TEXT NOT NULL DEFAULT '', obtenido INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS notas_generales (id INTEGER PRIMARY KEY CHECK (id = 1), contenido TEXT NOT NULL DEFAULT '')`,
  `INSERT OR IGNORE INTO notas_generales(id, contenido) VALUES(1, '')`,
];

async function makeTauriDB() {
  const { default: Database } = await import("@tauri-apps/plugin-sql");
  const sql = await Database.load("sqlite:gamesvault.db");
  for (const stmt of SCHEMA_STATEMENTS) await sql.execute(stmt + ";");
  return {
    async getJuegos(): Promise<Juego[]> {
      const rows = await sql.select<any[]>("SELECT * FROM juegos ORDER BY titulo COLLATE NOCASE");
      return rows.map(r => ({ ...r, favorito: !!r.favorito }));
    },
    async addJuego(j: Omit<Juego, "id">): Promise<number> {
      const res = await sql.execute(
        "INSERT INTO juegos(titulo,plataforma,progreso,genero,url,favorito) VALUES(?,?,?,?,?,?)",
        [j.titulo, j.plataforma, j.progreso, j.genero, j.url, j.favorito ? 1 : 0]
      );
      return res.lastInsertId as number;
    },
    async updateJuego(j: Juego): Promise<void> {
      await sql.execute(
        "UPDATE juegos SET titulo=?,plataforma=?,progreso=?,genero=?,url=?,favorito=? WHERE id=?",
        [j.titulo, j.plataforma, j.progreso, j.genero, j.url, j.favorito ? 1 : 0, j.id]
      );
    },
    async deleteJuego(id: number): Promise<void> { await sql.execute("DELETE FROM juegos WHERE id=?", [id]); },
    async getHistorial(juego_id: number): Promise<HistorialEntry[]> {
      return sql.select<HistorialEntry[]>("SELECT * FROM historial WHERE juego_id=? ORDER BY id DESC", [juego_id]);
    },
    async addHistorial(juego_id: number, valor: number): Promise<void> {
      await sql.execute("INSERT INTO historial(juego_id,fecha,valor) VALUES(?,?,?)",
        [juego_id, new Date().toLocaleString("es-PE"), valor]);
    },
    async getNota(juego_id: number): Promise<string> {
      const rows = await sql.select<{ contenido: string }[]>("SELECT contenido FROM notas WHERE juego_id=?", [juego_id]);
      return rows[0]?.contenido ?? "";
    },
    async setNota(juego_id: number, contenido: string): Promise<void> {
      await sql.execute(
        "INSERT INTO notas(juego_id,contenido) VALUES(?,?) ON CONFLICT(juego_id) DO UPDATE SET contenido=excluded.contenido",
        [juego_id, contenido]
      );
    },
    async getWishlist(): Promise<WishlistItem[]> {
      const rows = await sql.select<any[]>("SELECT * FROM wishlist ORDER BY titulo COLLATE NOCASE");
      return rows.map(r => ({ ...r, obtenido: !!r.obtenido }));
    },
    async addWishlistItem(item: Omit<WishlistItem, "id">): Promise<void> {
      await sql.execute("INSERT INTO wishlist(titulo,plataforma,precio,nota,obtenido) VALUES(?,?,?,?,?)",
        [item.titulo, item.plataforma, item.precio, item.nota, item.obtenido ? 1 : 0]);
    },
    async updateWishlistItem(item: WishlistItem): Promise<void> {
      await sql.execute("UPDATE wishlist SET titulo=?,plataforma=?,precio=?,nota=?,obtenido=? WHERE id=?",
        [item.titulo, item.plataforma, item.precio, item.nota, item.obtenido ? 1 : 0, item.id]);
    },
    async deleteWishlistItem(id: number): Promise<void> {
      await sql.execute("DELETE FROM wishlist WHERE id=?", [id]);
    },
    async getNotasGenerales(): Promise<string> {
      const rows = await sql.select<{ contenido: string }[]>("SELECT contenido FROM notas_generales WHERE id=1");
      return rows[0]?.contenido ?? "";
    },
    async setNotasGenerales(contenido: string): Promise<void> {
      await sql.execute("UPDATE notas_generales SET contenido=? WHERE id=1", [contenido]);
    },
  };
}

// ════════════════════════════════════════════════════════════════════════════
//  Singleton
// ════════════════════════════════════════════════════════════════════════════
type DB = Awaited<ReturnType<typeof makeSupabaseDB>>;
let _db: DB | null = null;

export async function getDB(): Promise<DB> {
  if (_db) return _db;
  if (IS_TAURI) {
    _db = await makeTauriDB() as unknown as DB;
  } else {
    _db = await makeSupabaseDB();
  }
  return _db;
}

export type { DB };
