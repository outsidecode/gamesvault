import { useJuegos } from "../hooks/useJuegos";
import { BarraProgreso, useToast } from "./ui";
import { GRUPOS, ICONOS } from "../types";

interface Props { hook: ReturnType<typeof useJuegos> }

// ══════════════════════════════════════════════════════
//  FAVORITOS
// ══════════════════════════════════════════════════════
export function FavoritosPage({ hook }: Props) {
  const { favoritos, toggleFavorito } = hook;
  const { toast, toastEl } = useToast();

  return (
    <div className="flex flex-col gap-4 overflow-auto">
      {toastEl}
      <div className="h-1 bg-gold rounded-full" />
      <h2 className="text-gold font-bold text-lg">⭐ Mis Favoritos</h2>

      {favoritos.length === 0 ? (
        <div className="text-fg2 text-sm py-20 text-center">
          Sin favoritos aún. Márcalos desde cada plataforma. ⭐
        </div>
      ) : (
        <div className="overflow-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-accent3 text-fg sticky top-0">
              <tr>
                <th className="text-left px-3 py-2">Juego</th>
                <th className="text-left px-3 py-2 w-40">Progreso</th>
                <th className="text-center px-3 py-2 hidden sm:table-cell w-36">Plataforma</th>
                <th className="text-left px-3 py-2 hidden md:table-cell">Género</th>
                <th className="text-center px-3 py-2 w-24">Acción</th>
              </tr>
            </thead>
            <tbody>
              {favoritos.map(j => (
                <tr key={j.id} className="border-b border-border/30 hover:bg-surface">
                  <td className="px-3 py-2 font-medium">⭐ {j.titulo}</td>
                  <td className="px-3 py-2"><BarraProgreso pct={j.progreso} color="gold" /></td>
                  <td className="px-3 py-2 text-center text-fg2 hidden sm:table-cell text-xs">{j.plataforma}</td>
                  <td className="px-3 py-2 text-fg2 hidden md:table-cell">{j.genero}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => { toggleFavorito(j); toast("Removido de favoritos."); }}
                      className="text-xs text-vred hover:text-vred2 transition-colors"
                    >⭐ Quitar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  ESTADÍSTICAS
// ══════════════════════════════════════════════════════
export function EstadisticasPage({ hook }: Props) {
  const { juegos, stats } = hook;

  // Filas: cada grupo y sus sub-plataformas
  const grupos = [
    { label: "🎮 PlayStation", color: "text-blue-400",   plats: GRUPOS.ps       },
    { label: "🟩 Xbox",        color: "text-green-400",  plats: GRUPOS.xbox     },
    { label: "🔴 Nintendo",    color: "text-red-400",    plats: GRUPOS.nintendo },
    { label: "💻 PC",          color: "text-cyan-400",   plats: GRUPOS.pc       },
    { label: "📱 Celular",     color: "text-purple-400", plats: GRUPOS.cel      },
  ];

  const global = stats();

  const top5 = [...juegos]
    .filter(j => j.plataforma !== "Archivados")
    .sort((a, b) => b.progreso - a.progreso)
    .slice(0, 5);

  const medallas = ["🥇","🥈","🥉","4️⃣","5️⃣"];

  return (
    <div className="flex flex-col gap-5 overflow-auto">
      <h2 className="text-accent2 font-bold text-lg">📊 Estadísticas</h2>

      {/* Tabla por grupo y sub-plataforma */}
      {grupos.map(g => {
        const totGrupo = g.plats.reduce((acc, p) => {
          const s = stats(p);
          return { total: acc.total + s.total, comp: acc.comp + s.comp };
        }, { total: 0, comp: 0 });
        if (totGrupo.total === 0) return null;
        return (
          <div key={g.label} className="bg-bg2 rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2 border-b border-border flex items-center gap-2">
              <h3 className={`font-bold text-sm ${g.color}`}>{g.label}</h3>
              <span className="text-fg2 text-xs ml-auto">{totGrupo.total} juegos · {totGrupo.comp} completados</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface text-fg2 text-xs">
                  <tr>
                    <th className="text-left px-3 py-2">Sub-plataforma</th>
                    <th className="text-center px-3 py-2">Total</th>
                    <th className="text-center px-3 py-2">Compl.</th>
                    <th className="text-left px-3 py-2 w-40">Prom. Progreso</th>
                  </tr>
                </thead>
                <tbody>
                  {g.plats.map(p => {
                    const s = stats(p);
                    if (s.total === 0) return null;
                    return (
                      <tr key={p} className="border-b border-border/30 hover:bg-surface">
                        <td className="px-3 py-2">{ICONOS[p] ?? "🎮"} {p}</td>
                        <td className="px-3 py-2 text-center text-fg2">{s.total}</td>
                        <td className="px-3 py-2 text-center text-vgreen">{s.comp}</td>
                        <td className="px-3 py-2"><BarraProgreso pct={Math.round(s.promedio)} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Fila TOTAL */}
      <div className="bg-selected rounded-xl border border-accent px-4 py-3 flex gap-8 flex-wrap">
        <span className="text-gold font-bold">🏆 TOTAL</span>
        <span className="text-fg2 text-sm">🎮 {global.total} juegos</span>
        <span className="text-fg2 text-sm">✅ {global.comp} completados</span>
        <span className="text-fg2 text-sm">⭐ {global.favs} favoritos</span>
        <span className="text-fg2 text-sm">📊 {global.promedio.toFixed(1)}% promedio</span>
      </div>

      {/* Top 5 */}
      <div className="bg-bg2 rounded-xl border border-border p-4">
        <h3 className="text-accent2 font-bold text-sm mb-3">🏆 Top 5 — Mayor Progreso</h3>
        <div className="flex flex-col gap-2">
          {top5.length === 0 && <p className="text-fg2 text-sm text-center py-4">Sin juegos aún.</p>}
          {top5.map((j, i) => (
            <div key={j.id} className="flex items-center gap-3 bg-surface rounded-lg px-3 py-2">
              <span className="text-xl w-8">{medallas[i]}</span>
              <span className="flex-1 font-medium truncate">{j.titulo}</span>
              <span className="text-fg2 text-xs hidden sm:inline">{j.plataforma}</span>
              <div className="w-32 hidden sm:block">
                <BarraProgreso pct={j.progreso} color={j.progreso===100?"green":j.progreso>=75?"gold":"accent"} />
              </div>
              <span className={`text-sm font-bold w-10 text-right ${
                j.progreso===100?"text-vgreen":j.progreso>=75?"text-gold":"text-accent2"
              }`}>{j.progreso}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Archivados count */}
      {hook.archivados.length > 0 && (
        <div className="bg-bg3 rounded-xl border border-border px-4 py-3 text-fg2 text-sm">
          🗂️ {hook.archivados.length} juego{hook.archivados.length !== 1 ? "s" : ""} archivado{hook.archivados.length !== 1 ? "s" : ""} (no incluidos en estadísticas)
        </div>
      )}
    </div>
  );
}
