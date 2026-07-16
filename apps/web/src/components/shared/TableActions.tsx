"use client";

import { Edit2, Trash2, ArrowRightLeft } from "lucide-react";

interface TableActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onDetail?: () => void;
  onMutasi?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  detailLabel?: string;
  mutasiLabel?: string;
  isReadOnly?: boolean;
}

export function TableActions({
  onEdit,
  onDelete,
  onDetail: _onDetail,
  onMutasi,
  editLabel = "Edit",
  deleteLabel = "Hapus",
  detailLabel: _detailLabel = "Detail",
  mutasiLabel = "Mutasi",
  isReadOnly = false
}: TableActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* 
        onDetail button removed per user request to use row click instead.
        Props kept to prevent TypeScript errors in consumers.
      */}
      {onEdit && !isReadOnly && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:border-blue-900/50 rounded-lg transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{editLabel}</span>
        </button>
      )}
      {onDelete && !isReadOnly && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 dark:border-rose-900/50 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{deleteLabel}</span>
        </button>
      )}
      {onMutasi && !isReadOnly && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMutasi();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 dark:border-orange-900/50 rounded-lg transition-colors"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>{mutasiLabel}</span>
        </button>
      )}
    </div>
  );
}
