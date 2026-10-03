# Migration des identifiants membres

La migration Flyway `V4__migrate_phone_member_identifiers.sql` s'exécute automatiquement au démarrage du backend. Elle cible uniquement les comptes de rôle `MEMBER` dont l'identifiant est encore égal au téléphone du membre.

Elle conserve les UUID, les mots de passe hashés, les rôles, les associations et les historiques. Les anciennes et nouvelles valeurs sont enregistrées dans `user_account_identifier_migration_t200` afin de permettre un contrôle et un rollback ciblé.

## Contrôle après déploiement

Depuis un poste ayant accès à PostgreSQL, ne pas afficher de mot de passe :

```sql
SELECT account_id, association_id, old_identifier, new_identifier, migrated_at
FROM user_account_identifier_migration_t200
ORDER BY migrated_at;
```

Vérifier ensuite que les comptes attendus utilisent bien `new_identifier`, puis transmettre ces identifiants aux utilisateurs par un canal privé. Le mot de passe n'est pas modifié par cette migration.

## Rollback exceptionnel

Après arrêt du backend et validation de la sauvegarde, la restauration doit être exécutée dans une transaction :

```sql
BEGIN;

UPDATE user_accounts ua
SET identifier = backup.old_identifier,
    updated_at = CURRENT_TIMESTAMP
FROM user_account_identifier_migration_t200 backup
WHERE ua.id = backup.account_id
  AND ua.identifier = backup.new_identifier;

COMMIT;
```

Le rollback ne supprime ni compte ni historique. Il doit être suivi d'un redéploiement de la version précédente et d'une vérification de connexion.
