"use client";

interface FallbackAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

export function FallbackAvatar({ name, size = "md" }: FallbackAvatarProps) {
  // Ambil inisial 2 huruf
  const cleanName = name.trim().toUpperCase();
  const parts = cleanName.split(/\s+/);
  const initials = parts.length >= 2 
    ? `${parts[0][0]}${parts[1][0]}` 
    : cleanName.slice(0, 2);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  // Preset gradien premium (Gold/Blue, Emerald, Purple-sunset)
  const gradients = [
    "from-amber-500 to-yellow-600 text-white",
    "from-blue-600 to-indigo-700 text-white",
    "from-emerald-500 to-teal-600 text-white",
    "from-purple-600 to-pink-600 text-white",
  ];

  // Tentukan gradien semi-konsisten berdasarkan panjang nama
  const gradientIdx = name.length % gradients.length;
  const gradient = gradients[gradientIdx];

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-linear-to-br ${gradient} flex items-center justify-center font-bold tracking-wider shadow-sm transition-transform duration-200`}>
      {initials}
    </div>
  );
}
