ALTER TABLE user_accounts
    ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE user_accounts
    ADD COLUMN password_changed_at TIMESTAMP WITH TIME ZONE;

UPDATE user_accounts
   SET must_change_password = TRUE
 WHERE password_changed_at IS NULL;
