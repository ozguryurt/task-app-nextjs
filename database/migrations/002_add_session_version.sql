-- Şifre değişikliğinde daha önce verilmiş JWT oturumlarını geçersiz kılmak için kullanılır.
ALTER TABLE users
    ADD COLUMN session_version INT UNSIGNED NOT NULL DEFAULT 0 AFTER is_active;
