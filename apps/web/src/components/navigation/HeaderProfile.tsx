"use client";
/* eslint-disable @next/next/no-img-element */

import { useAuth, useLogout, UserSession } from "../../lib/auth";
import { FallbackAvatar } from "../shared/FallbackAvatar";
import { LogOut, Loader2, Settings, Camera, X, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api";
import { useToast } from "../shared/ToastContext";
import { createPortal } from "react-dom";
import { signInWithGoogle } from "@/lib/firebase/client";

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
  const [googleLinking, setGoogleLinking] = useState(false);
  
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
          if (avatarUrl && avatarUrl !== user?.avatarUrl) {
            apiRequest("/api/media", {
              method: "DELETE",
              body: JSON.stringify({ url: avatarUrl })
            }).catch(e => console.error("Failed to cleanup old preview", e));
          }

          setAvatarUrl(uploadData.secure_url);
          setUploadFeedback("Foto profil berhasil diunggah!");
          toast("Foto profil berhasil diunggah!", "success", "Berhasil");
        } else {
          throw new Error("Upload response invalid");
        }
      } else {
        throw new Error("Signature invalid");
      }
    } catch (err: unknown) {
      console.error("Cloudinary upload error:", err);
      toast("Gagal mengunggah foto ke server. Silahkan hubungi developer.", "error", "Unggah Gagal");
      setUploadFeedback("Upload gagal. Silakan coba lagi.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLinkGoogle = async () => {
    setGoogleLinking(true);
    try {
      const { user: fbUser, error: fbError } = await signInWithGoogle();
      if (fbError || !fbUser) {
        throw new Error(fbError || "Gagal melakukan otentikasi dengan Google.");
      }

      const res = await apiRequest<{ status: string; message: string }>("/api/auth/google-link", {
        method: "POST",
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
        }),
      });

      toast(res.message || "Akun Google berhasil ditautkan!", "success", "Berhasil Ditautkan");
      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Gagal menautkan akun Google.", "error", "Penautan Gagal");
    } finally {
      setGoogleLinking(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    setGoogleLinking(true);
    try {
      const res = await apiRequest<{ status: string; message: string }>("/api/auth/google-link", {
        method: "DELETE",
      });

      toast(res.message || "Tautan akun Google berhasil dilepas.", "success", "Berhasil");
      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Gagal melepaskan penautan.", "error", "Gagal");
    } finally {
      setGoogleLinking(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newFullName.trim()) {
      toast("Nama lengkap tidak boleh kosong!", "error", "Validasi Gagal");
      return;
    }

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

      queryClient.setQueryData<UserSession>(["auth-session"], (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          fullName: newFullName,
          avatarUrl: avatarUrl
        };
      });

      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      toast("Pengaturan akun Anda berhasil diperbarui!", "success", "Perubahan Disimpan");
      
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setShowSettingsModal(false);
      }, 1000);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan pengaturan.", "error", "Gagal Menyimpan");
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
              <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-1">
                <span className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{name}</span>
                <span className="text-[10px] font-semibold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full w-fit uppercase">
                  {role}
                </span>
              </div>

              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setNewFullName(name);
                    setAvatarUrl(user?.avatarUrl || null);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowSettingsModal(true);
                    setTimeout(() => setDropdownOpen(false), 50);
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

      {mounted && createPortal(
        <AnimatePresence>
          {showSettingsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  if (avatarUrl && avatarUrl !== user?.avatarUrl) {
                    apiRequest("/api/media", { method: "DELETE", body: JSON.stringify({ url: avatarUrl }) }).catch(() => {});
                  }
                  setShowSettingsModal(false);
                }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden relative z-50 flex flex-col max-h-[88vh]"
              >
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md shrink-0">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                      Pengaturan Profil & Keamanan
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Perbarui profil, kata sandi, dan tautan autentikasi Google.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (avatarUrl && avatarUrl !== user?.avatarUrl) {
                        apiRequest("/api/media", { method: "DELETE", body: JSON.stringify({ url: avatarUrl }) }).catch(() => {});
                      }
                      setShowSettingsModal(false);
                    }}
                    className="p-2 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-2xl transition-colors text-zinc-500 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSaveSettings} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                  {/* Section 1: Profil */}
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                      I. Profil Pengguna
                    </span>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl">
                      <div className="relative shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-white dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center shadow-md">
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt="Preview Avatar" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <FallbackAvatar name={newFullName || name} size="lg" />
                        )}
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                            Loading...
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col items-center sm:items-start gap-1.5 text-center sm:text-left">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Foto Profil Akun</label>
                        <label className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-700 dark:text-zinc-200 cursor-pointer shadow-xs font-semibold transition-colors">
                          <Camera className="w-4 h-4 text-zinc-500" />
                          <span>Pilih Foto Baru</span>
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

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Nama Lengkap *</label>
                      <input
                        type="text"
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda..."
                        className="px-4 py-2.5 bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-zinc-100 font-semibold transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Section 2: Ganti Password */}
                  <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                      II. Ganti Kata Sandi (Opsional)
                    </span>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Password Lama</label>
                      <div className="relative">
                        <input
                          type={showOldPass ? "text" : "password"}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Masukkan password lama..."
                          className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-zinc-100 font-semibold transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPass(!showOldPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Password Baru</label>
                      <div className="relative">
                        <input
                          type={showNewPass ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Masukkan password baru (min 6 karakter)..."
                          className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-zinc-100 font-semibold transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Konfirmasi Password Baru</label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Masukkan kembali password baru..."
                          className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-zinc-100 font-semibold transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Penautan Akun Google */}
                  <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                      III. Penautan Akun Google / Gmail
                    </span>
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-xs">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">Masuk dengan Gmail</h4>
                          {user?.googleLinked ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 truncate">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Terhubung ({user.email})</span>
                            </div>
                          ) : (
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">Tautkan akun Gmail untuk akses login cepat.</p>
                          )}
                        </div>
                      </div>
                      
                      {user?.googleLinked ? (
                        <button
                          type="button"
                          onClick={handleUnlinkGoogle}
                          disabled={googleLinking}
                          className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200 dark:border-rose-900/40 cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {googleLinking ? "Memproses..." : "Lepas Tautan"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleLinkGoogle}
                          disabled={googleLinking}
                          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-all border border-zinc-300 dark:border-zinc-700 cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 shrink-0"
                        >
                          {googleLinking ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span>Tautkan Gmail</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Modal Actions Footer */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (avatarUrl && avatarUrl !== user?.avatarUrl) {
                          apiRequest("/api/media", { method: "DELETE", body: JSON.stringify({ url: avatarUrl }) }).catch(() => {});
                        }
                        setShowSettingsModal(false);
                      }}
                      className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`px-5 py-2.5 text-sm font-semibold rounded-xl shadow-md transition-colors cursor-pointer ${
                        isSaving
                          ? "bg-zinc-400 text-zinc-100 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
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
