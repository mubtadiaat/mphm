"use client";
import React, { useState } from "react";
import { Code, XCircle, Copy, Check } from "lucide-react";

interface JsonInspectorModalProps {
  data: any;
  onClose: () => void;
  title?: string;
}

export function JsonInspectorModal({ data, onClose, title }: JsonInspectorModalProps) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleCopy = () => {
    const jsonStr = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2 font-mono truncate">
            <Code className="w-4 h-4 text-emerald-400 shrink-0" /> {title || "Inspect Record Detail"}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                copied
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Tercopy!" : "Copy JSON"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer flex items-center gap-1 p-1 bg-zinc-800 hover:bg-zinc-700 rounded-xl"
              title="Tutup Modal"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 whitespace-pre-wrap break-all">
          {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
