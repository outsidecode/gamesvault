import React, { useState } from "react";

// ─── Barra de progreso ────────────────────────────────────────────────────────
export function BarraProgreso({ pct, color = "accent" }: { pct: number; color?: string }) {
  const colorMap: Record<string, string> = {
    accent: "bg-accent",
    green: "bg-vgreen",
    gold: "bg-gold",
    cyan: "bg-vcyan",
    red: "bg-vred",
  };
  const c = colorMap[color] ?? "bg-accent";
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${c}`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <span className="text-xs text-fg2 w-9 text-right">{pct}%</span>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
export function StatCard({
  icono, label, valor, color,
}: { icono: string; label: string; valor: string | number; color: string }) {
  const borderMap: Record<string, string> = {
    accent2: "border-t-accent2",
    vgreen: "border-t-vgreen",
    vcyan: "border-t-vcyan",
    gold: "border-t-gold",
  };
  const textMap: Record<string, string> = {
    accent2: "text-accent2",
    vgreen: "text-vgreen",
    vcyan: "text-vcyan",
    gold: "text-gold",
  };
  return (
    <div className={`bg-bg2 rounded-xl border-t-4 ${borderMap[color] ?? "border-t-accent"} p-4 flex flex-col items-center gap-1 flex-1 min-w-[120px]`}>
      <span className="text-2xl">{icono}</span>
      <span className="text-fg2 text-xs">{label}</span>
      <span className={`text-xl font-bold ${textMap[color] ?? "text-fg"}`}>{valor}</span>
    </div>
  );
}

// ─── Botón ────────────────────────────────────────────────────────────────────
type BtnVariant = "default" | "danger" | "gold" | "green" | "cyan" | "ghost";
export function Btn({
  children, onClick, variant = "default", disabled, className = "", type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const base = "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const variants: Record<BtnVariant, string> = {
    default: "bg-accent3 hover:bg-accent text-fg",
    danger:  "bg-vred hover:bg-vred2 text-white",
    gold:    "bg-gold hover:bg-yellow-500 text-bg",
    green:   "bg-vgreen hover:bg-vgreen2 text-bg",
    cyan:    "bg-vcyan hover:bg-vcyan2 text-bg",
    ghost:   "bg-surface hover:bg-bg3 text-fg2 border border-border",
  };
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({
  label, value, onChange, placeholder = "", width = "w-full",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  width?: string;
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${width}`}>
      {label && <label className="text-xs text-fg2">{label}</label>}
      <input
        className="bg-entry border border-border rounded-lg px-3 py-1.5 text-sm text-fg focus:outline-none focus:border-accent2"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({
  title, children, onClose,
}: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-bg2 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="h-1 bg-accent" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-accent2 font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-fg2 hover:text-fg text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Tabs internos ────────────────────────────────────────────────────────────
export function SubTabs({
  tabs, active, onChange,
}: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 bg-bg3 rounded-xl p-1 flex-wrap">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            active === t
              ? "bg-accent3 text-fg"
              : "text-fg2 hover:text-fg hover:bg-surface"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── Confirm dialog (lightweight) ────────────────────────────────────────────
export function useConfirm() {
  const [state, setState] = useState<{ msg: string; resolve: (v: boolean) => void } | null>(null);

  const confirm = (msg: string) =>
    new Promise<boolean>(resolve => setState({ msg, resolve }));

  const dialog = state ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
      <div className="bg-bg2 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="h-1 bg-vred" />
        <div className="p-6">
          <p className="text-fg mb-6">{state.msg}</p>
          <div className="flex gap-3 justify-end">
            <Btn variant="ghost" onClick={() => { state.resolve(false); setState(null); }}>Cancelar</Btn>
            <Btn variant="danger" onClick={() => { state.resolve(true); setState(null); }}>Eliminar</Btn>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, dialog };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: "ok" | "err" }[]>([]);
  let nextId = 0;

  const toast = (msg: string, type: "ok" | "err" = "ok") => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const toastEl = (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl text-sm font-semibold shadow-lg animate-fade-in ${
            t.type === "ok" ? "bg-vgreen text-bg" : "bg-vred text-white"
          }`}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );

  return { toast, toastEl };
}
