"use client";
import React from "react";
import { Code, XCircle } from "lucide-react";

interface JsonInspectorModalProps {
  data: any;
  onClose: () => void;
  title?: string;
}

export function JsonInspectorModal({ data, onClose, title }: JsonInspectorModalProps) {
  if (!data) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2 font-mono">
            <Code className="w-4 h-4 text-emerald-400" /> {title || "Inspect Record Detail"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer flex items-center gap-1"
          >
            <XCircle className="w-4 h-4" /> Tutup
          </button>
        </div>
        <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
