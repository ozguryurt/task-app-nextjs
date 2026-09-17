-- 6 haneli doğrulama kodlarında kod başına kalıcı deneme sınırı tutar.
ALTER TABLE users
    ADD COLUMN email_verification_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER email_verification_expires,
    ADD COLUMN password_reset_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER password_reset_expires;
