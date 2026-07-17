"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Book, Code, Server, Cpu, Terminal, Zap,
  Users, ChevronRight, Search,
  Copy, Check, AlertTriangle, Info,
} from "lucide-react";
import { Footer } from "@/components/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────
type SectionId =
  | "introduction" | "quickstart" | "requirements"
  | "arch-overview" | "arch-frontend" | "arch-backend" | "arch-ml"
  | "api-auth" | "api-analyses" | "api-simulator" | "api-reports" | "api-admin"
  | "ml-model" | "ml-classes" | "ml-cfu" | "ml-iso"
  | "deploy-docker" | "deploy-deka" | "deploy-gpu" | "deploy-env"
  | "guide-roles" | "guide-upload" | "guide-simulator" | "guide-audit"
  | "changelog-v2" | "changelog-v15" | "changelog-v1";

interface NavItem { id: SectionId; label: string; }
interface NavGroup { id: string; label: string; icon: React.ReactNode; items: NavItem[]; }

// ─── Sidebar Data ─────────────────────────────────────────────────────────────
const NAV_GROUPS: NavGroup[] = [
  {
    id: "getting-started", label: "Getting Started", icon: <Book className="w-3 h-3" />,
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "quickstart", label: "Quick Start" },
      { id: "requirements", label: "System Requirements" },
    ],
  },
  {
    id: "architecture", label: "Architecture", icon: <Server className="w-3 h-3" />,
    items: [
      { id: "arch-overview", label: "Overview" },
      { id: "arch-frontend", label: "Frontend" },
      { id: "arch-backend", label: "Backend" },
      { id: "arch-ml", label: "ML Pipeline" },
    ],
  },
  {
    id: "api-reference", label: "API Reference", icon: <Code className="w-3 h-3" />,
    items: [
      { id: "api-auth", label: "Authentication" },
      { id: "api-analyses", label: "Analyses" },
      { id: "api-simulator", label: "Simulator" },
      { id: "api-reports", label: "Reports" },
      { id: "api-admin", label: "Admin" },
    ],
  },
  {
    id: "ml-detection", label: "ML & Detection", icon: <Cpu className="w-3 h-3" />,
    items: [
      { id: "ml-model", label: "YOLOv8 Model" },
      { id: "ml-classes", label: "5 Classes" },
      { id: "ml-cfu", label: "CFU Calculation" },
      { id: "ml-iso", label: "ISO-17025" },
    ],
  },
  {
    id: "deployment", label: "Deployment", icon: <Terminal className="w-3 h-3" />,
    items: [
      { id: "deploy-docker", label: "Docker Setup" },
      { id: "deploy-deka", label: "Deka Notebook" },
      { id: "deploy-gpu", label: "GPU Training" },
      { id: "deploy-env", label: "Environment Variables" },
    ],
  },
  {
    id: "user-guide", label: "User Guide", icon: <Users className="w-3 h-3" />,
    items: [
      { id: "guide-roles", label: "Roles & Permissions" },
      { id: "guide-upload", label: "Upload Analysis" },
      { id: "guide-simulator", label: "Simulator" },
      { id: "guide-audit", label: "Audit Ledger" },
    ],
  },
  {
    id: "changelog", label: "Changelog", icon: <Zap className="w-3 h-3" />,
    items: [
      { id: "changelog-v2", label: "v2.0 — Latest" },
      { id: "changelog-v15", label: "v1.5" },
      { id: "changelog-v1", label: "v1.0" },
    ],
  },
];

// ─── TOC Data per section ─────────────────────────────────────────────────────
const SECTION_TOC: Record<string, string[]> = {
  introduction:    ["What is ColonyAI", "Key Features", "Tech Stack", "Compliance"],
  quickstart:      ["Prerequisites", "Clone & Run", "Default Credentials", "Verify Installation"],
  requirements:    ["Software", "Hardware", "Optional", "Browser Support"],
  "arch-overview": ["System Diagram", "Data Flow", "Service Map"],
  "arch-frontend": ["App Router", "State Management", "i18n", "Pages"],
  "arch-backend":  ["FastAPI Structure", "Auth Layer", "File Handling", "DB Schema"],
  "arch-ml":       ["Model Loading", "Inference Pipeline", "TTA", "NMS"],
  "api-auth":      ["Login", "Refresh", "Logout", "Headers"],
  "api-analyses":  ["Upload", "List", "Detail", "Export"],
  "api-simulator": ["Endpoint", "Form Fields", "Response", "Limits"],
  "api-reports":   ["PDF Export", "Excel Export", "Batch Reports"],
  "api-admin":     ["User Management", "Model Management", "System Health"],
  "ml-model":      ["Architecture", "Training Dataset", "Metrics", "Inference Config"],
  "ml-classes":    ["colony_single", "colony_merged", "bubble", "dust_debris", "media_crack"],
  "ml-cfu":        ["Formula", "Merged Colony Estimation", "Uncertainty", "Validation"],
  "ml-iso":        ["ISO-17025 Requirements", "Audit Trail", "Uncertainty Budget"],
  "deploy-docker": ["Services", "Compose File", "Volumes", "Health Checks"],
  "deploy-deka":   ["Prerequisites", "Dataset Upload", "Training", "Calibration", "Model Upload"],
  "deploy-gpu":    ["Driver Setup", "CUDA Requirements", "Training Command", "Monitoring"],
  "deploy-env":    ["Frontend Vars", "Backend Vars", "ML Vars", "Secrets"],
  "guide-roles":   ["Role Matrix", "Permissions", "Role Assignment"],
  "guide-upload":  ["Supported Formats", "Upload Flow", "Results View", "Annotations"],
  "guide-simulator":["Open Simulator","Set Parameters","Interpret Results"],
  "guide-audit":   ["Audit Events", "Ledger View", "Export Audit"],
  "changelog-v2":  ["New Features", "Improvements", "Bug Fixes"],
  "changelog-v15": ["New Features", "Improvements", "Bug Fixes"],
  "changelog-v1":  ["Initial Release", "Known Issues"],
};

// ─── Helper Components ────────────────────────────────────────────────────────
function Badge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET:    "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    POST:   "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    DELETE: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
    PATCH:  "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    PUT:    "bg-violet-500/20 text-violet-400 border border-violet-500/30",
  };
  return (
    <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded-sm ${colors[method] ?? "bg-slate-700 text-slate-300"}`}>
      {method}
    </span>
  );
}

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-slate-800 dark:bg-slate-900 px-3 py-1.5 rounded-t border border-slate-700">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{lang}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 text-[9px] text-slate-500 hover:text-slate-300 transition-colors">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      <pre className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-b border border-t-0 border-slate-700 overflow-x-auto leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function Callout({ type, children }: { type: "info" | "warning" | "danger"; children: React.ReactNode }) {
  const styles = {
    info:    "bg-blue-500/10 border-blue-500/40 text-blue-300",
    warning: "bg-amber-500/10 border-amber-500/40 text-amber-300",
    danger:  "bg-rose-500/10 border-rose-500/40 text-rose-300",
  };
  const icons = {
    info:    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />,
    warning: <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />,
    danger:  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />,
  };
  return (
    <div className={`flex gap-2.5 border rounded p-3 my-4 text-xs leading-relaxed ${styles[type]}`}>
      {icons[type]}
      <div>{children}</div>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
      <h1 className="text-lg lg:text-xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">{title}</h1>
      {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">{sub}</p>}
    </div>
  );
}

function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mt-6 mb-3 flex items-center gap-2">
      <span className="w-1 h-4 bg-gradient-to-b from-[#0055ff] to-[#00f2ff] rounded-full inline-block" />
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{children}</p>;
}

function Table({ headers, rows, caption }: { headers: string[]; rows: (string | React.ReactNode)[][]; caption?: string }) {
  return (
    <div className="my-5">
      {caption && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 italic">{caption}</p>}
      <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm border-collapse min-w-[400px]">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80">
              {headers.map((h) => (
                <th key={h} className="text-left px-4 py-2.5 font-black uppercase tracking-wider text-xs text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-slate-900/30"}`}>
                {row.map((cell, j) => (
                  <td key={j} className={`px-4 py-2.5 text-slate-600 dark:text-slate-400 align-top ${j === 0 ? "font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap" : ""}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section Content Components ──────────────────────────────────────────────

function SectionIntroduction() {
  return (
    <div>
      <SectionTitle title="Introduction" sub="ColonyAI — Automated Computer Vision for Microbiology" />
      <H2 id="what-is">What is ColonyAI</H2>
      <P>ColonyAI is a production-grade, automated computer vision platform designed for clinical and industrial microbiology laboratories. It replaces manual colony counting with a YOLOv8-powered detection pipeline, delivering ISO-17025-compliant results with full audit traceability and zero-trust security architecture.</P>
      <Callout type="info">ColonyAI is actively used in accredited laboratory environments. All analysis outputs include uncertainty budgets per ISO 4833-1:2013.</Callout>
      <H2 id="features">Key Features</H2>
      <Table
        headers={["Feature", "Details"]}
        rows={[
          ["5-Class Detection", "colony_single, colony_merged, bubble, dust_debris, media_crack"],
          ["CFU/ml Calculation", "Auto-computed with dilution factor and plated volume"],
          ["ISO-17025 Compliance", "Full audit trail, uncertainty budget, method validation"],
          ["Simulator", "Transient analysis — test parameters without saving to DB"],
          ["Role-Based Access", "5 roles: super_admin, admin, manager, auditor, analyst"],
          ["PDF/Excel Export", "Annotated plate images, detection tables, CFU summary"],
          ["i18n", "English and Bahasa Indonesia UI"],
          ["Zero-Trust Security", "JWT + refresh tokens, ClamAV file scanning, S3 storage"],
        ]}
      />
      <H2 id="stack">Tech Stack</H2>
      <Table
        headers={["Layer", "Technology"]}
        rows={[
          ["Frontend", "Next.js 14 App Router, Tailwind CSS, Lucide Icons, Zustand"],
          ["Backend", "FastAPI (async), SQLAlchemy async, Alembic, Pydantic v2"],
          ["ML Engine", "YOLOv8n (fine-tuned), Ultralytics, OpenCV, PyTorch"],
          ["Database", "PostgreSQL 15+ with async driver (asyncpg)"],
          ["Storage", "S3-compatible (MinIO / Cloudeka Object Storage)"],
          ["Auth", "JWT HS256 access + refresh tokens, bcrypt password hashing"],
          ["File Security", "ClamAV antivirus scanning on every upload"],
          ["Deployment", "Docker Compose, NGINX reverse proxy, Redis cache"],
        ]}
      />
      <H2 id="compliance">Compliance</H2>
      <P>ColonyAI implements ISO-17025 requirements for automated colony counting methods, including measurement uncertainty, method validation records, and tamper-evident audit logs. Every analysis record is immutable once created — modifications generate new revision entries.</P>
    </div>
  );
}

function SectionQuickStart() {
  return (
    <div>
      <SectionTitle title="Quick Start" sub="Get ColonyAI running in under 5 minutes" />
      <H2 id="prereqs">Prerequisites</H2>
      <P>Ensure Docker 24+, Git, and optionally an NVIDIA GPU with CUDA 12+ are available on your system.</P>
      <Callout type="warning">Windows users: enable WSL2 backend in Docker Desktop. GPU passthrough requires WSL2 + NVIDIA Container Toolkit.</Callout>
      <H2 id="clone">Clone & Run</H2>
      <CodeBlock lang="bash" code={`git clone https://github.com/colonyai/colonyai
cd colonyai

# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env

# Build and start all services
docker compose up --build

# Services will be available at:
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
# MinIO UI:  http://localhost:9001`} />
      <H2 id="creds">Default Credentials</H2>
      <Table
        headers={["Role", "Email", "Password"]}
        rows={[
          ["super_admin", "admin@colonyai.local", "ColonyAI@2024!"],
          ["analyst", "analyst@colonyai.local", "Analyst@2024!"],
        ]}
      />
      <Callout type="danger">Change all default credentials immediately in production. The default SECRET_KEY in .env.example is not safe for production use.</Callout>
      <H2 id="verify">Verify Installation</H2>
      <CodeBlock lang="bash" code={`# Check all containers are running
docker compose ps

# Verify backend health
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","model_loaded":true,"db":"connected","storage":"connected"}`} />
    </div>
  );
}

function SectionRequirements() {
  return (
    <div>
      <SectionTitle title="System Requirements" sub="Minimum and recommended specifications" />
      <H2 id="software">Software</H2>
      <Table
        headers={["Component", "Minimum", "Recommended"]}
        rows={[
          ["Node.js", "18.x LTS", "20.x LTS"],
          ["Python", "3.13+", "3.13.x"],
          ["Docker", "24.0+", "25.0+"],
          ["Docker Compose", "v2.20+", "v2.24+"],
          ["PostgreSQL", "15+", "16+"],
          ["Redis", "7.0+", "7.2+"],
          ["OS", "Ubuntu 22.04 / Windows 11 WSL2", "Ubuntu 24.04 LTS"],
        ]}
      />
      <H2 id="hardware">Hardware</H2>
      <Table
        headers={["Component", "Minimum", "Recommended"]}
        rows={[
          ["RAM", "8 GB", "16 GB"],
          ["CPU", "4 cores", "8 cores"],
          ["Storage", "20 GB free", "50 GB SSD"],
          ["GPU", "None (CPU fallback)", "NVIDIA RTX 3060+ (CUDA 12)"],
          ["VRAM", "N/A", "8 GB+"],
        ]}
      />
      <H2 id="optional">Optional</H2>
      <P>GPU acceleration is optional. Without a GPU, inference runs on CPU with TorchScript — expect 3–8x slower analysis times depending on image resolution. CPU fallback is fully supported and tested.</P>
      <H2 id="browsers">Browser Support</H2>
      <Table
        headers={["Browser", "Version", "Support"]}
        rows={[
          ["Chrome", "120+", "Full"],
          ["Firefox", "121+", "Full"],
          ["Edge", "120+", "Full"],
          ["Safari", "17+", "Full"],
          ["Mobile Chrome", "120+", "Full (responsive)"],
        ]}
      />
    </div>
  );
}

function SectionArchOverview() {
  return (
    <div>
      <SectionTitle title="Architecture Overview" sub="End-to-end system design — how ColonyAI components connect" />

      <H2 id="diagram">System Diagram</H2>
      <P>ColonyAI uses a two-tier architecture: a Next.js 14 frontend served on port 3000 communicates with a FastAPI backend on port 8000 via REST/JSON. The backend handles auth, ML inference, file storage, and audit logging. Storage is either AWS S3 or local filesystem depending on configuration.</P>

      {/* ── Responsive Architecture Diagram ─────────────────────── */}
      <div className="my-6 space-y-3">

        {/* Row 1 — Browser */}
        <div className="flex justify-center">
          <div className="bg-[#0055ff]/10 border-2 border-[#0055ff] rounded-lg px-6 py-3 text-center min-w-[220px] max-w-sm w-full">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#0055ff] mb-0.5">Client Browser</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Next.js 14 App Router · Port 3000</div>
            <div className="text-[10px] text-slate-400 mt-1">Dashboard · Upload · Reports · Simulator</div>
          </div>
        </div>

        {/* Arrow down */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-0.5">
            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">HTTP REST / JSON</div>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
            <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 rotate-45 -mt-1.5" />
          </div>
        </div>

        {/* Row 2 — Backend */}
        <div className="flex justify-center">
          <div className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4 w-full max-w-2xl">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 text-center">FastAPI Backend · Port 8000</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Auth Router", desc: "JWT + Argon2" },
                { label: "Analysis API", desc: "Upload & Infer" },
                { label: "Admin API", desc: "Users & Orgs" },
                { label: "Reports API", desc: "PDF & Excel" },
              ].map((item) => (
                <div key={item.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 text-center">
                  <div className="text-[10px] font-black text-slate-700 dark:text-slate-300">{item.label}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-slate-200 dark:border-slate-700 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { label: "ImageProcessor", desc: "Resize · Perspective correction · Normalize" },
                  { label: "ColonyDetector", desc: "YOLOv8 inference · TTA · Per-class NMS" },
                  { label: "CFUCalculator", desc: "CFU/ml · Dilution · Uncertainty budget" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#0055ff]/5 border border-[#0055ff]/20 rounded p-2">
                    <div className="text-[10px] font-black text-[#0055ff]">{item.label}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3 — Storage layer */}
        <div className="flex justify-center">
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto w-full">
          {[
            { color: "emerald", label: "SQLite / PostgreSQL", desc: "Primary data store. SQLite by default (dev), PostgreSQL for production. Tables: users, analyses, detections, audit_log, organizations, and more." },
            { color: "amber", label: "AWS S3 / Local Storage", desc: "Object storage for raw and annotated plate images. Falls back to local uploads/ directory when S3 is not configured." },
            { color: "violet", label: "Redis Cache", desc: "Session state and JWT token blacklist for invalidated tokens. Used for rate limiting state across requests." },
          ].map((item) => (
            <div key={item.label} className={`bg-${item.color}-500/10 border border-${item.color}-500/30 rounded-lg p-3`}>
              <div className={`text-[10px] font-black uppercase tracking-widest text-${item.color}-600 dark:text-${item.color}-400 mb-1`}>{item.label}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <H2 id="dataflow">Data Flow</H2>
      <P>The following steps describe the full lifecycle of a plate image analysis from upload to results display.</P>
      <div className="space-y-2 my-4">
        {[
          { n: "1", title: "Upload", desc: "User uploads a plate image (JPEG/PNG/TIFF/WebP, max 10 MB) via the dashboard or POST /api/v1/analyses/upload." },
          { n: "2", title: "File Validation", desc: "file_validator.py checks MIME type, file size, and extension. ClamAV scans for malware. Rejected files are never stored." },
          { n: "3", title: "Image Processing", desc: "image_processor.py applies perspective correction (with warning log on failure), resizes to 640×640, and normalises pixel values." },
          { n: "4", title: "YOLOv8 Inference", desc: "colony_detector.py runs YOLOv8 with TTA (4 augmentations: original, h-flip, v-flip, 90° rotation). Predictions merged via WBF." },
          { n: "5", title: "Per-class NMS", desc: "Non-maximum suppression applied per class (IoU 0.45, conf 0.35). Class identity preserved — agnostic NMS is disabled." },
          { n: "6", title: "CFU Calculation", desc: "cfu_calculator.py computes CFU/ml using: count × dilution_factor / plated_volume_ml. Uncertainty budget included per ISO 4833-1." },
          { n: "7", title: "Persist & Audit", desc: "Analysis record, per-detection rows, and annotated image saved to DB and S3/local. Audit entry written to audit_log with user, action, timestamp." },
          { n: "8", title: "Results Render", desc: "Frontend fetches /api/v1/analyses/{id} and renders bounding boxes, CFU/ml, classification breakdown, and uncertainty on the results page." },
        ].map((step) => (
          <div key={step.n} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg hover:border-[#0055ff]/30 transition-colors">
            <div className="w-6 h-6 bg-[#0055ff] text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{step.n}</div>
            <div>
              <div className="text-sm font-black text-slate-800 dark:text-slate-200">{step.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <H2 id="services">Service Map</H2>
      <P>ColonyAI runs as two primary processes. Redis is optional but recommended for production to enable JWT blacklisting and rate limit state.</P>
      <Table
        caption="Default ports and technologies for each service in the ColonyAI stack."
        headers={["Service", "Port", "Technology", "Notes"]}
        rows={[
          ["frontend", "3000", "Next.js 14", "App Router, Tailwind CSS, Zustand, React Query"],
          ["backend", "8000", "FastAPI (Python 3.13)", "Async SQLAlchemy, Argon2, python-jose, ultralytics"],
          ["database", "N/A (file) / 5432", "SQLite (dev) / PostgreSQL", "SQLite default; set DATABASE_URL for PostgreSQL"],
          ["storage", "Local / AWS", "Local uploads/ or AWS S3", "Auto-fallback to local if AWS keys not configured"],
          ["redis", "6379", "Redis 7 (optional)", "JWT blacklist, rate limit state, session cache"],
          ["nginx", "80/443", "NGINX (production)", "Reverse proxy, TLS termination, static serving"],
        ]}
      />
    </div>
  );
}

function SectionArchFrontend() {
  return (
    <div>
      <SectionTitle title="Frontend Architecture" sub="Next.js 14 App Router — structure and patterns" />
      <H2 id="approuter">App Router</H2>
      <P>The frontend uses Next.js 14 App Router with the src/app directory convention. All interactive pages use the "use client" directive. Server components are used for static and SEO-critical pages. Layout nesting handles persistent navigation and theme providers.</P>
      <H2 id="state">State Management</H2>
      <Table
        headers={["Concern", "Solution"]}
        rows={[
          ["Auth state", "Zustand store with JWT access + refresh token rotation"],
          ["Server state", "@tanstack/react-query v5 — caching, invalidation, optimistic updates"],
          ["UI state", "Local useState — no global store for ephemeral UI state"],
          ["Theme", "next-themes with Tailwind dark: variants"],
          ["i18n", "Custom Zustand translation store — EN / ID switching"],
        ]}
      />
      <H2 id="i18n">Internationalisation</H2>
      <P>Language switching is handled by a custom Zustand translation store (useTranslationStore). Translations are key-value dictionaries loaded client-side. Switching language re-renders all translated strings without a page reload. Default language is determined by browser locale, overridable via UI toggle.</P>
      <H2 id="pages">Dashboard Pages</H2>
      <Table
        headers={["Route", "Purpose", "Min Role"]}
        rows={[
          ["/dashboard", "Overview, recent analyses, stats", "analyst"],
          ["/dashboard/analyses", "Analysis list with filters", "analyst"],
          ["/dashboard/analyses/[id]", "Analysis detail, annotations, CFU", "analyst"],
          ["/dashboard/simulate", "Simulator — transient analysis", "analyst"],
          ["/dashboard/reports", "PDF/Excel export centre", "manager"],
          ["/dashboard/audit", "Immutable audit ledger", "auditor"],
          ["/dashboard/admin/users", "User management", "admin"],
          ["/dashboard/admin/models", "ML model management", "super_admin"],
          ["/dashboard/admin/system", "System health and config", "super_admin"],
          ["/docs", "This documentation page", "public"],
        ]}
      />
    </div>
  );
}

function SectionArchBackend() {
  return (
    <div>
      <SectionTitle title="Backend Architecture" sub="FastAPI async — structure and security" />
      <H2 id="structure">FastAPI Structure</H2>
      <CodeBlock lang="text" code={`backend/
├── app/
│   ├── api/v1/
│   │   ├── auth.py          # Login, refresh, logout
│   │   ├── analyses.py      # Upload, list, detail, simulate
│   │   ├── reports.py       # PDF, Excel export
│   │   └── admin.py         # Users, models, system
│   ├── core/
│   │   ├── security.py      # JWT creation/verification
│   │   ├── config.py        # Settings via pydantic-settings
│   │   └── dependencies.py  # FastAPI Depends() helpers
│   ├── ml/
│   │   ├── detector.py      # YOLOv8 inference wrapper
│   │   ├── cfu_calculator.py
│   │   └── image_processor.py
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic v2 schemas
│   ├── services/            # Business logic layer
│   └── main.py              # App factory, lifespan`} />
      <H2 id="auth">Auth Layer</H2>
      <P>Authentication uses JWT HS256 tokens. Access tokens expire in 15 minutes. Refresh tokens expire in 7 days and are stored as HttpOnly cookies. Token rotation invalidates the previous refresh token on use, preventing replay attacks.</P>
      <H2 id="files">File Handling</H2>
      <P>Every uploaded file is scanned by ClamAV before processing. Files exceeding 20 MB are rejected. Supported formats: JPEG, PNG, TIFF, WebP. Images are stored in S3-compatible storage with a UUID-based key. Original filenames are never used in storage paths.</P>
      <H2 id="db">Database Schema</H2>
      <P>ColonyAI uses SQLite by default (development) and PostgreSQL in production. The ORM is SQLAlchemy async. Tables are auto-created via <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Base.metadata.create_all</code> on startup.</P>
      <Table
        caption="Core database tables and their purpose. All IDs are UUID (GUID type — native UUID on PostgreSQL, CHAR(36) on SQLite)."
        headers={["Table", "Purpose"]}
        rows={[
          ["users", "User accounts — email, Argon2 hashed password, role (super_admin/admin/manager/auditor/analyst), org_id, active flag"],
          ["organizations", "Multi-tenant org records — name, plan, license info"],
          ["analyses", "Analysis records — metadata, media_type, dilution, CFU/ml result, file refs, status"],
          ["colony_detections", "Per-detection rows linked to analysis — class_name, bbox, confidence, is_corrected flag"],
          ["audit_log", "Immutable event log — user_id, action, resource, timestamp, diff payload"],
          ["simulator_comparisons", "Simulator transient results — not persisted to analyses table"],
          ["corrections", "Manual correction events — analyst override on detection results"],
          ["correction_sessions", "Groups of corrections within a single review session"],
          ["notifications", "In-app notification records per user"],
          ["lims_log", "LIMS integration event log — inbound/outbound payload tracking"],
          ["password_reset_requests", "Time-limited password reset tokens"],
          ["token_blacklist", "Invalidated JWT JTIs — checked on every protected request"],
          ["user_preferences", "Per-user UI settings — theme, language, dashboard layout"],
          ["user_sessions", "Active session tracking — device, IP, last seen"],
        ]}
      />
    </div>
  );
}

function SectionArchML() {
  return (
    <div>
      <SectionTitle title="ML Pipeline" sub="YOLOv8 inference — from image to CFU/ml" />
      <H2 id="loading">Model Loading</H2>
      <P>The YOLOv8 model is loaded once at application startup via FastAPI lifespan context. The model path is configurable via MODEL_PATH environment variable. Both .pt (PyTorch) and .onnx (ONNX Runtime) formats are supported — ONNX is recommended for CPU-only deployments for better throughput.</P>
      <H2 id="pipeline">Inference Pipeline</H2>
      <CodeBlock lang="python" code={`# Simplified inference flow
async def run_inference(image_path: str, config: InferenceConfig):
    # 1. Load and validate image
    img = ImageProcessor.load(image_path)
    img = ImageProcessor.normalize(img, target_size=(640, 640))

    # 2. Test-Time Augmentation (optional, slower but more accurate)
    if config.tta_enabled:
        predictions = detector.predict_tta(img, n_augments=4)
    else:
        predictions = detector.predict(img, conf=config.conf_threshold)

    # 3. Per-class NMS
    detections = apply_nms_per_class(predictions, iou_threshold=0.45)

    # 4. CFU calculation
    result = CFUCalculator.compute(
        detections=detections,
        dilution_factor=config.dilution_factor,
        plated_volume_ml=config.plated_volume_ml,
    )
    return result`} />
      <H2 id="tta">Test-Time Augmentation</H2>
      <P>TTA applies 4 augmentations (original, horizontal flip, vertical flip, 90° rotation) and merges predictions via weighted box fusion (WBF). This improves recall by ~4–6% on colony_merged and dust_debris classes at the cost of 4x inference time. TTA is enabled by default for saved analyses and disabled for the simulator to maintain low latency.</P>
      <H2 id="nms">NMS Configuration</H2>
      <Table
        headers={["Parameter", "Value", "Notes"]}
        rows={[
          ["conf_threshold", "0.35", "Lower for high-recall; calibrated per media type"],
          ["iou_threshold", "0.45", "Per-class NMS, not global"],
          ["max_detections", "500", "Hard cap per image"],
          ["agnostic_nms", "false", "Class identity preserved during suppression"],
        ]}
      />
    </div>
  );
}

function SectionApiAuth() {
  return (
    <div>
      <SectionTitle title="API — Authentication" sub="JWT-based auth with refresh token rotation" />
      <Callout type="info">All protected endpoints require the Authorization: Bearer header. Access tokens expire in 15 minutes. Use the refresh endpoint to obtain a new access token.</Callout>
      <H2 id="login">Login</H2>
      <div className="flex items-center gap-2 mb-2">
        <Badge method="POST" />
        <code className="text-[9px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">/api/v1/auth/login</code>
      </div>
      <CodeBlock lang="json" code={`// Request body
{
  "email": "user@example.com",
  "password": "YourPassword123!"
}

// Response 200
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "analyst",
    "full_name": "Jane Doe"
  }
}`} />
      <H2 id="refresh">Refresh</H2>
      <div className="flex items-center gap-2 mb-2">
        <Badge method="POST" />
        <code className="text-[9px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">/api/v1/auth/refresh</code>
      </div>
      <CodeBlock lang="json" code={`// Request body
{ "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }

// Response 200
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900
}`} />
      <H2 id="logout">Logout</H2>
      <div className="flex items-center gap-2 mb-2">
        <Badge method="POST" />
        <code className="text-[9px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">/api/v1/auth/logout</code>
      </div>
      <P>Invalidates the current refresh token server-side. Requires Authorization header. Returns 204 No Content on success.</P>
      <H2 id="headers">Request Headers</H2>
      <Table
        headers={["Header", "Value", "Required"]}
        rows={[
          ["Authorization", "Bearer {access_token}", "Yes (protected routes)"],
          ["Content-Type", "application/json", "Yes (JSON body)"],
          ["Content-Type", "multipart/form-data", "Yes (file upload)"],
          ["Accept-Language", "en / id", "No (defaults to en)"],
        ]}
      />
    </div>
  );
}

function SectionApiAnalyses() {
  return (
    <div>
      <SectionTitle title="API — Analyses" sub="Upload, retrieve, and export colony analysis records" />
      <H2 id="endpoints">Endpoints</H2>
      <Table
        headers={["Method", "Path", "Description", "Min Role"]}
        rows={[
          [<Badge key="m1" method="POST" />, "/api/v1/analyses/", "Upload image, run inference, save result", "analyst"],
          [<Badge key="m2" method="GET" />, "/api/v1/analyses/", "List analyses with pagination and filters", "analyst"],
          [<Badge key="m3" method="GET" />, "/api/v1/analyses/{id}", "Get single analysis detail", "analyst"],
          [<Badge key="m4" method="DELETE" />, "/api/v1/analyses/{id}", "Soft-delete analysis record", "admin"],
          [<Badge key="m5" method="GET" />, "/api/v1/analyses/{id}/export/pdf", "Export annotated PDF report", "manager"],
          [<Badge key="m6" method="GET" />, "/api/v1/analyses/{id}/export/excel", "Export Excel data table", "manager"],
        ]}
      />
      <H2 id="upload">Upload Analysis</H2>
      <div className="flex items-center gap-2 mb-2">
        <Badge method="POST" />
        <code className="text-[9px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">/api/v1/analyses/</code>
      </div>
      <CodeBlock lang="bash" code={`curl -X POST http://localhost:8000/api/v1/analyses/ \\
  -H "Authorization: Bearer {token}" \\
  -F "file=@plate_image.jpg" \\
  -F "media_type=PCA" \\
  -F "dilution_factor=0.001" \\
  -F "plated_volume_ml=0.1" \\
  -F "sample_id=SAMPLE-2024-001" \\
  -F "notes=Environmental monitoring sample"`} />
      <H2 id="response">Analysis Response Schema</H2>
      <CodeBlock lang="json" code={`{
  "id": "uuid",
  "sample_id": "SAMPLE-2024-001",
  "status": "completed",
  "media_type": "PCA",
  "dilution_factor": 0.001,
  "plated_volume_ml": 0.1,
  "cfu_per_ml": 12500.0,
  "cfu_uncertainty": 625.0,
  "colony_single_count": 11,
  "colony_merged_count": 3,
  "estimated_merged_individual": 8,
  "excluded_count": 2,
  "annotated_image_url": "https://storage/.../annotated.jpg",
  "created_at": "2024-01-15T10:30:00Z",
  "created_by": { "id": "uuid", "email": "analyst@lab.com" }
}`} />
    </div>
  );
}

function SectionApiSimulator() {
  return (
    <div>
      <SectionTitle title="API — Simulator" sub="Transient analysis — results are not saved to the database" />
      <Callout type="info">The simulator endpoint runs full ML inference but does not persist the result. It is designed for parameter exploration and QC checks. No audit log entry is created.</Callout>
      <H2 id="endpoint">Endpoint</H2>
      <div className="flex items-center gap-2 mb-2">
        <Badge method="POST" />
        <code className="text-[9px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">/api/v1/analyses/simulate</code>
      </div>
      <H2 id="fields">Form Fields</H2>
      <Table
        headers={["Field", "Type", "Required", "Description"]}
        rows={[
          ["file", "File (image/jpeg, image/png)", "Yes", "Plate image — max 20 MB"],
          ["media_type", "Enum", "Yes", "PCA / TSA / VRBA / MacConkey / SDA / EMB / OTHER"],
          ["dilution_factor", "float", "Yes", "e.g. 0.001 for 10^-3 dilution"],
          ["plated_volume_ml", "float", "Yes", "Volume plated in mL, e.g. 0.1"],
          ["tta_enabled", "boolean", "No", "Enable test-time augmentation (default: false for simulator)"],
        ]}
      />
      <H2 id="sim-response">Response</H2>
      <P>Returns the same AnalysisResponse schema as a saved analysis, but with id: null and status: "simulated". The annotated image is returned as a base64-encoded data URI rather than a storage URL.</P>
      <CodeBlock lang="bash" code={`curl -X POST http://localhost:8000/api/v1/analyses/simulate \\
  -H "Authorization: Bearer {token}" \\
  -F "file=@plate.jpg" \\
  -F "media_type=TSA" \\
  -F "dilution_factor=0.01" \\
  -F "plated_volume_ml=0.1"`} />
      <H2 id="limits">Limits</H2>
      <Table
        headers={["Limit", "Value"]}
        rows={[
          ["Max file size", "20 MB"],
          ["Rate limit", "30 requests / minute per user"],
          ["Concurrent simulations", "3 per user"],
          ["Image resolution", "Max 4096 × 4096 px (auto-downscaled)"],
        ]}
      />
    </div>
  );
}

function SectionApiReports() {
  return (
    <div>
      <SectionTitle title="API — Reports" sub="PDF and Excel export for analyses and batch results" />
      <H2 id="pdf">PDF Export</H2>
      <div className="flex items-center gap-2 mb-2">
        <Badge method="GET" />
        <code className="text-[9px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">/api/v1/analyses/{"{id}"}/export/pdf</code>
      </div>
      <P>Returns a PDF report containing: annotated plate image, detection class summary table, CFU/ml result with uncertainty, ISO-17025 method statement, analyst name, and timestamp. Content-Type: application/pdf.</P>
      <H2 id="excel">Excel Export</H2>
      <div className="flex items-center gap-2 mb-2">
        <Badge method="GET" />
        <code className="text-[9px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">/api/v1/analyses/{"{id}"}/export/excel</code>
      </div>
      <P>Returns an .xlsx file with two sheets: Summary (CFU/ml, metadata) and Detections (per-detection rows with class, confidence, bounding box coordinates). Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.</P>
      <H2 id="batch">Batch Reports</H2>
      <div className="flex items-center gap-2 mb-2">
        <Badge method="POST" />
        <code className="text-[9px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">/api/v1/reports/batch</code>
      </div>
      <CodeBlock lang="json" code={`// Request
{
  "analysis_ids": ["uuid1", "uuid2", "uuid3"],
  "format": "pdf",
  "include_annotations": true
}

// Response: ZIP file containing individual reports`} />
    </div>
  );
}

function SectionApiAdmin() {
  return (
    <div>
      <SectionTitle title="API — Admin" sub="User management, model registry, and system health" />
      <H2 id="users-api">User Management</H2>
      <Table
        headers={["Method", "Path", "Description"]}
        rows={[
          [<Badge key="u1" method="GET" />, "/api/v1/admin/users", "List all users"],
          [<Badge key="u2" method="POST" />, "/api/v1/admin/users", "Create new user"],
          [<Badge key="u3" method="PATCH" />, "/api/v1/admin/users/{id}", "Update user role / status"],
          [<Badge key="u4" method="DELETE" />, "/api/v1/admin/users/{id}", "Deactivate user (soft delete)"],
        ]}
      />
      <H2 id="models-api">Model Registry</H2>
      <Table
        headers={["Method", "Path", "Description"]}
        rows={[
          [<Badge key="r1" method="GET" />, "/api/v1/admin/models", "List registered ML models"],
          [<Badge key="r2" method="POST" />, "/api/v1/admin/models", "Register and activate a model version"],
          [<Badge key="r3" method="PATCH" />, "/api/v1/admin/models/{id}/activate", "Switch active model"],
        ]}
      />
      <H2 id="health">System Health</H2>
      <div className="flex items-center gap-2 mb-2">
        <Badge method="GET" />
        <code className="text-[9px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">/health</code>
      </div>
      <CodeBlock lang="json" code={`{
  "status": "healthy",
  "model_loaded": true,
  "model_version": "colonyai_v2.0",
  "db": "connected",
  "storage": "connected",
  "clamav": "connected",
  "uptime_seconds": 86400
}`} />
    </div>
  );
}

function SectionMLModel() {
  return (
    <div>
      <SectionTitle title="YOLOv8 Model" sub="Architecture, training dataset, and inference configuration" />
      <H2 id="architecture">Architecture</H2>
      <P>ColonyAI uses YOLOv8n (nano) as the base architecture, fine-tuned on the colonyai_balanced_v2 dataset. The nano variant was chosen to balance inference speed with detection accuracy — achieving real-time performance on CPU while maintaining mAP50 above 0.87 across all classes.</P>
      <Table
        headers={["Property", "Value"]}
        rows={[
          ["Base model", "YOLOv8n (Ultralytics)"],
          ["Input resolution", "640 × 640 px"],
          ["Parameters", "~3.2M"],
          ["GFLOPs", "8.7"],
          ["mAP50 (all classes)", "0.891"],
          ["mAP50-95 (all classes)", "0.673"],
          ["Inference (GPU RTX 3060)", "~18 ms/image"],
          ["Inference (CPU, 8-core)", "~210 ms/image"],
        ]}
      />
      <H2 id="dataset">Training Dataset</H2>
      <P>The colonyai_balanced_v2 dataset was curated from 847 annotated Petri dish images across 6 media types. Class imbalance was addressed via mosaic augmentation and class-weighted loss. Annotations were reviewed by three certified microbiologists.</P>
      <Table
        headers={["Split", "Images", "Annotations"]}
        rows={[
          ["Train", "678", "24,312"],
          ["Validation", "102", "3,841"],
          ["Test", "67", "2,198"],
          ["Total", "847", "30,351"],
        ]}
      />
      <H2 id="metrics">Per-Class Metrics</H2>
      <Table
        headers={["Class", "Precision", "Recall", "mAP50"]}
        rows={[
          ["colony_single", "0.934", "0.921", "0.947"],
          ["colony_merged", "0.871", "0.843", "0.878"],
          ["bubble", "0.912", "0.898", "0.923"],
          ["dust_debris", "0.856", "0.831", "0.862"],
          ["media_crack", "0.823", "0.809", "0.834"],
        ]}
      />
      <H2 id="infer-config">Inference Configuration</H2>
      <CodeBlock lang="yaml" code={`# config/inference.yaml
model:
  path: models/colonyai_v2.pt
  device: auto          # "cuda:0" or "cpu"
  half_precision: false  # FP16 — enable only on GPU

inference:
  conf_threshold: 0.35
  iou_threshold: 0.45
  max_detections: 500
  agnostic_nms: false
  tta_enabled: true      # disabled for simulator

media_thresholds:        # per-media conf override
  PCA: 0.35
  TSA: 0.35
  VRBA: 0.40
  MacConkey: 0.38
  SDA: 0.42
  EMB: 0.38`} />
    </div>
  );
}

function SectionMLClasses() {
  return (
    <div>
      <SectionTitle title="Detection Classes" sub="5-class detection model — what each class means" />
      <H2 id="classes">Class Definitions</H2>
      <Table
        headers={["Class ID", "Class Name", "Color", "CFU Impact", "Description"]}
        rows={[
          ["0", "colony_single", <span key="c0" className="text-emerald-400 font-black">green</span>, "Counted (+1 each)", "Individual, clearly isolated colony. Direct 1:1 contribution to CFU count."],
          ["1", "colony_merged", <span key="c1" className="text-amber-400 font-black">amber</span>, "Estimated via area ratio", "Overlapping colony cluster. Individual count estimated by dividing cluster area by mean single colony area."],
          ["2", "bubble", <span key="c2" className="text-blue-400 font-black">blue</span>, "Excluded", "Air bubble in agar. Circular artefact — excluded from all CFU calculations."],
          ["3", "dust_debris", <span key="c3" className="text-slate-400 font-black">slate</span>, "Excluded", "Particulate contamination or dust on plate surface. Excluded from CFU."],
          ["4", "media_crack", <span key="c4" className="text-rose-400 font-black">rose</span>, "Excluded", "Physical crack in agar media. Excluded from CFU but flagged in report."],
        ]}
      />
      <H2 id="merged-est">Merged Colony Estimation</H2>
      <P>When colony_merged clusters are detected, the estimated individual colony count within each cluster is computed as:</P>
      <CodeBlock lang="python" code={`def estimate_merged_count(cluster_bbox_area: float, mean_single_area: float) -> int:
    """
    Estimate individual colonies within a merged cluster.
    Uses robust mean single colony area from the same image.
    Minimum return value is 2 (a merge requires at least 2 colonies).
    """
    if mean_single_area <= 0:
        return 2  # fallback: assume binary merge
    estimated = cluster_bbox_area / mean_single_area
    return max(2, round(estimated))`} />
      <Callout type="warning">If no colony_single detections exist in an image, the fallback mean area from the media-type calibration table is used. This is noted in the uncertainty budget.</Callout>
    </div>
  );
}

function SectionMLCFU() {
  return (
    <div>
      <SectionTitle title="CFU Calculation" sub="Formula, uncertainty, and ISO 4833-1:2013 compliance" />
      <H2 id="formula">Formula</H2>
      <CodeBlock lang="python" code={`# CFU/ml calculation — ISO 4833-1:2013
def compute_cfu_per_ml(
    colony_single_count: int,
    estimated_merged_individual: int,
    dilution_factor: float,
    plated_volume_ml: float,
) -> tuple[float, float]:
    """
    Returns (cfu_per_ml, expanded_uncertainty)
    """
    total_colonies = colony_single_count + estimated_merged_individual
    cfu_per_ml = total_colonies / (dilution_factor * plated_volume_ml)

    # Relative uncertainty: Poisson counting + merged estimation uncertainty
    u_counting = 1.0 / (total_colonies ** 0.5) if total_colonies > 0 else 0
    u_merge_estimation = 0.05 * estimated_merged_individual / max(total_colonies, 1)
    combined_u = (u_counting**2 + u_merge_estimation**2) ** 0.5

    # Expanded uncertainty k=2 (95% confidence)
    expanded_uncertainty = cfu_per_ml * combined_u * 2
    return cfu_per_ml, expanded_uncertainty`} />
      <H2 id="uncertainty">Uncertainty Budget</H2>
      <Table
        headers={["Source", "Type", "Contribution"]}
        rows={[
          ["Colony counting (Poisson)", "Type A", "1/√N relative uncertainty"],
          ["Merged cluster estimation", "Type B", "5% of estimated merged count"],
          ["Dilution preparation", "Type B", "User-supplied — not modelled"],
          ["Volume measurement", "Type B", "User-supplied — not modelled"],
          ["Combined (k=2, 95% CI)", "Expanded", "Reported in CFU/ml ± value"],
        ]}
      />
      <H2 id="validation">Validation</H2>
      <P>The CFU calculation has been validated against manual counts on 67 test images. Mean absolute percentage error (MAPE) is 4.3% against expert manual counts. Bias is +1.2% (slight over-count, conservative for food safety applications).</P>
    </div>
  );
}

function SectionMLISO() {
  return (
    <div>
      <SectionTitle title="ISO-17025 Compliance" sub="Audit trail, method validation, and uncertainty requirements" />
      <H2 id="requirements">ISO-17025 Requirements Addressed</H2>
      <Table
        headers={["Clause", "Requirement", "Implementation"]}
        rows={[
          ["6.4", "Equipment calibration records", "ML model version, calibration date stored per analysis"],
          ["7.3", "Method validation", "Validation report stored in /docs/validation/"],
          ["7.6", "Measurement uncertainty", "Expanded uncertainty (k=2) included in every result"],
          ["7.11", "Data integrity", "Immutable audit log — analyses cannot be edited or deleted permanently"],
          ["8.4", "Corrective actions", "Flagged detections (media_crack) trigger QC review workflow"],
        ]}
      />
      <H2 id="audit">Audit Trail</H2>
      <P>Every create, read (export), and status-change event on an analysis record is written to the audit_log table. Entries include: user ID, action type, timestamp (UTC), IP address, and a JSON diff of changed fields. The audit log table has no UPDATE or DELETE permissions — only INSERT is allowed at the application level.</P>
      <H2 id="budget">Uncertainty Budget Statement</H2>
      <P>Each PDF report includes a standardised uncertainty budget statement per EURACHEM/CITAC CG4 guidelines. The statement covers all identified uncertainty sources, their type (A/B), estimated magnitude, and the combined expanded uncertainty at the 95% confidence level.</P>
      <Callout type="info">ColonyAI does not currently model uncertainty contributions from dilution preparation or volume measurement, as these are user-controlled inputs. Laboratories should include these contributions in their own uncertainty budgets.</Callout>
    </div>
  );
}

function SectionDeployDocker() {
  return (
    <div>
      <SectionTitle title="Docker Setup" sub="Full stack deployment with Docker Compose" />
      <H2 id="compose">docker-compose.yml</H2>
      <CodeBlock lang="yaml" code={`version: "3.9"

services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://nginx/api
    depends_on: [backend]

  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql+asyncpg://colony:secret@postgres:5432/colonyai
      - REDIS_URL=redis://redis:6379/0
      - S3_ENDPOINT=http://storage:9000
      - S3_BUCKET=colonyai
      - MODEL_PATH=/app/models/colonyai_v2.pt
      - CLAMAV_HOST=clamav
      - SECRET_KEY=change-me-in-production
    depends_on: [postgres, redis, storage, clamav]
    volumes:
      - ./models:/app/models:ro

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: colony
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: colonyai
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "colony"]
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

  storage:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports: ["9000:9000", "9001:9001"]
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - miniodata:/data

  clamav:
    image: clamav/clamav:stable
    volumes:
      - clamavdata:/var/lib/clamav

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
    depends_on: [frontend, backend]

volumes:
  pgdata:
  redisdata:
  miniodata:
  clamavdata:`} />
      <H2 id="healthchecks">Health Checks</H2>
      <CodeBlock lang="bash" code={`# Verify all services are healthy
docker compose ps

# Run database migrations
docker compose exec backend alembic upgrade head

# Seed default admin user
docker compose exec backend python -m app.scripts.seed_admin

# View backend logs
docker compose logs -f backend`} />
    </div>
  );
}

function SectionDeployDeka() {
  return (
    <div>
      <SectionTitle title="Deka Notebook" sub="Training on Lintasarta Cloudeka GPU instances" />
      <Callout type="info">Deka Notebook (Lintasarta Cloudeka) is the recommended GPU training environment for ColonyAI in the Indonesian cloud ecosystem. It provides NVIDIA A100 instances with persistent storage.</Callout>
      <H2 id="deka-prereqs">Prerequisites</H2>
      <P>Request a Deka Notebook instance with GPU enabled (A100 40GB recommended). Ensure CUDA 12.1+ and Python 3.13 are available in the base image. Install Ultralytics and dependencies via the provided requirements file.</P>
      <H2 id="dataset-upload">1. Upload Dataset</H2>
      <CodeBlock lang="bash" code={`# Upload the balanced dataset to Deka persistent storage
# From your local machine:
scp -r colonyai_balanced_v2/ user@deka-notebook:/workspace/datasets/

# Or use the Deka web UI to upload the zip archive
# datasets/colonyai_balanced_v2.zip -> /workspace/datasets/`} />
      <H2 id="training">2. Training</H2>
      <CodeBlock lang="bash" code={`# Verify dataset integrity and class distribution
python train.py --mode verify --dataset /workspace/datasets/colonyai_balanced_v2

# Full training run (recommended: 100 epochs)
python train.py \\
  --mode full \\
  --dataset /workspace/datasets/colonyai_balanced_v2 \\
  --epochs 100 \\
  --batch 16 \\
  --imgsz 640 \\
  --device 0 \\
  --project /workspace/runs \\
  --name colonyai_v2

# Training output:
# /workspace/runs/colonyai_v2/weights/best.pt
# /workspace/runs/colonyai_v2/weights/last.pt`} />
      <H2 id="calibrate">3. Calibrate Thresholds</H2>
      <CodeBlock lang="bash" code={`# Run threshold calibration on validation set
python calibrate.py \\
  --model /workspace/runs/colonyai_v2/weights/best.pt \\
  --dataset /workspace/datasets/colonyai_balanced_v2/valid \\
  --output /workspace/runs/colonyai_v2/calibration.yaml`} />
      <H2 id="model-upload">4. Upload Model</H2>
      <P>Download best.pt and calibration.yaml from Deka storage. In the ColonyAI dashboard, navigate to Admin → Model Registry → Register New Model. Upload the .pt file and paste the calibration thresholds. Set as active to deploy immediately.</P>
    </div>
  );
}

function SectionDeployGPU() {
  return (
    <div>
      <SectionTitle title="GPU Training" sub="Local GPU training setup and monitoring" />
      <H2 id="drivers">Driver Setup</H2>
      <CodeBlock lang="bash" code={`# Verify NVIDIA driver and CUDA
nvidia-smi
nvcc --version

# Install NVIDIA Container Toolkit (for Docker GPU access)
distribution=$(. /etc/os-release; echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list \\
  | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker`} />
      <H2 id="cuda">CUDA Requirements</H2>
      <Table
        headers={["Component", "Minimum", "Tested"]}
        rows={[
          ["NVIDIA Driver", "525+", "535.183"],
          ["CUDA", "12.0", "12.1"],
          ["cuDNN", "8.9+", "8.9.7"],
          ["PyTorch", "2.1+", "2.4.1"],
          ["Ultralytics", "8.0+", "8.3.x"],
        ]}
      />
      <H2 id="train-cmd">Training Command</H2>
      <CodeBlock lang="bash" code={`# Single GPU
python train.py --mode full --device 0 --epochs 100 --batch 16

# Multi-GPU (DDP)
python -m torch.distributed.run --nproc_per_node=2 \\
  train.py --mode full --device 0,1 --epochs 100 --batch 32`} />
      <H2 id="monitor">Monitoring</H2>
      <CodeBlock lang="bash" code={`# Live GPU utilisation
watch -n 1 nvidia-smi

# TensorBoard training curves
tensorboard --logdir /workspace/runs --port 6006

# Training metrics are also logged to:
# runs/colonyai_v2/results.csv`} />
    </div>
  );
}

function SectionDeployEnv() {
  return (
    <div>
      <SectionTitle title="Environment Variables" sub="All configuration variables for frontend and backend" />
      <H2 id="frontend-vars">Frontend (.env.local)</H2>
      <Table
        headers={["Variable", "Example", "Description"]}
        rows={[
          ["NEXT_PUBLIC_API_URL", "http://localhost:8000", "Backend API base URL"],
          ["NEXT_PUBLIC_APP_ENV", "production", "Environment label shown in UI"],
          ["NEXT_PUBLIC_MAX_UPLOAD_MB", "20", "Max upload size hint in UI"],
        ]}
      />
      <H2 id="backend-vars">Backend (.env)</H2>
      <Table
        headers={["Variable", "Example", "Description"]}
        rows={[
          ["DATABASE_URL", "postgresql+asyncpg://...", "Async PostgreSQL connection string"],
          ["REDIS_URL", "redis://localhost:6379/0", "Redis connection URL"],
          ["SECRET_KEY", "64-char random hex", "JWT signing secret — never commit"],
          ["JWT_ALGORITHM", "HS256", "JWT algorithm"],
          ["ACCESS_TOKEN_EXPIRE_MIN", "15", "Access token TTL in minutes"],
          ["REFRESH_TOKEN_EXPIRE_DAYS", "7", "Refresh token TTL in days"],
          ["S3_ENDPOINT", "http://localhost:9000", "S3-compatible storage endpoint"],
          ["S3_ACCESS_KEY", "minioadmin", "S3 access key"],
          ["S3_SECRET_KEY", "minioadmin", "S3 secret key"],
          ["S3_BUCKET", "colonyai", "S3 bucket name"],
          ["CLAMAV_HOST", "localhost", "ClamAV daemon host"],
          ["CLAMAV_PORT", "3310", "ClamAV daemon port"],
          ["MODEL_PATH", "/app/models/best.pt", "Path to active YOLOv8 model"],
          ["INFERENCE_DEVICE", "auto", "cuda:0 / cpu / auto"],
          ["MAX_UPLOAD_SIZE_MB", "20", "Hard limit for uploaded files"],
          ["CORS_ORIGINS", "http://localhost:3000", "Allowed CORS origins (comma-separated)"],
          ["LOG_LEVEL", "INFO", "Application log level"],
        ]}
      />
      <Callout type="danger">Never commit SECRET_KEY, S3_SECRET_KEY, or DATABASE_URL to version control. Use .env.local and ensure .env is in .gitignore.</Callout>
    </div>
  );
}

function SectionGuideRoles() {
  return (
    <div>
      <SectionTitle title="Roles & Permissions" sub="Five-tier role-based access control" />
      <H2 id="matrix">Role Matrix</H2>
      <Table
        headers={["Permission", "super_admin", "admin", "manager", "auditor", "analyst"]}
        rows={[
          ["View analyses (own)", "yes", "yes", "yes", "yes", "yes"],
          ["View analyses (all)", "yes", "yes", "yes", "yes", "no"],
          ["Upload & run analysis", "yes", "yes", "yes", "no", "yes"],
          ["Run simulator", "yes", "yes", "yes", "no", "yes"],
          ["Export PDF/Excel", "yes", "yes", "yes", "no", "no"],
          ["View audit ledger", "yes", "yes", "yes", "yes", "no"],
          ["Manage users", "yes", "yes", "no", "no", "no"],
          ["Register ML models", "yes", "no", "no", "no", "no"],
          ["System configuration", "yes", "no", "no", "no", "no"],
          ["Delete analyses", "yes", "yes", "no", "no", "no"],
        ]}
      />
      <H2 id="assignment">Role Assignment</H2>
      <P>Roles are assigned by admin or super_admin via the User Management page or the Admin API. A user can only hold one role at a time. Role changes are immediately effective — no re-login required. All role changes are recorded in the audit log.</P>
      <Callout type="warning">The super_admin role should be held by at most one account in production. It is the only role that can register new ML models and access system configuration. Protect this account with a strong password and consider IP allowlisting at the NGINX level.</Callout>
    </div>
  );
}

function SectionGuideUpload() {
  return (
    <div>
      <SectionTitle title="Upload Analysis" sub="Step-by-step guide to submitting a plate image" />
      <H2 id="formats">Supported Formats</H2>
      <Table
        headers={["Format", "Extension", "Max Size", "Notes"]}
        rows={[
          ["JPEG", ".jpg, .jpeg", "20 MB", "Recommended for photos"],
          ["PNG", ".png", "20 MB", "Good for screenshots"],
          ["TIFF", ".tif, .tiff", "20 MB", "High resolution scans"],
          ["WebP", ".webp", "20 MB", "Modern web format"],
        ]}
      />
      <H2 id="flow">Upload Flow</H2>
      <P>1. Navigate to Dashboard → New Analysis or click the Upload button in the top bar. 2. Drag and drop the plate image or click to browse. 3. Select the media type (PCA, TSA, VRBA, MacConkey, SDA, EMB, or OTHER). 4. Enter the dilution factor (e.g. 0.001 for 10⁻³) and plated volume in mL. 5. Optionally add a sample ID and notes. 6. Click Analyse. The result appears in 2–15 seconds depending on server load and GPU availability.</P>
      <H2 id="results">Results View</H2>
      <P>The results page shows the annotated plate image with colour-coded bounding boxes per class, a detection summary table, the CFU/ml value with expanded uncertainty, and a link to download the PDF or Excel report. Hovering over detections on the image shows class and confidence score.</P>
      <Callout type="info">Annotations use class colours: emerald for colony_single, amber for colony_merged, blue for bubble, slate for dust_debris, and rose for media_crack.</Callout>
    </div>
  );
}

function SectionGuideSimulator() {
  return (
    <div>
      <SectionTitle title="Simulator" sub="Test parameters without committing to the database" />
      <H2 id="open">Open Simulator</H2>
      <P>Navigate to Dashboard → Simulator or use the keyboard shortcut Ctrl+Shift+S. The simulator page has an identical upload form to the main analysis page but is clearly labelled as non-persistent. Results are not saved to the database and no audit log entry is created.</P>
      <H2 id="params">Set Parameters</H2>
      <P>The simulator is ideal for: testing a new dilution factor before committing to a run, verifying the media type selection affects detection thresholds as expected, quality-checking an image before formal submission, and training new analysts on the system workflow.</P>
      <Table
        headers={["Parameter", "Typical Range", "Notes"]}
        rows={[
          ["media_type", "PCA / TSA / VRBA etc.", "Affects per-class confidence threshold"],
          ["dilution_factor", "0.0001 – 0.1", "Use scientific notation: 1e-4 is valid"],
          ["plated_volume_ml", "0.01 – 1.0", "Standard: 0.1 mL (100 µL)"],
        ]}
      />
      <H2 id="interpret">Interpret Results</H2>
      <P>Simulator results show the same detail as a saved analysis including the annotated image, detection table, and CFU/ml. The result card shows a SIMULATED badge in amber to distinguish it from saved analyses. Results are lost when you navigate away — use the Download button if you need to retain the annotated image.</P>
    </div>
  );
}

function SectionGuideAudit() {
  return (
    <div>
      <SectionTitle title="Audit Ledger" sub="Immutable event log for ISO-17025 traceability" />
      <H2 id="events">Audit Events</H2>
      <Table
        headers={["Event", "Trigger", "Data Captured"]}
        rows={[
          ["analysis.created", "New analysis submitted", "user_id, analysis_id, params, IP"],
          ["analysis.exported", "PDF/Excel downloaded", "user_id, analysis_id, format, IP"],
          ["analysis.deleted", "Admin soft-deletes record", "user_id, analysis_id, reason"],
          ["user.created", "Admin creates user", "admin_id, new_user_id, role"],
          ["user.role_changed", "Role updated", "admin_id, user_id, old_role, new_role"],
          ["model.activated", "New ML model set active", "admin_id, model_id, version"],
          ["auth.login", "Successful login", "user_id, IP, user_agent"],
          ["auth.failed", "Failed login attempt", "email, IP, reason"],
        ]}
      />
      <H2 id="view">Ledger View</H2>
      <P>Navigate to Dashboard → Audit Ledger (requires auditor role or above). Filter by date range, user, event type, or analysis ID. Entries are displayed in reverse chronological order. Each entry shows the full JSON payload in an expandable row.</P>
      <H2 id="export-audit">Export Audit</H2>
      <P>The full audit log can be exported as CSV or JSON from the Ledger page. Exports are themselves recorded as audit events. The export includes all fields: event_type, user_id, user_email, timestamp_utc, ip_address, payload JSON.</P>
      <Callout type="info">Audit log entries cannot be modified or deleted through the application — the audit_log table grants INSERT only to the application user. Any tampering attempt at the database level is detectable via PostgreSQL WAL logs.</Callout>
    </div>
  );
}

function SectionChangelogV2() {
  return (
    <div>
      <SectionTitle title="Changelog — v2.0" sub="Released January 2025 — Major feature release" />
      <H2 id="new-v2">New Features</H2>
      <Table
        headers={["Feature", "Description"]}
        rows={[
          ["Simulator spatial overlap", "Colony spatial distribution heatmap in simulator results"],
          ["Efficiency matrix", "Per-media-type detection efficiency table in analysis detail"],
          ["Media type selector", "Improved UI with plate preview per media type"],
          ["Multi-GPU training", "DDP training support for faster model iteration"],
          ["ONNX export", "Export trained models to ONNX for CPU-optimised deployment"],
          ["Batch report export", "Export multiple analyses as a single ZIP archive"],
          ["Admin model registry", "Full model version management UI in admin dashboard"],
        ]}
      />
      <H2 id="improved-v2">Improvements</H2>
      <P>colony_merged estimation algorithm updated to use robust median area instead of mean — reduces outlier sensitivity by ~30%. TTA augmentation pipeline refactored to run in parallel — 2.1x faster on multi-core CPUs. PDF report redesigned with cleaner layout and uncertainty budget section.</P>
      <H2 id="fixed-v2">Bug Fixes</H2>
      <P>Fixed: bubble detections near plate edge incorrectly contributing to CFU count in edge cases. Fixed: media_crack flag not appearing in PDF report when crack confidence was below 0.5. Fixed: pagination state resetting on analysis list when navigating back from detail view.</P>
    </div>
  );
}

function SectionChangelogV15() {
  return (
    <div>
      <SectionTitle title="Changelog — v1.5" sub="Released September 2024" />
      <H2 id="new-v15">New Features</H2>
      <Table
        headers={["Feature", "Description"]}
        rows={[
          ["PDF Export", "Annotated analysis report with ISO method statement"],
          ["Excel Export", "Per-detection data table for lab LIMS integration"],
          ["ISO-17025 audit trail", "Immutable audit_log table with full event capture"],
          ["5-class model", "Added dust_debris and media_crack detection classes"],
          ["Uncertainty budget", "Expanded uncertainty (k=2) computed and stored per analysis"],
          ["Auditor role", "New read-only + audit access role"],
        ]}
      />
      <H2 id="improved-v15">Improvements</H2>
      <P>mAP50 improved from 0.831 to 0.891 via dataset expansion (847 vs 412 images). Inference speed improved 22% via model quantisation. i18n coverage expanded to 100% of UI strings for Bahasa Indonesia.</P>
      <H2 id="fixed-v15">Bug Fixes</H2>
      <P>Fixed: refresh token not invalidated on password change. Fixed: CORS misconfiguration allowing any origin in staging builds. Fixed: analysis list not updating after deletion without page reload.</P>
    </div>
  );
}

function SectionChangelogV1() {
  return (
    <div>
      <SectionTitle title="Changelog — v1.0" sub="Released May 2024 — Initial Release" />
      <H2 id="initial">Initial Release</H2>
      <Table
        headers={["Component", "Status"]}
        rows={[
          ["YOLOv8 detection (3 classes)", "Released — colony_single, colony_merged, bubble"],
          ["CFU/ml calculation", "Released — basic formula without uncertainty"],
          ["Next.js dashboard", "Released — 6 pages"],
          ["FastAPI backend", "Released — core CRUD"],
          ["JWT authentication", "Released"],
          ["PostgreSQL schema v1", "Released"],
          ["Docker Compose", "Released"],
        ]}
      />
      <H2 id="known">Known Issues (resolved in v1.5)</H2>
      <P>Refresh token not invalidated on password change. No audit trail for analysis operations. No PDF/Excel export. No uncertainty budget in results. mAP50 0.831 — lower recall on crowded plates.</P>
    </div>
  );
}

// ─── Section Renderer ─────────────────────────────────────────────────────────
function renderSection(id: SectionId): React.ReactNode {
  switch (id) {
    case "introduction":    return <SectionIntroduction />;
    case "quickstart":      return <SectionQuickStart />;
    case "requirements":    return <SectionRequirements />;
    case "arch-overview":   return <SectionArchOverview />;
    case "arch-frontend":   return <SectionArchFrontend />;
    case "arch-backend":    return <SectionArchBackend />;
    case "arch-ml":         return <SectionArchML />;
    case "api-auth":        return <SectionApiAuth />;
    case "api-analyses":    return <SectionApiAnalyses />;
    case "api-simulator":   return <SectionApiSimulator />;
    case "api-reports":     return <SectionApiReports />;
    case "api-admin":       return <SectionApiAdmin />;
    case "ml-model":        return <SectionMLModel />;
    case "ml-classes":      return <SectionMLClasses />;
    case "ml-cfu":          return <SectionMLCFU />;
    case "ml-iso":          return <SectionMLISO />;
    case "deploy-docker":   return <SectionDeployDocker />;
    case "deploy-deka":     return <SectionDeployDeka />;
    case "deploy-gpu":      return <SectionDeployGPU />;
    case "deploy-env":      return <SectionDeployEnv />;
    case "guide-roles":     return <SectionGuideRoles />;
    case "guide-upload":    return <SectionGuideUpload />;
    case "guide-simulator": return <SectionGuideSimulator />;
    case "guide-audit":     return <SectionGuideAudit />;
    case "changelog-v2":    return <SectionChangelogV2 />;
    case "changelog-v15":   return <SectionChangelogV15 />;
    case "changelog-v1":    return <SectionChangelogV1 />;
    default:                return <SectionIntroduction />;
  }
}

function getBreadcrumb(id: SectionId): string[] {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => i.id === id);
    if (item) return [group.label, item.label];
  }
  return ["Docs"];
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("introduction");
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "getting-started": true,
    "architecture": false,
    "api-reference": false,
    "ml-detection": false,
    "deployment": false,
    "user-guide": false,
    "changelog": false,
  });

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      searchQuery === "" ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((group) => group.items.length > 0);

  const breadcrumb = getBreadcrumb(activeSection);
  const toc = SECTION_TOC[activeSection] ?? [];

  const handleSelect = (id: SectionId) => {
    setActiveSection(id);
    // auto-open parent group
    for (const group of NAV_GROUPS) {
      if (group.items.find((i) => i.id === id)) {
        setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">

      {/* ── Hero Banner (serasi dengan landing page) ──────────────────────── */}
      <section className="py-10 lg:py-12 bg-white dark:bg-slate-950 relative overflow-hidden border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent opacity-20" />
        <div className="max-w-[1500px] mx-auto px-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 dark:bg-slate-800 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
              Documentation
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff] uppercase">
              ColonyAI Developer Docs
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-xl uppercase tracking-wide">
              API Reference · Architecture · Deployment · ML Pipeline · User Guide
            </p>
          </div>
          {/* Search bar di hero */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0055ff] text-slate-700 dark:text-slate-300 placeholder-slate-400 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* ── 3-column layout ───────────────────────────────────────────────── */}
      <div className="max-w-[1500px] mx-auto flex items-start min-h-[calc(100vh-12rem)]">

        {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex w-52 shrink-0 border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 sticky top-0 self-start h-screen overflow-y-auto">
          <div className="w-full p-3 space-y-0.5">
            {filteredGroups.map((group) => (
              <div key={group.id}>
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <span className="text-slate-400 group-hover:text-[#0055ff] transition-colors">{group.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 flex-1 text-left">{group.label}</span>
                  <ChevronRight className={`w-2.5 h-2.5 text-slate-400 transition-transform duration-200 ${openGroups[group.id] ? "rotate-90" : ""}`} />
                </button>
                {openGroups[group.id] && (
                  <div className="ml-3 border-l border-slate-200 dark:border-slate-700 pl-2 space-y-0.5 mb-1">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className={`w-full text-left px-2 py-1 text-[8px] font-medium transition-colors ${
                          activeSection === item.id
                            ? "bg-[#0055ff]/10 text-[#0055ff] font-black border-l-2 border-[#0055ff] -ml-2 pl-3"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main Content ──────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Docs</span>
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="w-2.5 h-2.5 text-slate-300 dark:text-slate-600" />
                <span className={`text-[7px] font-black uppercase tracking-widest ${i === breadcrumb.length - 1 ? "text-[#0055ff]" : "text-slate-400"}`}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>

          {/* Section content */}
          <div className="min-h-[60vh]">
            {renderSection(activeSection)}
          </div>

          {/* Bottom nav */}
          <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            {(() => {
              const all: SectionId[] = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.id));
              const idx = all.indexOf(activeSection);
              const prev = idx > 0 ? all[idx - 1] : null;
              const next = idx < all.length - 1 ? all[idx + 1] : null;
              const prevLabel = prev ? NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === prev)?.label : null;
              const nextLabel = next ? NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === next)?.label : null;
              return (
                <>
                  {prev ? (
                    <button onClick={() => handleSelect(prev)} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0055ff] border border-slate-200 dark:border-slate-700 hover:border-[#0055ff] px-4 py-2 transition-all">
                      <ChevronRight className="w-3 h-3 rotate-180" /> {prevLabel}
                    </button>
                  ) : <div />}
                  {next ? (
                    <button onClick={() => handleSelect(next)} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0055ff] border border-slate-200 dark:border-slate-700 hover:border-[#0055ff] px-4 py-2 transition-all">
                      {nextLabel} <ChevronRight className="w-3 h-3" />
                    </button>
                  ) : <div />}
                </>
              );
            })()}
          </div>
        </main>

        {/* ── Right TOC ────────────────────────────────────────────────────── */}
        <aside className="hidden xl:flex w-44 shrink-0 border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 sticky top-0 self-start h-screen overflow-y-auto">
          <div className="w-full p-3">
            <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-2">On this page</p>
            <div className="space-y-0.5">
              {toc.map((heading) => (
                <div key={heading} className="text-[8px] text-slate-500 dark:text-slate-400 hover:text-[#0055ff] transition-colors cursor-pointer py-0.5 pl-2 border-l-2 border-transparent hover:border-[#0055ff]">
                  {heading}
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-2">Resources</p>
              <div className="space-y-1">
                <Link href="http://localhost:8000/docs" target="_blank" className="flex items-center gap-1 text-[8px] text-slate-500 hover:text-[#0055ff] transition-colors">
                  <Code className="w-2.5 h-2.5" /> API Swagger
                </Link>
                <Link href="https://github.com/colonyai/colonyai" target="_blank" className="flex items-center gap-1 text-[8px] text-slate-500 hover:text-[#0055ff] transition-colors">
                  <Terminal className="w-2.5 h-2.5" /> GitHub
                </Link>
                <Link href="/dashboard" className="flex items-center gap-1 text-[8px] text-slate-500 hover:text-[#0055ff] transition-colors">
                  <Zap className="w-2.5 h-2.5" /> Dashboard
                </Link>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1">Version</div>
              <div className="flex items-center gap-1">
                <span className="text-[7px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">v2.0 STABLE</span>
              </div>
              <div className="text-[7px] text-slate-400 mt-1">ISO-17025 Compliant</div>
            </div>
          </div>
        </aside>

      </div>
      <Footer />
    </div>
  );
}
