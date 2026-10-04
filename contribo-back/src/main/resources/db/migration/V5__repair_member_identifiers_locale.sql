CREATE TABLE user_account_identifier_correction_t204 (
    account_id UUID PRIMARY KEY,
    association_id UUID NOT NULL,
    previous_identifier VARCHAR(150) NOT NULL,
    corrected_identifier VARCHAR(150) NOT NULL,
    corrected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
DECLARE
    account_row RECORD;
    normalized_first_name TEXT;
    initials TEXT;
    normalized_last_name TEXT;
    prefix TEXT;
    suffix TEXT;
    candidate TEXT;
    character_index INTEGER;
    source_characters CONSTANT TEXT[] := ARRAY[
        'À', 'Á', 'Â', 'Ä', 'Ã', 'Å', 'Ç', 'É', 'È', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ñ',
        'Ò', 'Ó', 'Ô', 'Ö', 'Õ', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'Ÿ',
        'à', 'á', 'â', 'ä', 'ã', 'å', 'ç', 'é', 'è', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ñ',
        'ò', 'ó', 'ô', 'ö', 'õ', 'ù', 'ú', 'û', 'ü', 'ý', 'ÿ'
    ];
    target_characters CONSTANT TEXT[] := ARRAY[
        'a', 'a', 'a', 'a', 'a', 'a', 'c', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'n',
        'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'u', 'y', 'y',
        'a', 'a', 'a', 'a', 'a', 'a', 'c', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'n',
        'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'u', 'y', 'y'
    ];
BEGIN
    FOR account_row IN
        SELECT ua.id,
               ua.association_id,
               ua.identifier,
               m.first_name,
               m.last_name
          FROM user_accounts ua
          JOIN members m ON m.id = ua.member_id
          JOIN user_account_identifier_migration_t200 migration
            ON migration.account_id = ua.id
           AND migration.new_identifier = ua.identifier
         ORDER BY ua.id
    LOOP
        suffix := substring(account_row.identifier FROM '-([0-9]{4})$');
        IF suffix IS NULL THEN
            RAISE EXCEPTION
                'T-204: identifier % for account % has no four-digit suffix',
                account_row.identifier,
                account_row.id;
        END IF;

        normalized_first_name := coalesce(account_row.first_name, '');
        FOR character_index IN 1..array_length(source_characters, 1)
        LOOP
            normalized_first_name := replace(
                normalized_first_name,
                source_characters[character_index],
                target_characters[character_index]
            );
        END LOOP;
        normalized_first_name := regexp_replace(
            lower(normalized_first_name),
            '[^a-z0-9 ]',
            ' ',
            'g');
        SELECT coalesce(string_agg(match[2], '' ORDER BY ordinal), '')
          INTO initials
          FROM regexp_matches(
                   trim(regexp_replace(normalized_first_name, ' +', ' ', 'g')),
                   '(^| )([a-z0-9])[^ ]*',
                   'g'
               ) WITH ORDINALITY AS matches(match, ordinal);

        normalized_last_name := coalesce(account_row.last_name, '');
        FOR character_index IN 1..array_length(source_characters, 1)
        LOOP
            normalized_last_name := replace(
                normalized_last_name,
                source_characters[character_index],
                target_characters[character_index]
            );
        END LOOP;
        normalized_last_name := regexp_replace(
            lower(normalized_last_name),
            '[^a-z0-9]',
            '',
            'g');
        prefix := left(coalesce(nullif(initials || normalized_last_name, ''), 'member'), 145);
        candidate := prefix || '-' || suffix;

        IF candidate <> account_row.identifier THEN
            IF EXISTS (
                SELECT 1
                  FROM user_accounts existing
                 WHERE existing.association_id = account_row.association_id
                   AND existing.identifier = candidate
                   AND existing.id <> account_row.id
            ) THEN
                RAISE EXCEPTION
                    'T-204: identifier collision for account %, candidate %',
                    account_row.id,
                    candidate;
            END IF;

            INSERT INTO user_account_identifier_correction_t204 (
                account_id,
                association_id,
                previous_identifier,
                corrected_identifier
            )
            VALUES (
                account_row.id,
                account_row.association_id,
                account_row.identifier,
                candidate
            );

            UPDATE user_accounts
               SET identifier = candidate,
                   updated_at = CURRENT_TIMESTAMP
             WHERE id = account_row.id;
        END IF;
    END LOOP;
END $$;
