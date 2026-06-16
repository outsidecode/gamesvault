import { useState, useEffect } from "react";
import { useJuegos } from "../hooks/useJuegos";
import { StatCard, BarraProgreso, Btn, useToast } from "./ui";

interface Props { hook: ReturnType<typeof useJuegos> }

export function InicioPage({ hook }: Props) {
  const {
    juegos, stats, casiTerminados, completados,
    getNotasGen, setNotasGen,
  } = hook;

  const [busqueda,   setBusqueda]   = useState("");
  const [resultados, setResultados] = useState<typeof juegos>([]);
  const [notas,      setNotas]      = useState("");
  const { toast, toastEl } = useToast();

  useEffect(() => {
    getNotasGen().then(setNotas);
  }, [getNotasGen]);

  const s = stats();

  function buscar() {
    const t = busqueda.toLowerCase().trim();
    if (!t) return;
    setResultados(
      juegos.filter(j =>
        j.titulo.toLowerCase().includes(t) ||
        j.genero.toLowerCase().includes(t)
      )
    );
  }

  async function guardarNotas() {
    await setNotasGen(notas);
    toast("💾 Notas guardadas.");
  }

  const pie    = casiTerminados.filter(j => j.progreso >= 90 && j.progreso <= 94);
  const casi   = casiTerminados.filter(j => j.progreso >= 95 && j.progreso <= 99);

  return (
    <div className="flex flex-col gap-5 overflow-auto">
      {toastEl}

      {/* Stat cards */}
      <div className="flex gap-3 flex-wrap">
        <StatCard icono="🎮" label="Total Juegos"   valor={s.total}              color="accent2" />
        <StatCard icono="✅" label="Completados"     valor={s.comp}               color="vgreen"  />
        <StatCard icono="📊" label="Progreso Prom."  valor={`${s.promedio.toFixed(1)}%`} color="vcyan" />
        <StatCard icono="⭐" label="Favoritos"       valor={s.favs}               color="gold"    />
      </div>

      {/* Buscador global */}
      <div className="bg-bg2 rounded-xl p-4 border border-border">
        <h3 className="text-accent2 font-bold mb-3">🔍 Buscador Global</h3>
        <div className="flex gap-2 flex-wrap">
          <input
            className="bg-entry border border-border rounded-lg px-3 py-1.5 text-sm text-fg flex-1 min-w-[200px] focus:outline-none focus:border-accent2"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            onKeyDown={e => e.key === "Enter" && buscar()}
            placeholder="Buscar juego o género..."
          />
          <Btn onClick={buscar}>🔍 Buscar</Btn>
          <Btn variant="cyan" onClick={() => { setResultados([]); setBusqueda(""); }}>Limpiar</Btn>
        </div>
        {resultados.length > 0 && (
          <div className="mt-3 overflow-auto max-h-48">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-fg2 border-b border-border text-left">
                  <th className="py-1 pr-4">Juego</th>
                  <th className="py-1 pr-4">Plataforma</th>
                  <th className="py-1 pr-4">Progreso</th>
                  <th className="py-1">Género</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map(j => (
                  <tr key={j.id} className="border-b border-border/30">
                    <td className="py-1.5 pr-4">
                      {j.favorito && "⭐ "}{j.titulo}
                    </td>
                    <td className="py-1.5 pr-4 text-fg2">{j.plataforma}</td>
                    <td className="py-1.5 pr-4 w-36"><BarraProgreso pct={j.progreso} /></td>
                    <td className="py-1.5 text-fg2">{j.genero}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paneles de progreso */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ProgressPanel
          titulo="⚡ Un pie adentro (90–94%)"
          color="text-vyellow"
          border="border-t-vyellow"
          items={pie.map(j => `${j.titulo} (${j.plataforma}) — ${j.progreso}%`)}
        />
        <ProgressPanel
          titulo="🔥 Casi terminados (95–99%)"
          color="text-vorange"
          border="border-t-vorange"
          items={casi.map(j => `${j.titulo} (${j.plataforma}) — ${j.progreso}%`)}
        />
        <ProgressPanel
          titulo="✅ Al 100% completados"
          color="text-vgreen"
          border="border-t-vgreen"
          items={completados.map(j => `✔ ${j.titulo} (${j.plataforma})`)}
        />
      </div>

      {/* Notas generales */}
      <div className="bg-bg2 rounded-xl p-4 border border-border">
        <h3 className="text-accent2 font-bold mb-3">📝 Notas Generales e Ideas</h3>
        <textarea
          className="w-full h-24 bg-entry border border-border rounded-lg p-3 text-fg text-sm resize-none focus:outline-none focus:border-accent2"
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Anota ideas, metas, recordatorios..."
        />
        <div className="flex justify-end mt-2">
          <Btn variant="green" onClick={guardarNotas}>💾 Guardar Notas</Btn>
        </div>
      </div>
    </div>
  );
}

function ProgressPanel({
  titulo, color, border, items,
}: { titulo: string; color: string; border: string; items: string[] }) {
  return (
    <div className={`bg-bg3 rounded-xl border-t-4 ${border} p-4`}>
      <h4 className={`font-bold text-sm mb-3 ${color}`}>{titulo}</h4>
      {items.length === 0 ? (
        <p className="text-fg2 text-xs text-center py-4">Sin juegos en este rango</p>
      ) : (
        <ul className="space-y-1 max-h-40 overflow-auto">
          {items.map((item, i) => (
            <li key={i} className="text-xs text-fg py-1 border-b border-border/30">{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
