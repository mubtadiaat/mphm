"use client";
/* eslint-disable @next/next/no-img-element */

import { useAuth, useLogout, UserSession } from "../../lib/auth";
import { FallbackAvatar } from "../shared/FallbackAvatar";
import { LogOut, Loader2, Settings, Camera, X, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api";
import { useToast } from "../shared/ToastContext";
import { createPortal } from "react-dom";

export function HeaderProfile() {
  const { data: user, isLoading } = useAuth();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Settings Form States
  const [newFullName, setNewFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Password States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Show/Hide Password States
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
      </div>
    );
  }

  const name = user?.fullName || "User MPHM";
  const role = user?.role || "Pengguna";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadFeedback("Mengompres & mengunggah berkas...");

    try {
      const res = await apiRequest<{ status: string; data: { signature: string; timestamp: number; cloudName: string; apiKey: string; folder?: string } }>("/api/media/signature");
      const sigRes = res.data;
      
      if (sigRes && sigRes.signature) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", sigRes.apiKey);
        formData.append("timestamp", String(sigRes.timestamp));
        formData.append("signature", sigRes.signature);
        if (sigRes.folder) {
          formData.append("folder", sigRes.folder);
        }

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigRes.cloudName}/image/upload`, {
          method: "POST",
          body: formData
        });
        
        const uploadData = await uploadRes.json();
        if (uploadData.secure_url) {
          setAvatarUrl(uploadData.secure_url);
          setUploadFeedback("Foto profil berhasil diunggah!");
          toast("Foto profil berhasil diunggah!", "success", "Berhasil");
        } else {
          throw new Error("Upload response invalid");
        }
      } else {
        throw new Error("Signature invalid");
      }
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      toast("Gagal mengunggah foto ke server. Silahkan hubungi developer.", "error", "Unggah Gagal");
      setUploadFeedback("Upload gagal. Silakan coba lagi.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newFullName.trim()) {
      toast("Nama lengkap tidak boleh kosong!", "error", "Validasi Gagal");
      return;
    }

    // If attempting to change password
    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword) {
        toast("Harap masukkan password lama Anda!", "warning", "Validasi Gagal");
        return;
      }
      if (!newPassword || !confirmPassword) {
        toast("Harap masukkan password baru dan konfirmasi!", "warning", "Validasi Gagal");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast("Konfirmasi password baru tidak cocok!", "error", "Password Tidak Cocok");
        return;
      }
      if (newPassword.length < 6) {
        toast("Password baru minimal terdiri dari 6 karakter!", "error", "Password Terlalu Pendek");
        return;
      }
    }

    setIsSaving(true);
    
    try {
      await apiRequest("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: newFullName,
          avatarUrl: avatarUrl,
          oldPassword: oldPassword || undefined,
          newPassword: newPassword || undefined,
        })
      });

      // Apply changes locally via TanStack Query client
      queryClient.setQueryData<UserSession>(["auth-session"], (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          fullName: newFullName,
          avatarUrl: avatarUrl
        };
      });

      toast("Pengaturan akun Anda berhasil diperbarui!", "success", "Perubahan Disimpan");
      
      // Clear password inputs
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Auto-close modal after delay
      setTimeout(() => {
        setShowSettingsModal(false);
      }, 1500);
    } catch (err: any) {
      toast(err.message || "Terjadi kesalahan saat menyimpan pengaturan.", "error", "Gagal Menyimpan");
    } finally {
      setIsSaving(false);
    }
    

  };

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 hover:opacity-85 transition-opacity duration-150 cursor-pointer focus:outline-none"
      >
        {user?.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt={name} 
            className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
          />
        ) : (
          <FallbackAvatar name={name} size="sm" />
        )}
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <>
            {/* Backdrop close area */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setDropdownOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              {/* Header Info */}
              <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-1">
                <span className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{name}</span>
                <span className="text-[10px] font-semibold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full w-fit uppercase">
                  {role}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    console.log("HeaderProfile: Opening settings modal. Mounted status:", mounted);
                    setNewFullName(name);
                    setAvatarUrl(user?.avatarUrl || null);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowSettingsModal(true);
                    // Defer closing dropdown to ensure state updates execute cleanly
                    setTimeout(() => {
                      setDropdownOpen(false);
                    }, 50);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors text-sm font-medium text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-zinc-500" />
                  <span>Pengaturan Akun</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logoutMutation.mutate();
                  }}
                  disabled={logoutMutation.isPending}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors text-sm font-medium text-left cursor-pointer"
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span>Keluar Sistem</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Account Settings Modal rendered outside stacking context via Portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showSettingsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSettingsModal(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden relative z-50 flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                      Pengaturan Profil & Keamanan
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Perbarui nama lengkap, pas foto, dan sandi kredensial akun Anda.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSaveSettings} className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Section 1: Profil */}
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-100 dark:border-zinc-850 pb-1">I. Profil Pengguna</span>
                    
                    {/* Foto Profil Upload Zone */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-zinc-50 dark:bg-zinc-800/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <div className="relative shrink-0 w-20 h-20 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-750 bg-white dark:bg-zinc-900 flex items-center justify-center group shadow-inner">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <FallbackAvatar name={newFullName || name} size="lg" />
                        )}
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                            Loading...
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Foto Profil Akun</label>
                        <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer w-fit shadow-xs font-semibold transition-colors">
                          <Camera className="w-4 h-4 text-zinc-455" />
                          <span>Pilih Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {uploadFeedback && (
                          <span className="text-[10px] text-zinc-500 font-mono mt-0.5">{uploadFeedback}</span>
                        )}
                      </div>
                    </div>

                    {/* Nama Lengkap Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nama Lengkap *</label>
                      <input
                        type="text"
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda..."
                        className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-250 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  {/* Section 2: Ganti Password */}
                  <div className="space-y-4 pt-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-100 dark:border-zinc-850 pb-1">II. Ganti Kata Sandi (Opsional)</span>
                    
                    {/* Password Lama */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Password Lama</label>
                      <div className="relative">
                        <input
                          type={showOldPass ? "text" : "password"}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Masukkan password lama..."
                          className="w-full pl-3 pr-10 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-250 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPass(!showOldPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                        >
                          {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Baru */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Password Baru</label>
                      <div className="relative">
                        <input
                          type={showNewPass ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Masukkan password baru..."
                          className="w-full pl-3 pr-10 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-250 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Konfirmasi Password Baru</label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Masukkan kembali password baru..."
                          className="w-full pl-3 pr-10 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-250 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Modal Actions Footer */}
                  <div className="flex justify-end gap-3 pt-5 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowSettingsModal(false)}
                      className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-750 dark:text-zinc-200 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`px-5 py-2.5 text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-colors cursor-pointer ${
                        isSaving
                          ? "bg-zinc-400 text-zinc-100 cursor-not-allowed"
                          : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      }`}
                    >
                      {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
