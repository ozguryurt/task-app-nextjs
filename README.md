# Task App - Next.js

Modern ve güvenli bir task yönetim uygulaması. Next.js 15, TypeScript, TailwindCSS ve MySQL ile geliştirilmiştir.

## 🚀 Özellikler

### ✅ Tamamlanan Özellikler

- **🔐 Authentication Sistemi**
  - Kullanıcı kaydı (e-posta doğrulama ile)
  - Kullanıcı girişi
  - Şifre sıfırlama
  - **JWT Token Authentication** (httpOnly cookie)
  - SHA256 şifreleme
  - SQL injection koruması
  
- **🛡️ Middleware Auth (Merkezi Route Koruma)**
  - Otomatik sayfa koruma
  - **JWT Token doğrulama** (cookie bazlı)
  - Giriş yapmamış kullanıcıları yönlendirme
  - Token süresi dolmuş kullanıcıları yönlendirme
  - Her sayfada kod yazmaya gerek yok!

- **📋 Form Validasyon**
  - React Hook Form
  - Zod schema validasyon
  - Real-time validasyon mesajları
  
- **🎨 Modern UI**
  - TailwindCSS
  - Radix UI components
  - Responsive tasarım
  - Dark mode ready

- **📊 State Management**
  - Zustand (global state)
  - Persistent auth state
  - Cookie senkronizasyonu

## 🏗️ Mimari

```
┌─────────────────────────────────────────────────┐
│           Next.js Middleware                     │
│     JWT Token Doğrulama (Node.js Runtime)       │
│     Korumalı route'ları otomatik korur          │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              UI Pages (App Router)               │
│   React Hook Form + Custom Hooks                │
│   (useLogin, useLogout, useRegister)            │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│            API Client Layer                      │
│   auth-api.ts (fetch + credentials: include)    │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│          API Routes (Backend)                    │
│   JWT Token Creation + httpOnly Cookie          │
│   MySQL Database + Prepared Statements          │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         Zustand Store (Client State)             │
│   User info + isAuthenticated                   │
│   LocalStorage persistence                       │
└─────────────────────────────────────────────────┘
```

## 📦 Teknolojiler

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Database:** MySQL (mysql2)
- **State Management:** Zustand
- **Form Management:** React Hook Form
- **Validation:** Zod
- **UI Components:** Radix UI (shadcn)
- **Authentication:** JWT Tokens (jsonwebtoken)
- **Security:** SHA256, Prepared Statements, httpOnly Cookies

## 🚀 Kurulum

### 1. Repository'yi Klonlayın
```bash
git clone <repo-url>
cd task-app-nextjs
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### 3. Veritabanını Oluşturun
```bash
mysql -u root -p
```

```sql
CREATE DATABASE `task-app-nextjs` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `task-app-nextjs`;
SOURCE database/schema.sql;
```

### 4. Environment Değişkenleri
Proje root dizininde `.env` dosyası oluşturun:

```env
# Database
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=task-app-nextjs

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**JWT_SECRET Oluşturma:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Bu komutu çalıştırın ve çıkan değeri JWT_SECRET olarak kullanın.

⚠️ **Önemli:** 
- `.env` dosyasını asla Git'e commit etmeyin!
- Production'da mutlaka güçlü ve farklı bir JWT_SECRET kullanın

### 5. Development Server'ı Başlatın
```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## ⚙️ Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `middleware.ts` | JWT token doğrulama ve route koruma |
| `lib/jwt-helpers.ts` | JWT token oluşturma ve doğrulama |
| `lib/auth-helpers.ts` | Şifre hash, email validasyon |
| `lib/store/auth-store.ts` | Global auth state (Zustand) |
| `lib/middleware/auth-config.ts` | Korumalı/public route tanımları |
| `database/schema.sql` | MySQL veritabanı şeması |

## 📁 Proje Yapısı

```
task-app-nextjs/
├── app/                          # Next.js App Router
│   ├── api/auth/                 # Authentication API endpoints
│   │   ├── login/route.ts        # Login endpoint
│   │   ├── logout/route.ts       # Logout endpoint
│   │   ├── register/route.ts     # Register endpoint
│   │   ├── verify-email/route.ts # Email verification
│   │   ├── forgot-password/route.ts
│   │   └── reset-password/route.ts
│   ├── giris/page.tsx            # Login sayfası
│   ├── kayit/page.tsx            # Register sayfası
│   ├── dashboard/page.tsx        # Dashboard (korumalı)
│   ├── sifremi-unuttum/page.tsx  # Forgot password
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Ana sayfa
│   └── globals.css               # Global styles
│
├── lib/                          # Core library
│   ├── api/
│   │   └── auth-api.ts           # Auth API client
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-login.ts          # Login hook
│   │   ├── use-logout.ts         # Logout hook
│   │   └── use-register.ts       # Register hook
│   ├── middleware/
│   │   └── auth-config.ts        # Middleware route config
│   ├── store/
│   │   └── auth-store.ts         # Zustand auth store
│   ├── validations/
│   │   └── auth-schema.ts        # Zod validation schemas
│   ├── auth-helpers.ts           # Auth utilities
│   ├── jwt-helpers.ts            # JWT utilities
│   └── db.ts                     # MySQL connection
│
├── components/ui/                # Reusable UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── alert.tsx
│   ├── checkbox.tsx
│   ├── label.tsx
│   └── ...
│
├── database/
│   └── schema.sql                # MySQL database schema
│
├── middleware.ts                 # Next.js Middleware (JWT auth)
├── .env                          # Environment variables
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

## 🔐 Güvenlik Özellikleri

- ✅ **JWT Authentication** - httpOnly cookie ile güvenli token yönetimi
- ✅ **SQL Injection Koruması** - Prepared statements
- ✅ **SHA256 Şifreleme** - Güvenli şifre saklama
- ✅ **Token Expiration** - JWT token 7 gün sonra otomatik expire
- ✅ **Validasyon** - Client + Server side validasyon (Zod)
- ✅ **Cookie Security** - httpOnly, SameSite, Secure flags
- ✅ **Middleware Auth** - Merkezi route koruma (her sayfada token kontrolü)
- ✅ **TypeScript** - Tip güvenliği

## 🎯 Kullanım

### Yeni Korumalı Sayfa Eklemek

1. **middleware.ts'te route ekle:**
```typescript
const protectedRoutes = [
  '/dashboard',
  '/new-page', // ← YENİ
];
```

2. **Sayfayı oluştur:**
```typescript
// app/new-page/page.tsx
export default function NewPage() {
  return <div>Korumalı içerik</div>;
}
```

Middleware otomatik olarak korur! ✨

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi (JWT token döner)
- `POST /api/auth/logout` - Çıkış yap (JWT cookie temizler)
- `GET /api/auth/verify-email?token=xxx` - Email doğrulama
- `POST /api/auth/verify-email` - Yeni doğrulama emaili gönder
- `POST /api/auth/forgot-password` - Şifre sıfırlama talebi
- `GET /api/auth/reset-password?token=xxx` - Reset token kontrolü
- `POST /api/auth/reset-password` - Yeni şifre belirleme

### Custom Hooks Kullanımı

```typescript
import { useLogin } from '@/lib/hooks/use-login';
import { useLogout } from '@/lib/hooks/use-logout';
import { useRegister } from '@/lib/hooks/use-register';

// Login hook
function LoginPage() {
  const { handleLogin, error, isSubmitting } = useLogin();
  
  const onSubmit = async (data) => {
    await handleLogin(data);
  };
}

// Logout hook
function Dashboard() {
  const { handleLogout, isSubmitting } = useLogout();
  
  const onLogout = async () => {
    await handleLogout();
  };
}

// Register hook
function RegisterPage() {
  const { handleRegister, error, success, isSubmitting } = useRegister();
  
  const onSubmit = async (data) => {
    await handleRegister(data);
  };
}
```

### Zustand Store

```typescript
import { useAuthStore } from '@/lib/store/auth-store';

function MyComponent() {
  const { user, isAuthenticated } = useAuthStore();
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Hoş geldin, {user?.name}!</p>
      ) : (
        <p>Lütfen giriş yap</p>
      )}
    </div>
  );
}
```

## 🧪 Test

### Manual Test

1. **Kayıt:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234","name":"Test User"}'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}'
```

### Browser Test

1. http://localhost:3000/kayit - Kayıt ol
2. http://localhost:3000/giris - Giriş yap
3. http://localhost:3000/dashboard - Dashboard (korumalı)

## 🔄 TODO

- [ ] E-posta gönderme servisi entegrasyonu
- [ ] E-posta doğrulama sayfası
- [ ] Şifre sıfırlama sayfası
- [ ] Task CRUD işlemleri
- [ ] Task kategorileri
- [ ] Task filtreleme ve sıralama
- [ ] Kullanıcı profil sayfası
- [ ] Avatar upload
- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth (Google, GitHub)
- [ ] Rate limiting
- [ ] Unit tests
- [ ] E2E tests

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır!

## 📄 Lisans

MIT

## 👨‍💻 Geliştirici

Task App - Next.js

---

**Not:** Bu proje geliştirilme aşamasındadır. Production kullanımı için ek güvenlik önlemleri (rate limiting, CAPTCHA, vb.) eklenmelidir.
