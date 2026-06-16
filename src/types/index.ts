export type Plataforma =
  | "PS1" | "PS2" | "PS3" | "PS4" | "PS5"
  | "Xbox 360" | "Xbox One" | "Xbox Series X/S"
  | "N64" | "Switch" | "Switch 2"
  | "PC Local" | "PC Online"
  | "Cel Local" | "Cel Online"
  | "Archivados";

export interface Juego {
  id: number;
  titulo: string;
  plataforma: Plataforma;
  progreso: number;
  genero: string;
  url: string;
  favorito: boolean;
}

export interface HistorialEntry {
  id: number;
  juego_id: number;
  fecha: string;
  valor: number;
}

export interface Nota {
  juego_id: number;
  contenido: string;
}

export interface WishlistItem {
  id: number;
  titulo: string;
  plataforma: string;
  precio: string;
  nota: string;
  obtenido: boolean;
}

// ─── Grupos de plataformas con sub-tabs ─────────────────────────────────────
export const GRUPOS: Record<string, Plataforma[]> = {
  ps:        ["PS1","PS2","PS3","PS4","PS5"],
  xbox:      ["Xbox 360","Xbox One","Xbox Series X/S"],
  nintendo:  ["N64","Switch","Switch 2"],
  pc:        ["PC Local","PC Online"],
  cel:       ["Cel Local","Cel Online"],
};

// Todas las plataformas jugables (sin Archivados)
export const PLATAFORMAS: Plataforma[] = [
  "PS1","PS2","PS3","PS4","PS5",
  "Xbox 360","Xbox One","Xbox Series X/S",
  "N64","Switch","Switch 2",
  "PC Local","PC Online",
  "Cel Local","Cel Online",
];

export const TODAS_PLATAFORMAS: Plataforma[] = [...PLATAFORMAS, "Archivados"];

// ─── Colores de acento por grupo ─────────────────────────────────────────────
export const COLORES_GRUPO: Record<string, string> = {
  ps:       "#006FFF",   // azul PlayStation
  xbox:     "#107C10",   // verde Xbox
  nintendo: "#E4000F",   // rojo Nintendo
  pc:       "#06B6D4",   // cyan PC
  cel:      "#A78BFA",   // violeta Cel
};

export const COLORES_TAB: Record<string, { bg: string; text: string; border: string }> = {
  ps:       { bg: "bg-blue-700",   text: "text-blue-300",   border: "border-blue-500"   },
  xbox:     { bg: "bg-green-700",  text: "text-green-300",  border: "border-green-500"  },
  nintendo: { bg: "bg-red-700",    text: "text-red-300",    border: "border-red-500"    },
  pc:       { bg: "bg-cyan-700",   text: "text-cyan-300",   border: "border-cyan-500"   },
  cel:      { bg: "bg-purple-700", text: "text-purple-300", border: "border-purple-500" },
};

export const ICONOS: Record<string, string> = {
  PS1:"🎮", PS2:"🎮", PS3:"🎮", PS4:"🎮", PS5:"🎮",
  "Xbox 360":"🟩", "Xbox One":"🟩", "Xbox Series X/S":"🟩",
  N64:"🔴", Switch:"🔴", "Switch 2":"🔴",
  "PC Local":"💻", "PC Online":"🌐",
  "Cel Local":"📱", "Cel Online":"📲",
  Archivados:"🗂️",
};
