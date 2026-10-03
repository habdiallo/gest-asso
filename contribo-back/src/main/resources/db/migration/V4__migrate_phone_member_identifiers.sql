CREATE TABLE user_account_identifier_migration_t200 (
    account_id UUID PRIMARY KEY,
    association_id UUID NOT NULL,
    old_identifier VARCHAR(150) NOT NULL,
    new_identifier VARCHAR(150) NOT NULL,
    migrated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
DECLARE
    account_row RECORD;
    normalized_first_name TEXT;
    initials TEXT;
    normalized_last_name TEXT;
    prefix TEXT;
    candidate TEXT;
    code INTEGER;
    attempts INTEGER;
BEGIN
    FOR account_row IN
        SELECT ua.id, ua.association_id, ua.identifier, m.first_name, m.last_name
          FROM user_accounts ua
          JOIN members m ON m.id = ua.member_id
         WHERE ua.role = 'MEMBER'
           AND m.phone IS NOT NULL
           AND ua.identifier = m.phone
           AND NOT EXISTS (
               SELECT 1
                 FROM user_account_identifier_migration_t200 backup
                WHERE backup.account_id = ua.id)
    LOOP
        normalized_first_name := regexp_replace(
            translate(lower(account_row.first_name),
                'àáâäãåçéèêëìíîïñòóôöõùúûüýÿ',
                'aaaaaaceeeeiiiinooooouuuuyy'),
            '[^a-z0-9 ]', ' ', 'g');
        SELECT coalesce(string_agg(match[2], '' ORDER BY ordinal), '')
          INTO initials
          FROM regexp_matches(trim(regexp_replace(normalized_first_name, ' +', ' ', 'g')),
                              '(^| )([a-z0-9])[^ ]*', 'g') WITH ORDINALITY AS matches(match, ordinal);
        normalized_last_name := regexp_replace(
            translate(lower(account_row.last_name),
                'àáâäãåçéèêëìíîïñòóôöõùúûüýÿ',
                'aaaaaaceeeeiiiinooooouuuuyy'),
            '[^a-z0-9]', '', 'g');
        prefix := left(coalesce(nullif(initials || normalized_last_name, ''), 'member'), 145);
        code := floor(random() * 10000)::INTEGER;
        attempts := 0;
        LOOP
            candidate := prefix || '-' || lpad(code::TEXT, 4, '0');
            EXIT WHEN NOT EXISTS (
                SELECT 1
                  FROM user_accounts existing
                 WHERE existing.association_id = account_row.association_id
                   AND existing.identifier = candidate);
            code := (code + 1) % 10000;
            attempts := attempts + 1;
            IF attempts >= 10000 THEN
                RAISE EXCEPTION 'No available member identifier for account %', account_row.id;
            END IF;
        END LOOP;
        INSERT INTO user_account_identifier_migration_t200 (
            account_id, association_id, old_identifier, new_identifier)
        VALUES (account_row.id, account_row.association_id, account_row.identifier, candidate);
        UPDATE user_accounts
           SET identifier = candidate, updated_at = CURRENT_TIMESTAMP
         WHERE id = account_row.id;
    END LOOP;
END $$;
