import { useState } from "react";
import type { Juego, Plataforma } from "../types";
import { TODAS_PLATAFORMAS, ICONOS } from "../types";
import { useJuegos } from "../hooks/useJuegos";
import { Btn, Input, BarraProgreso, Modal, useConfirm, useToast } from "./ui";

interface Props {
  plataforma: Plataforma;
  hook: ReturnType<typeof useJuegos>;
  isArchive?: boolean;
}

export function PlataformaTab({ plataforma, hook, isArchive = false }: Props) {
  const {
    juegosPorPlat, addJuego, updateJuego, deleteJuego,
    setProgreso, toggleFavorito, moverJuego,
    getNota, setNota, getHistorial,
  } = hook;

  const juegos = juegosPorPlat(plataforma);

  const [titulo,   setTitulo]   = useState("");
  const [genero,   setGenero]   = useState("");
  const [url,      setUrl]      = useState("");
  const [filtro,   setFiltro]   = useState("");
  const [selected, setSelected] = useState<Juego | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [modalNota,   setModalNota]   = useState(false);
  const [notaTexto,   setNotaTexto]   = useState("");
  const [modalHist,   setModalHist]   = useState(false);
  const [histData,    setHistData]    = useState<{fecha:string;valor:number}[]>([]);
  const [modalMover,  setModalMover]  = useState(false);
  const [modalProg,   setModalProg]   = useState(false);
  const [progresoVal, setProgresoVal] = useState("0");

  const { confirm, dialog } = useConfirm();
  const { toast, toastEl }  = useToast();

  const filtrados = juegos.filter(j =>
    !filtro ||
    j.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
    j.genero.toLowerCase().includes(filtro.toLowerCase())
  );

  function clearForm() {
    setTitulo(""); setGenero(""); setUrl("");
    setSelected(null); setEditMode(false);
  }

  function selectJuego(j: Juego) {
    setSelected(j);
    setTitulo(j.titulo); setGenero(j.genero); setUrl(j.url);
    setEditMode(true);
  }

  async function handleAgregar() {
    const t = titulo.trim();
    if (!t) return toast("El título no puede estar vacío.", "err");
    if (juegos.some(j => j.titulo.toLowerCase() === t.toLowerCase()))
      return toast("Ya existe ese juego aquí.", "err");
    await addJuego(t, plataforma, genero.trim(), url.trim());
    toast(`✅ "${t}" agregado.`);
    clearForm();
  }

  async function handleEditar() {
    if (!selected) return toast("Selecciona un juego.", "err");
    const t = titulo.trim();
    if (!t) return toast("El título no puede estar vacío.", "err");
    if (t.toLowerCase() !== selected.titulo.toLowerCase() &&
        juegos.some(j => j.titulo.toLowerCase() === t.toLowerCase()))
      return toast("Ya existe ese juego.", "err");
    await updateJuego({ ...selected, titulo: t, genero: genero.trim(), url: url.trim() });
    toast("✅ Editado.");
    clearForm();
  }

  async function handleEliminar() {
    if (!selected) return toast("Selecciona un juego.", "err");
    const ok = await confirm(`¿Eliminar permanentemente "${selected.titulo}"?`);
    if (!ok) return;
    await deleteJuego(selected.id);
    toast("🗑️ Eliminado.");
    clearForm();
  }

  async function handleArchivar() {
    if (!selected) return toast("Selecciona un juego.", "err");
    await moverJuego(selected, "Archivados");
    toast(`🗂️ "${selected.titulo}" archivado.`);
    clearForm();
  }

  async function handleDesarchivar() {
    if (!selected) return toast("Selecciona un juego.", "err");
    setModalMover(true);
  }

  async function openNota() {
    if (!selected) return toast("Selecciona un juego.", "err");
    setNotaTexto(await getNota(selected.id));
    setModalNota(true);
  }

  async function saveNota() {
    if (!selected) return;
    await setNota(selected.id, notaTexto);
    setModalNota(false);
    toast("💾 Nota guardada.");
  }

  async function openHistorial() {
    if (!selected) return toast("Selecciona un juego.", "err");
    setHistData(await getHistorial(selected.id));
    setModalHist(true);
  }

  function openProgreso() {
    if (!selected) return toast("Selecciona un juego.", "err");
    setProgresoVal(String(selected.progreso));
    setModalProg(true);
  }

  async function saveProgreso() {
    if (!selected) return;
    const v = Math.max(0, Math.min(100, parseInt(progresoVal) || 0));
    await setProgreso(selected, v);
    setSelected(prev => prev ? { ...prev, progreso: v } : null);
    setModalProg(false);
    toast(`📊 Progreso → ${v}%`);
  }

  async function handleMover(dest: Plataforma) {
    if (!selected) return;
    await moverJuego(selected, dest);
    setModalMover(false);
    toast(`➡️ Movido a ${dest}.`);
    clearForm();
  }

  async function handleFav() {
    if (!selected) return toast("Selecciona un juego.", "err");
    await toggleFavorito(selected);
    const nuevo = !selected.favorito;
    setSelected(prev => prev ? { ...prev, favorito: nuevo } : null);
    toast(nuevo ? "⭐ Favorito agregado." : "Removido de favoritos.");
  }

  // destinos para "mover": todo excepto la plataforma actual
  const destinos = TODAS_PLATAFORMAS.filter(p => p !== plataforma);

  return (
    <div className="flex flex-col gap-3 h-full">
      {dialog}{toastEl}

      {/* Archivados: banner informativo */}
      {isArchive && (
        <div className="bg-bg3 border border-border rounded-xl px-4 py-2 text-fg2 text-sm flex items-center gap-2">
          🗂️ <span>Juegos archivados — muévalos de vuelta a su plataforma cuando quieras retomarlos.</span>
        </div>
      )}

      {/* Filtro */}
      <div className="flex gap-2 flex-wrap">
        <Input value={filtro} onChange={setFiltro} placeholder="🔍 Filtrar..." width="w-48" />
        {filtro && <Btn variant="ghost" onClick={() => setFiltro("")}>✕ Limpiar</Btn>}
        <span className="ml-auto text-xs text-fg2 self-center">
          {filtrados.length} juego{filtrados.length !== 1 ? "s" : ""}
          {filtro ? ` de ${juegos.length}` : ""}
        </span>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto rounded-xl border border-border min-h-0">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-accent3 text-fg">
            <tr>
              <th className="text-left px-3 py-2">Juego</th>
              <th className="text-left px-3 py-2 w-44">Progreso</th>
              <th className="text-left px-3 py-2 w-32 hidden sm:table-cell">Género</th>
              {isArchive && <th className="text-left px-3 py-2 w-32 hidden md:table-cell">Plataforma</th>}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-fg2 py-12">
                  {isArchive ? "Sin juegos archivados." : "Sin juegos. ¡Agrega uno! 🎮"}
                </td>
              </tr>
            )}
            {filtrados.map(j => (
              <tr
                key={j.id}
                onClick={() => selectJuego(j)}
                className={`cursor-pointer border-b border-border/40 transition-colors ${
                  selected?.id === j.id ? "bg-selected" : "hover:bg-surface"
                }`}
              >
                <td className="px-3 py-2 font-medium">
                  {j.favorito && <span className="mr-1 text-gold">⭐</span>}
                  {j.titulo}
                </td>
                <td className="px-3 py-2">
                  <BarraProgreso
                    pct={j.progreso}
                    color={j.progreso === 100 ? "green" : j.progreso >= 75 ? "gold" : "accent"}
                  />
                </td>
                <td className="px-3 py-2 text-fg2 hidden sm:table-cell">{j.genero}</td>
                {isArchive && (
                  <td className="px-3 py-2 text-fg2 text-xs hidden md:table-cell">{j.plataforma}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inputs (solo si no es archivo o si es archivo no mostramos agregar) */}
      {!isArchive && (
        <div className="flex gap-2 flex-wrap">
          <Input label="Juego"      value={titulo} onChange={setTitulo} placeholder="Título..."     width="w-44" />
          <Input label="Género"     value={genero} onChange={setGenero} placeholder="RPG, Acción..." width="w-32" />
          <Input label="Link/Guía"  value={url}    onChange={setUrl}    placeholder="https://..."   width="w-44" />
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-1.5 flex-wrap">
        {!isArchive && (
          <>
            <Btn onClick={handleAgregar}>➕ Agregar</Btn>
            <Btn variant="ghost" onClick={handleEditar} disabled={!editMode}>✏️ Editar</Btn>
            <Btn variant="cyan" onClick={openProgreso} disabled={!selected}>📊 Progreso</Btn>
            <Btn onClick={handleFav} disabled={!selected}>
              {selected?.favorito ? "💛 Quitar fav." : "⭐ Favorito"}
            </Btn>
            <Btn variant="gold" onClick={() => { if (!selected) return toast("Selecciona un juego.", "err"); if (selected.url.trim()) window.open(selected.url.trim(), "_blank"); else toast("Sin enlace.", "err"); }} disabled={!selected}>🔗 Link</Btn>
            <Btn variant="ghost" onClick={openNota} disabled={!selected}>📝 Notas</Btn>
            <Btn variant="ghost" onClick={openHistorial} disabled={!selected}>📈 Historial</Btn>
            <Btn variant="ghost" onClick={() => { if (!selected) return toast("Selecciona un juego.", "err"); setModalMover(true); }} disabled={!selected}>➡️ Mover</Btn>
            <Btn variant="ghost" onClick={handleArchivar} disabled={!selected} className="!text-fg2">🗂️ Archivar</Btn>
          </>
        )}
        {isArchive && (
          <>
            <Btn variant="cyan" onClick={handleDesarchivar} disabled={!selected}>♻️ Restaurar a...</Btn>
            <Btn variant="ghost" onClick={openNota} disabled={!selected}>📝 Notas</Btn>
            <Btn variant="ghost" onClick={openHistorial} disabled={!selected}>📈 Historial</Btn>
          </>
        )}
        <Btn variant="danger" onClick={handleEliminar} disabled={!selected}>🗑️ Eliminar</Btn>
      </div>

      {/* Modal Progreso */}
      {modalProg && (
        <Modal title={`📊 Progreso — ${selected?.titulo}`} onClose={() => setModalProg(false)}>
          <div className="flex flex-col gap-4">
            <input type="range" min={0} max={100} value={progresoVal}
              onChange={e => setProgresoVal(e.target.value)}
              className="accent-accent w-full" />
            <div className="flex items-center gap-3">
              <input type="number" min={0} max={100} value={progresoVal}
                onChange={e => setProgresoVal(e.target.value)}
                className="bg-entry border border-border rounded-lg px-3 py-2 text-fg w-20 text-center" />
              <span className="text-fg2 text-sm">%</span>
              <BarraProgreso pct={parseInt(progresoVal)||0} />
            </div>
            <div className="flex gap-2 justify-end">
              <Btn variant="ghost" onClick={() => setModalProg(false)}>Cancelar</Btn>
              <Btn variant="green" onClick={saveProgreso}>💾 Guardar</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Notas */}
      {modalNota && selected && (
        <Modal title={`📝 Notas — ${selected.titulo}`} onClose={() => setModalNota(false)}>
          <textarea
            className="w-full h-48 bg-entry border border-border rounded-lg p-3 text-fg text-sm resize-none focus:outline-none focus:border-accent2"
            value={notaTexto} onChange={e => setNotaTexto(e.target.value)}
            placeholder="Escribe tus notas aquí..." />
          <div className="flex gap-2 justify-end mt-4">
            <Btn variant="ghost" onClick={() => setModalNota(false)}>Cancelar</Btn>
            <Btn variant="green" onClick={saveNota}>💾 Guardar</Btn>
          </div>
        </Modal>
      )}

      {/* Modal Historial */}
      {modalHist && selected && (
        <Modal title={`📈 Historial — ${selected.titulo}`} onClose={() => setModalHist(false)}>
          <div className="max-h-72 overflow-auto">
            {histData.length === 0 ? (
              <p className="text-fg2 text-center py-8">Sin registros aún.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-fg2 border-b border-border">
                    <th className="text-left py-1">Fecha</th>
                    <th className="text-center py-1">%</th>
                    <th className="text-left py-1 w-36">Barra</th>
                  </tr>
                </thead>
                <tbody>
                  {histData.map((h, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="py-1.5 text-fg2">{h.fecha}</td>
                      <td className="text-center font-bold text-accent2">{h.valor}%</td>
                      <td className="py-1.5 w-36"><BarraProgreso pct={h.valor} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Btn variant="ghost" onClick={() => setModalHist(false)}>Cerrar</Btn>
          </div>
        </Modal>
      )}

      {/* Modal Mover / Restaurar */}
      {modalMover && selected && (
        <Modal
          title={isArchive ? `♻️ Restaurar "${selected.titulo}" a...` : `➡️ Mover "${selected.titulo}" a...`}
          onClose={() => setModalMover(false)}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-auto">
            {destinos.map(p => (
              <Btn key={p} variant="ghost" onClick={() => handleMover(p)} className="justify-start">
                {ICONOS[p] ?? "🎮"} {p}
              </Btn>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
