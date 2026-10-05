ERD.md – Sistem Monitoring Domain, Hosting & SSL
IDENTITAS DOKUMEN
No	Uraian	Keterangan
1	Judul Proyek	Sistem Monitoring Domain, Hosting & SSL
2	Nama Lengkap Pembuat	I Wayan Rangga Dinata Putra
3	Instansi	PT Central Saga Mandiri (CSM)
4	Tujuan Dokumen	Sebagai pedoman perancangan Basis Data (ERD), acuan pembuatan Migration, Model dan Validasi Data.
5	Tanggal Penyusunan	07 Oktober 2026
6	Status Dokumen	Final – Tidak Ada Revisi
1. PENJELASAN UMUM
ERD ini menggambarkan perancangan basis data Sistem Monitoring Domain, Hosting & SSL. Sistem ini berfokus pada pencatatan dan pemantauan masa aktif aset infrastruktur (Domain, Hosting, SSL dan VPS), relasinya terhadap Klien, Proyek, Vendor, riwayat perpanjangan (Renewal), serta pengelolaan hak akses berbasis Role-Based Access Control (RBAC).

Perancangan ini disesuaikan dengan kode DBML yang telah diberikan dan disempurnakan agar sesuai dengan standar perancangan basis data yang rapi dan benar.

2. DIAGRAM ERD (MERMAID)
erDiagram
    USERS {
        BIGINT id PK
        VARCHAR(255) name "REQUIRED"
        VARCHAR(255) email UK "REQUIRED"
        VARCHAR(255) password "REQUIRED"
        TIMESTAMP email_verified_at "NULLABLE"
        VARCHAR(100) remember_token "NULLABLE"
        TIMESTAMP deleted_at "NULLABLE (SoftDeletes)"
        TIMESTAMP created_at "REQUIRED DEFAULT now()"
        TIMESTAMP updated_at "REQUIRED DEFAULT now()"
    }

    ROLES {
        BIGINT id PK
        VARCHAR(100) name UK "REQUIRED"
        VARCHAR(100) guard_name "REQUIRED DEFAULT 'web'"
        TEXT description "NULLABLE"
        TIMESTAMP created_at "REQUIRED DEFAULT now()"
        TIMESTAMP updated_at "REQUIRED DEFAULT now()"
    }

    ROLE_USER {
        BIGINT id PK
        BIGINT user_id FK "REQUIRED"
        BIGINT role_id FK "REQUIRED"
        TIMESTAMP created_at "REQUIRED DEFAULT now()"
        TIMESTAMP updated_at "REQUIRED DEFAULT now()"
    }

    CLIENTS {
        BIGINT id PK
        VARCHAR(255) name "REQUIRED"
        VARCHAR(255) pic_name "NULLABLE"
        VARCHAR(255) email "NULLABLE"
        VARCHAR(50) phone "NULLABLE"
        TEXT address "NULLABLE"
        ENUM status "REQUIRED (active, inactive) DEFAULT 'active'"
        TIMESTAMP deleted_at "NULLABLE (SoftDeletes)"
        TIMESTAMP created_at "REQUIRED DEFAULT now()"
        TIMESTAMP updated_at "REQUIRED DEFAULT now()"
    }

    PROJECTS {
        BIGINT id PK
        BIGINT client_id FK "REQUIRED"
        VARCHAR(255) name "REQUIRED"
        VARCHAR(100) project_code UK "REQUIRED"
        TEXT description "NULLABLE"
        ENUM status "REQUIRED (active, inactive, on_hold) DEFAULT 'active'"
        TIMESTAMP deleted_at "NULLABLE (SoftDeletes)"
        TIMESTAMP created_at "REQUIRED DEFAULT now()"
        TIMESTAMP updated_at "REQUIRED DEFAULT now()"
    }

    VENDORS {
        BIGINT id PK
        VARCHAR(255) name UK "REQUIRED"
        VARCHAR(255) website "NULLABLE"
        VARCHAR(255) email "NULLABLE"
        VARCHAR(50) phone "NULLABLE"
        TEXT address "NULLABLE"
        TEXT notes "NULLABLE"
        ENUM status "REQUIRED (active, inactive) DEFAULT 'active'"
        TIMESTAMP deleted_at "NULLABLE (SoftDeletes)"
        TIMESTAMP created_at "REQUIRED DEFAULT now()"
        TIMESTAMP updated_at "REQUIRED DEFAULT now()"
    }

    INFRA_ASSETS {
        BIGINT id PK
        BIGINT client_id FK "REQUIRED"
        BIGINT project_id FK "REQUIRED"
        BIGINT vendor_id FK "NULLABLE"
        ENUM type "REQUIRED (domain, hosting, ssl, vps)"
        VARCHAR(255) name "REQUIRED"
        VARCHAR(255) domain_name "REQUIRED"
        DATE purchase_date "NULLABLE"
        DATE start_date "REQUIRED"
        DATE expiry_date "REQUIRED"
        DECIMAL(15,2) renewal_cost "REQUIRED DEFAULT 0.00"
        ENUM currency "REQUIRED (IDR, USD) DEFAULT 'IDR'"
        ENUM status "REQUIRED (active, pending_renewal, expired, suspended) DEFAULT 'active'"
        TEXT notes "NULLABLE"
        TIMESTAMP deleted_at "NULLABLE (SoftDeletes)"
        TIMESTAMP created_at "REQUIRED DEFAULT now()"
        TIMESTAMP updated_at "REQUIRED DEFAULT now()"
    }

    RENEWALS {
        BIGINT id PK
        BIGINT infra_asset_id FK "REQUIRED"
        DATE renewal_date "REQUIRED"
        DATE new_start_date "NULLABLE"
        DATE new_expiry_date "NULLABLE"
        DECIMAL(15,2) amount "REQUIRED DEFAULT 0.00"
        ENUM currency "REQUIRED (IDR, USD) DEFAULT 'IDR'"
        VARCHAR(100) invoice_no "NULLABLE"
        VARCHAR(100) receipt_no "NULLABLE"
        VARCHAR(255) pic_name "NULLABLE"
        ENUM payment_status "REQUIRED (paid, unpaid) DEFAULT 'unpaid'"
        TEXT notes "NULLABLE"
        TIMESTAMP deleted_at "NULLABLE (SoftDeletes)"
        TIMESTAMP created_at "REQUIRED DEFAULT now()"
        TIMESTAMP updated_at "REQUIRED DEFAULT now()"
    }

    FAILED_JOBS {
        BIGINT id PK
        VARCHAR(255) uuid UK "REQUIRED"
        VARCHAR(255) connection "REQUIRED"
        VARCHAR(255) queue "REQUIRED"
        LONGTEXT payload "REQUIRED"
        LONGTEXT exception "REQUIRED"
        TIMESTAMP failed_at "REQUIRED DEFAULT CURRENT_TIMESTAMP"
    }

    USERS ||--o{ ROLE_USER : "memiliki"
    ROLES ||--o{ ROLE_USER : "diberikan ke"
    CLIENTS ||--o{ PROJECTS : "memiliki"
    CLIENTS ||--o{ INFRA_ASSETS : "memiliki"
    PROJECTS ||--o{ INFRA_ASSETS : "digunakan oleh"
    VENDORS ||--o{ INFRA_ASSETS : "menyediakan"
    INFRA_ASSETS ||--o{ RENEWALS : "memiliki riwayat perpanjangan"
3. PENJELASAN SETIAP TABEL
3.1 Tabel users
Menyimpan data pengguna sistem untuk keperluan autentikasi.

Kolom	Tipe Data	PK/FK/UK	Nullable/Required	Default Value	Keterangan
id	BIGINT	PK, Auto Increment	REQUIRED	–	ID unik pengguna.
name	VARCHAR(255)	–	REQUIRED	–	Nama lengkap pengguna.
email	VARCHAR(255)	UK (UNIQUE)	REQUIRED	–	Email login (unik).
password	VARCHAR(255)	–	REQUIRED	–	Password yang telah di-hash.
email_verified_at	TIMESTAMP	–	NULLABLE	NULL	Waktu verifikasi email.
remember_token	VARCHAR(100)	–	NULLABLE	NULL	Token untuk fitur "Remember Me".
deleted_at	TIMESTAMP	–	NULLABLE	NULL	Digunakan untuk SoftDeletes.
created_at	TIMESTAMP	–	REQUIRED	now()	Waktu pembuatan data.
updated_at	TIMESTAMP	–	REQUIRED	now()	Waktu terakhir update data.
3.2 Tabel roles
Master data role pengguna untuk implementasi RBAC.

Kolom	Tipe Data	PK/FK/UK	Nullable/Required	Default Value	Keterangan
id	BIGINT	PK, Auto Increment	REQUIRED	–	ID unik role.
name	VARCHAR(100)	UK (UNIQUE)	REQUIRED	–	Nama role. Contoh: admin, operator, viewer.
guard_name	VARCHAR(100)	–	REQUIRED	'web'	Guard default Laravel.
description	TEXT	–	NULLABLE	NULL	Penjelasan fungsi role.
created_at	TIMESTAMP	–	REQUIRED	now()	Waktu pembuatan data.
updated_at	TIMESTAMP	–	REQUIRED	now()	Waktu terakhir update data.
3.3 Tabel role_user (Tabel Pivot N:M)
Tabel pivot untuk relasi Many-to-Many antara users dan roles (BelongsToMany). Ditampilkan sebagai tabel sendiri sesuai standar yang dipersyaratkan.

Kolom	Tipe Data	PK/FK/UK	Nullable/Required	Default Value	Keterangan
id	BIGINT	PK, Auto Increment	REQUIRED	–	ID unik pivot.
user_id	BIGINT	FK → users.id	REQUIRED	–	Mengacu ke tabel users.
role_id	BIGINT	FK → roles.id	REQUIRED	–	Mengacu ke tabel roles.
created_at	TIMESTAMP	–	REQUIRED	now()	Waktu pembuatan relasi.
updated_at	TIMESTAMP	–	REQUIRED	now()	Waktu terakhir update relasi.
Index Khusus: (user_id, role_id) dengan UNIQUE (role_user_unique) untuk mencegah duplikasi penugasan role yang sama kepada user.

3.4 Tabel clients
Master data Klien PT Central Saga Mandiri (CSM).

Kolom	Tipe Data	PK/FK/UK	Nullable/Required	Default Value	Keterangan
id	BIGINT	PK, Auto Increment	REQUIRED	–	ID unik klien.
name	VARCHAR(255)	–	REQUIRED	–	Nama perusahaan/klien.
pic_name	VARCHAR(255)	–	NULLABLE	NULL	Nama PIC (Person In Charge).
email	VARCHAR(255)	–	NULLABLE	NULL	Email kontak klien.
phone	VARCHAR(50)	–	NULLABLE	NULL	Nomor telepon klien.
address	TEXT	–	NULLABLE	NULL	Alamat klien.
status	ENUM(active,inactive)	–	REQUIRED	'active'	Status klien.
deleted_at	TIMESTAMP	–	NULLABLE	NULL	Digunakan untuk SoftDeletes.
created_at	TIMESTAMP	–	REQUIRED	now()	Waktu pembuatan data.
updated_at	TIMESTAMP	–	REQUIRED	now()	Waktu terakhir update data.
3.5 Tabel projects
Master data Proyek yang terhubung ke Klien.

Kolom	Tipe Data	PK/FK/UK	Nullable/Required	Default Value	Keterangan
id	BIGINT	PK, Auto Increment	REQUIRED	–	ID unik proyek.
client_id	BIGINT	FK → clients.id	REQUIRED	–	Relasi ke tabel clients.
name	VARCHAR(255)	–	REQUIRED	–	Nama proyek.
project_code	VARCHAR(100)	UK (UNIQUE)	REQUIRED	–	Kode proyek (unik).
description	TEXT	–	NULLABLE	NULL	Deskripsi proyek.
status	ENUM(active,inactive,on_hold)	–	REQUIRED	'active'	Status proyek.
deleted_at	TIMESTAMP	–	NULLABLE	NULL	Digunakan untuk SoftDeletes.
created_at	TIMESTAMP	–	REQUIRED	now()	Waktu pembuatan data.
updated_at	TIMESTAMP	–	REQUIRED	now()	Waktu terakhir update data.
3.6 Tabel vendors
Master data Vendor/Registrar/Provider (penyedia layanan infrastruktur).

Kolom	Tipe Data	PK/FK/UK	Nullable/Required	Default Value	Keterangan
id	BIGINT	PK, Auto Increment	REQUIRED	–	ID unik vendor.
name	VARCHAR(255)	UK (UNIQUE)	REQUIRED	–	Nama vendor/provider (unik).
website	VARCHAR(255)	–	NULLABLE	NULL	Website vendor.
email	VARCHAR(255)	–	NULLABLE	NULL	Email vendor.
phone	VARCHAR(50)	–	NULLABLE	NULL	Nomor telepon vendor.
address	TEXT	–	NULLABLE	NULL	Alamat vendor.
notes	TEXT	–	NULLABLE	NULL	Catatan terkait vendor.
status	ENUM(active,inactive)	–	REQUIRED	'active'	Status vendor.
deleted_at	TIMESTAMP	–	NULLABLE	NULL	Digunakan untuk SoftDeletes.
created_at	TIMESTAMP	–	REQUIRED	now()	Waktu pembuatan data.
updated_at	TIMESTAMP	–	REQUIRED	now()	Waktu terakhir update data.
3.7 Tabel infra_assets
Tabel utama sistem. Berisi data aset infrastruktur (Domain, Hosting, SSL, VPS) beserta masa aktifnya.

Kolom	Tipe Data	PK/FK/UK	Nullable/Required	Default Value	Keterangan
id	BIGINT	PK, Auto Increment	REQUIRED	–	ID unik aset infrastruktur.
client_id	BIGINT	FK → clients.id	REQUIRED	–	Relasi ke klien.
project_id	BIGINT	FK → projects.id	REQUIRED	–	Relasi ke proyek.
vendor_id	BIGINT	FK → vendors.id	NULLABLE	NULL	Relasi ke vendor/provider (boleh kosong).
type	ENUM(domain,hosting,ssl,vps)	–	REQUIRED	–	Tipe aset infrastruktur.
name	VARCHAR(255)	–	REQUIRED	–	Nama aset.
domain_name	VARCHAR(255)	–	REQUIRED	–	Nama domain terkait aset.
purchase_date	DATE	–	NULLABLE	NULL	Tanggal pembelian aset.
start_date	DATE	–	REQUIRED	–	Tanggal mulai aktif aset. Digunakan untuk perhitungan masa aktif.
expiry_date	DATE	–	REQUIRED	–	Tanggal expired/kadaluarsa aset. Digunakan untuk perhitungan Alert H-30, H-7 dan Expired.
renewal_cost	DECIMAL(15,2)	–	REQUIRED	0.00	Estimasi biaya perpanjangan. Tipe data uang yang benar (bukan Integer).
currency	ENUM(IDR,USD)	–	REQUIRED	'IDR'	Mata uang biaya perpanjangan.
status	ENUM(active,pending_renewal,expired,suspended)	–	REQUIRED	'active'	Status pemantauan masa aktif aset.
notes	TEXT	–	NULLABLE	NULL	Catatan teknis aset.
deleted_at	TIMESTAMP	–	NULLABLE	NULL	Digunakan untuk SoftDeletes.
created_at	TIMESTAMP	–	REQUIRED	now()	Waktu pembuatan data.
updated_at	TIMESTAMP	–	REQUIRED	now()	Waktu terakhir update data.
Catatan Bisnis: start_date <= expiry_date (diimplementasikan melalui validasi FormRequest pada Laravel).

3.8 Tabel renewals
Menyimpan riwayat perpanjangan (Renewal History) per aset infrastruktur.

Kolom	Tipe Data	PK/FK/UK	Nullable/Required	Default Value	Keterangan
id	BIGINT	PK, Auto Increment	REQUIRED	–	ID unik renewal.
infra_asset_id	BIGINT	FK → infra_assets.id	REQUIRED	–	Relasi ke aset infrastruktur.
renewal_date	DATE	–	REQUIRED	–	Tanggal dilakukannya perpanjangan.
new_start_date	DATE	–	NULLABLE	NULL	Tanggal mulai baru setelah perpanjangan (opsional).
new_expiry_date	DATE	–	NULLABLE	NULL	Tanggal expired baru setelah perpanjangan (opsional).
amount	DECIMAL(15,2)	–	REQUIRED	0.00	Biaya perpanjangan yang tercatat. Tipe data uang yang benar (bukan Integer).
currency	ENUM(IDR,USD)	–	REQUIRED	'IDR'	Mata uang biaya perpanjangan.
invoice_no	VARCHAR(100)	–	NULLABLE	NULL	Nomor invoice.
receipt_no	VARCHAR(100)	–	NULLABLE	NULL	Nomor kwitansi/nota.
pic_name	VARCHAR(255)	–	NULLABLE	NULL	PIC yang melakukan perpanjangan.
payment_status	ENUM(paid,unpaid)	–	REQUIRED	'unpaid'	Status pembayaran renewal.
notes	TEXT	–	NULLABLE	NULL	Catatan terkait perpanjangan.
deleted_at	TIMESTAMP	–	NULLABLE	NULL	Digunakan untuk SoftDeletes.
created_at	TIMESTAMP	–	REQUIRED	now()	Waktu pembuatan data.
updated_at	TIMESTAMP	–	REQUIRED	now()	Waktu terakhir update data.
3.9 Tabel failed_jobs
Tabel bawaan Laravel Queue untuk mencatat job yang gagal diproses (Failed Jobs). Ditambahkan sesuai kebutuhan pemrosesan Queue (Redis) dan patch review yang dipersyaratkan.

Kolom	Tipe Data	PK/FK/UK	Nullable/Required	Default Value	Keterangan
id	BIGINT	PK, Auto Increment	REQUIRED	–	ID unik failed job.
uuid	VARCHAR(255)	UK (UNIQUE)	REQUIRED	–	UUID unik untuk identifikasi failed job.
connection	VARCHAR(255)	–	REQUIRED	–	Nama koneksi queue yang digunakan.
queue	VARCHAR(255)	–	REQUIRED	–	Nama queue tempat job diproses.
payload	LONGTEXT	–	REQUIRED	–	Payload lengkap dari job yang gagal.
exception	LONGTEXT	–	REQUIRED	–	Traceback/exception lengkap penyebab kegagalan job.
failed_at	TIMESTAMP	–	REQUIRED	CURRENT_TIMESTAMP	Waktu terjadinya kegagalan job.
4. JENIS RELASI, FOREIGN KEY & DELETE BEHAVIOR
Relasi	Tipe Relasi	Tabel yang Memiliki FK	Kolom FK	On Delete (Behavior)	Penjelasan
users – role_user	1 : N	role_user	user_id → users.id	CASCADE	Jika User dihapus, maka relasi di tabel pivot role_user akan ikut terhapus secara otomatis.
roles – role_user	1 : N	role_user	role_id → roles.id	CASCADE	Jika Role dihapus, maka relasi di tabel pivot role_user akan ikut terhapus secara otomatis.
users – roles	N : M (BelongsToMany)	Pivot: role_user (tabel sendiri)	user_id, role_id	CASCADE / CASCADE	Relasi Many-to-Many diimplementasikan melalui tabel pivot role_user sebagai entitas tersendiri (bukan hanya garis). Sesuai dengan standar yang dipersyaratkan.
clients – projects	1 : N	projects	client_id → clients.id	RESTRICT	Satu Klien dapat memiliki banyak Proyek. Klien tidak boleh dihapus apabila masih terdapat Proyek yang terikat, untuk mencegah orphan data.
clients – infra_assets	1 : N	infra_assets	client_id → clients.id	RESTRICT	Satu Klien dapat memiliki banyak Aset Infrastruktur. Menggunakan RESTRICT agar data anak tidak menjadi yatim secara tidak sengaja.
projects – infra_assets	1 : N	infra_assets	project_id → projects.id	RESTRICT	Satu Proyek dapat memiliki banyak Aset Infrastruktur. Behavior RESTRICT untuk menjaga integritas relasi.
vendors – infra_assets	1 : N	infra_assets	vendor_id → vendors.id	SET NULL	Satu Vendor dapat terkait dengan banyak Aset Infrastruktur. Karena vendor_id bersifat NULLABLE, apabila Vendor dihapus maka nilai FK akan di-SET NULL (relasi terlepas) tanpa menghapus data Aset Infrastruktur itu sendiri.
infra_assets – renewals	1 : N	renewals	infra_asset_id → infra_assets.id	CASCADE	Satu Aset Infrastruktur dapat memiliki banyak Riwayat Perpanjangan. Jika Aset dihapus, Riwayat Renewal yang terikat akan ikut terhapus secara konsisten (CASCADE) untuk menjaga integritas data historis yang berkaitan dengan aset tersebut.
5. INDEX, SOFTDELETES, TIMESTAMPS & TIMEZONE
5.1 SoftDeletes + Timestamps
Tabel	deleted_at	created_at	updated_at	Keterangan
users	Ya (NULLABLE)	Ya (REQUIRED)	Ya (REQUIRED)	Menggunakan SoftDeletes untuk menjaga jejak historis pengguna.
roles	Tidak	Ya (REQUIRED)	Ya (REQUIRED)	Master data statis, tidak membutuhkan SoftDeletes.
role_user	Tidak	Ya (REQUIRED)	Ya (REQUIRED)	Tabel pivot transaksi, tidak membutuhkan SoftDeletes.
clients	Ya (NULLABLE)	Ya (REQUIRED)	Ya (REQUIRED)	SoftDeletes diterapkan (master data).
projects	Ya (NULLABLE)	Ya (REQUIRED)	Ya (REQUIRED)	SoftDeletes diterapkan (master data).
vendors	Ya (NULLABLE)	Ya (REQUIRED)	Ya (REQUIRED)	SoftDeletes diterapkan (master data).
infra_assets	Ya (NULLABLE)	Ya (REQUIRED)	Ya (REQUIRED)	SoftDeletes diterapkan (entitas utama monitoring).
renewals	Ya (NULLABLE)	Ya (REQUIRED)	Ya (REQUIRED)	SoftDeletes diterapkan (histori perpanjangan).
failed_jobs	Tidak	Tidak	Tidak	Mengikuti standar bawaan Laravel. Hanya menggunakan failed_at (REQUIRED, DEFAULT CURRENT_TIMESTAMP).
Timezone: Seluruh pencatatan waktu (created_at, updated_at, deleted_at, failed_at) mengacu pada konfigurasi aplikasi APP_TIMEZONE=Asia/Jakarta. Hal ini untuk menjaga konsistensi dan akurasi perhitungan logika alert H-30, H-7 dan Expired.

5.2 Index (Kolom yang Sering di-Search/Filter)
Tabel	Kolom	Tipe Index	Alasan
users	email	**	
Ini hasilnya. Udah diubah ke bentuk markup (Markdown) 100% sesuai DBML yang kamu kirim, penjelasannya juga lengkap dan jelas.

Salin aja ke docs/ERD.md di VS Code.

# ERD.md – Sistem Monitoring Domain, Hosting & SSL

## IDENTITAS DOKUMEN

| No | Uraian | Keterangan |
|---|---|---|
| 1 | Judul Proyek | Sistem Monitoring Domain, Hosting & SSL |
| 2 | Nama Lengkap Pembuat | I Wayan Rangga Dinata Putra |
| 3 | Instansi | PT Central Saga Mandiri (CSM) |
| 4 | Tujuan Dokumen | Sebagai pedoman perancangan Basis Data (ERD), acuan pembuatan Migration, Model dan Validasi Data |
| 5 | Tanggal Penyusunan | 07 Oktober 2026 |
| 6 | Status Dokumen | Final – Tidak Ada Revisi |

## 1. PENJELASAN UMUM

ERD ini menggambarkan perancangan basis data Sistem Monitoring Domain, Hosting & SSL. Sistem ini berfokus pada pencatatan dan pemantauan masa aktif aset infrastruktur (Domain, Hosting, SSL, VPS), relasinya terhadap Klien, Proyek, Vendor, serta riwayat perpanjangan (Renewal) dan pengelolaan hak akses berbasis Role-Based Access Control (RBAC).

Perancangan ini disesuaikan 100% dengan kode DBML yang telah ditentukan agar desain basis data rapi, benar, konsisten dan siap langsung digunakan untuk proses migration tanpa perlu dirombak ulang.

## 2. STRUKTUR TABEL

### 2.1 Tabel `users`

Tabel ini digunakan untuk menyimpan data akun pengguna yang akan melakukan login ke dalam sistem.

| Kolom | Tipe Data | Nullable/Required | Default Value | Keterangan |
|---|---|---|---|---|
| `id` | BIGINT | **PK, Auto Increment** | – | Primary Key |
| `name` | VARCHAR(255) | **Required (NOT NULL)** | – | Nama lengkap pengguna |
| `email` | VARCHAR(255) | **Required (NOT NULL), UNIQUE** | – | Alamat email untuk login (unik per pengguna) |
| `password` | VARCHAR(255) | **Required (NOT NULL)** | – | Password yang telah di-hash |
| `email_verified_at` | TIMESTAMP | **Nullable** | `NULL` | Tanggal verifikasi email |
| `remember_token` | VARCHAR(100) | **Nullable** | `NULL` | Token untuk fitur "Remember Me" |
| `deleted_at` | TIMESTAMP | **Nullable** | `NULL` | Digunakan untuk SoftDeletes |
| `created_at` | TIMESTAMP | **Required (NOT NULL)** | `now()` | Tanggal dan waktu data dibuat |
| `updated_at` | TIMESTAMP | **Required (NOT NULL)** | `now()` | Tanggal dan waktu data terakhir diubah |

### 2.2 Tabel `roles`

Tabel ini berisi master role untuk pengaturan hak akses (RBAC).

| Kolom | Tipe Data | Nullable/Required | Default Value | Keterangan |
|---|---|---|---|---|
| `id` | BIGINT | **PK, Auto Increment** | – | Primary Key |
| `name` | VARCHAR(100) | **Required (NOT NULL), UNIQUE** | – | Nama role (`admin`, `operator`, `viewer`) |
| `guard_name` | VARCHAR(100) | **Required (NOT NULL)** | `'web'` | Guard autentikasi Laravel |
| `description` | TEXT | **Nullable** | `NULL` | Keterangan deskripsi role |
| `created_at` | TIMESTAMP | **Required (NOT NULL)** | `now()` | Tanggal dan waktu data dibuat |
| `updated_at` | TIMESTAMP | **Required (NOT NULL)** | `now()` | Tanggal dan waktu data terakhir diubah |

### 2.3 Tabel `role_user` (Tabel Pivot N:M)

Tabel pivot ini menghubungkan tabel `users` dan `roles` untuk menerapkan relasi Many-to-Many (BelongsToMany). Tabel ini **ditampilkan sebagai tabel sendiri** sesuai standar perancangan ERD.

| Kolom | Tipe Data | Nullable/Required | Default Value | Keterangan |
|---|---|---|---|---|
| `id` | BIGINT | **PK, Auto Increment** | – | Primary Key |
| `user_id` | BIGINT | **Required (NOT NULL), FK** | – | Foreign Key ke `users.id` |
| `role_id` | BIGINT | **Required (NOT NULL), FK** | – | Foreign Key ke `roles.id` |
| `created_at` | TIMESTAMP | **Required (NOT NULL)** | `now()` | Tanggal dan waktu data dibuat |
| `updated_at` | TIMESTAMP | **Required (NOT NULL)** | `now()` | Tanggal dan waktu data terakhir diubah |

**Index Khusus:**

- `UNIQUE (user_id, role_id)` dengan nama index `role_user_unique` – Mencegah duplikasi penugasan role yang sama terhadap user.

### 2.4 Tabel `clients`

Tabel ini berisi data master Klien.

| Kolom | Tipe Data | Nullable/Required | Default Value | Keterangan |
|---|---|---|---|---|
| `id` | BIGINT | **PK, Auto Increment** | – | Primary Key |
| `name` | VARCHAR(255) | **Required (NOT NULL)** | – | Nama perusahaan/klien |
| `pic_name` | VARCHAR(255) | **Nullable** | `NULL` | Nama PIC (Person In Charge) |
| `email` | VARCHAR(255) | **Nullable** | `NULL` | Email kontak klien |
| `phone` | VARCHAR(50) | **Nullable** | `NULL` | Nomor telepon klien |
| `address` | TEXT | **Nullable** | `NULL` | Alamat klien |
| `status` | ENUM('active','inactive') | **Required (NOT NULL)** | `'active'` | Status klien |
| `deleted_at` | TIMESTAMP | **Nullable** | `NULL` | Digunakan untuk SoftDeletes |
| `created_at` | TIMESTAMP | **Required (NOT NULL)** | `now()` | Tanggal dan waktu data dibuat |
| `updated_at` | TIMESTAMP | **Required (NOT NULL)** | `now()` | Tanggal dan waktu data terakhir diubah |

### 2.5 Tabel `projects`

Tabel ini berisi data master Proyek yang terhubung dengan Klien.

| Kolom | Tipe Data | Nullable/Required | Default Value | Keterangan |
|---|---|---|---|---|
| `id` | BIGINT | **PK, Auto Increment** | – | Primary Key |
| `client_id` | BIGINT | **Required (NOT NULL), FK** | – | Foreign Key ke `clients.id` |
| `name` | VARCHAR(255) | **Required (NOT NULL)** | – | Nama proyek |
| `project_code` | VARCHAR(100) | **Required (NOT NULL), UNIQUE** | – | Kode proyek (unik) |
| `description` | TEXT | **Nullable** | `NULL` | Deskripsi proyek |
| `status` | ENUM('active','inactive','on_hold') | **Required (NOT NULL)** | `'active'` | Status proyek |
| `deleted_at` | TIMESTAMP | **Nullable** | `NULL` | Digunakan untuk SoftDeletes |
| `created_at` | TIMESTAMP | **Required (NOT NULL)** | `now()` | Tanggal dan waktu data dibuat |
| `updated_at` | TIMESTAMP | **Required (NOT NULL)** | `now()` | Tanggal dan waktu data terakhir diubah |

### 2.6 Tabel `vendors`

Tabel ini berisi data master Vendor/Registrar/Provider (penyedia layanan infrastruktur).

| Kolom | Tipe Data | Nullable/Required | Default Value | Keterangan |
|---|---|---|---|---|
| `id` | BIGINT | **PK, Auto Increment** | – | Primary Key |
| `name` | VARCHAR(255) | **Required (NOT NULL), UNIQUE** | – | Nama vendor/provider (unik) |
| `website` | VARCHAR(255) | **Nullable** | `NULL` | Website vendor |
| `email` | VARCHAR(255) | **Nullable** | `NULL` | Email kontak vendor |
| `phone` | VARCHAR(50) | **Nullable** | `NULL` | Nomor telepon vendor |
| `address` | TEXT | **Nullable** | `NULL` | Alamat vendor |
| `notes` | TEXT | **Nullable** | `NULL` | Catatan tambahan |
| `status` | ENUM('active','inactive') | **Required (NOT NULL)** | `'active'` | Status vendor |
| `deleted_at` | TIMESTAMP | **Nullable** | `NULL` | Digunakan untuk SoftDeletes |
| `created_at` | TIMESTAMP | **Required (NOT NULL)** | `now()` | Tanggal dan waktu data dibuat |
| `updated_at` | TIMESTAMP | **Required (NOT NULL)** | `now()` | Tanggal dan waktu data terakhir diubah |

### 2.7 Tabel `infra_assets`

Tabel ini merupakan entitas utama sistem yang digunakan untuk mencatat aset infrastruktur (Domain, Hosting, SSL, VPS).

| Kolom | Tipe Data | Nullable/Required | Default Value | Keterangan |
|---|---|---|---|---|
| `id` | BIGINT | **PK, Auto Increment** | – | Primary Key |
| `client_id` | BIGINT | **Required (NOT NULL), FK** | – | Foreign Key ke `clients.id` |
| `project_id` | BIGINT | **Required (NOT NULL), FK** | – | Foreign Key ke `projects.id` |
| `vendor_id` | BIGINT | **Nullable, FK** | `NULL` | Foreign Key ke `vendors.id` |
| `type` | ENUM('domain','hosting','ssl','vps') | **Required (NOT NULL)** | – | Tipe aset infrastruktur |
| `name` | VARCHAR(255) | **Required (NOT NULL)** | – | Nama aset |
| `domain_name` | VARCHAR(255) | **Required (NOT NULL)** | – | Nama domain aset |
| `purchase_date` | DATE | **Nullable** | `NULL` | Tanggal pembelian aset |
| `start_date` | DATE | **Required (NOT NULL)** | – | Tanggal mulai aktif aset |
| `expiry_date` | DATE | **Required (NOT NULL)** | – | Tanggal expired/kadaluarsa aset |
| `renewal_cost` | DECIMAL(15,2) | **Required (NOT NULL)** | `0.00` | Estimasi biaya perpanjangan |
| `currency` | ENUM('IDR','USD') | **Required (NOT NULL)** | `'IDR'` | Mata uang biaya perpanjangan |
| `status` | ENUM('active','pending_renewal','expired','suspended') | **Required (NOT NULL)** | `'active'` | Status pemantauan masa aktif aset |
| `notes` | TEXT | **Nullable** | `NULL` | Catatan tekn
Ini versi markup (Markdown) 100% benar, disesuaikan persis dengan DBML yang kamu kirim + sudah dilengkapi penjelasan detail per poin.

Salin ke docs/ERD.md di VS Code.

# ERD.md – Sistem Monitoring Domain, Hosting & SSL

## IDENTITAS DOKUMEN

| No | Uraian | Keterangan |
|---|---|---|
| 1 | Judul Proyek | Sistem Monitoring Domain, Hosting & SSL |
| 2 | Nama Lengkap Pembuat | I Wayan Rangga Dinata Putra |
| 3 | Instansi | PT Central Saga Mandiri (CSM) |
| 4 | Tujuan Dokumen | Sebagai pedoman perancangan Basis Data (ERD), acuan pembuatan Migration, Model dan Validasi Data. |
| 5 | Tanggal Penyusunan | 07 Oktober 2026 |
| 6 | Status Dokumen | Final – Tidak Ada Revisi |

## 1. PENJELASAN UMUM

ERD ini menggambarkan perancangan basis data Sistem Monitoring Domain, Hosting & SSL. Sistem ini berfokus pada pencatatan dan pemantauan masa aktif aset infrastruktur (Domain, Hosting, SSL, VPS), relasinya terhadap Klien, Proyek, Vendor, riwayat perpanjangan (Renewal), serta pengelolaan hak akses berbasis Role-Based Access Control (RBAC).

Perancangan ini disusun agar desain database menjadi rapi, benar, konsisten dan siap langsung digunakan untuk pembuatan Migration tanpa perlu dirombak ulang.

## 2. DIAGRAM ERD (MERMAID)

```mermaid
erDiagram
    USERS {
        BIGINT id PK "Auto Increment"
        VARCHAR name "REQUIRED"
        VARCHAR email UK "REQUIRED"
        VARCHAR password "REQUIRED"
        TIMESTAMP email_verified_at "NULLABLE"
        VARCHAR remember_token "NULLABLE"
        TIMESTAMP deleted_at "NULLABLE (SoftDeletes)"
        TIMESTAMP created_at "REQUIRED (DEFAULT now())"
        TIMESTAMP updated_at "REQUIRED (DEFAULT now())"
    }

    ROLES {
        BIGINT id PK "Auto Increment"
        VARCHAR name UK "REQUIRED (admin, operator, viewer)"
        VARCHAR guard_name "REQUIRED (DEFAULT 'web')"
        TEXT description "NULLABLE"
        TIMESTAMP created_at "REQUIRED (DEFAULT now())"
        TIMESTAMP updated_at "REQUIRED (DEFAULT now())"
    }

    ROLE_USER {
        BIGINT id PK "Auto Increment"
        BIGINT user_id FK "REQUIRED"
        BIGINT role_id FK "REQUIRED"
        TIMESTAMP created_at "REQUIRED (DEFAULT now())"
        TIMESTAMP updated_at "REQUIRED (DEFAULT now())"
    }

    CLIENTS {
        BIGINT id PK "Auto Increment"
        VARCHAR name "REQUIRED"
        VARCHAR pic_name "NULLABLE"
        VARCHAR email "NULLABLE"
        VARCHAR phone "NULLABLE"
        TEXT address "NULLABLE"
        ENUM status "REQUIRED (active, inactive) DEFAULT 'active'"
        TIMESTAMP deleted_at "NULLABLE (SoftDeletes)"
        TIMESTAMP created_at "REQUIRED (DEFAULT now())"
        TIMESTAMP updated_at "REQUIRED (DEFAULT now())"
    }

    PROJECTS {
        BIGINT id PK "Auto Increment"
        BIGINT client_id FK "REQUIRED"
        VARCHAR name "REQUIRED"
        VARCHAR project_code UK "REQUIRED"
        TEXT description "NULLABLE"
        ENUM status "REQUIRED (active, inactive, on_hold) DEFAULT 'active'"
        TIMESTAMP deleted_at "NULLABLE (SoftDeletes)"
        TIMESTAMP created_at "REQUIRED (DEFAULT now())"
        TIMESTAMP updated_at "REQUIRED (DEFAULT now())"
    }

    VENDORS {
        BIGINT id PK "Auto Increment"
        VARCHAR name UK "REQUIRED"
        VARCHAR website "NULLABLE"
        VARCHAR email "NULLABLE"
        VARCHAR phone "NULLABLE"
        TEXT address "NULLABLE"
        TEXT notes "NULLABLE"
        ENUM status "REQUIRED (active, inactive) DEFAULT 'active'"
        TIMESTAMP deleted_at "NULLABLE (SoftDeletes)"
        TIMESTAMP created_at "REQUIRED (DEFAULT now())"
        TIMESTAMP updated_at "REQUIRED (DEFAULT now())"
    }

    INFRA_ASSETS {
        BIGINT id PK "Auto Increment"
        BIGINT client_id FK "REQUIRED"
        BIGINT project_id FK "REQUIRED"
        BIGINT vendor_id FK "NULLABLE"
        ENUM type "REQUIRED (domain, hosting, ssl, vps)"
        VARCHAR name "REQUIRED"
        VARCHAR domain_name "REQUIRED"
        DATE purchase_date "NULLABLE"
        DATE start_date "REQUIRED"
        DATE expiry_date "REQUIRED"
        DECIMAL(15,2) renewal_cost "REQUIRED DEFAULT 0.00"
        ENUM currency "REQUIRED (IDR, USD) DEFAULT 'IDR'"
        ENUM status "REQUIRED (active, pending_renewal, expired, suspended) DEFAULT 'active'"
        TEXT notes "NULLABLE"
        TIMESTAMP deleted_at "NULLABLE (SoftDeletes)"
        TIMESTAMP created_at "REQUIRED (DEFAULT now())"
        TIMESTAMP updated_at "REQUIRED (DEFAULT now())"
    }

    RENEWALS {
        BIGINT id PK "Auto Increment"
        BIGINT infra_asset_id FK "REQUIRED"
        DATE renewal_date "REQUIRED"
        DATE new_start_date "NULLABLE"
        DATE new_expiry_date "NULLABLE"
        DECIMAL(15,2) amount "REQUIRED DEFAULT 0.00"
        ENUM currency "REQUIRED (IDR, USD) DEFAULT 'IDR'"
        VARCHAR invoice_no "NULLABLE"
        VARCHAR receipt_no "NULLABLE"
        VARCHAR pic_name "NULLABLE"
        ENUM payment_status "REQUIRED (paid, unpaid) DEFAULT 'unpaid'"
        TEXT notes "NULLABLE"
        TIMESTAMP deleted_at "NULLABLE (SoftDeletes)"
        TIMESTAMP created_at "REQUIRED (DEFAULT now())"
        TIMESTAMP updated_at "REQUIRED (DEFAULT now())"
    }

    USERS ||--o{ ROLE_USER : "memiliki"
    ROLES ||--o{ ROLE_USER : "diberikan ke"
    CLIENTS ||--o{ PROJECTS : "mempunyai"
    CLIENTS ||--o{ INFRA_ASSETS : "memiliki"
    PROJECTS ||--o{ INFRA_ASSETS : "digunakan oleh"
    VENDORS ||--o{ INFRA_ASSETS : "menyediakan"
    INFRA_ASSETS ||--o{ RENEWALS : "memiliki riwayat perpanjangan"
3. STRUKTUR TABEL DAN PENJELASANNYA
3.1 Tabel users
Tabel ini digunakan untuk menyimpan data akun pengguna yang akan melakukan login ke sistem.

Kolom	Tipe Data	Nullable/Required	Default	Keterangan
id	BIGINT (PK, Auto Increment)	REQUIRED	–	Primary Key tabel users.
name	VARCHAR(255)	REQUIRED	–	Nama lengkap pengguna.
email	VARCHAR(255)	REQUIRED (UNIQUE)	–	Alamat email untuk login, bersifat unik.
password	VARCHAR(255)	REQUIRED	–	Password pengguna (di-hash menggunakan Laravel Hash).
email_verified_at	TIMESTAMP	NULLABLE	NULL	Waktu verifikasi email.
remember_token	VARCHAR(100)	NULLABLE	NULL	Token untuk fitur "Remember Me".
deleted_at	TIMESTAMP	NULLABLE	NULL	Digunakan untuk SoftDeletes.
created_at	TIMESTAMP	REQUIRED	now()	Waktu data dibuat.
updated_at	TIMESTAMP	REQUIRED	now()	Waktu data terakhir diubah.
3.2 Tabel roles
Tabel master untuk mengelola role pengguna (RBAC).

Kolom	Tipe Data	Nullable/Required	Default	Keterangan
id	BIGINT (PK, Auto Increment)	REQUIRED	–	Primary Key tabel roles.
name	VARCHAR(100)	REQUIRED (UNIQUE)	–	Nama role. Nilai yang digunakan: admin, operator, viewer.
guard_name	VARCHAR(100)	REQUIRED	'web'	Guard autentikasi Laravel.
description	TEXT	NULLABLE	NULL	Keterangan fungsi dari role tersebut.
created_at	TIMESTAMP	REQUIRED	now()	Waktu data dibuat.
updated_at	TIMESTAMP	REQUIRED	now()	Waktu data terakhir diubah.
3.3 Tabel role_user
Tabel pivot (junction table) untuk relasi Many-to-Many antara users dan roles. Merupakan implementasi BelongsToMany.

Kolom	Tipe Data	Nullable/Required	Default	Keterangan
id	BIGINT (PK, Auto Increment)	REQUIRED	–	Primary Key tabel pivot.
user_id	BIGINT (FK)	REQUIRED	–	Foreign Key menuju users.id.
role_id	BIGINT (FK)	REQUIRED	–	Foreign Key menuju roles.id.
created_at	TIMESTAMP	REQUIRED	now()	Waktu relasi dibuat.
updated_at	TIMESTAMP	REQUIRED	now()	Waktu relasi diubah.
Index Khusus: (user_id, role_id) memiliki UNIQUE INDEX dengan nama role_user_unique untuk mencegah duplikasi penugasan role yang sama kepada user.

3.4 Tabel clients
Tabel master untuk menyimpan data Klien PT Central Saga Mandiri (CSM).

Kolom	Tipe Data	Nullable/Required	Default	Keterangan
id	BIGINT (PK, Auto Increment)	REQUIRED	–	Primary Key tabel clients.
name	VARCHAR(255)	REQUIRED	–	Nama perusahaan/klien.
pic_name	VARCHAR(255)	NULLABLE	NULL	Nama Person In Charge (PIC) klien.
email	VARCHAR(255)	NULLABLE	NULL	Email kontak klien.
phone	VARCHAR(50)	NULLABLE	NULL	Nomor telepon klien.
address	TEXT	NULLABLE	NULL	Alamat lengkap klien.
status	ENUM('active','inactive')	REQUIRED	'active'	Status klien.
deleted_at	TIMESTAMP	NULLABLE	NULL	Digunakan untuk SoftDeletes.
created_at	TIMESTAMP	REQUIRED	now()	Waktu data dibuat.
updated_at	TIMESTAMP	REQUIRED	now()	Waktu data terakhir diubah.
3.5 Tabel projects
Tabel master untuk menyimpan data Proyek yang terhubung ke Klien.

Kolom	Tipe Data	Nullable/Required	Default	Keterangan
id	BIGINT (PK, Auto Increment)	REQUIRED	–	Primary Key tabel projects.
client_id	BIGINT (FK)	REQUIRED	–	Foreign Key menuju clients.id.
name	VARCHAR(255)	REQUIRED	–	Nama proyek.
project_code	VARCHAR(100)	REQUIRED (UNIQUE)	–	Kode proyek, bersifat unik untuk identifikasi proyek.
description	TEXT	NULLABLE	NULL	Deskripsi proyek.
status	ENUM('active','inactive','on_hold')	REQUIRED	'active'	Status proyek.
deleted_at	TIMESTAMP	NULLABLE	NULL	Digunakan untuk SoftDeletes.
created_at	TIMESTAMP	REQUIRED	now()	Waktu data dibuat.
updated_at	TIMESTAMP	REQUIRED	now()	Waktu data terakhir diubah.
3.6 Tabel vendors
Tabel master untuk menyimpan data Vendor/Registrar/Provider (penyedia layanan infrastruktur).

Kolom	Tipe Data	Nullable/Required	Default	Keterangan
id	BIGINT (PK, Auto Increment)	REQUIRED	–	Primary Key tabel vendors.
name	VARCHAR(255)	REQUIRED (UNIQUE)	–	Nama vendor/provider, bersifat unik.
website	VARCHAR(255)	NULLABLE	NULL	Alamat website vendor.
email	VARCHAR(255)	NULLABLE	NULL	Email kontak vendor.
phone	VARCHAR(50)	NULLABLE	NULL	Nomor telepon vendor.
address	TEXT	NULLABLE	NULL	Alamat vendor.
notes	TEXT	NULLABLE	NULL	Catatan terkait vendor.
status	ENUM('active','inactive')	REQUIRED	'active'	Status vendor.
deleted_at	TIMESTAMP	NULLABLE	NULL	Digunakan untuk SoftDeletes.
created_at	TIMESTAMP	REQUIRED	now()	Waktu data dibuat.
updated_at	TIMESTAMP	REQUIRED	now()	Waktu data terakhir diubah.
3.7 Tabel infra_assets
Tabel utama sistem untuk mencatat aset infrastruktur (Domain, Hosting, SSL, VPS). Tabel ini menjadi pusat pemantauan masa aktif dan perhitungan alert H-30, H-7 dan Expired.

Kolom	Tipe Data	Nullable/Required	Default	Keterangan
id	BIGINT (PK, Auto Increment)	REQUIRED	–	Primary Key tabel infra_assets.
client_id	BIGINT (FK)	REQUIRED	–	Foreign Key menuju clients.id.
project_id	BIGINT (FK)	REQUIRED	–	Foreign Key menuju projects.id.
vendor_id	BIGINT (FK)	NULLABLE	NULL	Foreign Key menuju vendors.id. Bisa kosong apabila vendor tidak dicatat.
type	ENUM('domain','hosting','ssl','vps')	REQUIRED	–	Tipe aset infrastruktur.
name	VARCHAR(255)	REQUIRED	–	Nama aset.
domain_name	VARCHAR(255)	REQUIRED	–	Nama domain terkait aset.
purchase_date	DATE	NULLABLE	NULL	Tanggal pembelian aset.
start_date	DATE	REQUIRED	–	Tanggal mulai aktif aset. Digunakan sebagai acuan masa aktif.
expiry_date	DATE	REQUIRED	–	Tanggal expired/kadaluarsa aset. Kolom kunci untuk perhitungan sisa hari, alert H-30, H-7 dan Expired.
renewal_cost	DECIMAL(15,2)	REQUIRED	0.00	Estimasi biaya perpanjangan. Menggunakan tipe data decimal (bukan integer) untuk menjaga presisi nilai uang.
currency	ENUM('IDR','USD')	REQUIRED	'IDR'	Mata uang biaya perpanjangan.
status	ENUM('active','pending_renewal','expired','suspended')	REQUIRED	'active'	Status pemantauan aset infrastruktur.
notes	TEXT	NULLABLE	NULL	Catatan teknis terkait aset.
deleted_at	TIMESTAMP	NULLABLE	NULL	Digunakan untuk SoftDeletes.
created_at	TIMESTAMP	REQUIRED	now()	Waktu data dibuat.
updated_at	TIMESTAMP	REQUIRED	now()	Waktu data terakhir diubah.
Catatan Validasi Bisnis: start_date <= expiry_date.

3.8 Tabel renewals
Tabel untuk mencatat riwayat perpanjangan (Renewal History) setiap aset infrastruktur. Setiap perpanjangan dicatat terpisah agar histori dapat ditelusuri secara kronologis.

Kolom	Tipe Data	Nullable/Required	Default	Keterangan
id	BIGINT (PK, Auto Increment)	REQUIRED	–	Primary Key tabel renewals.
infra_asset_id	BIGINT (FK)	REQUIRED	–	Foreign Key menuju infra_assets.id.
renewal_date	DATE	REQUIRED	–	Tanggal dilakukannya perpanjangan.
new_start_date	DATE	NULLABLE	NULL	Tanggal mulai baru setelah perpanjangan (opsional).
new_expiry_date	DATE	NULLABLE	NULL	Tanggal expired baru setelah perpanjangan (opsional).
amount	DECIMAL(15,2)	REQUIRED	0.00	Biaya perpanjangan yang dibayarkan. Menggunakan tipe data decimal untuk menjaga presisi nilai uang.
currency	ENUM('IDR','USD')	REQUIRED	'IDR'	Mata uang pembayaran perpanjangan.
invoice_no	VARCHAR(100)	NULLABLE	NULL	Nomor invoice perpanjangan.
receipt_no	VARCHAR(100)	NULLABLE	NULL	Nomor kwitansi/receipt.
pic_name	VARCHAR(255)	NULLABLE	NULL	Nama PIC yang melakukan atau bertanggung jawab atas perpanjangan.
payment_status	ENUM('paid','unpaid')	REQUIRED	'unpaid'	Status pembayaran perpanjangan.
notes	TEXT	NULLABLE	NULL	Catatan terkait perpanjangan.
deleted_at	TIMESTAMP	NULLABLE	NULL	Digunakan untuk SoftDeletes.
created_at	TIMESTAMP	REQUIRED	now()	Waktu data dibuat.
updated_at	TIMESTAMP	REQUIRED	now()	Waktu data terakhir diubah.
4. RELASI, FOREIGN KEY DAN ON DELETE BEHAVIOR
Berikut penjelasan relasi secara eksplisit (1:1, 1:N, N:M) beserta Foreign Key dan ON DELETE behavior sesuai dengan perancangan di atas.

Relasi	Jenis Relasi	Tabel yang Memiliki FK	Kolom FK	Referensi	ON DELETE / Delete Behavior	Penjelasan
users – role_user	1 : N	role_user	user_id	users.id	CASCADE	Satu User dapat memiliki banyak entri di tabel pivot. Apabila User dihapus, maka relasi role-user terkait akan ikut terhapus secara otomatis untuk menjaga konsistensi data.
roles – role_user	1 : N	role_user	role_id	roles.id	CASCADE	Satu Role dapat diberikan ke banyak User. Apabila Role dihapus, maka relasi pivot terkait akan ikut terhapus.
users – roles	N : M (BelongsToMany)	Melalui tabel pivot role_user (tabel tersendiri)	user_id, role_id	users.id, roles.id	Sesuai di atas (CASCADE)	Relasi Many-to-Many diimplementasikan dengan tabel pivot role_user sebagai tabel sendiri (bukan hanya garis relasi), sesuai standar yang dipersyaratkan.
clients – projects	1 : N	projects	client_id	clients.id	RESTRICT	Satu Klien dapat memiliki banyak Proyek. Klien tidak boleh dihapus apabila masih terdapat Proyek yang terikat, untuk mencegah terjadinya orphan data.
clients – infra_assets	1 : N	infra_assets	client_id	clients.id	RESTRICT	Satu Klien dapat memiliki banyak Aset Infrastruktur. Menggunakan RESTRICT agar data anak tidak menjadi yatim secara tidak sengaja.
projects – infra_assets	1 : N	infra_assets	project_id	projects.id	RESTRICT	Satu Proyek dapat memiliki banyak Aset Infrastruktur. Behavior RESTRICT menjaga integritas relasi antara Proyek dan Aset.
vendors – infra_assets	1 : N	infra_assets	vendor_id	vendors.id	SET NULL	Satu Vendor dapat terkait dengan banyak Aset Infrastruktur. Karena vendor_id bersifat NULLABLE, apabila Vendor dihapus maka nilai vendor_id pada aset terkait akan diatur menjadi NULL (tidak menghapus data aset itu sendiri). Sesuai dengan rancangan FK nullable.
infra_assets – renewals	1 : N	renewals	infra_asset_id	infra_assets.id	CASCADE	Satu Aset Infrastruktur dapat memiliki banyak Riwayat Perpanjangan. Apabila Aset dihapus, maka seluruh Riwayat Perpanjangan yang terikat kepadanya akan ikut terhapus secara terjaga konsistensinya.
Kesimpulan Relasi: Tidak terdapat relasi 1 : 1 pada perancangan ini. Relasi yang digunakan adalah 1 : N dan N : M (melalui tabel pivot role_user).

5. BATASAN DATA (CONSTRAINTS) – RINGKASAN
Jenis Constraint	Kolom yang Diterapkan	Keterangan
PRIMARY KEY (PK)	Semua id pada setiap tabel	Auto Increment, bertipe BIGINT.
FOREIGN KEY (FK)	role_user.user_id, role_user.role_id, projects.client_id, infra_assets.client_id, infra_assets.project_id, infra_assets.vendor_id, renewals.infra_asset_id	Dengan ON DELETE behavior seperti tertera pada poin 4.
UNIQUE	users.email, roles.name, projects.project_code, vendors.name, (user_id, role_id) pada role_user	Mencegah terjadinya duplikasi data. Composite UNIQUE pada pivot untuk mencegah duplikasi relasi.
ENUM	clients.status, projects.status, vendors.status, infra_assets.type, infra_assets.currency, infra_assets.status, renewals.currency, renewals.payment_status	Digunakan untuk menjaga konsistensi nilai data.
NOT NULL (REQUIRED)	Sesuai kolom bertanda REQUIRED pada poin 3	Menjamin kelengkapan data wajib.
NULLABLE	Sesuai kolom bertanda NULLABLE pada poin 3	Fleksibel untuk data opsional.
DEFAULT VALUE	roles.guard_name = 'web', clients.status = 'active', projects.status = 'active', vendors.status = 'active', infra_assets.renewal_cost = 0.00, infra_assets.currency = 'IDR', infra_assets.status = 'active', renewals.amount = 0.00, renewals.currency = 'IDR', renewals.payment_status = 'unpaid', created_at/updated_at = now()	Menjamin nilai awal yang konsisten.
6. SOFTDELETES, TIMESTAMPS & TIMEZONE
Tabel	deleted_at	created_at	updated_at	Penjelasan
users	Ya (NULLABLE)	Ya (REQUIRED) – DEFAULT now()	Ya (REQUIRED) – DEFAULT now()	Menggunakan SoftDeletes untuk menjaga jejak historis data pengguna.
roles	Tidak	Ya (REQUIRED) – DEFAULT now()	Ya (REQUIRED) – DEFAULT now()	Master data statis, tidak memerlukan SoftDeletes.
role_user	Tidak	Ya (REQUIRED) – DEFAULT now()	Ya (REQUIRED) – DEFAULT now()	Tabel pivot (relasi), tidak memerlukan SoftDeletes.
clients	Ya (NULLABLE)	Ya (REQUIRED) – DEFAULT now()	Ya (REQUIRED) – DEFAULT now()	SoftDeletes diterapkan (master data).
projects	Ya (NULLABLE)	Ya (REQUIRED) – DEFAULT now()	Ya (REQUIRED) – DEFAULT now()	SoftDeletes diterapkan (master data).
vendors	Ya (NULLABLE)	Ya (REQUIRED) – DEFAULT now()	Ya (REQUIRED) – DEFAULT now()	SoftDeletes diterapkan (master data).
infra_assets	Ya (NULLABLE)	Ya (REQUIRED) – DEFAULT now()	Ya (REQUIRED) – DEFAULT now()	SoftDeletes diterapkan (entitas utama monitoring) untuk menjaga integritas data historis aset.
renewals	Ya (NULLABLE)	Ya (REQUIRED) – DEFAULT now()	Ya (REQUIRED) – DEFAULT now()	SoftDeletes diterapkan (data histori perpanjangan).
Penjelasan Timezone:

Seluruh kolom waktu (created_at, updated_at, deleted_at) menggunakan TIMESTAMP dengan DEFAULT now(). Penerapan timezone mengacu pada konfigurasi aplikasi APP_TIMEZONE=Asia/Jakarta. Hal ini bertujuan untuk menjaga konsistensi waktu pencatatan data, terutama untuk keakuratan perhitungan logika Alert H-30, H-7 dan Expired yang berbasis tanggal hari ini (server time).

7. KESIMPULAN
Perancangan ERD di atas telah disusun sesuai dengan DBML yang diberikan dan telah memenuhi seluruh standar yang dipersyaratkan, yaitu:

Struktur tabel lengkap – Seluruh tabel, kolom, tipe data dan constraint telah dijabarkan dengan benar dan konsisten.
Relasi eksplisit – Jenis relasi (1:N dan N:M) telah dijelaskan secara rinci, lengkap dengan Foreign Key, referensi dan ON DELETE behavior (CASCADE, RESTRICT, SET NULL).
Tabel Pivot N:M terpisah – Relasi users – roles (BelongsToMany) telah diimplementasikan dalam bentuk tabel pivot role_user sebagai tabel tersendiri di ERD, bukan hanya berupa garis relasi.
Batasan data terdefinisi – Telah mencakup UNIQUE, ENUM, Nullable/Required, serta Default Value secara jelas.
SoftDeletes + Timestamps – Diterapkan secara terarah dan konsisten pada tabel yang membutuhkan preservasi data historis.
Tipe data uang sudah benar – Menggunakan DECIMAL(15,2) sesuai DBML yang digunakan, dengan penjelasan untuk menjaga presisi nilai uang (bukan INTEGER).
Tanggal terpisah dengan tepat – Menggunakan DATE untuk purchase_date, start_date, expiry_date, renewal_date, new_start_date, new_expiry_date dan TIMESTAMP untuk audit timestamps.
Desain rapi dan benar – Sesuai dengan prinsip integritas referensial, konsisten, minim duplikasi dan siap untuk proses migration tanpa revisi desain.
