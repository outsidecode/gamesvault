import { useState, useEffect, useCallback } from "react";
import { getDB } from "../db";
import type { Juego, WishlistItem, HistorialEntry, Plataforma } from "../types";

export function useJuegos() {
  const [juegos,   setJuegos]   = useState<Juego[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const db = await getDB();
      const [j, w] = await Promise.all([db.getJuegos(), db.getWishlist()]);
      setJuegos(j);
      setWishlist(w);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const addJuego = useCallback(async (
    titulo: string, plataforma: Plataforma, genero = "", url = ""
  ) => {
    const db = await getDB();
    await db.addJuego({ titulo, plataforma, progreso: 0, genero, url, favorito: false });
    await reload();
  }, [reload]);

  const updateJuego = useCallback(async (j: Juego) => {
    const db = await getDB();
    await db.updateJuego(j);
    await reload();
  }, [reload]);

  const deleteJuego = useCallback(async (id: number) => {
    const db = await getDB();
    await db.deleteJuego(id);
    await reload();
  }, [reload]);

  const setProgreso = useCallback(async (j: Juego, valor: number) => {
    const db = await getDB();
    await db.updateJuego({ ...j, progreso: valor });
    await db.addHistorial(j.id, valor);
    await reload();
  }, [reload]);

  const toggleFavorito = useCallback(async (j: Juego) => {
    const db = await getDB();
    await db.updateJuego({ ...j, favorito: !j.favorito });
    await reload();
  }, [reload]);

  const moverJuego = useCallback(async (j: Juego, destino: Plataforma) => {
    const db = await getDB();
    await db.updateJuego({ ...j, plataforma: destino });
    await reload();
  }, [reload]);

  const getHistorial = useCallback(async (juego_id: number): Promise<HistorialEntry[]> => {
    const db = await getDB();
    return db.getHistorial(juego_id);
  }, []);

  const getNota = useCallback(async (juego_id: number) => {
    const db = await getDB();
    return db.getNota(juego_id);
  }, []);

  const setNota = useCallback(async (juego_id: number, contenido: string) => {
    const db = await getDB();
    await db.setNota(juego_id, contenido);
  }, []);

  const addWish = useCallback(async (item: Omit<WishlistItem,"id">) => {
    const db = await getDB();
    await db.addWishlistItem(item);
    await reload();
  }, [reload]);

  const updateWish = useCallback(async (item: WishlistItem) => {
    const db = await getDB();
    await db.updateWishlistItem(item);
    await reload();
  }, [reload]);

  const deleteWish = useCallback(async (id: number) => {
    const db = await getDB();
    await db.deleteWishlistItem(id);
    await reload();
  }, [reload]);

  const getNotasGen = useCallback(async () => {
    const db = await getDB();
    return db.getNotasGenerales();
  }, []);

  const setNotasGen = useCallback(async (texto: string) => {
    const db = await getDB();
    await db.setNotasGenerales(texto);
  }, []);

  // Stats — excluye Archivados del total principal
  const stats = useCallback((plat?: Plataforma) => {
    const lista = plat
      ? juegos.filter(j => j.plataforma === plat)
      : juegos.filter(j => j.plataforma !== "Archivados");
    const total    = lista.length;
    const comp     = lista.filter(j => j.progreso === 100).length;
    const favs     = lista.filter(j => j.favorito).length;
    const promedio = total ? lista.reduce((s, j) => s + j.progreso, 0) / total : 0;
    return { total, comp, favs, promedio };
  }, [juegos]);

  const juegosPorPlat = useCallback((plat: Plataforma) =>
    juegos.filter(j => j.plataforma === plat),
  [juegos]);

  const favoritos      = juegos.filter(j => j.favorito && j.plataforma !== "Archivados");
  const casiTerminados = juegos.filter(j => j.plataforma !== "Archivados" && j.progreso >= 90 && j.progreso < 100);
  const completados    = juegos.filter(j => j.plataforma !== "Archivados" && j.progreso === 100);
  const archivados     = juegos.filter(j => j.plataforma === "Archivados");

  return {
    juegos, wishlist, loading, error,
    addJuego, updateJuego, deleteJuego, setProgreso,
    toggleFavorito, moverJuego,
    getHistorial, getNota, setNota,
    addWish, updateWish, deleteWish,
    getNotasGen, setNotasGen,
    stats, juegosPorPlat,
    favoritos, casiTerminados, completados, archivados,
    reload,
  };
}
