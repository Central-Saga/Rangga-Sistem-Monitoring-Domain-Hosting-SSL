# PRD – Sistem Monitoring Domain, Hosting & SSL

## IDENTITAS DOKUMEN

| No | Uraian | Keterangan |
|---|---|---|
| 1 | Judul Proyek | Sistem Monitoring Domain, Hosting & SSL |
| 2 | Nama Lengkap Pembuat | I Wayan Rangga Dinata Putra |
| 3 | Instansi | PT Central Saga Mandiri (CSM) |
| 4 | Tujuan Dokumen | Sebagai pedoman perancangan, pengembangan dan implementasi Sistem Monitoring Domain, Hosting & SSL |
| 5 | Tanggal Penyusunan | 07 Oktober 2026 |
| 6 | Status Dokumen | Final – Tidak Ada Revisi |

## 1. MASALAH & TUJUAN

### 1.1 Latar Belakang

PT Central Saga Mandiri (CSM) mengelola berbagai aset infrastruktur digital untuk tiap proyek dan klien, seperti Domain, Hosting, SSL, dan VPS. Saat ini pencatatan masa aktif aset tersebut masih dilakukan secara manual menggunakan spreadsheet.

Akibatnya, jadwal perpanjangan sering terlewat sehingga berpotensi menyebabkan domain tidak diperpanjang, sertifikat SSL berakhir mendadak, atau layanan hosting terputus yang berdampak pada operasional tim maupun klien.

### 1.2 Permasalahan

Beberapa permasalahan yang ingin diatasi antara lain:

1. Data aset infrastruktur belum terpusat dalam satu sistem yang terstandar.
2. Belum ada peringatan otomatis terkait aset yang akan segera expired.
3. Sulit memantau masa aktif aset berdasarkan Klien, Proyek, maupun Vendor/Provider.
4. Riwayat perpanjangan (renewal) belum tercatat secara terstruktur.
5. Belum ada pembagian hak akses yang jelas antar pengguna sesuai perannya.

### 1.3 Tujuan Sistem

Tujuan dibangunnya sistem ini adalah:

1. Memusatkan pencatatan aset infrastruktur beserta data klien, proyek, dan vendor.
2. Memudahkan pemantauan masa aktif aset melalui tampilan daftar, countdown sisa hari, dan dashboard.
3. Memberikan peringatan otomatis bertahap **H-30** dan **H-7** sebelum tanggal expired.
4. Mencatat dan menelusuri riwayat perpanjangan setiap aset.
5. Menerapkan hak akses berbasis role (RBAC) untuk menjaga keamanan data.
6. Menyediakan informasi yang jelas bagi tim Teknis, Operasional maupun Manajemen untuk mengambil tindak lanjut perpanjangan tepat waktu.

### 1.4 Sasaran Sistem

Sistem ini ditujukan untuk membantu tim CSM dalam mengelola, memantau dan memastikan perpanjangan aset infrastruktur dilakukan tepat waktu secara terpusat, terstruktur dan terdokumentasi.

## 2. RUANG LINGKUP

### 2.1 Fitur yang Dikerjakan

#### A. Master Data
- **Clients (Klien)** – Mengelola data klien (nama, PIC, kontak, alamat dan status aktif/tidak aktif).
- **Projects (Proyek)** – Mengelola proyek per klien (nama proyek, kode proyek unik, deskripsi dan status).
- **Vendors (Vendor/Provider)** – Mengelola data registrar/provider (nama vendor, kontak, website, catatan dan status).

#### B. Manajemen Aset Infrastruktur
- **Infra Assets (Aset Infrastruktur)** – Pencatatan aset dengan tipe `domain`, `hosting`, `ssl`, dan `vps`.
- Data yang dicatat meliputi: nama/domain aset, relasi ke klien, proyek, vendor, tanggal pembelian (`purchase_date`), tanggal mulai aktif (`start_date`), tanggal expired (`expiry_date`), estimasi biaya perpanjangan (`renewal_cost`), mata uang (`IDR`/`USD`), status aset (`active`, `pending_renewal`, `expired`, `suspended`) dan catatan.
- Sistem memiliki validasi untuk memastikan `start_date <= expiry_date` agar menjaga keabsahan data.

#### C. Monitoring, Alert & Countdown
- **Perhitungan sisa hari** – Otomatis menghitung selisih hari antara `expiry_date` dengan tanggal hari ini, berdasarkan timezone server `Asia/Jakarta`.
- **Alert bertahap** – Mengelompokkan aset menjadi: **Akan Expired H-30**, **Akan Expired H-7**, dan **Sudah Expired**.
- **Countdown "Sisa X Hari"** – Ditampilkan pada daftar aset maupun dashboard untuk mempermudah prioritas tindak lanjut.
- **Update status otomatis** – Aset yang telah melewati `expiry_date` akan secara otomatis ditandai sebagai `expired` atau `pending_renewal` berdasarkan kondisi aset.

#### D. Riwayat Perpanjangan (Renewal)
- **Renewals (Riwayat Perpanjangan)** – Mencatat aktivitas perpanjangan per aset (tanggal perpanjangan, periode baru bila ada, nominal biaya, nomor invoice/nota, PIC, status pembayaran, dan catatan).
- Setiap data renewal terhubung langsung ke aset terkait (`infra_asset_id`) agar riwayat perpanjangan dapat ditelusuri secara kronologis per aset.

#### E. Dashboard, Filter & Pencarian
- **Dashboard** – Menampilkan total aset per tipe (Domain, Hosting, SSL, VPS), jumlah aset akan expired H-30, H-7, yang sudah expired, serta daftar **Expiring Soon** berdasarkan urutan sisa hari terdekat.
- **Filter** – Dapat difilter berdasarkan tipe aset, klien, proyek, vendor, status, kategori expiring (H-7/H-30/Semua), dan rentang tanggal expired.
- **Pencarian** – Dapat dilakukan berdasarkan nama aset atau nama domain untuk mempercepat pencarian data.

#### F. Manajemen Pengguna & Hak Akses (RBAC)
- **Role** – Terdiri dari 3 role yaitu `admin`, `operator`, dan `viewer`.
- **Otorisasi** – Menggunakan **Laravel Sanctum**, **FormRequest** dan **Policy** untuk pembatasan hak akses per resource berdasarkan role masing-masing.
- **Manajemen User** – Hanya role `admin` yang berwenang menambah, mengubah maupun menghapus data pengguna dan penugasan role.

### 2.2 Batasan Sistem

- **Hanya monitoring & pencatatan** – Sistem ini berfungsi sebagai monitoring dan pencatatan masa aktif aset, tidak melakukan auto-renewal langsung ke provider.
- **Tidak menyimpan data sensitif** – Tidak menyimpan password teknis, API Key, token, credential atau data rahasia lainnya di dalam sistem.
- **Tidak mencakup billing terintegrasi penuh** – Sistem hanya mencatat estimasi biaya perpanjangan maupun riwayat biaya perpanjangan (renewal), bukan sistem penagihan terintegrasi penuh.
- **Fokus pada masa aktif aset** – Sistem difokuskan pada pemantauan masa aktif infrastruktur, bukan pada pengelolaan konfigurasi server secara detail.
- **Soft Delete diterapkan** – Digunakan pada data master dan data terkait untuk menjaga integritas dan jejak historis data.

## 3. ALUR & USE CASE

### 3.1 Aktor Pengguna

| Role | Deskripsi |
|---|---|
| **Admin** | Memiliki akses penuh terhadap sistem. Dapat mengelola master data, aset, renewal, pengguna dan role. |
| **Operator** | Bertugas mengelola data klien, proyek, vendor, aset infrastruktur serta mencatat riwayat perpanjangan (renewal). Tidak berwenang mengelola pengguna dan role. |
| **Viewer** | Hanya dapat melihat data, daftar aset, riwayat renewal dan dashboard. Tidak memiliki izin untuk menambah, mengubah maupun menghapus data. |

### 3.2 Alur Sistem

1. **Login** – Pengguna melakukan login dengan email dan password melalui autentikasi Laravel Sanctum sesuai dengan rolenya.
2. **Persiapan Master Data** – Admin atau Operator mengisi data Klien, Proyek dan Vendor sebagai data referensi untuk aset infrastruktur.
3. **Input Aset Infrastruktur** – Menambahkan aset baru (Domain, Hosting, SSL, VPS) beserta data pendukung, termasuk `start_date` dan `expiry_date` serta relasinya ke Klien, Proyek dan Vendor.
4. **Pemantauan Otomatis** – Sistem akan menghitung sisa hari secara otomatis berdasarkan `expiry_date` dan mengelompokkan aset ke dalam kategori H-30, H-7 atau Expired.
5. **Peringatan & Prioritas** – Hasil perhitungan tersebut ditampilkan pada daftar aset dan dashboard berdasarkan urutan sisa hari terdekat untuk mempermudah penentuan prioritas tindak lanjut.
6. **Pencatatan Perpanjangan** – Apabila aset dilakukan perpanjangan, Operator atau Admin mencatatnya melalui menu **Renewal** yang terhubung langsung dengan aset tersebut.
7. **Pemantauan Berkelanjutan** – Viewer, Operator maupun Admin dapat memantau kondisi seluruh aset melalui dashboard, fitur filter maupun pencarian berdasarkan kebutuhan.

### 3.3 Use Case Utama

| Use Case | Aktor | Alur |
|---|---|---|
| **Login / Logout** | Admin, Operator, Viewer | Melakukan autentikasi menggunakan token Laravel Sanctum untuk mengakses sistem sesuai hak akses berdasarkan role. |
| **Kelola Master Data (Clients, Projects, Vendors)** | Admin, Operator | Melakukan CRUD terhadap data master dengan validasi menggunakan FormRequest. |
| **Kelola Infra Assets** | Admin, Operator | Melakukan CRUD terhadap aset infrastruktur dengan validasi tanggal (`start_date <= expiry_date`). |
| **Pantau Aset Expiring (H-7 / H-30 / Expired)** | Admin, Operator, Viewer | Melihat daftar aset yang akan expired atau sudah expired berdasarkan hasil perhitungan otomatis sistem. |
| **Catat Renewal History (Riwayat Perpanjangan)** | Admin, Operator | Melakukan input riwayat perpanjangan, menyimpan relasinya ke `infra_asset_id` dan menampilkan data kronologis per aset. |
| **Lihat Dashboard Monitoring** | Admin, Operator, Viewer | Melihat ringkasan total aset per tipe, H-30, H-7, Expired, countdown sisa hari serta daftar Expiring Soon. |
| **Pencarian & Filter** | Admin, Operator, Viewer | Melakukan pencarian dan filter data berdasarkan tipe aset, klien, proyek, vendor, status, kategori expiring dan rentang tanggal expired. |
| **Kelola User & Role (RBAC)** | Admin | Mengelola data pengguna dan penugasan role dengan pembatasan akses melalui Laravel Policy. |

## 4. RANCANGAN DATA

### 4.1 Entitas Utama

| Entitas | Kegunaan |
|---|---|
| `users` | Data akun pengguna untuk keperluan login. |
| `roles` | Master role pengguna (`admin`, `operator`, `viewer`). |
| `role_user` | Tabel pivot untuk relasi Many-to-Many antara users dan roles (RBAC). |
| `clients` | Master data Klien PT Central Saga Mandiri (CSM). |
| `projects` | Master data Proyek yang terhubung ke Klien. |
| `vendors` | Master data Vendor/Registrar/Provider. |
| `infra_assets` | Data aset infrastruktur utama (Domain, Hosting, SSL, VPS). |
| `renewals` | Riwayat perpanjangan per aset infrastruktur. |

### 4.2 Struktur Field Kunci

| Tabel | Field Kunci | Keterangan |
|---|---|---|
| `users` | `id`, `name`, `email` (UNIQUE), `password`, `email_verified_at`, `deleted_at` | Menggunakan Soft Deletes. |
| `roles` | `id`, `name` (UNIQUE), `guard_name`, `description` | Master role. |
| `role_user` | `id`, `user_id` (FK), `role_id` (FK) | Pivot untuk implementasi RBAC. |
| `clients` | `id`, `name`, `pic_name`, `email`, `phone`, `address`, `status`, `deleted_at` | Menggunakan Soft Deletes. |
| `projects` | `id`, `client_id` (FK), `name`, `project_code` (UNIQUE), `description`, `status`, `deleted_at` | Terhubung ke clients. Menggunakan Soft Deletes. |
| `vendors` | `id`, `name` (UNIQUE), `website`, `email`, `phone`, `address`, `notes`, `status`, `deleted_at` | Menggunakan Soft Deletes. |
| `infra_assets` | `id`, `client_id` (FK), `project_id` (FK), `vendor_id` (FK NULL), `type` (enum: domain/hosting/ssl/vps), `name`, `domain_name`, `purchase_date`, `start_date`, `expiry_date`, `renewal_cost` (decimal), `currency` (IDR/USD), `status` (enum: active/pending_renewal/expired/suspended), `notes`, `deleted_at` | Entitas utama sistem. Field `vendor_id` bersifat nullable. Menggunakan Soft Deletes. |
| `renewals` | `id`, `infra_asset_id` (FK), `renewal_date`, `new_start_date` (NULL), `new_expiry_date` (NULL), `amount` (decimal), `currency` (IDR/USD), `invoice_no`, `receipt_no`, `pic_name`, `payment_status` (paid/unpaid), `notes`, `deleted_at` | Menyimpan riwayat perpanjangan. Menggunakan Soft Deletes. |

### 4.3 Relasi Antar Tabel

| Relasi | Jenis | Keterangan |
|---|---|---|
| `clients` – `projects` | 1 : N | Satu klien dapat memiliki banyak proyek. |
| `clients` – `infra_assets` | 1 : N | Satu klien dapat memiliki banyak aset infrastruktur. |
| `projects` – `infra_assets` | 1 : N | Satu proyek dapat memiliki banyak aset infrastruktur. |
| `vendors` – `infra_assets` | 1 : N | Satu vendor/provider dapat terkait dengan banyak aset infrastruktur. |
| `infra_assets` – `renewals` | 1 : N | Satu aset infrastruktur dapat memiliki banyak riwayat perpanjangan. |
| `users` – `roles` | M : N | Relasi Many-to-Many melalui tabel pivot `role_user`. |

### 4.4 Catatan Desain Data

- **Migration-based** – Seluruh tabel database dibuat melalui Laravel Migration, **tidak dibuat secara manual**.
- **Data Dummy** – Tersedia Laravel Seeder untuk menghasilkan data dummy yang dibutuhkan untuk keperluan demo dan pengujian.
- **SoftDeletes** – Diterapkan pada master data dan data terkait untuk menjaga integritas dan jejak historis data.
- **Foreign Key** – Digunakan untuk menjaga integritas referensial antar tabel.
- **Enum** – Digunakan pada field `type`, `status`, `currency`, dan `payment_status` untuk menjaga konsistensi nilai data.
- **Unique Key** – Diterapkan pada `users.email`, `projects.project_code`, dan `vendors.name` untuk mencegah terjadinya duplikasi data.

## 5. RANCANGAN TEKNIS

### 5.1 Stack Teknologi

| Layer | Teknologi | Keterangan |
|---|---|---|
| **Backend** | **Laravel (PHP 8.3+)** | Digunakan untuk membangun REST API. Menggunakan **Laravel Sanctum** (Autentikasi), **FormRequest** (Validasi Request), **Policy** (Otorisasi) serta menerapkan konsep **RBAC (Role-Based Access Control)**. |
| **Frontend** | **Next.js App Router + TypeScript + Tailwind CSS** | Digunakan sebagai antarmuka pengguna (UI). **Seluruh data diambil dari REST API Laravel**, tidak ada data yang di-hardcode. |
| **Database** | **PostgreSQL 16** | Database relasional utama. Dikelola secara penuh melalui Laravel Migration dan Laravel Seeder. |
| **Cache, Session, Queue & Rate Limit** | **Redis 7** | Digunakan untuk caching data, manajemen session, menjalankan **Queue Job** (contoh: generate PDF, email alert), serta menerapkan **API Rate Limit** untuk perlindungan API. |
| **Container** | **Podman + Podman Compose** | Seluruh service dikemas dalam container. Sistem dirancang agar dapat dijalankan dengan perintah **`podman-compose up` sekali jalan**. |
| **Web Server (Backend)** | **Nginx + PHP-FPM** | Digunakan pada container backend untuk menangani permintaan (request) REST API secara optimal. |
| **Frontend Runtime** | **Node.js (Next.js Standalone)** | Frontend dibangun dengan mode **standalone output** untuk optimasi ukuran dan performa image container. |

### 5.2 Arsitektur Service

Service yang akan dijalankan melalui file `podman-compose.yml` meliputi:

| Service | Fungsi |
|---|---|
| **db** | PostgreSQL 16 – Sebagai database utama aplikasi. |
| **redis** | Redis 7 – Untuk Cache, Session, Queue dan Rate Limit. |
| **backend** | Laravel API (Nginx + PHP-FPM) – Sebagai core REST API aplikasi. |
| **queue** | Laravel Queue Worker – Memproses job asinkron (background jobs). |
| **scheduler** | Laravel Scheduler – Menjalankan `php artisan schedule:run` secara berkala (siap untuk mendukung logika alert terjadwal). |
| **frontend** | Next.js Standalone – Sebagai UI Web Aplikasi. |

### 5.3 Prinsip Implementasi

- **API-First** – Frontend hanya berkomunikasi dengan Backend melalui REST API Laravel.
- **RESTful** – Menggunakan HTTP Method yang tepat (`GET`, `POST`, `PUT`, `DELETE`) dengan struktur endpoint yang konsisten dan terstandar.
- **Validasi & Otorisasi Ketat** – Setiap request divalidasi melalui FormRequest dan dicek hak aksesnya melalui Policy berdasarkan role pengguna.
- **RBAC Terpadu** – Pembagian hak akses diterapkan secara jelas dan konsisten antara role `admin`, `operator` dan `viewer`.
- **Migration-First Approach** – Tidak ada pembuatan tabel manual. Seluruh perubahan skema database dikelola melalui Laravel Migration.
- **Separation of Concerns** – Pemisahan tanggung jawab yang jelas antara Controller, Request, Policy, Model, Route, Resource dan Layer terkait pada Laravel.
- **Queue Ready** – Infrastruktur Redis dan Queue Worker telah disiapkan untuk kebutuhan job asinkron di masa mendatang (email alert, generate file, dsb.).
- **Fully Containerized** – Seluruh stack aplikasi (Backend, Frontend, Database, Redis) dapat di-deploy dan dijalankan bersamaan hanya dengan perintah **`podman-compose up --build -d`**.
- **Konsisten Perhitungan Tanggal** – Seluruh logika perhitungan alert H-30, H-7 dan Expired menggunakan perhitungan berbasis tanggal server dengan konfigurasi `APP_TIMEZONE=Asia/Jakarta`.

### 5.4 Dokumentasi yang Disediakan

Berikut dokumentasi wajib yang akan tersedia di repository **Central-Saga/csm-domain-monitoring**:

| Dokumen | Lokasi | Kegunaan |
|---|---|---|
| **PRD** | `docs/PRD_Sistem_Monitoring_Domain_Hosting_SSL.md` | Dokumen perancangan sistem ini sebagai acuan pengembangan dan penilaian. |
| **ERD** | `docs/ERD_Sistem_Monitoring_Domain_Hosting_SSL.md` | Diagram Entity Relationship (ERD) beserta penjelasan relasi antar tabel. |
| **Daftar Endpoint API** | `docs/API_ENDPOINTS.md` | Daftar lengkap endpoint REST API, HTTP Method, autentikasi, role akses, contoh request dan response. |
| **README.md** | Root Repository | Panduan setup, cara menjalankan dengan Podman Compose, perintah umum, struktur proyek dan akun demo. |
| **Screenshot/Demo** | `docs/screenshots/` | Dokumentasi visual aplikasi untuk keperluan demo dan penilaian. |

## 6. KRITERIA PENERIMAAN

| No | Kriteria | Tujuan Verifikasi |
|---|---|---|
| 1. | **Masalah & Tujuan Jelas** | Terdapat penjelasan masalah nyata, rumusan masalah, tujuan dan sasaran sistem yang jelas. |
| 2. | **Ruang Lingkup Tepat** | Fitur yang dikerjakan dan batasan sistem telah terdefinisi dengan jelas dan terarah. |
| 3. | **Alur & Use Case Masuk Akal** | Aktor, peran, alur kerja dan use case utama teridentifikasi dengan runtut dan logis. |
| 4. | **Rancangan Data Logis** | Tabel, field kunci, relasi, aturan konsistensi data dan ERD sesuai kebutuhan sistem. |
| 5. | **Rancangan Teknis Sesuai Spesifikasi** | Tercantum dan digunakan: **Laravel**, **Next.js App Router + TypeScript + Tailwind CSS**, **PostgreSQL**, **Redis (Cache/Session/Queue/Rate Limit)**, **Podman + Podman Compose** sesuai dengan spesifikasi teknis wajib. |
| 6. | **Fitur Monitoring Berjalan Sesuai Perancangan** | Alert H-30, H-7, Expired, countdown sisa hari dan Dashboard Expiring Soon berfungsi berdasarkan perhitungan tanggal secara otomatis. |
| 7. | **Renewal History Terhubung Dengan Benar** | Riwayat perpanjangan tersimpan, terhubung ke aset terkait dan dapat ditampilkan secara kronologis. |
| 8. | **RBAC Diterapkan Dengan Baik** | Hak akses dibatasi per role menggunakan Laravel Sanctum + FormRequest + Policy sesuai pembagian akses yang telah ditetapkan. |
| 9. | **Migration + Seeder Tersedia** | Seluruh tabel dibuat melalui Migration, dilengkapi dengan Seeder untuk data dummy demo sesuai persyaratan. |
| 10. | **Siap Dijalankan Melalui Podman Compose** | Seluruh service dapat dijalankan dengan perintah **`podman-compose up` sekali jalan** sesuai spesifikasi teknis wajib. |