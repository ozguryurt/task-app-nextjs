# Taskflow

Taskflow, ekiplerin görevleri oluşturup atayabildiği, durum ve teslim tarihlerini takip edebildiği bir Next.js uygulamasıdır. Arayüz Türkçedir; sade ve kompakt bir tasarım için Tailwind CSS, shadcn/ui tabanlı Radix bileşenleri ve Lucide ikonları kullanılır.

## Özellikler

- Kayıt, giriş ve çıkış; JWT'nin `httpOnly` çerezde tutulması ve e-posta doğrulama.
- Takım oluşturma, üye ekleme/çıkarma ve `admin` / `member` rolleri.
- Takım görevlerini oluşturma, atama, düzenleme ve silme; durum, öncelik ve tarih alanları.
- Paneldeki **Bana atanan görevler** ve takım detayındaki **Görevler** bölümlerinde arama, durum/öncelik filtreleri, sıralama ve filtreleri temizleme. Takım detayında ayrıca atanan kişiye göre filtreleme bulunur. Filtreler, yüklenen görevler üzerinde tarayıcıda çalışır.
- İşlem geri bildirimleri için Sonner bildirimleri ve mobil uyumlu arayüz.

## Teknoloji ve gereksinimler

| Alan | Kullanılan teknoloji |
| --- | --- |
| Uygulama | Next.js 16 App Router, React 19, TypeScript |
| Arayüz | Tailwind CSS 4, Radix UI / shadcn/ui bileşenleri, Lucide, Sonner |
| Form ve istemci durumu | React Hook Form, Zod, Zustand |
| Sunucu ve veri | Next.js Route Handlers, MySQL, `mysql2` |
| Kimlik doğrulama | `bcryptjs`, `jsonwebtoken`, `nodemailer` |

MySQL sunucusu, npm ve Node.js gerekir. Next.js 16 için en az Node.js **20.9.0** kullanın; projedeki filtre testi komutu için Node.js **22 veya üzeri** önerilir. SMTP, doğrulama e-postalarının gönderilmesi için gereklidir.

## Kurulum

1. Bağımlılıkları yükleyin:

   ```bash
   npm ci
   ```

2. Proje kökünde MySQL istemcisini açın ve yeni kurulumda şemayı içe aktarın:

   ```bash
   mysql -u root -p
   ```

   ```sql
   CREATE DATABASE IF NOT EXISTS `task-app-nextjs` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE `task-app-nextjs`;
   SOURCE database/schema.sql;
   ```

   Var olan bir kurulumda, eski 64 karakterlik SHA-256 şifre alanını bcrypt hash'lerine uygun hâle getirmek için **mevcut veritabanınızı yedekledikten sonra** şu migrasyonu çalıştırın:

   ```sql
   USE `task-app-nextjs`;
   SOURCE database/migrations/001_expand_password_hash_column.sql;
   ```

   Migrasyon mevcut hash'leri topluca dönüştürmez. Eski SHA-256 kayıtları, kullanıcı doğru şifreyle ilk kez giriş yaptığında otomatik olarak bcrypt'e yükseltilir.

3. [`env.example`](env.example) dosyasını `.env.local` olarak kopyalayıp kendi değerlerinizi girin. PowerShell'de:

   ```powershell
   Copy-Item env.example .env.local
   ```

   macOS/Linux'ta `cp env.example .env.local` kullanabilirsiniz. Özellikle `DB_*` değişkenlerini ve tahmin edilmesi güç, benzersiz bir `JWT_SECRET` değerini ayarlayın. `NEXT_PUBLIC_APP_URL` yerelde `http://localhost:3000` olabilir.

4. Geliştirme sunucusunu başlatın:

   ```bash
   npm run dev
   ```

   Uygulamayı [http://localhost:3000](http://localhost:3000) adresinde açın. Geliştirme ve derleme komutları Turbopack kullanır; `next.config.ts` bağımsız (`standalone`) çıktı üretir.

### Ortam değişkenleri

| Değişken | Amaç |
| --- | --- |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL bağlantısı. |
| `JWT_SECRET` | JWT imzalama/doğrulama anahtarı; canlı ortamda mutlaka güçlü bir değer verin. |
| `NEXT_PUBLIC_APP_URL` | E-posta doğrulama bağlantılarında kullanılan uygulama adresi. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Doğrulama e-postasının SMTP üzerinden gönderimi. |
| `NODE_ENV` | Ortam türü; normalde Next.js tarafından belirlenir. |

`NEXT_PUBLIC_*` değişkenleri istemciye açıktır; bu alanlara gizli anahtar koymayın. Gerçek `.env.local` dosyasını sürüm kontrolüne eklemeyin.

## Sayfalar ve kullanım

| Yol | Açıklama |
| --- | --- |
| `/` | Açılış sayfası. |
| `/kayit`, `/giris` | Hesap oluşturma ve giriş. |
| `/eposta-dogrulama` | E-posta doğrulama. |
| `/sifremi-unuttum` | Şifre sıfırlama talebi arayüzü; aşağıdaki sınırlamaya bakın. |
| `/panel` | Takımlar ve kullanıcıya atanan görevler. |
| `/panel/takimlar/[takimId]` | Takım üyeleri ve görevleri. |

`proxy.ts`, oturum açmamış kullanıcıları korumalı panel sayfalarından `/giris` yoluna yönlendirir. API uçları `proxy.ts` içinde atlanır; yetki kontrolleri ilgili Route Handler'larda yapılır.

Görev durumları `pending`, `in_progress`, `completed`, `cancelled`; öncelikler `low`, `medium`, `high` değerlerini kullanır. Görev filtresindeki arama başlık ve açıklamada çalışır; panelde takım/atayan, takım detayında ise atanan/atayan adları da aranabilir. Sıralama seçenekleri en yeni, en eski, yakın teslim tarihi ve önceliktir.

## API

Tüm yollar `/api` önekini kullanır. Korumalı uçlar oturum çerezini gerektirir; takım ve görev işlemlerinde rol/üyelik kontrolleri uygulanır.

| Yöntem | Yol | İşlem |
| --- | --- | --- |
| POST | `/kimlik/kayit` | Kayıt. |
| POST | `/kimlik/giris` | Giriş. |
| POST | `/kimlik/cikis` | Çıkış. |
| GET, POST | `/kimlik/eposta-dogrulama` | E-posta doğrulama / yeniden doğrulama talebi. |
| POST | `/kimlik/sifremi-unuttum` | Şifre sıfırlama token'ı oluşturma; aşağıdaki uyarıya bakın. |
| GET, POST | `/kimlik/sifre-sifirla` | Token doğrulama / yeni şifre belirleme. |
| GET, POST | `/takimlar` | Takımları listeleme / oluşturma. |
| GET, PUT, DELETE | `/takimlar/[takimId]` | Takım detayı / güncelleme / silme. |
| GET, POST | `/takimlar/[takimId]/uyeler` | Üyeleri listeleme / ekleme. |
| PUT, DELETE | `/takimlar/[takimId]/uyeler/[uyeId]` | Üye rolünü güncelleme / üyeyi çıkarma. |
| GET, POST | `/takimlar/[takimId]/gorevler` | Görevleri listeleme / oluşturma. |
| GET, PUT, DELETE | `/takimlar/[takimId]/gorevler/[gorevId]` | Görev detayı / güncelleme / silme. |
| GET | `/kullanici/gorevler` | Kullanıcıya atanan görevler. |

Örneğin giriş isteği:

```http
POST /api/kimlik/giris
Content-Type: application/json

{"email":"ornek@alanadi.com","password":"OrnekSifre123"}
```

## Şifreler ve güvenlik durumu

Yeni parolalar `bcryptjs` ile **12 maliyet faktörü** kullanılarak hash'lenir; düz metin veya yeni SHA-256 hash'i saklanmaz. Parola en az 8 karakter olmalı; büyük harf, küçük harf ve rakam içermeli ve bcrypt sınırı nedeniyle UTF-8 olarak 72 baytı aşmamalıdır. Eski SHA-256 hash'leri yalnızca geçiş dönemi için doğrulanır ve başarılı girişte bcrypt'e çevrilir.

Oturum JWT'si `auth-token` adlı `httpOnly`, `SameSite=Lax` çerezde saklanır; `Secure` niteliği canlı ortamda etkinleşir ve çerez 7 gün geçerlidir. Canlı ortam için HTTPS ve güçlü bir `JWT_SECRET` gereklidir.

**Bilinen eksik:** Şifre sıfırlama talebi şu anda e-posta göndermez; token'ı API yanıtında döndürür. Bu davranış canlı ortam için uygun değildir. Sıfırlama akışını üretimde kullanmadan önce token'ı yalnızca e-posta ile ileten güvenli gönderim akışı ve kullanıcı arayüzü tamamlanmalı, yanıt içindeki token kaldırılmalıdır. Doğrulama e-postalarının gönderimi ise SMTP yapılandırmasına bağlıdır.

## Proje yapısı

```text
app/                  Sayfalar ve API Route Handler'ları
components/ui/        Ortak Radix/shadcn tabanlı arayüz bileşenleri
components/tasks/     Görev listesi, diyalogları ve filtre çubuğu
components/teams/     Takım kartları ve üye yönetimi bileşenleri
components/dashboard/ Panel görev bileşenleri
lib/                  DB, kimlik doğrulama, veri kancaları ve filtre mantığı
database/schema.sql   İlk kurulum şeması
database/migrations/  Var olan veritabanı için SQL migrasyonları
tests/                Görev filtreleme testleri
proxy.ts              Sayfa yönlendirme ve oturum kontrolü
```

## Komutlar ve kontroller

```bash
npm run dev
npm run build
npm run start
npm run lint
npx tsc --noEmit
node --experimental-strip-types --test tests/task-filters.test.mjs
```

`npm run start`, önceden alınmış üretim derlemesini başlatır. Filtre testi, `lib/task-filters.ts` içindeki arama, filtreleme ve sıralamayı sınar. Mevcut TypeScript 7 / ESLint araç zinciri uyumsuzluğu nedeniyle `npm run lint` bazı ortamlarda yapılandırma aşamasında hata verebilir; bu, lint kontrolünün geçtiği anlamına gelmez.
