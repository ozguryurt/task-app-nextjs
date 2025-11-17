# Task App - Next.js

Modern ve güvenli bir görev yönetim uygulaması. Kullanıcı kimlik doğrulama, takım yönetimi ve gelişmiş güvenlik özellikleri ile donatılmış profesyonel bir web uygulaması. Next.js 15, TypeScript, TailwindCSS ve MySQL teknolojileri kullanılarak geliştirilmiştir.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Kurulum](#-kurulum)
- [Proje Yapısı](#-proje-yapısı)
- [Mimari](#-mimari)
- [Kullanım](#-kullanım)
- [API Endpoints](#-api-endpoints)
- [Güvenlik](#-güvenlik)
- [Katkıda Bulunma](#-katkıda-bulunma)

## ✨ Özellikler

### 🔐 Kimlik Doğrulama Sistemi

- **Kullanıcı Kaydı**
  - E-posta ile kayıt
  - Şifre güvenlik gereksinimleri (min. 8 karakter, büyük/küçük harf, rakam)
  - E-posta doğrulama sistemi
  
- **Kullanıcı Girişi**
  - JWT token tabanlı kimlik doğrulama
  - httpOnly cookie ile güvenli token saklama
  - Otomatik token yenileme (7 gün geçerlilik)
  
- **Şifre Yönetimi**
  - Şifre sıfırlama talebi
  - Güvenli token ile şifre yenileme
  - SHA256 ile şifre şifreleme

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
- **Framework:** Next.js 15.5.4 (App Router)
- **Language:** TypeScript 5
- **UI Library:** React 19.1.0
- **Styling:** TailwindCSS 4
- **Component Library:** Radix UI (ShadCN)
- **Icons:** Lucide React
- **Form Management:** React Hook Form 7.65.0
- **Validation:** Zod 4.1.12
- **State Management:** Zustand 5.0.8

### Backend
- **Runtime:** Node.js
- **Database:** MySQL (mysql2 3.15.2)
- **Authentication:** JSON Web Tokens (jsonwebtoken 9.0.2)
- **Security:** SHA256, Prepared Statements

### Development
- **Package Manager:** npm
- **Build Tool:** Turbopack (Next.js)
- **Linter:** ESLint 9
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
```

**JWT_SECRET Oluşturma:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

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
│   │   ├── auth/                     # Kimlik Doğrulama API
│   │   │   ├── login/route.ts        # Giriş endpoint
│   │   │   ├── logout/route.ts       # Çıkış endpoint
│   │   │   ├── register/route.ts     # Kayıt endpoint
│   │   │   ├── verify-email/route.ts # E-posta doğrulama
│   │   │   ├── forgot-password/route.ts
│   │   │   └── reset-password/route.ts
│   │   ├── teams/                    # Takım Yönetimi API
│   │   │   ├── route.ts              # Takım listesi/oluşturma
│   │   │   └── [teamId]/             # Takım detay işlemleri
│   │   │       ├── route.ts          # Takım CRUD
│   │   │       ├── members/          # Üye yönetimi
│   │   │       │   ├── route.ts      # Üye listesi/ekleme
│   │   │       │   └── [memberId]/route.ts
│   │   │       └── tasks/            # Görev Yönetimi API
│   │   │           ├── route.ts      # Görev listesi/oluşturma
│   │   │           └── [taskId]/route.ts # Görev CRUD
│   │   └── user/                     # Kullanıcı API
│   │       └── tasks/route.ts        # Kullanıcının görevleri
│   │
│   ├── dashboard/                    # Dashboard Sayfaları
│   │   ├── page.tsx                  # Ana dashboard
│   │   └── teams/                    # Takım sayfaları
│   │       └── [teamId]/page.tsx     # Takım detay sayfası
│   │
│   ├── giris/page.tsx                # Giriş sayfası
│   ├── kayit/page.tsx                # Kayıt sayfası
│   ├── sifremi-unuttum/page.tsx      # Şifre sıfırlama
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Ana sayfa
│   └── globals.css                   # Global stil tanımları
│
├── components/                       # React Bileşenleri
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
│       └── navigation-menu.tsx       # Navigation menu
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
├── middleware.ts                     # Next.js Middleware (JWT auth)
├── components.json                   # ShadCN konfigürasyonu
├── .env                              # Environment değişkenleri
├── package.json                      # NPM bağımlılıkları
├── tsconfig.json                     # TypeScript konfigürasyonu
├── next.config.ts                    # Next.js konfigürasyonu
├── tailwind.config.js                # Tailwind konfigürasyonu
└── README.md                         # Proje dokümantasyonu
```

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
│   • /api/auth/* - Kimlik doğrulama              │
│   • /api/teams/* - Takım yönetimi               │
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
├── password (SHA256)
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

### 4. Yeni Korumalı Sayfa Eklemek

1. **Middleware'de route ekleyin:**

```typescript
// middleware.ts
const protectedRoutes = [
  '/dashboard',
  '/dashboard/teams',
  '/profile', // ← YENİ
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

### 5. Zustand Store Kullanımı

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
| `POST` | `/api/auth/register` | Yeni kullanıcı kaydı |
| `POST` | `/api/auth/login` | Kullanıcı girişi (JWT token döner) |
| `POST` | `/api/auth/logout` | Çıkış yap (JWT cookie temizler) |
| `GET` | `/api/auth/verify-email?token=xxx` | E-posta doğrulama |
| `POST` | `/api/auth/verify-email` | Yeni doğrulama e-postası gönder |
| `POST` | `/api/auth/forgot-password` | Şifre sıfırlama talebi |
| `GET` | `/api/auth/reset-password?token=xxx` | Reset token kontrolü |
| `POST` | `/api/auth/reset-password` | Yeni şifre belirleme |

### Takım Yönetimi

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| `GET` | `/api/teams` | Kullanıcının takımlarını listele | Tümü |
| `POST` | `/api/teams` | Yeni takım oluştur | Tümü |
| `GET` | `/api/teams/[teamId]` | Takım detaylarını getir | Üye |
| `PUT` | `/api/teams/[teamId]` | Takım bilgilerini güncelle | Admin |
| `DELETE` | `/api/teams/[teamId]` | Takımı sil | Admin |
| `GET` | `/api/teams/[teamId]/members` | Takım üyelerini listele | Üye |
| `POST` | `/api/teams/[teamId]/members` | Takıma üye ekle | Admin |
| `PUT` | `/api/teams/[teamId]/members/[memberId]` | Üye rolünü güncelle | Admin |
| `DELETE` | `/api/teams/[teamId]/members/[memberId]` | Üyeyi takımdan çıkar | Admin |

### Görev Yönetimi

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| `GET` | `/api/teams/[teamId]/tasks` | Takımın görevlerini listele | Üye |
| `POST` | `/api/teams/[teamId]/tasks` | Yeni görev oluştur | Admin |
| `GET` | `/api/teams/[teamId]/tasks/[taskId]` | Görev detaylarını getir | Üye |
| `PUT` | `/api/teams/[teamId]/tasks/[taskId]` | Görevi güncelle | Admin / Atayan / Atanan |
| `DELETE` | `/api/teams/[teamId]/tasks/[taskId]` | Görevi sil | Admin / Atayan |
| `GET` | `/api/user/tasks` | Kullanıcıya atanan görevler | Tümü |

### Örnek API İstekleri

**Kayıt:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "Ahmet Yılmaz"
  }'
```

**Giriş:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**Takım Oluşturma:**
```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_JWT_TOKEN" \
  -d '{
    "name": "Geliştirme Ekibi",
    "description": "Ürün geliştirme takımı"
  }'
```

**Üye Ekleme:**
```bash
curl -X POST http://localhost:3000/api/teams/1/members \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_JWT_TOKEN" \
  -d '{
    "email": "member@example.com",
    "role": "member"
  }'
```

**Görev Oluşturma:**
```bash
curl -X POST http://localhost:3000/api/teams/1/tasks \
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
curl -X GET http://localhost:3000/api/user/tasks \
  -H "Cookie: auth-token=YOUR_JWT_TOKEN"
```

## 🔐 Güvenlik

### Güvenlik Özellikleri

- ✅ **JWT Authentication** - httpOnly cookie ile güvenli token yönetimi
- ✅ **SQL Injection Koruması** - Prepared statements ile parametre binding
- ✅ **SHA256 Şifreleme** - Şifre hashleme
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
| `lib/auth-helpers.ts` | Şifre hash, e-posta validasyon |
| `lib/store/auth-store.ts` | Global auth state (Zustand) |
| `lib/store/team-store.ts` | Global team state (Zustand) |
| `lib/middleware/auth-config.ts` | Korumalı/public route tanımları |
| `database/schema.sql` | MySQL veri tabanı şeması ve tablolar |
| `components.json` | ShadCN UI konfigürasyonu |

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
   - /giris sayfasına yönlendirilmelisiniz

### Browser Console Test

```javascript
// Kullanıcı durumunu kontrol et
console.log(localStorage.getItem('auth-store'));

// Cookie'yi kontrol et
document.cookie.split(';').find(c => c.includes('auth-token'));
```

## ✅ Tamamlanan Özellikler

- [x] Görev (Task) CRUD işlemleri
- [x] Görev atama sistemi
- [x] Rol tabanlı görev yetkilendirmesi
- [x] Görev durum ve öncelik yönetimi
- [x] Kullanıcı dashboard'ında görev listesi
- [x] Tarih yönetimi (başlangıç, bitiş, son tarih)

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