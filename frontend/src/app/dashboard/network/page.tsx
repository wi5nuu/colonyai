"use client";

import { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import {
  Globe,
  Building2,
  Users,
  Activity,
  CheckCircle2,
  RefreshCw,
  MapPin,
  ArrowUpRight,
  X,
  Search,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

// Local world map TopoJSON (stored in public folder for offline support)
const GEO_URL = "/world-110m.json";

interface OrgNode {
  id: string;
  name: string;
  slug: string;
  location: string;
  status: string;
  license_tier: string;
  users_count: number;
  analyses_count: number;
  coordinates: [number, number]; // [lng, lat]
}

interface PopupState {
  org: OrgNode;
  x: number; // percent of map width
  y: number; // percent of map height
}

const LOCATION_COORDS: Record<string, [number, number]> = {
  jakarta: [106.8, -6.2],
  surabaya: [112.75, -7.25],
  bandung: [107.6, -6.9],
  medan: [98.7, 3.6],
  bali: [115.2, -8.4],
  makassar: [119.4, -5.1],
  semarang: [110.4, -7.0],
  singapore: [103.8, 1.35],
  "kuala lumpur": [101.7, 3.1],
  bangkok: [100.5, 13.75],
  "ho chi minh": [106.7, 10.8],
  manila: [120.9, 14.6],
  tokyo: [139.7, 35.7],
  osaka: [135.5, 34.7],
  seoul: [126.9, 37.6],
  beijing: [116.4, 39.9],
  shanghai: [121.5, 31.2],
  "hong kong": [114.2, 22.3],
  sydney: [151.2, -33.9],
  melbourne: [144.9, -37.8],
  auckland: [174.8, -36.9],
  london: [-0.1, 51.5],
  paris: [2.35, 48.8],
  frankfurt: [8.7, 50.1],
  berlin: [13.4, 52.5],
  amsterdam: [4.9, 52.4],
  geneva: [6.15, 46.2],
  luxembourg: [6.13, 49.6],
  zurich: [8.5, 47.4],
  "new york": [-74.0, 40.7],
  secaucus: [-74.1, 40.8],
  burlington: [-79.4, 36.1],
  rochester: [-92.5, 44.0],
  chicago: [-87.6, 41.9],
  "los angeles": [-118.2, 34.1],
  "san francisco": [-122.4, 37.8],
  toronto: [-79.4, 43.7],
  "sao paulo": [-46.6, -23.5],
  "buenos aires": [-58.4, -34.6],
  dubai: [55.3, 25.2],
  mumbai: [72.9, 19.1],
  delhi: [77.2, 28.6],
  johannesburg: [28.0, -26.2],
  nairobi: [36.8, -1.3],
};

const getCoordinates = (location: string): [number, number] => {
  const key = location.toLowerCase();
  for (const [k, v] of Object.entries(LOCATION_COORDS)) {
    if (key.includes(k)) return v;
  }
  // Default: Jakarta area with slight jitter
  return [106.8 + (Math.random() - 0.5) * 4, -6.2 + (Math.random() - 0.5) * 3];
};

const REGION_PRESETS = [
  { label: "Global", center: [0, 0] as [number, number], zoom: 1 },
  { label: "Southeast Asia", center: [115, -3] as [number, number], zoom: 3 },
  { label: "Asia Pacific", center: [130, 25] as [number, number], zoom: 2 },
  { label: "Europe", center: [10, 52] as [number, number], zoom: 4 },
  { label: "Americas", center: [-80, 30] as [number, number], zoom: 2 },
];

export default function NetworkMapPage() {
  const [orgs, setOrgs] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [activeRegion, setActiveRegion] = useState("Global");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [mapZoom, setMapZoom] = useState(1);
  const [isDark, setIsDark] = useState(false);
  const [topology, setTopology] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrgs = orgs.filter((org) => {
    const query = searchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(query) ||
      org.location.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(document.documentElement.classList.contains("dark") || mq.matches);
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Fetch world topology with CDN fallback
    const CDN_URLS = [
      "/world-110m.json",
      "https://unpkg.com/world-atlas@2/countries-110m.json",
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
    ];
    const fetchTopology = async () => {
      for (const url of CDN_URLS) {
        try {
          const res = await fetch(url, { cache: "force-cache" });
          if (res.ok) {
            const data = await res.json();
            setTopology(data);
            return;
          }
        } catch {
          // try next CDN
        }
      }
    };
    fetchTopology();

    return () => observer.disconnect();
  }, []);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.get<any[]>("/api/v1/super/organizations");
      const mapped: OrgNode[] = res.data.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        location: org.location || "Jakarta, Indonesia",
        status: org.status,
        license_tier: org.license_tier,
        users_count: org.users_count || 0,
        analyses_count: org.analyses_count || 0,
        coordinates: getCoordinates(org.location || "Jakarta"),
      }));
      setOrgs(mapped);
    } catch {
      toast.error("Failed to fetch organization network data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRegion = (r: (typeof REGION_PRESETS)[0]) => {
    setActiveRegion(r.label);
    setMapCenter(r.center);
    setMapZoom(r.zoom);
    setPopup(null);
  };

  const activeOrgs = orgs.filter((o) => o.status === "active");
  const totalAnalyses = orgs.reduce((a, o) => a + o.analyses_count, 0);
  const totalUsers = orgs.reduce((a, o) => a + o.users_count, 0);

  if (!mounted) return null;

  return (
    <div className="flex flex-col w-full bg-white dark:bg-slate-950 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="px-4 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-none">
            Global Network Map
          </h1>
          <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
            Real-time organization location intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-2 py-1 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {activeOrgs.length} Active Nodes
          </div>
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-800">
        {[
          { label: "Total Organizations", val: orgs.length, icon: Building2 },
          { label: "Active Nodes", val: activeOrgs.length, icon: CheckCircle2 },
          { label: "Total Users", val: totalUsers, icon: Users },
          {
            label: "Total Analyses",
            val: totalAnalyses.toLocaleString(),
            icon: Activity,
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-5 py-4 bg-white dark:bg-slate-900 ${i < 3 ? "border-r border-slate-200 dark:border-slate-800" : ""}`}
          >
            <s.icon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                {s.label}
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                {s.val}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-1" style={{ minHeight: 0 }}>
        {/* Map Area */}
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 relative">
          {/* Region Tabs */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4 bg-slate-50 dark:bg-slate-900/80 shrink-0">
            {REGION_PRESETS.map((r) => (
              <button
                key={r.label}
                onClick={() => handleRegion(r)}
                className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${
                  activeRegion === r.label
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-4 pr-2">
              {/* Sleek Search Input */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search nodes..."
                  className="w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary transition-all px-2 py-1 pl-6 rounded-none uppercase tracking-wide placeholder:text-slate-400"
                />
                <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{" "}
                  Active
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />{" "}
                  Inactive
                </span>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div
            className="flex-1 relative bg-slate-100 dark:bg-slate-950 overflow-hidden"
            onClick={(e: any) => {
              // Close popup if clicking on the map background
              if ((e.target as HTMLElement).tagName === "path") setPopup(null);
            }}
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Globe className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-pulse mx-auto" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Loading Network...
                  </p>
                </div>
              </div>
            ) : (
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ center: mapCenter, scale: 130 * mapZoom }}
                style={{ width: "100%", height: "100%" }}
              >
                <ZoomableGroup center={mapCenter} zoom={mapZoom}>
                  <Geographies geography={GEO_URL}>
                    {({ geographies }: { geographies: any[] }) =>
                      geographies.map((geo: any) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          style={{
                            default: {
                              fill: isDark ? "#1e293b" : "#e2e8f0",
                              stroke: isDark ? "#334155" : "#cbd5e1",
                              strokeWidth: 0.4,
                              outline: "none",
                            },
                            hover: {
                              fill: isDark ? "#334155" : "#cbd5e1",
                              stroke: isDark ? "#475569" : "#94a3b8",
                              strokeWidth: 0.4,
                              outline: "none",
                            },
                            pressed: { outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>

                  {filteredOrgs.map((org) => {
                    const isActive = org.status === "active";
                    const isHovered = hoveredId === org.id;
                    const isSelected = popup?.org.id === org.id;
                    return (
                      <Marker
                        key={org.id}
                        coordinates={org.coordinates}
                        onClick={(e: any) => {
                          e.stopPropagation();
                          if (popup?.org.id === org.id) {
                            setPopup(null);
                            return;
                          }
                          // Get position from the SVG marker event
                          const svgEl = (e.target as SVGElement).closest("svg");
                          if (!svgEl) return;
                          const rect = svgEl.getBoundingClientRect();
                          const cx = (e as any).clientX - rect.left;
                          const cy = (e as any).clientY - rect.top;
                          setPopup({ org, x: cx, y: cy + 16 });
                        }}
                        onMouseEnter={() => setHoveredId(org.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        {/* Pulse ring */}
                        {isActive && (
                          <circle
                            r={isHovered || isSelected ? 14 : 10}
                            fill={
                              isSelected
                                ? "rgba(99,102,241,0.2)"
                                : "rgba(16,185,129,0.2)"
                            }
                            className="animate-pulse"
                          />
                        )}
                        {/* Main dot */}
                        <circle
                          r={isHovered || isSelected ? 7 : 5}
                          fill={
                            isSelected
                              ? "#6366f1"
                              : isActive
                                ? "#10b981"
                                : "#94a3b8"
                          }
                          stroke={
                            isSelected
                              ? "#fff"
                              : isActive
                                ? "rgba(255,255,255,0.6)"
                                : "rgba(255,255,255,0.3)"
                          }
                          strokeWidth={1.5}
                          style={{ cursor: "pointer", transition: "r 0.15s" }}
                        />
                        {/* Name label on hover */}
                        {(isHovered || isSelected) && (
                          <>
                            <rect
                              x={-50}
                              y={-26}
                              width={100}
                              height={18}
                              rx={0}
                              fill="#0f172a"
                              opacity={0.88}
                            />
                            <text
                              textAnchor="middle"
                              y={-13}
                              fontSize={7}
                              fontWeight="800"
                              fill="white"
                              style={{ pointerEvents: "none" }}
                            >
                              {org.name.length > 20
                                ? org.name.slice(0, 18) + "…"
                                : org.name}
                            </text>
                          </>
                        )}
                      </Marker>
                    );
                  })}
                </ZoomableGroup>
              </ComposableMap>
            )}

            {/* Popup — positioned BELOW the clicked dot */}
            {popup && (
              <div
                className="absolute z-30 w-56 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
                style={{
                  left: Math.min(popup.x - 112, window.innerWidth - 240),
                  top: popup.y + 8,
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-[10px] font-black text-slate-900 dark:text-white tracking-widest truncate">
                      {popup.org.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setPopup(null)}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ml-1 shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-3 space-y-3">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${popup.org.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`}
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {popup.org.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 border border-slate-100 dark:border-slate-800">
                    <div className="p-2 border-r border-slate-100 dark:border-slate-800">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                        Users
                      </p>
                      <p className="text-base font-black text-slate-900 dark:text-white">
                        {popup.org.users_count}
                      </p>
                    </div>
                    <div className="p-2">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                        Analyses
                      </p>
                      <p className="text-base font-black text-slate-900 dark:text-white">
                        {popup.org.analyses_count}
                      </p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                        Location
                      </span>
                      <span className="text-[9px] font-black text-slate-900 dark:text-white text-right">
                        {popup.org.location}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        License
                      </span>
                      <span className="text-[9px] font-black text-primary uppercase">
                        {popup.org.license_tier}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <a
                    href="/dashboard/super"
                    className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
                  >
                    <ArrowUpRight className="w-3 h-3" /> Open Observability
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — max 10 rows, scrollable */}
        <div className="w-72 flex flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 shrink-0">
            <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Active Regions{" "}
              <span className="text-primary ml-1">{filteredOrgs.length}</span>
            </p>
          </div>

          {/* Scrollable list — 10 items visible */}
          <div
            className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ maxHeight: "560px" }}
          >
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orgs.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-slate-400 gap-2">
                <Globe className="w-6 h-6 opacity-20" />
                <p className="text-[9px] font-black uppercase tracking-widest">
                  No organizations
                </p>
              </div>
            ) : (
              filteredOrgs.map((org) => (
                <div
                  key={org.id}
                  onClick={() => {
                    if (popup?.org.id === org.id) {
                      setPopup(null);
                      return;
                    }
                    setPopup({ org, x: 100, y: 100 });
                  }}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-2 ${
                    popup?.org.id === org.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${org.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none mb-0.5 truncate">
                        {org.name}
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none truncate">
                        {org.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-[10px] font-black text-slate-900 dark:text-white font-mono leading-none mb-0.5">
                      {org.analyses_count}
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                      analyses
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom metrics */}
          <div className="border-t border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 mt-auto shrink-0">
            {[
              {
                label: "Edge Requests",
                val: "1.2K",
                trend: "+12%",
                color: "emerald",
              },
              {
                label: "Error Rate (5xx)",
                val: "0%",
                trend: "0%",
                color: "slate",
              },
              {
                label: "Avg Inference",
                val: "124ms",
                trend: "+5%",
                color: "blue",
              },
            ].map((m) => (
              <div
                key={m.label}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {m.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white">
                    {m.val}
                  </span>
                  <span
                    className={`text-[8px] font-black px-1 py-0.5 ${
                      m.color === "emerald"
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
                        : m.color === "blue"
                          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
                          : "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    {m.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
