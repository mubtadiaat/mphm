"use client";

import { useState } from "react";
import { Calculator, Save, Undo2, XCircle } from "lucide-react";
import { useToast } from "./ToastContext";

export type FormulaChip = {
  id: string;
  type: "variable" | "operator" | "number";
  value: string;
  label: string;
};

const VARIABLES = [
  { value: "KWARTAL", label: "Nilai Kwartal" },
  { value: "UJIAN", label: "Nilai Ujian" },
  { value: "TUGAS", label: "Nilai Tugas" },
  { value: "AKHLAQ", label: "Nilai Akhlaq" },
];

const OPERATORS = [
  { value: "+", label: "+" },
  { value: "-", label: "-" },
  { value: "*", label: "×" },
  { value: "/", label: "÷" },
  { value: "(", label: "(" },
  { value: ")", label: ")" },
];

export function MathFormulaBuilder() {
  const [formula, setFormula] = useState<FormulaChip[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("raport_formula");
      if (saved) return JSON.parse(saved);
    }
    // Default formula: (KWARTAL + UJIAN) / 2
    return [
      { id: "1", type: "operator", value: "(", label: "(" },
      { id: "2", type: "variable", value: "KWARTAL", label: "Nilai Kwartal" },
      { id: "3", type: "operator", value: "+", label: "+" },
      { id: "4", type: "variable", value: "UJIAN", label: "Nilai Ujian" },
      { id: "5", type: "operator", value: ")", label: ")" },
      { id: "6", type: "operator", value: "/", label: "÷" },
      { id: "7", type: "number", value: "2", label: "2" },
    ];
  });
  
  const { toast } = useToast();

  const addChip = (chip: Omit<FormulaChip, "id">) => {
    setFormula(prev => [...prev, { ...chip, id: Date.now().toString() }]);
  };

  const removeLast = () => {
    setFormula(prev => prev.slice(0, -1));
  };

  const clearFormula = () => {
    setFormula([]);
  };

  const saveFormula = () => {
    localStorage.setItem("raport_formula", JSON.stringify(formula));
    toast("Rumus berhasil disimpan dan akan digunakan untuk perhitungan nilai.", "success", "Rumus Disimpan");
  };

  // Numpad Numbers
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "."];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Calculator className="w-6 h-6 text-emerald-500" />
          Engine Parameter Matematis
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Susun rumus perhitungan (misal: Nilai Raport) dengan mengklik variabel dan operator di bawah ini. Anda tidak perlu mengetik secara manual untuk menghindari kesalahan sintaks.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center">
          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Rumus Aktif:</span>
          <div className="flex gap-2">
            <button onClick={removeLast} className="p-1.5 text-zinc-500 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Hapus Terakhir">
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={clearFormula} className="p-1.5 text-zinc-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Kosongkan">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6 min-h-[120px] flex flex-wrap content-start gap-2 bg-slate-900 font-mono">
          {formula.length === 0 ? (
            <span className="text-zinc-500 text-sm italic">Klik variabel atau operator untuk mulai merangkai rumus...</span>
          ) : (
            formula.map(chip => (
              <span
                key={chip.id}
                className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center justify-center shadow-sm ${
                  chip.type === "variable" 
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                    : chip.type === "operator"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {chip.label}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-zinc-500 uppercase">1. Variabel Sistem</h4>
          <div className="flex flex-wrap gap-2">
            {VARIABLES.map(v => (
              <button
                key={v.value}
                onClick={() => addChip({ type: "variable", value: v.value, label: v.label })}
                className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-zinc-500 uppercase">2. Operator Dasar</h4>
          <div className="flex flex-wrap gap-2">
            {OPERATORS.map(o => (
              <button
                key={o.value}
                onClick={() => addChip({ type: "operator", value: o.value, label: o.label })}
                className="w-10 h-10 flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg text-lg font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-zinc-500 uppercase">3. Angka / Konstanta</h4>
          <div className="grid grid-cols-4 gap-2">
            {numbers.map(n => (
              <button
                key={n}
                onClick={() => addChip({ type: "number", value: n, label: n })}
                className="w-10 h-10 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-lg font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={saveFormula}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
        >
          <Save className="w-5 h-5" />
          Simpan Rumus Raport
        </button>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl mt-4">
        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Catatan Implementasi (Engine Evaluation)</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 list-disc list-inside space-y-1">
          <li>Rumus yang dibuat di sini akan disimpan dalam <code className="bg-white/50 dark:bg-black/20 px-1 py-0.5 rounded">localStorage</code> dengan key <code className="bg-white/50 dark:bg-black/20 px-1 py-0.5 rounded">raport_formula</code>.</li>
          <li>Pada halaman <strong>Manajemen Nilai</strong> dan <strong>Raport</strong>, sistem membaca array formula ini.</li>
          <li>Untuk menghitung nilai akhir, sistem mengubah <em>chip variable</em> menjadi angka (nilai Kwartal atau Ujian santri).</li>
          <li>Lalu array divalidasi keamanannya sebelum dikonversi menjadi string matematika (<code className="bg-white/50 dark:bg-black/20 px-1 py-0.5 rounded">7.5 + 8.0 / 2</code>) dan dieksekusi via <strong>Function()</strong> secara <em>sandbox</em>.</li>
        </ul>
      </div>
    </div>
  );
}
