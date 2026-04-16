# 🚀 ColonyAI - Quick Start Guide

## Panduan Lengkap Setup & Run untuk Developer Baru

Dokumen ini berisi **semua langkah yang harus dilakukan** ketika pertama kali membuka proyek ColonyAI di VS Code.

---

## 📋 PREREQUISITES (Install Dulu!)

Sebelum memulai, pastikan software berikut sudah terinstall di komputer Anda:

### **1. Python 3.10+**
```bash
# Cek versi
python --version
# Output harus: Python 3.10.x atau lebih tinggi

# Download: https://www.python.org/downloads/
```

### **2. Node.js 18+**
```bash
# Cek versi
node --version
# Output harus: v18.x.x atau lebih tinggi

npm --version
# Output harus: 9.x.x atau lebih tinggi

# Download: https://nodejs.org/
```

### **3. Git**
```bash
# Cek instalasi
git --version
# Output: git version 2.x.x

# Download: https://git-scm.com/
```

### **4. VS Code**
```
Download: https://code.visualstudio.com/
Extensions yang direkomendasikan:
- Python (Microsoft)
- Pylance
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens
```

---

##  LANGKAH 1: CLONE REPOSITORY

Buka terminal dan jalankan:

```bash
# 1. Clone repository
git clone https://github.com/wi5nuu/colonyai.git

# 2. Masuk ke folder proyek
cd colonyai

# 3. (Windows) Pastikan di folder yang benar
# d:\lombapuai
```

---

##  LANGKAH 2: SETUP BACKEND

### **A. Buat Virtual Environment**

```bash
# Windows (Command Prompt)
python -m venv .venv

# Aktifkan virtual environment
.venv\Scripts\activate

# (PowerShell - jika gagal, run sebagai Administrator dulu):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.venv\Scripts\activate
```

**Verifikasi:** Terminal harus menunjukkan `(.venv)` di awal prompt.

---

### **B. Install Dependencies Backend**

```bash
# Pastikan .venv aktif
cd backend

# Install semua dependencies
pip install -r requirements.txt

# Install testing dependencies (optional tapi recommended)
pip install pytest pytest-asyncio pytest-cov httpx
```

**Expected output:** Semua package terinstall tanpa error.

---

### **C. Setup Environment Variables**

```bash
# Copy template .env
copy .env.example .env

# Edit file .env dengan text editor
notepad .env
```

**Minimal yang harus diisi:**
```env
# Wajib diisi
DEBUG=True
SECRET_KEY=generate-key-here
JWT_SECRET_KEY=generate-key-here
DATABASE_URL=sqlite+aiosqlite:///d:/lombapuai/backend/colonyai.db

# Optional (bisa kosong dulu untuk testing)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

**Generate secret keys:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

**Copy hasil generate dan paste ke `.env`:**
```env
SECRET_KEY=hasil-generate-dari-perintah-di-atas
JWT_SECRET_KEY=generate-lagi-dan-paste-di-sini
```

---

### **D. Setup Database**

```bash
# Kembali ke root folder
cd ..

# Database akan otomatis dibuat saat pertama kali run
# Tidak perlu setup manual untuk SQLite
```

---

### **E. Download Model YOLOv8 (PENTING!)**

```bash
# Buat folder models jika belum ada
mkdir backend\models

# Download model (pilih salah satu):
# Option 1: Jika sudah ada model trained
# Copy file model Anda ke: backend/models/colony_best.pt

# Option 2: Gunakan placeholder untuk testing
# (Model asli diperlukan untuk inference, tapi app tetap bisa jalan tanpa model untuk UI testing)
```

**Catatan:** Tanpa model file (`colony_best.pt`), backend akan error saat mencoba inference. Untuk testing UI saja, ini tidak masalah.

---

##  LANGKAH 3: SETUP FRONTEND

### **A. Install Dependencies Frontend**

```bash
# Buka terminal BARU (biarkan terminal backend tetap jalan)
cd frontend

# Install semua dependencies
npm install

# Tunggu sampai selesai (bisa 2-5 menit)
```

**Expected output:**
```
added XXX packages in XXs
```

---

### **B. Setup Environment Variables Frontend**

```bash
# Copy template .env
copy .env.example .env.local

# Edit file
notepad .env.local
```

**Isi dengan:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=ColonyAI
```

---

##  LANGKAH 4: JALANKAN APLIKASI

### **METHOD 1: Manual (Terminal Terpisah)**

#### **Terminal 1 - Backend:**
```bash
# Dari folder root
.venv\Scripts\activate
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Test backend:** Buka browser → `http://localhost:8000/health`
Harus muncul: `{"status":"healthy"}`

**API Docs:** `http://localhost:8000/docs`

---

#### **Terminal 2 - Frontend:**
```bash
# Buka terminal BARU (jangan tutup terminal backend!)
cd frontend
npm run dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Test frontend:** Buka browser → `http://localhost:3000`

---

### **METHOD 2: Menggunakan Batch Script (Windows)**

#### **Jalankan Backend:**
```bash
# Double-click file ini atau jalankan dari terminal
backend\start_backend.bat
```

#### **Jalankan Frontend:**
```bash
# Buka terminal BARU
frontend\start_frontend.bat
```

---

### **METHOD 3: VS Code Tasks (RECOMMENDED)**

**Setup VS Code Tasks:**

1. Buat file `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "cd backend && ..\\.venv\\Scripts\\activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload",
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "cd frontend && npm run dev",
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "Start All",
      "dependsOn": ["Start Backend", "Start Frontend"],
      "dependsOrder": "parallel"
    }
  ]
}
```

**Cara pakai:**
1. Tekan `Ctrl+Shift+P`
2. Ketik "Tasks: Run Task"
3. Pilih "Start All"

---

##  LANGKAH 5: VERIFIKASI INSTALASI

### **Checklist Verifikasi:**

- [ ] Backend running di `http://localhost:8000`
- [ ] Frontend running di `http://localhost:3000`
- [ ] API docs accessible di `http://localhost:8000/docs`
- [ ] Health check returns `{"status":"healthy"}`
- [ ] Frontend loads tanpa error di console
- [ ] Login page visible
- [ ] Can login with admin credentials

### **Test Login:**
```
Email: admin@colonyai.com
Password: admin_secure_2026
```

**Expected flow:**
1. Login berhasil
2. Welcome modal muncul
3. Klik "Lanjut ke Dashboard"
4. Dashboard terbuka

---

##  TROUBLESHOOTING

### **Problem 1: ModuleNotFoundError saat run backend**

**Error:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solusi:**
```bash
# Pastikan virtual environment aktif
.venv\Scripts\activate

# Reinstall dependencies
pip install -r backend\requirements.txt
```

---

### **Problem 2: Port 8000 already in use**

**Error:**
```
OSError: [Errno 10048] error while attempting to bind on address ('0.0.0.0', 8000)
```

**Solusi:**
```bash
# Windows: Cari proses yang menggunakan port 8000
netstat -ano | findstr :8000

# Kill proses (ganti PID dengan angka dari hasil di atas)
taskkill /PID <PID> /F

# Atau gunakan port lain
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

---

### **Problem 3: Frontend error "Cannot find module"**

**Error:**
```
Error: Cannot find module 'next'
```

**Solusi:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

### **Problem 4: CORS error di frontend**

**Error di browser console:**
```
Access to fetch at 'http://localhost:8000' has been blocked by CORS policy
```

**Solusi:**
```bash
# Pastikan backend running dan CORS configured
# Check backend/.env
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]

# Restart backend setelah ubah .env
```

---

### **Problem 5: Database error**

**Error:**
```
sqlalchemy.exc.OperationalError: no such table: users
```

**Solusi:**
```bash
# Database belum diinisialisasi
# Hapus database lama (jika ada)
del backend\colonyai.db

# Restart backend, database akan dibuat ulang
```

---

### **Problem 6: Model not found error**

**Error:**
```
RuntimeError: Critical: ColonyAI model not found at ./models/colony_best.pt
```

**Solusi:**
```bash
# Option 1: Download/copy model file
# Copy file model Anda ke: backend/models/colony_best.pt

# Option 2: Untuk testing UI saja, comment code model loading di:
# backend/app/services/colony_detector.py
# (Tidak recommended untuk production)
```

---

### **Problem 7: npm install sangat lambat**

**Solusi:**
```bash
# Gunakan mirror registry yang lebih cepat (untuk Indonesia)
npm config set registry https://registry.npmmirror.com

# Atau gunakan yarn (biasanya lebih cepat)
npm install -g yarn
yarn install
```

---

### **Problem 8: Virtual environment tidak aktif di VS Code**

**Solusi:**
1. Tekan `Ctrl+Shift+P`
2. Ketik "Python: Select Interpreter"
3. Pilih interpreter di `.venv\Scripts\python.exe`
4. Restart terminal VS Code

---

##  FOLDER STRUCTURE PENTING

```
colonyai/
├── .venv/                    # Python virtual environment
├── backend/                  # FastAPI backend
│   ├── app/                  # Application code
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Config, security, database
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   └── services/         # Business logic
│   ├── models/               # YOLOv8 model files
│   │   └── colony_best.pt    # ⚠️ WAJIB ADA untuk inference
│   ├── tests/                # Test files
│   ├── .env                  # Environment variables
│   └── main.py               # Entry point
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/              # Pages (Next.js App Router)
│   │   ├── components/       # React components
│   │   └── lib/              # API clients, utilities
│   ├── .env.local            # Environment variables
│   └── package.json          # Dependencies
└── docs/                     # Documentation
```

---

## ⌨️ SHORTCUT VS CODE RECOMMENDED

| Shortcut | Action |
|----------|--------|
| `Ctrl+`` | Toggle terminal |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+Shift+`` | New terminal |
| `Ctrl+J` | Toggle panel |
| `Ctrl+P` | Quick open file |
| `Ctrl+Shift+F` | Global search |
| `F5` | Run/Debug |
| `Ctrl+F5` | Run without debug |

---

## 📝 DEVELOPMENT WORKFLOW

### **Daily Workflow:**

```bash
# 1. Buka VS Code
code .

# 2. Activate virtual environment (jika belum)
.venv\Scripts\activate

# 3. Pull latest changes (jika kolaborasi)
git pull origin main

# 4. Install new dependencies (jika ada update)
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# 5. Run aplikasi
# Terminal 1
cd backend && uvicorn main:app --reload

# Terminal 2
cd frontend && npm run dev

# 6. Mulai coding! 🚀
```

### **Before Commit:**

```bash
# 1. Run tests
cd backend && pytest tests/ -v

# 2. Check code quality
cd backend && flake8 app/
cd ../frontend && npm run lint

# 3. Commit changes
git add .
git commit -m "feat: description of changes"

# 4. Push to remote
git push origin main
```

---

## 🎯 QUICK REFERENCE

### **Ports:**
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- API Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### **Admin Login:**
```
Email: admin@colonyai.com
Password: admin_secure_2026
```

### **Database:**
- Development: SQLite (`backend/colonyai.db`)
- Production: PostgreSQL (Supabase/Railway)

### **Model:**
- Location: `backend/models/colony_best.pt`
- Framework: YOLOv8 (Ultralytics)
- Classes: 5 (colony_single, colony_merged, bubble, dust_debris, media_crack)

---

## ✅ SETUP CHECKLIST

**First-time setup:**
- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] VS Code installed with extensions
- [ ] Repository cloned
- [ ] Virtual environment created and activated
- [ ] Backend dependencies installed
- [ ] `.env` file configured with secret keys
- [ ] Frontend dependencies installed
- [ ] `.env.local` configured
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Login tested successfully
- [ ] API docs accessible

**Daily startup:**
- [ ] Activate virtual environment
- [ ] Start backend
- [ ] Start frontend
- [ ] Verify both services running
- [ ] Begin development!

---

## 📞 NEED HELP?

### **Documentation:**
- [API Documentation](docs/api.md)
- [Architecture Guide](docs/architecture.md)
- [Deployment Guide](docs/deployment.md)
- [User Manual](docs/user-manual.md)

### **Team Contacts:**
- **Product Owner:** Wisnu Alfian
- **Scrum Master & AI Lead:** Muhammad Faras
- **UI/UX Designer:** Suci
- **Data Analyst & QA:** Steven

### **Resources:**
- GitHub: https://github.com/wi5nuu/colonyai
- YOLOv8 Docs: https://docs.ultralytics.com/
- FastAPI Docs: https://fastapi.tiangolo.com/
- Next.js Docs: https://nextjs.org/docs

---

##  HAPPY CODING! 🚀

Anda sekarang siap untuk development ColonyAI. Jika ada masalah, cek bagian **Troubleshooting** di atas atau hubungi tim.

**Last Updated:** April 16, 2025  
**Version:** 1.0
