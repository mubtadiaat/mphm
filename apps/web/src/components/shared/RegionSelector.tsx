"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Region {
  id: string;
  name: string;
}

interface RegionSelectorProps {
  onChange: (address: string) => void;
}

interface PostalRecord {
  code: number | string;
  village: string;
  district: string;
  regency: string;
  province: string;
}

const FALLBACK_REGIONS = {
  provinces: [
    { id: "31", name: "DKI JAKARTA" },
    { id: "32", name: "JAWA BARAT" },
    { id: "33", name: "JAWA TENGAH" },
    { id: "35", name: "JAWA TIMUR" },
    { id: "73", name: "SULAWESI SELATAN" }
  ],
  regencies: {
    "31": [
      { id: "31.71", name: "KOTA JAKARTA SELATAN" },
      { id: "31.73", name: "KOTA JAKARTA BARAT" },
      { id: "31.74", name: "KOTA JAKARTA PUSAT" }
    ],
    "32": [
      { id: "32.73", name: "KOTA BANDUNG" },
      { id: "32.75", name: "KOTA BEKASI" },
      { id: "32.04", name: "KABUPATEN BANDUNG" }
    ],
    "33": [
      { id: "33.74", name: "KOTA SEMARANG" },
      { id: "33.72", name: "KOTA SURAKARTA" },
      { id: "33.02", name: "KABUPATEN BANYUMAS" }
    ],
    "35": [
      { id: "35.78", name: "KOTA SURABAYA" },
      { id: "35.73", name: "KOTA MALANG" },
      { id: "35.07", name: "KABUPATEN MALANG" }
    ],
    "73": [
      { id: "73.71", name: "KOTA MAKASSAR" },
      { id: "73.06", name: "KABUPATEN GOWA" }
    ]
  } as Record<string, Region[]>,
  districts: {
    "31.71": [
      { id: "31.71.01", name: "KEBAYORAN BARU" },
      { id: "31.71.03", name: "CILANDAK" }
    ],
    "31.73": [
      { id: "31.73.01", name: "CENGKARENG" },
      { id: "31.73.04", name: "KEBON JERUK" }
    ],
    "31.74": [
      { id: "31.74.01", name: "MENTENG" },
      { id: "31.74.02", name: "TANAH ABANG" }
    ],
    "32.73": [
      { id: "32.73.01", name: "COBLONG" },
      { id: "32.73.02", name: "LENGKONG" }
    ],
    "32.75": [
      { id: "32.75.01", name: "BEKASI BARAT" },
      { id: "32.75.02", name: "BEKASI TIMUR" }
    ],
    "33.74": [
      { id: "33.74.01", name: "SEMARANG TENGAH" },
      { id: "33.74.02", name: "TEMBALANG" }
    ],
    "35.78": [
      { id: "35.78.01", name: "GUBENG" },
      { id: "35.78.02", name: "TEGALSARI" }
    ],
    "35.73": [
      { id: "35.73.01", name: "LOWOKWARU" },
      { id: "35.73.02", name: "KLOJEN" }
    ],
    "73.71": [
      { id: "73.71.01", name: "RAPPOCINI" },
      { id: "73.71.02", name: "TAMALATE" }
    ]
  } as Record<string, Region[]>,
  villages: {
    "31.71.01": [
      { id: "31.71.01.1001", name: "SELONG" },
      { id: "31.71.01.1002", name: "GUNUNG" }
    ],
    "31.71.03": [
      { id: "31.71.03.1001", name: "CILANDAK BARAT" },
      { id: "31.71.03.1002", name: "CIPETE SELATAN" }
    ],
    "31.73.01": [
      { id: "31.73.01.1001", name: "CENGKARENG TIMUR" },
      { id: "31.73.01.1002", name: "KAPUK" }
    ],
    "32.73.01": [
      { id: "32.73.01.1001", name: "DAGO" },
      { id: "32.73.01.1002", name: "SADANGSERANG" }
    ],
    "33.74.01": [
      { id: "33.74.01.1001", name: "SEKAYU" },
      { id: "33.74.01.1002", name: "MIJEN" }
    ],
    "35.78.01": [
      { id: "35.78.01.1001", name: "AIRLANGGA" },
      { id: "35.78.01.1002", name: "PUCANG SEWU" }
    ],
    "35.73.01": [
      { id: "35.73.01.1001", name: "TULUNGAGUNG" },
      { id: "35.73.01.1002", name: "JATIMULYO" }
    ],
    "73.71.01": [
      { id: "73.71.01.1001", name: "BENTENG" },
      { id: "73.71.01.1002", name: "BALLAPARANG" }
    ]
  } as Record<string, Region[]>
};

export function RegionSelector({ onChange }: RegionSelectorProps) {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [regencies, setRegencies] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");

  const [loading, setLoading] = useState(false);
  const [apiSource, setApiSource] = useState("cahyadsn");
  const [apiKey, setApiKey] = useState("8e49f28e0f2f2cf56393c352613eec358e85fb7077ce6f7f453ebb826a7b1f6d");

  // Postcode Autocomplete states
  const [postcode, setPostcode] = useState("");
  const [loadingPostcode, setLoadingPostcode] = useState(false);

  // Load configuration from settings Cockpit dynamically
  useEffect(() => {
    const loadConfig = () => {
      if (typeof window !== "undefined") {
        setApiSource(localStorage.getItem("region_api_source") || "cahyadsn");
        setApiKey(localStorage.getItem("binderbyte_api_key") || "8e49f28e0f2f2cf56393c352613eec358e85fb7077ce6f7f453ebb826a7b1f6d");
      }
    };
    loadConfig();
    window.addEventListener("region_settings_changed", loadConfig);
    return () => {
      window.removeEventListener("region_settings_changed", loadConfig);
    };
  }, []);

  // 1. Fetch Provinces on mount
  useEffect(() => {
    async function fetchProvinces() {
      setLoading(true);
      try {
        if (apiSource === "cahyadsn") {
          const res = await fetch("/wilayah/provinces.json");
          const json = await res.json();
          setProvinces(json || []);
        } else if (apiSource === "emsifa") {
          const res = await fetch("https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json");
          const data = await res.json();
          setProvinces(data || []);
        } else if (apiSource === "binderbyte") {
          const res = await fetch(`https://api.binderbyte.com/wilayah/provinsi?api_key=${apiKey}`);
          const data = await res.json();
          setProvinces(data.value || []);
        } else {
          setProvinces(FALLBACK_REGIONS.provinces);
        }
      } catch (err) {
        console.warn("Failed to fetch provinces, falling back to local database:", err);
        setProvinces(FALLBACK_REGIONS.provinces);
      } finally {
        setLoading(false);
      }
    }
    fetchProvinces();
  }, [apiSource, apiKey]);

  // 2. Fetch Regencies when province changes
  useEffect(() => {
    if (!selectedProvince) return;
    async function fetchRegencies() {
      setLoading(true);
      try {
        if (apiSource === "cahyadsn") {
          const res = await fetch("/wilayah/regencies.json");
          const json = await res.json();
          setRegencies(json[selectedProvince] || []);
        } else if (apiSource === "emsifa") {
          const cleanProv = selectedProvince.replace(/\./g, "");
          const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${cleanProv}.json`);
          const data = await res.json();
          setRegencies(data || []);
        } else if (apiSource === "binderbyte") {
          const cleanProv = selectedProvince.replace(/\./g, "");
          const res = await fetch(`https://api.binderbyte.com/wilayah/kabupaten?api_key=${apiKey}&id_provinsi=${cleanProv}`);
          const data = await res.json();
          setRegencies(data.value || []);
        } else {
          setRegencies(FALLBACK_REGIONS.regencies[selectedProvince] || []);
        }
      } catch (err) {
        console.warn(`Failed to fetch regencies, falling back to local database:`, err);
        setRegencies(FALLBACK_REGIONS.regencies[selectedProvince] || []);
      } finally {
        setLoading(false);
      }
    }
    fetchRegencies();
  }, [selectedProvince, apiSource, apiKey]);

  // 3. Fetch Districts when regency changes
  useEffect(() => {
    if (!selectedRegency) return;
    async function fetchDistricts() {
      setLoading(true);
      try {
        if (apiSource === "cahyadsn") {
          const res = await fetch("/wilayah/districts.json");
          const json = await res.json();
          setDistricts(json[selectedRegency] || []);
        } else if (apiSource === "emsifa") {
          const cleanReg = selectedRegency.replace(/\./g, "");
          const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${cleanReg}.json`);
          const data = await res.json();
          setDistricts(data || []);
        } else if (apiSource === "binderbyte") {
          const cleanReg = selectedRegency.replace(/\./g, "");
          const res = await fetch(`https://api.binderbyte.com/wilayah/kecamatan?api_key=${apiKey}&id_kabupaten=${cleanReg}`);
          const data = await res.json();
          setDistricts(data.value || []);
        } else {
          setDistricts(FALLBACK_REGIONS.districts[selectedRegency] || []);
        }
      } catch (err) {
        console.warn(`Failed to fetch districts, falling back to local database:`, err);
        setDistricts(FALLBACK_REGIONS.districts[selectedRegency] || []);
      } finally {
        setLoading(false);
      }
    }
    fetchDistricts();
  }, [selectedRegency, apiSource, apiKey]);

  // 4. Fetch Villages when district changes
  useEffect(() => {
    if (!selectedDistrict) return;
    async function fetchVillages() {
      setLoading(true);
      try {
        if (apiSource === "cahyadsn") {
          const cleanDist = selectedDistrict.replace(/\./g, "");
          const res = await fetch(`/wilayah/villages/${cleanDist}.json`);
          const json = await res.json();
          setVillages(json || []);
        } else if (apiSource === "emsifa") {
          const cleanDist = selectedDistrict.replace(/\./g, "");
          const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/villages/${cleanDist}.json`);
          const data = await res.json();
          setVillages(data || []);
        } else if (apiSource === "binderbyte") {
          const cleanDist = selectedDistrict.replace(/\./g, "");
          const res = await fetch(`https://api.binderbyte.com/wilayah/kelurahan?api_key=${apiKey}&id_kecamatan=${cleanDist}`);
          const data = await res.json();
          setVillages(data.value || []);
        } else {
          setVillages(FALLBACK_REGIONS.villages[selectedDistrict] || []);
        }
      } catch (err) {
        console.warn(`Failed to fetch villages, falling back to local database:`, err);
        setVillages(FALLBACK_REGIONS.villages[selectedDistrict] || []);
      } finally {
        setLoading(false);
      }
    }
    fetchVillages();
  }, [selectedDistrict, apiSource, apiKey]);

  // Autocomplete Postal Code when all data is selected
  useEffect(() => {
    if (!selectedVillage) return;

    const vilName = villages.find(v => v.id === selectedVillage)?.name || "";
    const distName = districts.find(d => d.id === selectedDistrict)?.name || "";
    const regName = regencies.find(r => r.id === selectedRegency)?.name || "";

    if (!vilName) return;

    let active = true;

    async function fetchPostcode() {
      setLoadingPostcode(true);
      try {
        const res = await fetch(`https://kodepos.vercel.app/search?q=${encodeURIComponent(vilName)}`);
        const json = await res.json();
        
        const cleanName = (str: string) => str.toLowerCase().replace(/(kabupaten|kab\.|kota|kecamatan|kec\.|kelurahan|desa|kel\.)/g, "").trim();

        const cleanReg = cleanName(regName);
        const cleanDist = cleanName(distName);
        const cleanVil = cleanName(vilName);

        const matches = json.data || json || [];
        if (Array.isArray(matches) && active) {
          const matchedRecord = matches.find((m: PostalRecord) => {
            const mReg = cleanName(m.regency || "");
            const mDist = cleanName(m.district || "");
            const mVil = cleanName(m.village || "");
            return mVil === cleanVil && (mDist === cleanDist || mReg === cleanReg);
          }) || matches[0];

          if (matchedRecord && matchedRecord.code) {
            setPostcode(String(matchedRecord.code));
          } else {
            setPostcode("");
          }
        }
      } catch (err) {
        console.warn("Failed to fetch postcode automatically:", err);
        if (active) setPostcode("");
      } finally {
        if (active) setLoadingPostcode(false);
      }
    }

    fetchPostcode();
    return () => {
      active = false;
    };
  }, [selectedVillage, selectedDistrict, selectedRegency, villages, districts, regencies]);

  // 5. Update complete address string when any dropdown changes
  useEffect(() => {
    const provName = provinces.find(p => p.id === selectedProvince)?.name || "";
    const regName = regencies.find(r => r.id === selectedRegency)?.name || "";
    const distName = districts.find(d => d.id === selectedDistrict)?.name || "";
    const vilName = villages.find(v => v.id === selectedVillage)?.name || "";

    if (provName || regName || distName || vilName) {
      const parts = [];
      if (vilName) parts.push(`Desa/Kel. ${vilName}`);
      if (distName) parts.push(`Kec. ${distName}`);
      if (regName) parts.push(regName);
      if (provName) parts.push(`Provinsi ${provName}`);
      if (postcode) parts.push(`Kode Pos ${postcode}`);
      
      onChange(parts.join(", "));
    }
  }, [selectedProvince, selectedRegency, selectedDistrict, selectedVillage, provinces, regencies, districts, villages, postcode, onChange]);

  return (
    <div className="space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl relative animate-fade-in">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Pilih Wilayah Alamat</label>
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Province Select */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Provinsi</span>
          <select
            value={selectedProvince}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedProvince(val);
              setSelectedRegency("");
              setRegencies([]);
              setSelectedDistrict("");
              setDistricts([]);
              setSelectedVillage("");
              setVillages([]);
              setPostcode("");
            }}
            className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 transition-colors"
          >
            <option value="">-- Pilih Provinsi --</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name}
              </option>
            ))}
          </select>
        </div>

        {/* Regency Select */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Kota / Kabupaten</span>
          <select
            value={selectedRegency}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedRegency(val);
              setSelectedDistrict("");
              setDistricts([]);
              setSelectedVillage("");
              setVillages([]);
              setPostcode("");
            }}
            disabled={!selectedProvince}
            className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 dark:text-zinc-200 transition-colors"
          >
            <option value="">-- Pilih Kota/Kabupaten --</option>
            {regencies.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.name}
              </option>
            ))}
          </select>
        </div>

        {/* District Select */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Kecamatan</span>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedDistrict(val);
              setSelectedVillage("");
              setVillages([]);
              setPostcode("");
            }}
            disabled={!selectedRegency}
            className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 dark:text-zinc-200 transition-colors"
          >
            <option value="">-- Pilih Kecamatan --</option>
            {districts.map((dist) => (
              <option key={dist.id} value={dist.id}>
                {dist.name}
              </option>
            ))}
          </select>
        </div>

        {/* Village Select */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Kelurahan / Desa</span>
          <select
            value={selectedVillage}
            onChange={(e) => {
              setSelectedVillage(e.target.value);
              setPostcode("");
            }}
            disabled={!selectedDistrict}
            className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 dark:text-zinc-200 transition-colors"
          >
            <option value="">-- Pilih Kelurahan/Desa --</option>
            {villages.map((vil) => (
              <option key={vil.id} value={vil.id}>
                {vil.name}
              </option>
            ))}
          </select>
        </div>

        {/* Postcode Automatic Lookup */}
        <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Kode Pos (Otomatis Terisi)</span>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={postcode || (loadingPostcode ? "Mencari Kode Pos..." : "-- Kode Pos Otomatis --")}
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none dark:text-zinc-350 cursor-not-allowed font-semibold text-blue-600 dark:text-blue-400 transition-colors"
            />
            {loadingPostcode && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500 absolute right-3 top-3" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
