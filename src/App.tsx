import { useState } from "react";
import { useJuegos } from "./hooks/useJuegos";
import { PlataformaTab } from "./components/PlataformaTab";
import { InicioPage } from "./components/InicioPage";
import { WishlistPage } from "./components/WishlistPage";
import { FavoritosPage, EstadisticasPage } from "./components/OtherPages";
import { GRUPOS, COLORES_TAB, type Plataforma } from "./types";

type TabGroup = "inicio" | "ps" | "xbox" | "nintendo" | "pc" | "cel" | "archivados" | "wishlist" | "favoritos" | "estadisticas";

const NAV: { id: TabGroup; label: string; icon: string; color?: string }[] = [
  { id: "inicio",       label: "Inicio",       icon: "🏠" },
  { id: "ps",           label: "PlayStation",  icon: "🎮", color: "text-blue-400"   },
  { id: "xbox",         label: "Xbox",         icon: "🟩", color: "text-green-400"  },
  { id: "nintendo",     label: "Nintendo",     icon: "🔴", color: "text-red-400"    },
  { id: "pc",           label: "PC",           icon: "💻", color: "text-cyan-400"   },
  { id: "cel",          label: "Celular",      icon: "📱", color: "text-purple-400" },
  { id: "archivados",   label: "Archivados",   icon: "🗂️" },
  { id: "wishlist",     label: "Wishlist",     icon: "🛒" },
  { id: "favoritos",    label: "Favoritos",    icon: "⭐" },
  { id: "estadisticas", label: "Estadísticas", icon: "📊" },
];

// Sub-tab con contador de juegos
function SubTabsConContador({
  grupo, active, onChange, hook,
}: {
  grupo: string;
  active: string;
  onChange: (t: string) => void;
  hook: ReturnType<typeof useJuegos>;
}) {
  const plats = GRUPOS[grupo] ?? [];
  const col   = COLORES_TAB[grupo];

  return (
    <div className="flex gap-1 bg-bg3 rounded-xl p-1 flex-wrap">
      {plats.map(p => {
        const count = hook.juegosPorPlat(p).length;
        const isActive = active === p;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              isActive
                ? `${col.bg} text-white`
                : `text-fg2 hover:text-fg hover:bg-surface`
            }`}
          >
            {p}
            {count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                isActive
                  ? "bg-white/20 text-white"
                  : `${col.text} bg-surface`
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function App() {
  const hook    = useJuegos();
  const [tab, setTab]         = useState<TabGroup>("inicio");
  const [subs, setSubs]       = useState<Record<string, string>>({
    ps:       "PS1",
    xbox:     "Xbox 360",
    nintendo: "N64",
    pc:       "PC Local",
    cel:      "Cel Local",
  });
  const [sideOpen, setSideOpen] = useState(false);

  if (hook.loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-accent2 text-xl font-bold animate-pulse">🎮 Cargando GamesVault...</div>
    </div>
  );

  if (hook.error) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-vred text-center">
        <p className="text-2xl mb-2">⚠️ Error al cargar</p>
        <p className="text-fg2 text-sm">{hook.error}</p>
      </div>
    </div>
  );

  const s = hook.stats();

  // Total por grupo para badge en sidebar
  function totalGrupo(g: string) {
    return (GRUPOS[g] ?? []).reduce((acc, p) => acc + hook.juegosPorPlat(p).length, 0);
  }

  // Color del borde izquierdo activo en sidebar
  const BORDER_ACTIVE: Record<string, string> = {
    ps:       "border-blue-400",
    xbox:     "border-green-400",
    nintendo: "border-red-400",
    pc:       "border-cyan-400",
    cel:      "border-purple-400",
  };

  function setSubFor(grupo: string, val: string) {
    setSubs(prev => ({ ...prev, [grupo]: val }));
  }

  function renderMain() {
    if (tab === "inicio")       return <InicioPage hook={hook} />;
    if (tab === "wishlist")     return <WishlistPage hook={hook} />;
    if (tab === "favoritos")    return <FavoritosPage hook={hook} />;
    if (tab === "estadisticas") return <EstadisticasPage hook={hook} />;
    if (tab === "archivados")   return <PlataformaTab plataforma="Archivados" hook={hook} isArchive />;

    const grupos: TabGroup[] = ["ps","xbox","nintendo","pc","cel"];
    if (grupos.includes(tab)) {
      const grupo = tab as string;
      const activeSub = subs[grupo] as Plataforma;
      return (
        <div className="flex flex-col gap-3 h-full overflow-hidden">
          <SubTabsConContador
            grupo={grupo}
            active={activeSub}
            onChange={v => setSubFor(grupo, v)}
            hook={hook}
          />
          <div className="flex-1 overflow-hidden">
            <PlataformaTab key={activeSub} plataforma={activeSub} hook={hook} />
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-bg text-fg font-sans flex flex-col">
      {/* Header */}
      <header className="bg-bg2 border-b border-border h-14 flex items-center px-4 gap-3 shrink-0">
        <button className="lg:hidden text-fg2 hover:text-fg text-xl" onClick={() => setSideOpen(v => !v)}>☰</button>
        <span className="text-accent2 font-bold text-lg">🎮 GamesVault</span>
        <span className="text-fg2 text-xs hidden sm:inline">tu colección, tu progreso</span>
        <div className="ml-auto flex gap-4 text-xs text-fg2">
          <span className="hidden md:inline">🎮 {s.total} juegos</span>
          <span className="hidden md:inline">✅ {s.comp} completados</span>
          <span className="hidden md:inline text-gold">⭐ {s.favs} favoritos</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          bg-bg2 border-r border-border w-52 shrink-0 flex flex-col py-3 gap-0.5
          lg:translate-x-0 transition-transform duration-200
          ${sideOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          fixed lg:static top-14 bottom-0 z-40
        `}>
          {NAV.map(n => {
            const isActive  = tab === n.id;
            const count     = GRUPOS[n.id] ? totalGrupo(n.id) : 0;
            const borderCol = BORDER_ACTIVE[n.id] ?? "border-accent2";
            return (
              <button
                key={n.id}
                onClick={() => { setTab(n.id); setSideOpen(false); }}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors text-left border-r-2 ${
                  isActive
                    ? `bg-surface text-fg ${borderCol}`
                    : "border-transparent text-fg2 hover:bg-surface/50 hover:text-fg"
                }`}
              >
                <span className="text-base w-5 text-center">{n.icon}</span>
                <span className={isActive && n.color ? n.color : ""}>{n.label}</span>
                {count > 0 && (
                  <span className="ml-auto text-xs bg-border text-fg2 rounded-full px-1.5 py-0.5 font-bold">
                    {count}
                  </span>
                )}
                {n.id === "favoritos" && s.favs > 0 && (
                  <span className="ml-auto bg-gold text-bg text-xs rounded-full px-1.5 py-0.5 font-bold">
                    {s.favs}
                  </span>
                )}
              </button>
            );
          })}

          <div className="mt-auto px-4 pb-3">
            <div className="h-px bg-border mb-2" />
            <p className="text-fg2 text-xs text-center">GamesVault v1.1</p>
          </div>
        </aside>

        {/* Overlay mobile */}
        {sideOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSideOpen(false)} />}

        {/* Main */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-cyan-500 shrink-0" />
          <div className="flex-1 overflow-auto p-4">
            {renderMain()}
          </div>
        </main>
      </div>
    </div>
  );
}
