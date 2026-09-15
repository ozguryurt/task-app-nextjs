-- Mevcut SHA-256 kayıtlarını silmeden Argon2id PHC hash'leri için alanı genişletir.
-- Eski hash'ler, kullanıcının ilk başarılı girişinde otomatik olarak Argon2id'e yükseltilir.
ALTER TABLE users
    MODIFY COLUMN password VARCHAR(255) NOT NULL COMMENT 'Argon2id PHC hash';
