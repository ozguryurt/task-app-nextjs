# Task App - Next.js

Modern ve güvenli bir görev yönetim uygulaması. Kullanıcı kimlik doğrulama, takım yönetimi ve gelişmiş güvenlik özellikleri ile donatılmış profesyonel bir web uygulaması. Next.js 16, TypeScript, TailwindCSS ve MySQL teknolojileri kullanılarak geliştirilmiştir.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Kurulum](#-kurulum)
- [Proje Yapısı](#-proje-yapısı)
- [Mimari](#-mimari)
- [Kullanım](#-kullanım)
- [API Endpoints](#-api-endpoints)
- [Bildirimler (Toast)](#-bildirimler-toast)
- [URL Yapısı](#-url-yapısı-türkçe)
- [Güvenlik](#-güvenlik)
- [Katkıda Bulunma](#-katkıda-bulunma)

## ✨ Özellikler

### 🔐 Kimlik Doğrulama Sistemi

- **Kullanıcı Kaydı**
  - E-posta ile kayıt
  - Şifre güvenlik gereksinimleri (min. 8 karakter, büyük/küçük harf, rakam)
  - E-posta doğrulama sistemi (otomatik SMTP gönderimi)
  
- **Kullanıcı Girişi**
  - JWT token tabanlı kimlik doğrulama
  - httpOnly cookie ile güvenli token saklama
  - Otomatik token yenileme (7 gün geçerlilik)
  
- **Şifre Yönetimi**
  - Şifre sıfırlama talebi
  - Güvenli token ile şifre yenileme
  - Benzersiz salt ve 12 maliyet faktörüyle bcrypt parola hashleme
  - Eski SHA-256 parola kayıtlarını başarılı girişte otomatik bcrypt'e yükseltme

- **Merkezi Route Koruma**
  - Next.js Middleware ile otomatik sayfa koruma
  - JWT token doğrulama
  - Yetkisiz erişim yönlendirme

### 👥 Takım Yönetimi Sistemi

- **Takım Oluşturma**
  - Sınırsız takım oluşturma
  - Takım adı ve açıklama belirleme
  - Otomatik yönetici rolü atama

- **Rol Tabanlı Yetkilendirme**
  - **Yönetici (Admin):** Takımı tam yönetim yetkisi
    - Üye ekleme/çıkarma
    - Rol değiştirme
    - Takım bilgilerini düzenleme
    - Takımı silme
    - Görev oluşturma
  - **Üye (Member):** Görüntüleme yetkisi
    - Takım bilgilerini görüntüleme
    - Üyeleri görüntüleme
    - Kendisine atanan görevleri yönetme

- **Üye Yönetimi**
  - E-posta ile üye ekleme
  - Rol değiştirme (Admin ↔ Üye)
  - Üye çıkarma
  - En az bir yönetici zorunluluğu
  - Kendini çıkaramama/rol değiştirememe koruması

- **Modern Kullanıcı Arayüzü**
  - Takım kartları ile görsel liste
  - Üye detay sayfası
  - Confirmation dialog'ları ile güvenli silme işlemleri
  - Gerçek zamanlı durum güncellemeleri
  - Responsive tasarım

### 📋 Görev Yönetimi Sistemi

- **Görev Oluşturma ve Atama**
  - Takım yöneticileri görev oluşturabilir
  - Takım üyelerine görev atama
  - Görev başlığı ve detaylı açıklama
  - Başlangıç, bitiş ve son tarih belirleme
  - Otomatik atayan kişi kaydı

- **Görev Özellikleri**
  - **Durum Takibi:**
    - Beklemede (pending)
    - Devam Ediyor (in_progress)
    - Tamamlandı (completed)
    - İptal Edildi (cancelled)
  - **Öncelik Seviyeleri:**
    - Düşük (low)
    - Orta (medium)
    - Yüksek (high)
  - **Tarih Yönetimi:**
    - Başlangıç tarihi
    - Bitiş tarihi
    - Son tarih (due date)
    - Otomatik tamamlanma tarihi kaydı

- **Yetki Matrisi**
  - **Görev Oluşturma:** Sadece takım yöneticileri
  - **Görev Düzenleme:** Admin, görevi atayan kişi ve göreve atanan kişi
  - **Görev Silme:** Admin ve görevi atayan kişi
  - **Görev Görüntüleme:** Tüm takım üyeleri

- **Dashboard Entegrasyonu**
  - Kullanıcıya atanan tüm görevleri dashboard'da görüntüleme
  - Durum ve önceliğe göre akıllı sıralama
  - Görevden takım sayfasına tek tıkla geçiş
  - Aktif görev sayısı gösterimi
  - Renkli durum ve öncelik badge'leri

- **Modern Görev Arayüzü**
  - Görev oluşturma/düzenleme dialog'ları
  - ShadCN UI Select bileşenleri ile seçimler
  - Görev liste görünümü
  - Tarih seçici entegrasyonu
  - Gerçek zamanlı validasyon

### 🎨 Modern UI Bileşenleri (ShadCN)

- Dialog/Modal bileşenleri
- Select dropdown'lar
- Form input'ları ve validasyon
- Button varyantları
- Card ve Alert bileşenleri
- Badge ve Label bileşenleri
- Confirmation dialog'lar
- Textarea bileşeni
- Navigation menu

### 📊 State Management

- **Zustand** ile global state yönetimi
- **Auth Store:** Kullanıcı bilgileri ve kimlik durumu
- **Team Store:** Takım, üye ve görev yönetimi
- LocalStorage ile kalıcı state
- Cookie senkronizasyonu

### 📋 Form Yönetimi

- React Hook Form entegrasyonu
- Zod schema validasyon
- Gerçek zamanlı validasyon mesajları
- Custom hook'lar ile tekrar kullanılabilir formlar

## 🛠 Teknolojiler

### Frontend
- **Framework:** Next.js 16.3.5 (App Router)
- **Language:** TypeScript 7
- **UI Library:** React 19.3.0
- **Styling:** TailwindCSS 4
- **Component Library:** Radix UI (ShadCN)
- **Icons:** Lucide React
- **Form Management:** React Hook Form 7.65.0
- **Validation:** Zod 4.1.12
- **State Management:** Zustand 5.0.8

### Backend
- **Runtime:** Node.js
- **Database:** MySQL (mysql2 3.24.4)
- **Authentication:** JSON Web Tokens (jsonwebtoken 9.0.3)
- **Email:** Nodemailer (SMTP)
- **Password Hashing:** bcrypt (`bcryptjs`, cost factor 12)
- **Security:** bcrypt, Prepared Statements

### Development
- **Package Manager:** npm
- **Build Tool:** Turbopack (Next.js)
- **Linter:** ESLint 10
- **Type Checking:** TypeScript

## 🚀 Kurulum

### Ön Gereksinimler

- Node.js 18+ kurulu olmalı
- MySQL 5.7+ veya 8.0+ kurulu olmalı
- npm veya yarn package manager

### 1. Repository'yi Klonlayın

```bash
git clone <repository-url>
cd task-app-nextjs
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Veri Tabanını Oluşturun

MySQL'e bağlanın:
```bash
mysql -u root -p
```

Veri tabanını oluşturun:
```sql
CREATE DATABASE `task-app-nextjs` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `task-app-nextjs`;
SOURCE database/schema.sql;
```

Mevcut bir kurulumu SHA-256 parola kayıtlarından yükseltiyorsanız önce kolon migrasyonunu çalıştırın:

```bash
mysql -u root -p task-app-nextjs < database/migrations/001_expand_password_hash_column.sql
```

Bu migrasyon mevcut hash'leri silmez. Eski 64 karakterlik SHA-256 kayıtları giriş sırasında güvenli ve sabit zamanlı biçimde doğrulanır; başarılı girişten hemen sonra aynı parola yeni, salt'lı bcrypt hash'iyle değiştirilir. Yeni kayıtlar ve parola sıfırlamaları doğrudan bcrypt kullanır.

> bcrypt girdiyi 72 byte ile sınırlar. Kayıt ve parola sıfırlama doğrulamaları bu sınırı hem istemci hem sunucu tarafında uygular.

### 4. Environment Değişkenlerini Ayarlayın

Proje root dizininde `.env` dosyası oluşturun:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=task-app-nextjs

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# SMTP Server (Email Verification)
SMTP_HOST=mail.ozguryurt.dev
SMTP_PORT=587
SMTP_USER=taskappnextjs@ozguryurt.dev
SMTP_PASS=your_smtp_password
EMAIL_FROM="Task App Next.js" <taskappnextjs@ozguryurt.dev>

# Site Bilgileri
# Alt bilgide gösterilen destek/iletişim adresi.
NEXT_PUBLIC_SUPPORT_EMAIL=destek@taskflow.app
```

**JWT_SECRET Oluşturma:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> 📁 `env.example` dosyasını kendi değerlerinizle güncelleyip `.env.local` veya `.env` olarak kopyalayabilirsiniz.

⚠️ **Önemli Güvenlik Notları:**
- `.env` dosyasını asla Git'e commit etmeyin!
- Production'da mutlaka güçlü ve farklı bir JWT_SECRET kullanın
- MySQL şifrenizi güçlü tutun

### 5. Development Server'ı Başlatın

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

### 6. Production Build

```bash
npm run build
npm run start
```

## 📁 Proje Yapısı

```
task-app-nextjs/
├── app/                              # Next.js App Router
│   ├── api/                          # Backend API Routes
│   │   ├── kimlik/                   # Kimlik Doğrulama API
│   │   │   ├── giris/route.ts        # Giriş endpoint
│   │   │   ├── cikis/route.ts        # Çıkış endpoint
│   │   │   ├── kayit/route.ts        # Kayıt endpoint
│   │   │   ├── eposta-dogrulama/route.ts # E-posta doğrulama
│   │   │   ├── sifremi-unuttum/route.ts  # Şifre sıfırlama talebi
│   │   │   └── sifre-sifirla/route.ts    # Yeni şifre belirleme
│   │   ├── takimlar/                 # Takım Yönetimi API
│   │   │   ├── route.ts              # Takım listesi/oluşturma
│   │   │   └── [takimId]/            # Takım detay işlemleri
│   │   │       ├── route.ts          # Takım CRUD
│   │   │       ├── uyeler/           # Üye yönetimi
│   │   │       │   ├── route.ts      # Üye listesi/ekleme
│   │   │       │   └── [uyeId]/route.ts
│   │   │       └── gorevler/         # Görev Yönetimi API
│   │   │           ├── route.ts      # Görev listesi/oluşturma
│   │   │           └── [gorevId]/route.ts # Görev CRUD
│   │   └── kullanici/                # Kullanıcı API
│   │       └── gorevler/route.ts     # Kullanıcının görevleri
│   │
│   ├── panel/                        # Panel (dashboard) sayfaları
│   │   ├── page.tsx                  # Ana panel
│   │   └── takimlar/                 # Takım sayfaları
│   │       └── [takimId]/page.tsx    # Takım detay sayfası
│   │
│   ├── giris/page.tsx                # Giriş sayfası
│   ├── kayit/page.tsx                # Kayıt sayfası
│   ├── sifremi-unuttum/page.tsx      # Şifre sıfırlama talebi
│   ├── eposta-dogrulama/page.tsx     # E-posta doğrulama sayfası
│   │
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Ana sayfa (landing)
│   └── globals.css                   # Global stil tanımları
│
├── components/                       # React Bileşenleri
│   ├── layout/                       # Sayfa iskeleti bileşenleri
│   │   ├── site-header.tsx           # Ana sayfa üst menüsü
│   │   └── site-footer.tsx           # Alt bilgi (ürün linkleri + iletişim)
│   │
│   ├── teams/                        # Takım bileşenleri
│   │   ├── create-team-dialog.tsx    # Takım oluşturma dialog
│   │   ├── team-card.tsx             # Takım kartı
│   │   ├── add-member-dialog.tsx     # Üye ekleme dialog
│   │   └── member-list-item.tsx      # Üye liste elemanı
│   │
│   ├── tasks/                        # Görev bileşenleri
│   │   ├── create-task-dialog.tsx    # Görev oluşturma dialog
│   │   ├── edit-task-dialog.tsx      # Görev düzenleme dialog
│   │   └── task-list-item.tsx        # Görev liste elemanı
│   │
│   ├── dashboard/                    # Dashboard bileşenleri
│   │   └── user-task-item.tsx        # Kullanıcı görev kartı
│   │
│   └── ui/                           # ShadCN UI Bileşenleri
│       ├── button.tsx                # Button bileşeni
│       ├── input.tsx                 # Input bileşeni
│       ├── card.tsx                  # Card bileşeni
│       ├── dialog.tsx                # Dialog/Modal bileşeni
│       ├── select.tsx                # Select dropdown bileşeni
│       ├── confirm-dialog.tsx        # Confirmation dialog
│       ├── alert.tsx                 # Alert bileşeni
│       ├── badge.tsx                 # Badge bileşeni
│       ├── label.tsx                 # Label bileşeni
│       ├── textarea.tsx              # Textarea bileşeni
│       ├── checkbox.tsx              # Checkbox bileşeni
│       ├── input-group.tsx           # Input grubu
│       ├── navigation-menu.tsx       # Navigation menu
│       └── sonner.tsx                # Toast bildirimleri (sonner Toaster)
│
├── lib/                              # Core Kütüphane
│   ├── api/                          # API İstemci Katmanı
│   │   └── auth-api.ts               # Auth API client
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── use-login.ts              # Giriş hook
│   │   ├── use-logout.ts             # Çıkış hook
│   │   ├── use-register.ts           # Kayıt hook
│   │   ├── use-teams.ts              # Takımları getir
│   │   ├── use-create-team.ts        # Takım oluştur
│   │   ├── use-team-members.ts       # Üye yönetimi
│   │   ├── use-tasks.ts              # Görev yönetimi
│   │   └── use-user-tasks.ts         # Kullanıcı görevleri
│   │
│   ├── store/                        # Zustand State Store
│   │   ├── auth-store.ts             # Auth state
│   │   └── team-store.ts             # Team state
│   │
│   ├── validations/                  # Zod Validation Schemas
│   │   └── auth-schema.ts            # Auth validasyon
│   │
│   ├── middleware/                   # Middleware Konfigürasyonu
│   │   └── auth-config.ts            # Route koruma ayarları
│   │
│   ├── site-info.ts                  # Marka adı ve iletişim bilgisi
│   │
│   ├── auth-helpers.ts               # Auth yardımcı fonksiyonlar
│   ├── jwt-helpers.ts                # JWT işlemleri
│   ├── db.ts                         # MySQL bağlantı havuzu
│   └── utils.ts                      # Genel yardımcı fonksiyonlar
│
├── database/
│   └── schema.sql                    # MySQL veri tabanı şeması
│
├── public/                           # Statik dosyalar
│   ├── hero.jpg
│   └── hero.webp
│
├── proxy.ts                          # Next.js Proxy (JWT auth + route koruma)
├── components.json                   # ShadCN konfigürasyonu
├── env.example                       # Örnek environment değerleri
├── package.json                      # NPM bağımlılıkları
├── tsconfig.json                     # TypeScript konfigürasyonu
├── next.config.ts                    # Next.js konfigürasyonu
├── tailwind.config.js                # Tailwind konfigürasyonu
└── README.md                         # Proje dokümantasyonu
```

## 🔔 Bildirimler (Toast)

Form ve veri işlemlerinin sonucu, sayfa içindeki bilgi kutucuğu (inline alert) yerine **toast** bildirimi olarak gösterilir. Bildirimler `sonner` ile üretilir; `components/ui/sonner.tsx` içindeki `Toaster` bileşeni kök layout'ta (`app/layout.tsx`) bir kez render edilir.

> **Neden sonner?** shadcn'in yeni `toast` bileşeni yalnızca **Base UI** kaydına sahip projelerde kullanılabilir. Bu proje Radix tabanlı olduğu için CLI (`npx shadcn@latest add toast`) şu hatayı verir: *"The toast component is only available for Base UI projects. Use the sonner component instead."* Bu nedenle shadcn'in önerdiği `sonner` bileşeni kurulmuştur (`npx shadcn@latest add sonner`).

### Kullanım

```tsx
import { toast } from 'sonner';

toast.success('Görev oluşturuldu', { description: task.title });
toast.error(errorMessage);
toast.info('Bilgilendirme');
toast.promise(kaydet(), { loading: 'Kaydediliyor...', success: 'Kaydedildi', error: 'Kaydedilemedi' });
```

### Davranış

- **Konum:** sağ üst (`top-right`), 4,5 saniye sonra otomatik kapanır; kapatma butonu ve `richColors` (yeşil/kırmızı vurgu) aktiftir.
- **Tema:** sabit `light`. Uygulamada tema geçişi bulunmadığı için bildirimin sistem temasına göre farklı görünmesi engellenmiştir.
- **Kalıcılık:** sonner istemci tarafında çalışır; giriş/çıkış gibi yönlendirmelerden sonra da bildirim görünmeye devam eder.

### Bildirim tetiklenen yerler

En güncel sonuç bilgisine sahip oldukları için bildirimler ağırlıklı olarak **hook katmanında** tetiklenir:

| Konum | Başarı bildirimi | Hata bildirimi |
|-------|------------------|----------------|
| `lib/hooks/use-login.ts` | "Giriş başarılı" | API mesajı |
| `lib/hooks/use-register.ts` | "Hesabınız oluşturuldu" | API mesajı |
| `lib/hooks/use-logout.ts` | "Çıkış yapıldı" | API mesajı |
| `lib/hooks/use-create-team.ts` | "Takım oluşturuldu" | API mesajı |
| `lib/hooks/use-team-members.ts` | Üye eklendi / rol güncellendi / üye çıkarıldı | API mesajı |
| `lib/hooks/use-tasks.ts` | Görev oluşturuldu / güncellendi / silindi | API mesajı |
| `lib/hooks/use-teams.ts`, `use-user-tasks.ts` | — | Liste yükleme hatası |
| `app/sifremi-unuttum/page.tsx` | "Sıfırlama bağlantısı gönderildi" | API mesajı |
| `app/eposta-dogrulama/page.tsx` | Doğrulama ve yeniden gönderim sonucu | API mesajı |
| `app/panel/takimlar/[takimId]/page.tsx` | "Takım silindi" | API mesajı |

> `components/ui/alert.tsx` genel amaçlı bir UI primitifi olarak korunmuştur; uygulamada form ve işlem geri bildirimleri toast ile gösterilir.

## 🔗 URL Yapısı (Türkçe)

Kullanıcıya görünen tüm sayfa adresleri ve dahili API endpoint'leri Türkçe'dir. Eski İngilizce adresler (`/login`, `/register`, `/dashboard`, `/verify-email`, `/api/auth/*`, `/api/teams/*` …) **kaldırılmıştır**; geriye dönük yönlendirme bırakılmamıştır.

### Sayfalar

| Sayfa | Adres |
|-------|-------|
| Ana sayfa | `/` |
| Giriş | `/giris` |
| Kayıt | `/kayit` |
| Şifremi unuttum | `/sifremi-unuttum` |
| E-posta doğrulama | `/eposta-dogrulama?token=...` |
| Panel (dashboard) | `/panel` |
| Takım detayı | `/panel/takimlar/[takimId]` |

### API Endpoint'leri

| Alan | Endpoint |
|------|----------|
| Giriş / kayıt / çıkış | `/api/kimlik/giris`, `/api/kimlik/kayit`, `/api/kimlik/cikis` |
| Doğrulama ve şifre işlemleri | `/api/kimlik/eposta-dogrulama`, `/api/kimlik/sifremi-unuttum`, `/api/kimlik/sifre-sifirla` |
| Takımlar | `/api/takimlar`, `/api/takimlar/[takimId]` |
| Üyeler | `/api/takimlar/[takimId]/uyeler`, `/api/takimlar/[takimId]/uyeler/[uyeId]` |
| Görevler | `/api/takimlar/[takimId]/gorevler`, `/api/takimlar/[takimId]/gorevler/[gorevId]` |
| Kullanıcının görevleri | `/api/kullanici/gorevler` |

### Adlandırma kuralları

- Segmentler küçük harfli, tire ayraçlı ve ASCII'dir: `sifremi-unuttum`, `eposta-dogrulama`, `takimlar` (URL'de Türkçe karakter kullanılmaz).
- Dinamik segment adları da Türkçedir: `[takimId]`, `[uyeId]`, `[gorevId]`. Route handler'larda ve panel sayfasında değer yerel değişkene eşlenir (ör. `const { takimId: teamId } = await params;`); veritabanı kolonları (`team_id`, `user_id`) ve iç veri modeli değişmemiştir.
- Korumalı adresler `lib/middleware/auth-config.ts` içinde tanımlıdır: `/panel` (ve alt yolları), `/profil`, `/ayarlar`, `/gorevler`. Oturum yoksa `proxy.ts` kullanıcıyı `/giris?yonlendir=<istenen-yol>` adresine yönlendirir.
- Yetkili kullanıcı `/giris`, `/kayit` veya `/sifremi-unuttum` sayfalarına gelirse otomatik olarak `/panel`'e yönlendirilir.
- Yeni sayfa veya endpoint eklerken bu kurallara uyulmalıdır; proje genelinde Türkçe olmayan bir rota bulunmamalıdır.

## 🏗 Mimari

### Genel Sistem Akışı

```
┌─────────────────────────────────────────────────┐
│           Next.js Middleware Layer              │
│     JWT Token Doğrulama (Node.js Runtime)       │
│        Korumalı route'ları otomatik korur       │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         UI Layer (React Components)             │
│   • Dashboard                                   │
│   • Takım Yönetimi Sayfaları                    │
│   • Kimlik Doğrulama Sayfaları                  │
│   • ShadCN UI Bileşenleri                       │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│        Custom Hooks Layer                       │
│   • useLogin, useLogout, useRegister            │
│   • useTeams, useCreateTeam                     │
│   • useTeamMembers                              │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         API Client Layer (fetch)                │
│   auth-api.ts (credentials: include)            │
│   Otomatik cookie yönetimi                      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         API Routes (Backend)                    │
│   • /api/kimlik/* - Kimlik doğrulama            │
│   • /api/takimlar/* - Takım yönetimi            │
│   JWT Token oluşturma ve doğrulama             │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         Database Layer (MySQL)                  │
│   • users - Kullanıcı bilgileri                 │
│   • teams - Takım bilgileri                     │
│   • team_members - Üyeler ve roller             │
│   • tasks - Görevler ve atamalar               │
│   Prepared Statements ile SQL Injection koruması│
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         State Management (Zustand)              │
│   • auth-store - Kullanıcı durumu               │
│   • team-store - Takım durumu                   │
│   LocalStorage persistence                      │
└─────────────────────────────────────────────────┘
```

### Veri Tabanı Şeması

```sql
users
├── id (PK)
├── email (UNIQUE)
├── password (VARCHAR(255), bcrypt hash)
├── name
├── email_verified
├── email_verification_token
├── password_reset_token
└── created_at

teams
├── id (PK)
├── name
├── description
├── created_by (FK → users.id)
├── created_at
└── updated_at

team_members
├── id (PK)
├── team_id (FK → teams.id)
├── user_id (FK → users.id)
├── role (enum: 'admin', 'member')
└── joined_at

tasks
├── id (PK)
├── team_id (FK → teams.id)
├── assigned_to (FK → users.id)
├── assigned_by (FK → users.id)
├── title
├── description
├── status (enum: 'pending', 'in_progress', 'completed', 'cancelled')
├── priority (enum: 'low', 'medium', 'high')
├── start_date
├── end_date
├── due_date
├── completed_at
├── created_at
└── updated_at
```

## 🎯 Kullanım

### 1. Kullanıcı Kaydı ve Girişi

```typescript
// Kayıt
import { useRegister } from '@/lib/hooks/use-register';

function RegisterPage() {
  const { handleRegister, error, success, isSubmitting } = useRegister();
  
  const onSubmit = async (data: { email: string; password: string; name: string }) => {
    await handleRegister(data);
  };
}

// Giriş
import { useLogin } from '@/lib/hooks/use-login';

function LoginPage() {
  const { handleLogin, error, isSubmitting } = useLogin();
  
  const onSubmit = async (data: { email: string; password: string }) => {
    await handleLogin(data);
  };
}
```

### 2. Takım Yönetimi

```typescript
// Takımları listele
import { useTeams } from '@/lib/hooks/use-teams';
import { useTeamStore } from '@/lib/store/team-store';

function Dashboard() {
  const { teams } = useTeamStore();
  const { fetchTeams, isLoading } = useTeams();
  
  useEffect(() => {
    fetchTeams();
  }, []);
}

// Yeni takım oluştur
import { useCreateTeam } from '@/lib/hooks/use-create-team';

function CreateTeamDialog() {
  const { createTeam, isSubmitting } = useCreateTeam();
  
  const handleSubmit = async (data: { name: string; description?: string }) => {
    await createTeam(data);
  };
}

// Üye yönetimi
import { useTeamMembers } from '@/lib/hooks/use-team-members';

function TeamDetailPage() {
  const { 
    fetchMembers, 
    addTeamMember, 
    updateTeamMemberRole,
    removeTeamMember 
  } = useTeamMembers(teamId);
  
  // Üye ekle
  await addTeamMember({ 
    email: 'user@example.com', 
    role: 'member' 
  });
  
  // Rol değiştir
  await updateTeamMemberRole(memberId, 'admin');
  
  // Üye çıkar
  await removeTeamMember(memberId);
}
```

### 3. Görev Yönetimi

```typescript
// Takım görevlerini listele
import { useTasks } from '@/lib/hooks/use-tasks';

function TeamTasksPage() {
  const { 
    tasks,
    fetchTasks, 
    createTask, 
    updateTask,
    deleteTask,
    isLoading,
    isSubmitting 
  } = useTasks(teamId);
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  // Yeni görev oluştur (sadece admin)
  await createTask({
    assigned_to: userId,
    title: 'Yeni özellik geliştir',
    description: 'Login sayfası tasarımı',
    status: 'pending',
    priority: 'high',
    start_date: '2025-01-20',
    due_date: '2025-01-25'
  });
  
  // Görevi güncelle
  await updateTask(taskId, {
    status: 'in_progress',
    priority: 'high'
  });
  
  // Görevi sil
  await deleteTask(taskId);
}

// Kullanıcıya atanan görevleri listele
import { useUserTasks } from '@/lib/hooks/use-user-tasks';

function Dashboard() {
  const { tasks, fetchUserTasks, isLoading } = useUserTasks();
  
  useEffect(() => {
    fetchUserTasks();
  }, []);
  
  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

### 4. E-posta Doğrulama Arayüzü

- Kullanıcı kayıt olduğunda otomatik olarak `/eposta-dogrulama?token=...` adresine yönlendiren bir bağlantı içeren e-posta gönderilir.
- Bu sayfada:
  - Token otomatik olarak doğrulanır ve kullanıcıya durum bilgisi gösterilir.
  - E-posta ulaşmadıysa form üzerinden yeni doğrulama e-postası talep edilebilir.
  - Doğrulama başarılıysa doğrudan giriş sayfasına veya dashboard'a geçiş kısayolları sunulur.

### 5. Yeni Korumalı Sayfa Eklemek

1. **Middleware'de route ekleyin:**

```typescript
// middleware.ts
const protectedRoutes = [
  '/panel',
  '/panel/takimlar',
  '/profil', // ← YENİ
];
```

2. **Sayfayı oluşturun:**

```typescript
// app/profile/page.tsx
export default function ProfilePage() {
  return <div>Korumalı profil sayfası</div>;
}
```

Middleware otomatik olarak korur! ✨

### 6. Zustand Store Kullanımı

```typescript
import { useAuthStore } from '@/lib/store/auth-store';
import { useTeamStore } from '@/lib/store/team-store';

function MyComponent() {
  // Auth store
  const { user, isAuthenticated } = useAuthStore();
  
  // Team store
  const { teams, currentTeam, currentTeamMembers } = useTeamStore();
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Hoş geldin, {user?.name}!</p>
          <p>Takım sayısı: {teams.length}</p>
        </>
      ) : (
        <p>Lütfen giriş yap</p>
      )}
    </div>
  );
}
```

## 📡 API Endpoints

### Kimlik Doğrulama

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/kimlik/kayit` | Yeni kullanıcı kaydı |
| `POST` | `/api/kimlik/giris` | Kullanıcı girişi (JWT token döner) |
| `POST` | `/api/kimlik/cikis` | Çıkış yap (JWT cookie temizler) |
| `GET` | `/api/kimlik/eposta-dogrulama?token=xxx` | E-posta doğrulama |
| `POST` | `/api/kimlik/eposta-dogrulama` | Yeni doğrulama e-postası gönder |
| `POST` | `/api/kimlik/sifremi-unuttum` | Şifre sıfırlama talebi |
| `GET` | `/api/kimlik/sifre-sifirla?token=xxx` | Reset token kontrolü |
| `POST` | `/api/kimlik/sifre-sifirla` | Yeni şifre belirleme |

### Takım Yönetimi

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| `GET` | `/api/takimlar` | Kullanıcının takımlarını listele | Tümü |
| `POST` | `/api/takimlar` | Yeni takım oluştur | Tümü |
| `GET` | `/api/takimlar/[takimId]` | Takım detaylarını getir | Üye |
| `PUT` | `/api/takimlar/[takimId]` | Takım bilgilerini güncelle | Admin |
| `DELETE` | `/api/takimlar/[takimId]` | Takımı sil | Admin |
| `GET` | `/api/takimlar/[takimId]/uyeler` | Takım üyelerini listele | Üye |
| `POST` | `/api/takimlar/[takimId]/uyeler` | Takıma üye ekle | Admin |
| `PUT` | `/api/takimlar/[takimId]/uyeler/[uyeId]` | Üye rolünü güncelle | Admin |
| `DELETE` | `/api/takimlar/[takimId]/uyeler/[uyeId]` | Üyeyi takımdan çıkar | Admin |

### Görev Yönetimi

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| `GET` | `/api/takimlar/[takimId]/gorevler` | Takımın görevlerini listele | Üye |
| `POST` | `/api/takimlar/[takimId]/gorevler` | Yeni görev oluştur | Admin |
| `GET` | `/api/takimlar/[takimId]/gorevler/[gorevId]` | Görev detaylarını getir | Üye |
| `PUT` | `/api/takimlar/[takimId]/gorevler/[gorevId]` | Görevi güncelle | Admin / Atayan / Atanan |
| `DELETE` | `/api/takimlar/[takimId]/gorevler/[gorevId]` | Görevi sil | Admin / Atayan |
| `GET` | `/api/kullanici/gorevler` | Kullanıcıya atanan görevler | Tümü |

### Örnek API İstekleri

**Kayıt:**
```bash
curl -X POST http://localhost:3000/api/kimlik/kayit \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "Ahmet Yılmaz"
  }'
```

**Giriş:**
```bash
curl -X POST http://localhost:3000/api/kimlik/giris \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**Takım Oluşturma:**
```bash
curl -X POST http://localhost:3000/api/takimlar \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_JWT_TOKEN" \
  -d '{
    "name": "Geliştirme Ekibi",
    "description": "Ürün geliştirme takımı"
  }'
```

**Üye Ekleme:**
```bash
curl -X POST http://localhost:3000/api/takimlar/1/members \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_JWT_TOKEN" \
  -d '{
    "email": "member@example.com",
    "role": "member"
  }'
```

**Görev Oluşturma:**
```bash
curl -X POST http://localhost:3000/api/takimlar/1/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_JWT_TOKEN" \
  -d '{
    "assigned_to": 2,
    "title": "API Entegrasyonu",
    "description": "Kullanıcı API entegrasyonunu tamamla",
    "status": "pending",
    "priority": "high",
    "due_date": "2025-01-30"
  }'
```

**Kullanıcı Görevlerini Listele:**
```bash
curl -X GET http://localhost:3000/api/kullanici/gorevler \
  -H "Cookie: auth-token=YOUR_JWT_TOKEN"
```

## 🔐 Güvenlik

### Güvenlik Özellikleri

- ✅ **JWT Authentication** - httpOnly cookie ile güvenli token yönetimi
- ✅ **SQL Injection Koruması** - Prepared statements ile parametre binding
- ✅ **bcrypt Parola Hashleme** - Her parola için benzersiz salt ve 12 maliyet faktörü
- ✅ **Geriye Dönük Hash Migrasyonu** - Eski SHA-256 kayıtlarını başarılı girişte otomatik bcrypt'e yükseltme
- ✅ **Token Expiration** - JWT token (7 gün sonra otomatik expire)
- ✅ **Validasyon** - Client + Server side validasyon (Zod)
- ✅ **Cookie Security** - httpOnly, SameSite, Secure flags
- ✅ **Middleware Auth** - Merkezi route koruma
- ✅ **TypeScript** - Tip güvenliği
- ✅ **Rol Bazlı Yetkilendirme** - Admin/Üye rolleri
- ✅ **CSRF Koruması** - SameSite cookie flagi

## ⚙️ Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `middleware.ts` | JWT token doğrulama ve route koruma |
| `lib/jwt-helpers.ts` | JWT token oluşturma ve doğrulama fonksiyonları |
| `lib/auth-helpers.ts` | bcrypt hash/doğrulama, eski SHA-256 geçişi ve e-posta validasyonu |
| `lib/store/auth-store.ts` | Global auth state (Zustand) |
| `lib/store/team-store.ts` | Global team state (Zustand) |
| `lib/email.ts` | SMTP üzerinden e-posta gönderimi |
| `lib/middleware/auth-config.ts` | Korumalı/public route tanımları |
| `database/schema.sql` | MySQL veri tabanı şeması ve tablolar |
| `database/migrations/001_expand_password_hash_column.sql` | Mevcut parola kolonunu bcrypt hash formatı için genişleten migrasyon |
| `components.json` | ShadCN UI konfigürasyonu |
| `env.example` | Örnek environment değişkenleri |

## 🧪 Test

### Manuel Test

1. **Kayıt Testi:**
   - http://localhost:3000/kayit adresine gidin
   - Formu doldurup kayıt olun
   - E-posta doğrulama kontrolü yapın

2. **Giriş Testi:**
   - http://localhost:3000/giris adresine gidin
   - Kayıt olduğunuz bilgilerle giriş yapın
   - Dashboard'a yönlendirilmelisiniz

3. **Takım Yönetimi Testi:**
   - Dashboard'da "Yeni Takım" butonuna tıklayın
   - Takım oluşturun
   - Takım kartına tıklayarak detay sayfasına gidin
   - "Üye Ekle" ile yeni üye ekleyin
   - Rol değiştirme ve üye çıkarma işlemlerini test edin

4. **Güvenlik Testi:**
   - Çıkış yapın
   - /dashboard adresine gitmeye çalışın
   - /login sayfasına yönlendirilmelisiniz

### Browser Console Test

```javascript
// Kullanıcı durumunu kontrol et
console.log(localStorage.getItem('auth-store'));

// Cookie'yi kontrol et
document.cookie.split(';').find(c => c.includes('auth-token'));
```

## ✅ Tamamlanan Özellikler

- [x] Toast tabanlı bildirim sistemi (sonner) — form ve veri işlemleri geri bildirimi
- [x] Görev (Task) CRUD işlemleri
- [x] Görev atama sistemi
- [x] Rol tabanlı görev yetkilendirmesi
- [x] Görev durum ve öncelik yönetimi
- [x] Kullanıcı dashboard'ında görev listesi
- [x] Tarih yönetimi (başlangıç, bitiş, son tarih)
- [x] SMTP tabanlı e-posta doğrulama sistemi

## 🚧 İleride Eklenebilecek Özellikler

### Kısa Vadeli
- [ ] Görev filtreleme ve sıralama
- [ ] Görev durum takibi
- [ ] Görev arama
- [ ] E-posta gönderme servisi (takım davetleri vb. durumlar için)
- [ ] Bildirim sistemi
- [ ] Kullanıcı profil sayfası ve düzenleme

### Orta Vadeli
- [ ] Dosya yükleme ve eklenti sistemi
- [ ] Görev yorumları
- [ ] Görev tarihçesi
- [ ] Takım istatistikleri ve raporlar
- [ ] Avatar upload
- [ ] Gerçek zamanlı bildirimler (WebSocket)
- [ ] Takım ayarları ve özelleştirme

### Uzun Vadeli
- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth (Google, GitHub, Microsoft)
- [ ] Rate limiting
- [ ] CAPTCHA entegrasyonu
- [ ] Unit tests (Jest, React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] API rate limiting
- [ ] GraphQL API desteği
- [ ] Mobile uygulama (React Native)

## 📊 Performans

- **Turbopack** ile hızlı geliştirme
- **Server Components** ile optimized rendering
- **Image Optimization** Next.js Image bileşeni ile
- **Code Splitting** otomatik route-based splitting
- **Database Connection Pooling** mysql2

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [ShadCN](https://ui.shadcn.com/) - UI bileşenleri
- [Radix UI](https://www.radix-ui.com/) - Headless UI
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Lucide Icons](https://lucide.dev/) - Icon seti

---

**⚠️ Önemli Not:** Bu proje geliştirilme aşamasındadır. Production kullanımı için aşağıdaki ek güvenlik önlemlerini mutlaka alınmalı:
- Rate limiting ekleyin
- CAPTCHA entegrasyonu yapın
- SSL/TLS sertifikası kullanın
- Güvenlik header'ları ekleyin (Helmet.js)
- Düzenli güvenlik güncellemeleri yapın
- Penetrasyon testleri gerçekleştirin
