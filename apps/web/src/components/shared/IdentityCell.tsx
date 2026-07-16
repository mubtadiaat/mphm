"use client";

import Image from "next/image";
import { FallbackAvatar } from "./FallbackAvatar";

interface IdentityCellProps {
  name: string;
  subInfo?: string;
  stambuk?: string;
  avatarUrl?: string | null;
}

export function IdentityCell({ name, subInfo, stambuk, avatarUrl }: IdentityCellProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Avatar Container */}
      <div className="relative shrink-0">
        {avatarUrl ? (
          <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <Image
              src={avatarUrl}
              alt={name}
              width={40}
              height={40}
              className="object-cover w-full h-full"
              priority={false}
              unoptimized
            />
          </div>
        ) : (
          <FallbackAvatar name={name} size="md" />
        )}
      </div>

      {/* Info Container */}
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
          {name}
        </span>
        {(stambuk || subInfo) && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[200px]">
            {stambuk ? `Stambuk: ${stambuk}` : ""}{stambuk && subInfo ? " • " : ""}{subInfo || ""}
          </span>
        )}
      </div>
    </div>
  );
}
