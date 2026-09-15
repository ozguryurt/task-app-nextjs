-- Mevcut SHA-256 kayıtlarını silmeden bcrypt hash'leri için alanı genişletir.
-- Eski hash'ler, kullanıcının ilk başarılı girişinde otomatik olarak bcrypt'e yükseltilir.
ALTER TABLE users
    MODIFY COLUMN password VARCHAR(255) NOT NULL COMMENT 'bcrypt hash';
