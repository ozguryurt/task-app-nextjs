# Taskflow

Taskflow, ekiplerin görevleri oluşturup atayabildiği, projelerle düzenleyebildiği ve ilerlemeyi takip edebildiği Türkçe bir Next.js uygulamasıdır. Panelde analitik, takımlar ve kullanıcıya atanan görevler ayrı sayfalarda yer alır.

## Özellikler

- Kayıt, giriş ve çıkış; JWT'nin `httpOnly` çerezde tutulması ve e-posta doğrulama.
- Takım oluşturma, üye ekleme/çıkarma ve `admin` / `member` rolleri.
- Takım görevlerini oluşturma, atama, düzenleme ve silme; durum, öncelik ve tarih alanları.
- `/panel/gorevler` sayfasında kullanıcıya atanan görevleri, takım detayında ise takım görevlerini arama, filtreleme ve sıralama. Takım detayında atanan kişi, proje ve etikete göre filtreleme de bulunur.
- Takım görevlerinde liste, sürükle-bırak destekli Kanban ve aylık takvim görünümleri. Mobil Kanban kartlarında durum seçimi bulunur; takvim görevleri teslim tarihine göre yerleştirir.
- Her görev için açıklama, sorumlular, durum/öncelik, tarih planı ve zaman çizelgesini gösteren detay ekranı; yetkiye bağlı durum değiştirme, düzenleme ve silme işlemleri.
- Görev detayında takım üyelerinin yorum yazması ve `@Ad Soyad` ile bahsetmesi. Bahsedilen üyeye ve görev katılımcılarına kalıcı bildirim gönderilir. Takım yöneticileri yorumları onayla siler; işlem değişiklik geçmişine kaydedilir.
- Görev ataması, yorum ve durum değişiklikleri için okunmamış sayılı bildirim kutusu; yaklaşan ve geciken teslimler için uygulama içi hatırlatmalar. Bildirimler açık panelde dakikada bir yenilenir.
- Görev oluşturma, yorum ve alan değişikliklerinin aktör, zaman, eski ve yeni değerleriyle kaydedildiği gerçek değişiklik geçmişi.
- `/panel` genel bakışı ve `/panel/analitik` sayfasında tamamlanma oranı, geciken/yaklaşan görevler, durum dağılımı ve takım bazlı iş yükü.
- Takım bazlı projeler, renkli görev etiketleri ve tekrar eden iş akışlarını hızlandıran görev şablonları. Proje ve etiketler görev oluşturma/düzenleme akışlarında seçilebilir ve görev listesinde filtrelenebilir.
- Kullanıcı profilinde mevcut şifre doğrulamasıyla şifre değiştirme ve yeni adrese gönderilen, 5 dakika geçerli tek kullanımlık kodla e-posta değiştirme.
- Profil fotoğrafı yükleme (ImgBB): PNG, JPG, JPEG veya WEBP; en fazla 3 MB. Dairesel avatar için 512 × 512 px kare görsel önerilir. Fotoğraf profil ve panel üst çubuğunda gösterilir.
- İşlem geri bildirimleri için Sonner bildirimleri ve mobil uyumlu arayüz.

## Teknoloji ve gereksinimler

| Alan | Kullanılan teknoloji |
| --- | --- |
| Uygulama | Next.js 16 App Router, React 19, TypeScript |
| Arayüz | Tailwind CSS 4, Radix UI / shadcn/ui bileşenleri, Lucide, Sonner |
| Form ve istemci durumu | React Hook Form, Zod, Zustand |
| Sunucu ve veri | Next.js Route Handlers, MySQL, `mysql2` |
| Kimlik doğrulama | `bcryptjs`, `jsonwebtoken`, `nodemailer` |

MySQL, npm ve en az Node.js **20.9.0** gerekir. Test komutundaki `--experimental-strip-types` seçeneği için Node.js 22 veya üzeri kullanın. E-posta kodlarının gönderimi için SMTP, profil fotoğrafı yükleme için ImgBB API anahtarı gerekir.

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

   Var olan bir kurulumda **önce veritabanını yedekleyin**, ardından henüz uygulanmamış migrasyonları numara sırasıyla çalıştırın. Aşağıdaki liste, henüz hiçbir migrasyonun uygulanmadığı eski kurulum içindir; uygulanmış `ALTER TABLE` migrasyonlarını tekrar çalıştırmayın:

   ```sql
   USE `task-app-nextjs`;
   SOURCE database/migrations/001_expand_password_hash_column.sql;
   SOURCE database/migrations/002_add_session_version.sql;
   SOURCE database/migrations/003_add_verification_attempts.sql;
   SOURCE database/migrations/004_add_projects_labels_templates.sql;
   SOURCE database/migrations/005_add_profile_email_change_codes.sql;
   SOURCE database/migrations/006_add_user_avatar_url.sql;
   SOURCE database/migrations/007_add_task_collaboration.sql;
   ```

   `001` şifre alanını genişletir; eski SHA-256 hash'leri başarılı girişte bcrypt'e çevrilir. `002` oturum sürümünü, `003` kod deneme sayaçlarını ekler. `004` proje/etiket/şablon tablolarını, `005` profil e-posta değişikliği kodu tablosunu, `006` ise `users.avatar_url` alanını oluşturur. `007` yorum, bahsetme, görev hareketi ve bildirim tablolarını ekler. Yeni kurulumda `schema.sql` yeterlidir; migrasyonları ayrıca çalıştırmayın.

3. [`env.example`](env.example) dosyasını `.env.local` olarak kopyalayıp kendi değerlerinizi girin. PowerShell'de:

   ```powershell
   Copy-Item env.example .env.local
   ```

   macOS/Linux'ta `cp env.example .env.local` kullanabilirsiniz. `DB_*`, `APP_ORIGIN`, güçlü `JWT_SECRET` / `OTP_SECRET` ve SMTP ayarlarını doldurun. Profil fotoğrafı kullanılacaksa [ImgBB API](https://api.imgbb.com/) anahtarını `IMGBB_API_KEY` olarak ekleyin.

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
| `IMGBB_API_KEY` | ImgBB API anahtarı; profil fotoğrafını sunucu üzerinden yüklemek için gereklidir. Tarayıcıya gönderilmez. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Kayıt doğrulama, şifre sıfırlama ve e-posta değiştirme kodlarının gönderimi. |
| `NODE_ENV` | Ortam türü; normalde Next.js tarafından belirlenir. |

`NEXT_PUBLIC_*` değişkenleri istemciye açıktır; `IMGBB_API_KEY`, SMTP şifresi ve JWT/OTP anahtarlarını bu önekle tanımlamayın. Gerçek `.env.local` dosyasını sürüm kontrolüne eklemeyin. ImgBB anahtarı tanımlı değilse fotoğraf yükleme ucu `503` döner.

Profil fotoğrafı için [ImgBB API](https://api.imgbb.com/) anahtarını yerel ortamda proje kökündeki `.env.local` dosyasına `IMGBB_API_KEY=anahtariniz` olarak yazın. cPanel'de aynı adı Node.js uygulamasının ortam değişkenlerine ekleyin ve uygulamayı yeniden başlatın. Anahtar yalnızca sunucudaki yükleme isteğinde kullanılır.

### Üretim ve cPanel

Önce yeni veritabanı şemasını veya eksik migrasyonları uygulayın; görev API'leri `007` ile eklenen tabloları kullanır. Ardından üretim derlemesini alın:

```bash
npm ci
npm run build
```

`next.config.ts` bağımsız (`standalone`) çıktı üretir. `public` klasörünü `.next/standalone/public` konumuna, `.next/static` klasörünü de `.next/standalone/.next/static` konumuna kopyalayın. cPanel'de Node.js giriş noktası olarak `.next/standalone/server.js` dosyasını ayarlayın veya sunucuda `node .next/standalone/server.js` komutunu çalıştırın.

cPanel ortam değişkenlerinde `DB_*`, `JWT_SECRET`, `OTP_SECRET`, SMTP ayarları, `IMGBB_API_KEY` ve kullanıcıların tarayıcıda açtığı HTTPS adresiyle eşleşen `APP_ORIGIN` değerini tanımlayın:

```env
APP_ORIGIN=https://task.example.com
```

Ortam değişkenleri değiştirildikten sonra Node.js uygulamasını cPanel üzerinden yeniden başlatın. Reverse proxy, `Host` ve `X-Forwarded-*` başlıklarını uygulamaya aktarmalıdır. `APP_ORIGIN` birden fazla adres için virgülle ayrılmış liste kabul eder.

## Sayfalar ve kullanım

| Yol | Açıklama |
| --- | --- |
| `/` | Açılış sayfası. |
| `/kayit`, `/giris` | Hesap oluşturma ve giriş. |
| `/eposta-dogrulama` | E-posta adresi ve 6 haneli kodla hesap doğrulama. |
| `/sifremi-unuttum` | 6 haneli kod isteme ve kodla yeni şifre belirleme. |
| `/sifre-sifirla` | Eski bağlantılar için `/sifremi-unuttum` yoluna yönlendirir. |
| `/panel` | Çalışma alanı özeti ve diğer panel sayfalarına kısayollar. |
| `/panel/analitik` | Kullanıcıya atanan görevlerin ilerleme ve iş yükü analitiği. |
| `/panel/takimlar` | Üyesi olunan takımlar ve yeni takım oluşturma. |
| `/panel/gorevler` | Kullanıcıya atanan görevler; arama, filtreleme ve sıralama. |
| `/panel/profil` | Hesap bilgileri ve profil fotoğrafı; mevcut şifre doğrulamasıyla şifre ve e-posta değiştirme. |
| `/panel/takimlar/[takimId]` | Takım üyeleri ve görevleri. |
| `/panel/takimlar/[takimId]/gorevler/[gorevId]` | Görev ayrıntıları ve yetkili görev işlemleri. |

Tanımsız adreslerde özel 404 ekranı gösterilir. `proxy.ts`, oturum açmamış kullanıcıları `/panel` altındaki sayfalardan girişe yönlendirir ve API'deki durum değiştiren çapraz site isteklerini reddeder. API uçları oturum ve yetki kontrollerini ayrıca kendi Route Handler'larında yapar. Takım detayı, üyeler, görevler, yorumlar ve görev kaynakları yalnızca takımın güncel üyelerine açılır; takımdan çıkarılan kişinin eski görevleri kişisel görev listesinde de gösterilmez.

Görev durumları `pending`, `in_progress`, `completed`, `cancelled`; öncelikler `low`, `medium`, `high` değerlerini kullanır. Arama başlık ve açıklamayı kapsar; kullanıcı görevlerinde takım/atayan, takım detayında atanan/atayan ve proje/etiket bilgileri de aranır. Sıralama seçenekleri en yeni, en eski, yakın teslim tarihi ve önceliktir. Takım, üye, görev (durum değişikliği dahil), proje, etiket ve şablon yönetimi takımda `admin` rolüne sahip kullanıcılara açıktır; takım üyeleri görevleri okuyabilir ve yorum yazabilir. Sol menüdeki proje kısayolları kullanıcıya atanan görevlerden türetilir ve ilgili görev işlemlerinden sonra güncellenir.

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
| GET, PUT, DELETE | `/takimlar/[takimId]/gorevler/[gorevId]` | Görev detayı (yorum ve hareketlerle) / güncelleme / silme. |
| POST | `/takimlar/[takimId]/gorevler/[gorevId]/yorumlar` | Takım üyesi olarak yorum ve `mentionIds` ile bahsetme ekleme. |
| DELETE | `/takimlar/[takimId]/gorevler/[gorevId]/yorumlar/[yorumId]` | Takım yöneticisi tarafından yorum silme; işlem geçmişe kaydedilir. |
| GET, POST, DELETE | `/takimlar/[takimId]/gorev-yapilandirma` | Proje, etiket ve görev şablonlarını listeleme / oluşturma / silme. |
| GET | `/kullanici/gorevler` | Kullanıcıya atanan görevler. |
| GET, PATCH | `/kullanici/bildirimler` | Bildirim kutusu ve teslim hatırlatmaları / bildirimi veya tümünü okundu işaretleme. |
| GET, POST | `/kullanici/profil` | Profil bilgisini getirme; şifre değiştirme, e-posta değişikliği kodu isteme ve kodu doğrulama işlemleri. |
| POST | `/kullanici/profil/fotograf` | Profil fotoğrafını doğrulayıp ImgBB'ye yükleme; dönen adresi kullanıcıya kaydetme. |

Örneğin giriş isteği:

```http
POST /api/kimlik/giris
Content-Type: application/json

{"email":"ornek@alanadi.com","password":"OrnekSifre123"}
```

## Şifreler ve güvenlik durumu

Yeni parolalar `bcryptjs` ile **12 maliyet faktörü** kullanılarak hash'lenir; düz metin veya yeni SHA-256 hash'i saklanmaz. Parola en az 8 karakter olmalı; büyük harf, küçük harf ve rakam içermeli ve bcrypt sınırı nedeniyle UTF-8 olarak 72 baytı aşmamalıdır. Eski SHA-256 hash'leri yalnızca geçiş dönemi için doğrulanır ve başarılı girişte bcrypt'e çevrilir. Hesap doğrulama, şifre sıfırlama ve profil e-posta değişikliği kodları 6 hanelidir, 5 dakika geçerlidir ve kod başına en fazla 5 deneme kabul edilir; veritabanında sunucu anahtarlı HMAC özeti saklanır. Profilde şifre veya e-posta değişikliğinde mevcut şifre de doğrulanır.

Oturum JWT'si `auth-token` adlı `httpOnly`, `SameSite=Lax` çerezde saklanır; `Secure` niteliği canlı ortamda etkinleşir ve çerez 7 gün geçerlidir. Token algoritması, yayıncı ve hedef kitle değerleri doğrulanır. Kullanıcı devre dışı bırakıldığında oturum reddedilir; şifre veya e-posta değişikliğinde diğer oturumlar geçersizleşir, işlemi yapan tarayıcıya yeni çerez verilir. Canlı ortam için HTTPS ve güçlü bir `JWT_SECRET` gereklidir.

Kimlik ve profil işlemlerinde istek hız sınırlaması; durum değiştiren API isteklerinde kaynak denetimi; JSON API'lerinde 32 KB `Content-Length` kontrolü; uygulama genelinde CSP, HSTS, clickjacking/MIME/referrer güvenlik başlıkları bulunur. Fotoğraf yüklemede uzantı, MIME türü, dosya imzası ve 3 MB dosya sınırı sunucuda da denetlenir. Fotoğraflar ImgBB'de barındırılır; yeni fotoğraf eski adresin yerini alır, ancak önceki yükleme ImgBB'den otomatik silinmez. Uygulama birden fazla sunucu örneğinde çalıştırılacaksa bellek içi hız sınırlayıcı yerine Redis gibi ortak bir depo kullanılmalıdır.

## Proje yapısı

```text
app/                      Sayfalar ve API Route Handler'ları
app/panel/                Genel bakış, analitik, takımlar, görevler ve profil
components/dashboard/     Ortak panel kabuğu ve analitik/görev bileşenleri
components/tasks/         Liste, Kanban, takvim, filtre ve görev diyalogları
components/teams/         Takım kartları ve üye yönetimi
components/users/         Profil/avatar bileşenleri
components/ui/            Ortak Radix/shadcn tabanlı bileşenler
lib/                      DB, kimlik doğrulama, veri kancaları ve yardımcılar
database/schema.sql       Yeni kurulum şeması
database/migrations/      Var olan veritabanı için numaralı SQL migrasyonları
tests/                    Görev filtresi ve güvenlik testleri
proxy.ts                  Sayfa koruması ve API kaynak denetimi
env.example               Ortam değişkenleri örneği
```

## Komutlar ve kontroller

```bash
npm run dev
npm run build
npm run lint
npx tsc --noEmit
node --experimental-strip-types --test tests/task-filters.test.mjs tests/security.test.mjs tests/task-collaboration.test.mjs
```

Üretimde standalone sunucuyu `node .next/standalone/server.js` ile başlatın. Node test komutu, görev filtreleri ile güvenlik yardımcılarının doğrulamalarını çalıştırır.
