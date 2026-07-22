"use client";
import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface SearchedPerson {
  id: string;
  fullName: string;
  role?: string;
  nik?: string;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchedPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Reset search states when closing
  useEffect(() => {
    if (!open) {
      setSearch("");
      setResults([]);
    }
  }, [open]);

  // Live search debounced/fetch
  useEffect(() => {
    if (!search) {
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        // Fetch people with query
        const res = await fetch(`${apiUrl}/api/admin/people?q=${encodeURIComponent(search)}`, {
          headers: {
            "Accept": "application/json",
          },
          credentials: "include",
        });
        const json = await res.json();
        if (json.status === "Success") {
          setResults(json.data || []);
        }
      } catch (err) {
        console.error("Command palette search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (!val) {
      setResults([]);
    }
  };

  const handleSelect = (personId: string, role: string) => {
    setOpen(false);
    setSearch("");
    // Redirect to profile 360 view
    if (role === "Sekretariat") {
      router.push(`/sekretariat/people/${personId}`);
    } else {
      router.push(`/mufattisy/santri/${personId}`);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Glassmorphism Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden relative z-10"
          >
            <Command className="w-full">
              <div className="flex items-center px-4 border-b border-zinc-100 dark:border-zinc-800">
                <Search className="w-5 h-5 text-zinc-400" />
                <Command.Input 
                  value={search}
                  onValueChange={handleSearchChange}
                  placeholder="Cari santri, pengajar, wali (ESC untuk tutup)..." 
                  className="flex-1 px-4 py-4 bg-transparent outline-none text-zinc-900 dark:text-white placeholder-zinc-400"
                />
                {loading && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
              </div>
              
              <Command.List className="max-h-[300px] overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                  {loading ? "Mencari..." : "Pencarian tidak ditemukan."}
                </Command.Empty>
                
                <Command.Group heading="Navigasi Utama">
                  <Command.Item 
                    onSelect={() => { setOpen(false); router.push("/sekretariat"); }}
                    className="px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                  >
                    Dashboard Sekretariat
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { setOpen(false); router.push("/mustahiq/penilaian"); }}
                    className="px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-150 dark:hover:bg-zinc-800 text-sm aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                  >
                    Input Nilai Kwartal
                  </Command.Item>
                </Command.Group>

                {results.length > 0 && (
                  <Command.Group heading="Hasil Pencarian">
                    {results.map((person) => (
                      <Command.Item
                        key={person.id}
                        onSelect={() => handleSelect(person.id, person.role || "Santri")}
                        className="px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800 flex justify-between items-center"
                      >
                        <span>{person.fullName}</span>
                        {person.nik && <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">NIK: {person.nik}</span>}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
