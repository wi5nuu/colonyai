# 🔧 ColonyAI - Troubleshooting Guide

## Masalah yang Diperbaiki (April 2026)

Dokumen ini menjelaskan masalah-masalah yang ditemukan dan solusi yang sudah diimplementasikan.

---

## 1. ❌ Frontend dan Backend Tidak Terhubung

### Gejala:

- Upload image gagal dengan error "Connection refused" atau "Failed to fetch"
- Dashboard kosong atau menampilkan error
- API calls tidak berhasil

### Penyebab:

1. **Backend tidak running** - Uvicorn server harus aktif di port 8000
2. **CORS misconfigured** - Frontend tidak diizinkan mengakses backend
3. **API URL salah** - Frontend pointing ke URL yang salah
4. **Database tidak terinisialisasi** - Backend tidak bisa connect ke DB

### ✅ Solusi yang Sudah Diterapkan:

#### A. Backend CORS Configuration (FIXED)

- File: `backend/main.py`
- CORS sudah dikonfigurasi untuk mengizinkan:
  - `http://localhost:3000` (Frontend)
  - `http://localhost:8000` (Backend itself)
  - All methods: GET, POST, PUT, DELETE, etc.
  - All headers

#### B. Frontend API Configuration (VERIFIED)

- File: `frontend/src/lib/api.ts`
- Sudah menggunakan `NEXT_PUBLIC_API_URL` environment variable
- Default ke `http://localhost:8000` jika tidak dikonfigurasi

#### C. FormData Handling (VERIFIED)

- Browser otomatis set `Content-Type: multipart/form-data` dengan boundary untuk FormData
- API client tidak override header ini

### 🚀 Cara Memastikan Koneksi Bekerja:

**Step 1: Buat .env file di backend**

```bash
cd backend
copy .env.example .env
```

Edit `.env` dan atur:

```env
DEBUG=True
DATABASE_URL=sqlite+aiosqlite:///./colonyai.db
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]
```

**Step 2: Jalankan backend**

```bash
.venv\Scripts\activate
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Verifikasi output menunjukkan:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
[DATABASE] Connecting to PostgreSQL Database...
[DATABASE] Connection successful and tables synchronized.
```

**Step 3: Test connection**

```bash
# Di browser, buka:
http://localhost:8000/health
```

Harus menampilkan:

```json
{ "status": "healthy" }
```

**Step 4: Jalankan frontend**

```bash
# Terminal baru
cd frontend
npm run dev
```

**Step 5: Test upload**

1. Buka http://localhost:3000
2. Login dengan: `admin@colonyai.com` / `admin_secure_2026`
3. Go ke Dashboard → Upload
4. Try upload image
5. Check browser DevTools (F12) → Network tab untuk melihat request

---

## 2. ❌ Frontend Tidak Menggunakan Real-time Data

### Gejala:

- Analytics page selalu menampilkan data demo
- Data tidak update real-time
- Upload tidak mengubah data di dashboard

### ✅ Solusi yang Sudah Diterapkan:

File: `frontend/src/app/dashboard/analytics/page.tsx`

**Changed:**

```diff
- const USE_DEMO_DATA = true; // Set to false to use real data from API
+ const USE_DEMO_DATA = false; // Set to false to use real data from API
```

Sekarang analytics page akan:

1. Fetch data real-time dari `/api/v1/analyses`
2. Display data yang sebenarnya dari database
3. Update setiap kali ada analisis baru

### Verifikasi:

1. Upload image di dashboard
2. Go ke Analytics page
3. Data upload Anda harus muncul di chart dan list

---

## 3. ❌ Upload Image Gagal

### Gejala:

- Error ketika mencoba upload: "Failed to upload image"
- File tidak tersimpan
- No image files appear di uploads directory

### Penyebab:

1. Backend tidak running
2. Upload directory tidak ada atau tidak writable
3. Database connection error
4. Permission issue dengan file system

### ✅ Verifikasi yang Sudah Ada:

Backend (`backend/main.py` - lifespan function):

```python
# Ensure upload directories exist on startup
for subdir in ["original", "annotated", "reports"]:
    Path(f"{settings.UPLOAD_DIR}/{subdir}").mkdir(parents=True, exist_ok=True)
```

### 🔍 Debugging Steps:

**Step 1: Verifikasi backend berjalan**

```bash
curl http://localhost:8000/health
# Harus return: {"status":"healthy"}
```

**Step 2: Verifikasi upload directory**

```bash
# Check if directory exists
dir backend\uploads

# If not, backend hasn't started yet
# This directory will be created when backend starts
```

**Step 3: Check backend logs**
Look for these messages when backend starts:

```
[STARTUP] Initializing Laboratory OS Backend...
[STARTUP] Connecting to PostgreSQL Database...
[DATABASE] Connection successful and tables synchronized.
[STARTUP] Database initialization complete.
```

**Step 4: Test upload via API**

```bash
# Create a simple test image file
# Then use curl to test upload:

curl -X POST http://localhost:8000/api/v1/images/upload ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -F "file=@test.jpg"

# Should return:
# {"image_id":"uuid","original_url":"...","filename":"..."}
```

**Step 5: Check browser console**

- Open DevTools (F12)
- Go to Network tab
- Try upload
- Click on the failed request
- Check Response tab for error details

### ✅ Most Common Issues & Fixes:

| Issue                       | Fix                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `Connection refused`        | Backend not running. Run: `uvicorn main:app --reload`                                |
| `401 Unauthorized`          | Not logged in or token expired. Login again.                                         |
| `422 Invalid media_type`    | Media type spelling wrong. Must be exactly: "Plate Count Agar", "VRBA", "BGBB", etc. |
| `413 Payload too large`     | Image > 10MB. Use smaller image.                                                     |
| `500 Internal Server Error` | Check backend logs for detailed error message.                                       |
| `CORS error` in browser     | Backend CORS not properly configured. Check `.env` file.                             |

---

## 4. ❌ Admin Tidak Melihat 4 Role

### Gejala:

- Administration page kosong atau hanya show beberapa user
- 4 role (admin, manager, analyst, auditor) tidak semua terlihat
- User list tidak lengkap

### ✅ Solusi yang Sudah Diterapkan:

#### A. Backend Database Seeding (VERIFIED)

File: `backend/app/core/database.py` - `init_db()` function

Automatically creates 4 demo users:

1. **admin@colonyai.local** / admin_secure_placeholder → System Admin (Level-04)
2. **analyst@colonyai.com** / analyst_secure_2026 → Lab Analyst (Level-01)
3. **manager@colonyai.com** / manager_secure_2026 → Lab Manager (Level-03)
4. **auditor@colonyai.com** / auditor_secure_2026 → Quality Auditor (Level-02)

#### B. Admin Page Role Display (FIXED)

File: `frontend/src/app/dashboard/administration/page.tsx`

**Changes:**

1. Added explicit role-to-clearance level mapping:

```typescript
else if (roleStr === 'analyst') clearanceLevel = 'Level-01';
```

2. Added fallback to demo data when API call fails:

```typescript
catch (err) {
    // Fallback ke demo data kalau API gagal
    setAnalysts(DEMO_ANALYSTS);
    setAuditLogs(DEMO_AUDIT_LOGS.slice(0, 10));
    toast.error('Gagal mengambil data dari server. Menampilkan data demo.');
}
```

### ✅ Verifikasi Semua 4 Roles:

**Step 1: Start backend dan check seeding**

```bash
# Backend logs should show:
[DATABASE] Seeding initial admin user: admin@colonyai.local
[DATABASE] Seeding lead analyst: analyst@colonyai.com
[DATABASE] Seeding lab manager: manager@colonyai.com
[DATABASE] Seeding auditor: auditor@colonyai.com
```

**Step 2: Login sebagai admin**

- Email: `admin@colonyai.local`
- Password: `admin_secure_placeholder` (atau dari `.env`)

**Step 3: Navigate ke Administration**

- Should show all 4 users dengan clearance level masing-masing

**Step 4: Verify in API**

```bash
# Get all users
curl http://localhost:8000/api/v1/users/ ^
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Response should include:
# [
#   {"id":"...", "email":"admin@colonyai.local", "role":"admin", ...},
#   {"id":"...", "email":"analyst@colonyai.com", "role":"analyst", ...},
#   {"id":"...", "email":"manager@colonyai.com", "role":"manager", ...},
#   {"id":"...", "email":"auditor@colonyai.com", "role":"auditor", ...}
# ]
```

---

## 📊 Full Test Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] `/health` endpoint returns `{"status":"healthy"}`
- [ ] Can login with `admin@colonyai.local` / password
- [ ] Dashboard loads real-time data (not demo data)
- [ ] Can upload image in Dashboard → Upload
- [ ] Uploaded image appears in Dashboard → History
- [ ] Analytics page shows real data from database
- [ ] Administration page shows all 4 users with correct roles
- [ ] Upload directories exist: `backend/uploads/{original,annotated,reports}`
- [ ] Database file exists: `backend/colonyai.db`

---

## 🔧 Useful Commands

```bash
# Run diagnostic tool
python diagnose_connection.py

# View backend logs
tail -f backend/logs/colonyai.log

# Clear database and restart
del backend\colonyai.db
# Then restart backend - it will recreate and reseed

# Test API directly
curl http://localhost:8000/docs
# Opens interactive API documentation

# Check if port is in use
netstat -ano | findstr :8000

# Kill process using port 8000
taskkill /PID <PID> /F

# Check environment
echo %PATH%
python --version
node --version
npm --version
```

---

## 📞 Getting Help

1. **Check logs:**
   - Backend: Terminal output atau `backend/logs/colonyai.log`
   - Frontend: Browser DevTools Console (F12)

2. **Run diagnostic:**

   ```bash
   python diagnose_connection.py
   ```

3. **Check configuration:**
   - Backend: `backend/.env` file
   - Frontend: `frontend/.env.local` file

4. **Restart everything:**

   ```bash
   # Kill all running processes
   taskkill /F /IM python.exe /FI "WINDOWTITLE eq uvicorn*"
   taskkill /F /IM node.exe /FI "WINDOWTITLE eq next*"

   # Start fresh
   # Follow "Cara Memastikan Koneksi Bekerja" section above
   ```

---

**Last Updated:** May 1, 2026
**Status:** ✅ All 4 issues addressed and tested
