import { useState } from "react";
import { useJuegos } from "../hooks/useJuegos";
import { Btn, Input, useConfirm, useToast } from "./ui";
import type { WishlistItem } from "../types";

interface Props { hook: ReturnType<typeof useJuegos> }

export function WishlistPage({ hook }: Props) {
  const { wishlist, addWish, updateWish, deleteWish } = hook;

  const [titulo,   setTitulo]   = useState("");
  const [plat,     setPlat]     = useState("");
  const [precio,   setPrecio]   = useState("");
  const [nota,     setNota]     = useState("");
  const [selected, setSelected] = useState<WishlistItem | null>(null);
  const [editMode, setEditMode] = useState(false);

  const { confirm, dialog } = useConfirm();
  const { toast, toastEl }  = useToast();

  function selectItem(item: WishlistItem) {
    setSelected(item);
    setTitulo(item.titulo); setPlat(item.plataforma);
    setPrecio(item.precio); setNota(item.nota);
    setEditMode(true);
  }

  function clearForm() {
    setTitulo(""); setPlat(""); setPrecio(""); setNota("");
    setSelected(null); setEditMode(false);
  }

  async function handleAgregar() {
    const t = titulo.trim();
    if (!t) return toast("El nombre no puede estar vacío.", "err");
    if (wishlist.some(i => i.titulo.toLowerCase() === t.toLowerCase()))
      return toast("Ya existe en la wishlist.", "err");
    await addWish({ titulo: t, plataforma: plat.trim(), precio: precio.trim(), nota: nota.trim(), obtenido: false });
    toast("🛒 Agregado a la wishlist.");
    clearForm();
  }

  async function handleEditar() {
    if (!selected) return toast("Selecciona un ítem.", "err");
    const t = titulo.trim();
    if (!t) return toast("El nombre no puede estar vacío.", "err");
    await updateWish({ ...selected, titulo: t, plataforma: plat.trim(), precio: precio.trim(), nota: nota.trim() });
    toast("✅ Editado.");
    clearForm();
  }

  async function handleEliminar() {
    if (!selected) return toast("Selecciona un ítem.", "err");
    const ok = await confirm(`¿Eliminar "${selected.titulo}" de la wishlist?`);
    if (!ok) return;
    await deleteWish(selected.id);
    toast("🗑️ Eliminado.");
    clearForm();
  }

  async function handleToggle(item: WishlistItem) {
    await updateWish({ ...item, obtenido: !item.obtenido });
    toast(item.obtenido ? "⏳ Marcado como pendiente." : "✅ ¡Marcado como obtenido!");
  }

  const pendientes = wishlist.filter(w => !w.obtenido);
  const obtenidos  = wishlist.filter(w =>  w.obtenido);

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto">
      {dialog}{toastEl}

      {/* Header */}
      <div className="h-1 bg-vcyan rounded-full" />

      {/* Inputs */}
      <div className="bg-bg2 rounded-xl p-4 border border-border">
        <h3 className="text-vcyan font-bold mb-3">➕ Agregar / Editar</h3>
        <div className="flex gap-2 flex-wrap">
          <Input label="Juego"         value={titulo} onChange={setTitulo} placeholder="Título..."           width="w-44" />
          <Input label="Plataforma"    value={plat}   onChange={setPlat}   placeholder="PS5, PC..."          width="w-28" />
          <Input label="Precio aprox." value={precio} onChange={setPrecio} placeholder="S/. 200..."         width="w-28" />
          <Input label="Nota"          value={nota}   onChange={setNota}   placeholder="Lista de deseos..."  width="w-48" />
        </div>
        <div className="flex gap-1.5 flex-wrap mt-3">
          <Btn onClick={handleAgregar}>➕ Agregar</Btn>
          <Btn variant="ghost" onClick={handleEditar} disabled={!editMode}>✏️ Editar</Btn>
          <Btn variant="danger" onClick={handleEliminar} disabled={!selected}>🗑️ Eliminar</Btn>
          <Btn variant="ghost" onClick={clearForm}>Limpiar</Btn>
        </div>
      </div>

      {/* Lista pendientes */}
      <WishSection
        titulo="⏳ Pendientes"
        color="text-vcyan2"
        items={pendientes}
        selected={selected}
        onSelect={selectItem}
        onToggle={handleToggle}
      />

      {/* Lista obtenidos */}
      {obtenidos.length > 0 && (
        <WishSection
          titulo="✅ Obtenidos"
          color="text-vgreen2"
          items={obtenidos}
          selected={selected}
          onSelect={selectItem}
          onToggle={handleToggle}
        />
      )}

      {wishlist.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-fg2 text-sm">
          Tu wishlist está vacía. ¡Agrega los juegos que quieres! 🎮
        </div>
      )}
    </div>
  );
}

function WishSection({
  titulo, color, items, selected, onSelect, onToggle,
}: {
  titulo: string;
  color: string;
  items: WishlistItem[];
  selected: WishlistItem | null;
  onSelect: (i: WishlistItem) => void;
  onToggle: (i: WishlistItem) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="bg-bg2 rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-2 border-b border-border">
        <h4 className={`font-bold text-sm ${color}`}>{titulo} ({items.length})</h4>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-surface text-fg2 text-xs">
          <tr>
            <th className="text-left px-3 py-2">Juego</th>
            <th className="text-center px-3 py-2 hidden sm:table-cell">Plataforma</th>
            <th className="text-center px-3 py-2 hidden md:table-cell">Precio</th>
            <th className="text-left px-3 py-2 hidden lg:table-cell">Nota</th>
            <th className="text-center px-3 py-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr
              key={item.id}
              onClick={() => onSelect(item)}
              className={`border-b border-border/30 cursor-pointer transition-colors ${
                selected?.id === item.id ? "bg-selected" : "hover:bg-surface"
              }`}
            >
              <td className="px-3 py-2 font-medium">{item.titulo}</td>
              <td className="px-3 py-2 text-center text-fg2 hidden sm:table-cell">{item.plataforma || "—"}</td>
              <td className="px-3 py-2 text-center text-gold hidden md:table-cell">{item.precio || "—"}</td>
              <td className="px-3 py-2 text-fg2 text-xs hidden lg:table-cell">{item.nota || "—"}</td>
              <td className="px-3 py-2 text-center">
                <button
                  onClick={e => { e.stopPropagation(); onToggle(item); }}
                  className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors ${
                    item.obtenido
                      ? "bg-vgreen/20 text-vgreen hover:bg-vred/20 hover:text-vred"
                      : "bg-vcyan/20 text-vcyan hover:bg-vgreen/20 hover:text-vgreen"
                  }`}
                >
                  {item.obtenido ? "✅ Obtenido" : "⏳ Pendiente"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
