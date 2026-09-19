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
   SOURCE database/migrations/002_add_session_version.sql;
   SOURCE database/migrations/003_add_verification_attempts.sql;
   ```

   İlk migrasyon mevcut hash'leri topluca dönüştürmez. Eski SHA-256 kayıtları, kullanıcı doğru şifreyle ilk kez giriş yaptığında otomatik olarak bcrypt'e yükseltilir. İkinci migrasyon, şifre değiştiğinde eski JWT oturumlarını iptal edebilmek için `session_version` alanını ekler. Üçüncü migrasyon, 6 haneli kodlarda kod başına deneme sınırını kalıcı olarak tutar.

3. [`env.example`](env.example) dosyasını `.env.local` olarak kopyalayıp kendi değerlerinizi girin. PowerShell'de:

   ```powershell
   Copy-Item env.example .env.local
   ```

   macOS/Linux'ta `cp env.example .env.local` kullanabilirsiniz. Özellikle `DB_*` değişkenlerini ve tahmin edilmesi güç, benzersiz `JWT_SECRET` / `OTP_SECRET` değerlerini ayarlayın.

4. Geliştirme sunucusunu başlatın:

   ```bash
   npm run dev
   ```

   Uygulamayı [http://localhost:3000](http://localhost:3000) adresinde açın. Geliştirme ve derleme komutları Turbopack kullanır; `next.config.ts` bağımsız (`standalone`) çıktı üretir.

### Ortam değişkenleri

| Değişken | Amaç |
| --- | --- |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL bağlantısı. |
| `JWT_SECRET` | JWT imzalama/doğrulama anahtarı; uygulama en az 32 karakterlik bir değer olmadan oturum üretmez. |
| `OTP_SECRET` | 6 haneli kodları HMAC ile korur; boşsa `JWT_SECRET` kullanılır. Canlı ortamda ayrı ve en az 32 karakterlik değer önerilir. |
| `APP_ORIGIN` | Uygulamanın dışarıdan erişilen tam adresi (ör. `https://task.example.com`). cPanel/reverse proxy kurulumlarında CSRF origin kontrolü için ayarlanmalıdır. Birden fazla adres virgülle ayrılabilir. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Doğrulama e-postasının SMTP üzerinden gönderimi. |
| `NODE_ENV` | Ortam türü; normalde Next.js tarafından belirlenir. |

`NEXT_PUBLIC_*` değişkenleri istemciye açıktır; bu alanlara gizli anahtar koymayın. Gerçek `.env.local` dosyasını sürüm kontrolüne eklemeyin.

### cPanel / reverse proxy notu

Canlı ortamda `APP_ORIGIN` değerini kullanıcıların tarayıcıda açtığı HTTPS adresiyle aynı olacak şekilde tanımlayın:

```env
APP_ORIGIN=https://task.example.com
```

Bu değer değiştirildikten sonra Node.js uygulamasını cPanel üzerinden yeniden başlatın. Proxy, `Host` ve `X-Forwarded-*` başlıklarını uygulamaya aktarmaya devam etmelidir; `APP_ORIGIN` tanımlandığında güvenlik kontrolünün esas allowlist değeri bu değişken olur.

## Sayfalar ve kullanım

| Yol | Açıklama |
| --- | --- |
| `/` | Açılış sayfası. |
| `/kayit`, `/giris` | Hesap oluşturma ve giriş. |
| `/eposta-dogrulama` | E-posta adresi ve 6 haneli kodla hesap doğrulama. |
| `/sifremi-unuttum` | Kod isteme ve kodla yeni şifre belirleme. |
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
| POST | `/kimlik/eposta-dogrulama` | Kod yoksa yeni kod gönderme; `email` ve `code` varsa hesabı doğrulama. |
| POST | `/kimlik/sifremi-unuttum` | E-posta adresine 6 haneli şifre sıfırlama kodu gönderme. |
| POST | `/kimlik/sifre-sifirla` | E-posta, kod ve yeni şifreyle parolayı güncelleme. |
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

Yeni parolalar `bcryptjs` ile **12 maliyet faktörü** kullanılarak hash'lenir; düz metin veya yeni SHA-256 hash'i saklanmaz. Parola en az 8 karakter olmalı; büyük harf, küçük harf ve rakam içermeli ve bcrypt sınırı nedeniyle UTF-8 olarak 72 baytı aşmamalıdır. Eski SHA-256 hash'leri yalnızca geçiş dönemi için doğrulanır ve başarılı girişte bcrypt'e çevrilir. E-posta doğrulama ve şifre sıfırlama kodları 6 hanelidir, 5 dakika geçerlidir, kod başına en fazla 5 deneme kabul edilir ve veritabanında sunucu anahtarlı HMAC özeti olarak saklanır.

Oturum JWT'si `auth-token` adlı `httpOnly`, `SameSite=Lax` çerezde saklanır; `Secure` niteliği canlı ortamda etkinleşir ve çerez 7 gün geçerlidir. Token algoritması, yayıncı ve hedef kitle değerleri doğrulanır; kullanıcı devre dışı bırakıldığında veya şifresi değiştiğinde mevcut oturum reddedilir. Canlı ortam için HTTPS ve güçlü bir `JWT_SECRET` gereklidir.

Kimlik uçlarında istek hız sınırlaması, durum değiştiren API isteklerinde aynı kaynak kontrolü, 32 KB gövde sınırı ve uygulama genelinde CSP, HSTS, clickjacking/MIME/referrer güvenlik başlıkları bulunur. Şifre sıfırlama ve doğrulama e-postalarının gönderimi SMTP yapılandırmasına bağlıdır. Uygulama birden fazla sunucu örneğinde çalıştırılacaksa bellek içi hız sınırlayıcı yerine Redis gibi ortak bir depo kullanılmalıdır.

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
node --experimental-strip-types --test tests/task-filters.test.mjs tests/security.test.mjs
```

`npm run start`, önceden alınmış üretim derlemesini başlatır. Node test komutu, görev filtreleri ile güvenlik yardımcılarının doğrulamalarını çalıştırır.
