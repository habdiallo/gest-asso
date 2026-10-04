# Migration des identifiants membres

La migration Flyway `V4__migrate_phone_member_identifiers.sql` s'exécute automatiquement au démarrage du backend. Elle cible uniquement les comptes de rôle `MEMBER` dont l'identifiant est encore égal au téléphone du membre.

Elle conserve les UUID, les mots de passe hashés, les rôles, les associations et les historiques. Les anciennes et nouvelles valeurs sont enregistrées dans `user_account_identifier_migration_t200` afin de permettre un contrôle et un rollback ciblé.

La migration `V5__repair_member_identifiers_locale.sql` s'exécute ensuite automatiquement. Elle ne recalcule que les comptes présents dans l'audit T-200 et conserve le suffixe numérique déjà attribué par V4. Elle corrige notamment les initiales issues de majuscules accentuées, sans dépendre de la locale PostgreSQL. Les corrections sont enregistrées dans `user_account_identifier_correction_t204`.

## Contrôle après déploiement

Depuis un poste ayant accès à PostgreSQL, ne pas afficher de mot de passe :

```sql
SELECT account_id, association_id, old_identifier, new_identifier, migrated_at
FROM user_account_identifier_migration_t200
ORDER BY migrated_at;
```

Vérifier ensuite que les comptes attendus utilisent bien `new_identifier`, puis transmettre ces identifiants aux utilisateurs par un canal privé. Le mot de passe n'est pas modifié par cette migration.

Après le déploiement de la version contenant V5, contrôler les corrections réellement effectuées :

```sql
SELECT account_id, association_id, previous_identifier, corrected_identifier, corrected_at
FROM user_account_identifier_correction_t204
ORDER BY corrected_at, account_id;
```

Pour chaque ligne, vérifier que le suffixe à quatre chiffres est identique entre `previous_identifier` et `corrected_identifier`, que `account_id` est inchangé et qu'aucune collision n'existe dans l'association :

```sql
SELECT association_id, corrected_identifier, COUNT(*) AS occurrences
FROM user_account_identifier_correction_t204
GROUP BY association_id, corrected_identifier
HAVING COUNT(*) > 1;
```

Une migration V5 qui rencontre une collision ou un identifiant T-200 sans suffixe conforme échoue entièrement. Dans ce cas, Flyway ne valide pas V5 et aucune correction partielle ni table d'audit persistante ne doit être utilisée comme preuve de succès. Corriger la donnée en conflit, puis redéployer la même version.

## Rollback exceptionnel

Après arrêt du backend et validation de la sauvegarde, la restauration doit être exécutée dans une transaction :

```sql
BEGIN;

UPDATE user_accounts ua
SET identifier = backup.previous_identifier,
    updated_at = CURRENT_TIMESTAMP
FROM user_account_identifier_correction_t204 backup
WHERE ua.id = backup.account_id
  AND ua.identifier = backup.corrected_identifier
  AND NOT EXISTS (
      SELECT 1
      FROM user_accounts conflict
      WHERE conflict.association_id = backup.association_id
        AND conflict.identifier = backup.previous_identifier
        AND conflict.id <> ua.id
  );

COMMIT;
```

Avant de valider, contrôler le nombre de lignes modifiées et vérifier qu'il correspond aux lignes attendues de l'audit T-204. Une ligne exclue par la clause `NOT EXISTS` doit être traitée manuellement après analyse, jamais forcée par une désactivation de contrainte. Le rollback ne supprime ni compte ni historique. Il doit être suivi d'un redéploiement de la version précédente et d'une vérification de connexion.

### Revenir aux identifiants d'avant T-200

Si le rollback doit également annuler la migration V4 et restaurer les identifiants téléphone, utiliser l'audit T-200. La valeur courante peut encore être `new_identifier` si V5 n'a pas corrigé le compte, ou `corrected_identifier` si V5 l'a corrigé. La jointure externe conserve donc les comptes T-200 sans ligne T-204 :

```sql
BEGIN;

UPDATE user_accounts ua
SET identifier = t200.old_identifier,
    updated_at = CURRENT_TIMESTAMP
FROM user_account_identifier_migration_t200 t200
LEFT JOIN user_account_identifier_correction_t204 t204
  ON t204.account_id = t200.account_id
WHERE ua.id = t200.account_id
  AND (
      ua.identifier = t200.new_identifier
      OR ua.identifier = t204.corrected_identifier
  )
  AND NOT EXISTS (
      SELECT 1
      FROM user_accounts conflict
      WHERE conflict.association_id = t200.association_id
        AND conflict.identifier = t200.old_identifier
        AND conflict.id <> ua.id
  );

COMMIT;
```

Avant de valider, contrôler le nombre de lignes modifiées et le comparer aux comptes T-200 dont l'identifiant courant vaut `new_identifier` ou `corrected_identifier`. Une ligne exclue par la clause `NOT EXISTS` doit être traitée manuellement après analyse, jamais forcée par une désactivation de contrainte. Cette procédure ne supprime ni compte ni audit et doit être suivie d'un redéploiement de la version précédente et d'une vérification de connexion.
