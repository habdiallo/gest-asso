## Context

La création d'un membre crée déjà une ligne `members` et une ligne
`user_accounts`, mais le mot de passe aléatoire n'est pas récupérable par la
personne qui doit le transmettre. Le backend ne possède pas encore d'état de
mot de passe temporaire, de changement de mot de passe ni de provisioning
idempotent du premier administrateur.

Le changement traverse le contrat OpenAPI, les migrations PostgreSQL, les
services d'authentification et de membres, les cookies JWT, les routes Angular
et les dialogues de gestion des membres et des utilisateurs. Il doit rester
compatible avec l'architecture `features/core/shared` du frontend et avec le
déploiement Docker et Portainer.

## Goals / Non-Goals

**Goals:**

- Provisionner un secret temporaire pour chaque nouveau compte concerné et le
  retourner une seule fois dans une réponse de création ou de régénération.
- Empêcher l'accès fonctionnel tant que le secret temporaire n'a pas été
  remplacé par un mot de passe choisi par l'utilisateur.
- Appliquer l'obligation aux comptes existants lors de la migration et aux
  comptes créés ultérieurement.
- Créer le premier administrateur de manière idempotente après les migrations,
  à partir d'un secret Docker monté en fichier.
- Permettre à un administrateur de régénérer un secret temporaire sans jamais
  révéler le mot de passe existant.
- Tracer les événements de provisioning, de changement et de régénération sans
  écrire de secret dans les journaux.

**Non-Goals:**

- Ajouter une inscription publique ou une récupération par email ou SMS.
- Envoyer automatiquement le mot de passe par email, SMS ou messagerie.
- Stocker un mot de passe en clair, même chiffré réversiblement, dans la base.
- Réinitialiser le mot de passe d'un administrateur existant à chaque démarrage.
- Changer le fournisseur de hashage ou le mécanisme général de session JWT.

## Decisions

### État persistant du compte

Ajouter `must_change_password BOOLEAN NOT NULL DEFAULT FALSE` à
`user_accounts`. La migration positionne l'état à `TRUE` pour les comptes
existants afin de respecter l'obligation globale demandée. Les créations et
les régénérations positionnent explicitement l'état à `TRUE`, tandis qu'un
changement réussi le remet à `FALSE`. Un horodatage `password_changed_at` est
également conservé pour l'audit sans stocker le secret.

L'alternative consistant à déduire l'état du format du hash est rejetée : elle
ne permet pas de distinguer un secret temporaire d'un mot de passe choisi et
rendrait les migrations et les réinitialisations fragiles.

### Contrats de création et de changement

Le `POST /members` utilise une réponse dédiée `MemberCreationResponse` qui
contient le membre, l'identifiant du compte et le mot de passe temporaire. Ce
champ n'est jamais inclus dans `GET /members`, `GET /members/{id}` ou les
listes. L'endpoint administrateur de régénération retourne la même structure
de secret temporaire, une seule fois.

Le mot de passe de confirmation du formulaire frontend reste local au
navigateur et n'est pas envoyé au backend. Le backend applique la politique de
mot de passe sur la valeur finale et ne journalise jamais les champs sensibles.

### Session limitée de première connexion

Le JWT émis après une authentification valide d'un compte marqué
`must_change_password` porte une revendication de session limitée. Le filtre
JWT transmet cet état à Spring Security. Une règle backend autorise seulement
la lecture minimale de session, le changement de mot de passe et la
déconnexion, et refuse les autres endpoints avec un code stable
`PASSWORD_CHANGE_REQUIRED`.

`POST /auth/password/change` valide le nouveau mot de passe, remet l'état à
`FALSE`, révoque le jeton temporaire et émet une session normale. Cette
restriction côté serveur est nécessaire même si le frontend redirige déjà
l'utilisateur vers l'écran de changement.

### Parcours frontend

Le feature `auth` ajoute une route lazy `change-password`. Le service de
session conserve l'état retourné par l'API et le garde de navigation dirige
une session limitée vers cette route. Après succès, la réponse remplace la
session et redirige vers le tableau de bord autorisé par le rôle.

Le feature `members` utilise une confirmation persistante jusqu'à fermeture,
avec identifiant, mot de passe temporaire, bouton de copie accessible et
indication d'état de copie. Le mot de passe n'est pas écrit dans
`localStorage`, dans une URL ou dans les données persistantes du formulaire.

Le feature `roles-users` expose une action de régénération uniquement à
l'Administrateur. L'action affiche le même panneau de copie et rappelle que
l'ancien secret est invalidé.

### Bootstrap du premier administrateur

Un composant de démarrage transactionnel s'exécute après Flyway. Il est actif
uniquement si `BOOTSTRAP_ADMIN_ENABLED=true`. Il lit
`BOOTSTRAP_ADMIN_PASSWORD_FILE`, crée une association, une catégorie de revenu
initiale, un membre et son compte Administrateur sur une base vide, puis marque
le compte pour un changement obligatoire.

Le composant est idempotent : si le compte identifié existe déjà, il ne modifie
ni son mot de passe ni son rôle. Si la configuration est activée mais
incomplète, le démarrage échoue explicitement. Le mot de passe en variable
`BOOTSTRAP_ADMIN_PASSWORD` reste un secours réservé au développement local.
Portainer utilise un secret Docker monté en fichier et la documentation demande
de le retirer ou de désactiver le bootstrap après l'activation initiale.

### Réinitialisation et révocation

`POST /users/{userId}/credentials/reset` est réservé à l'Administrateur. Il
génère un secret temporaire aléatoire, remplace son hash, active
`must_change_password`, révoque les sessions connues et retourne le secret une
seule fois. Les événements de changement et de régénération sont consignés
sans identifiant sensible dans les messages de log.

## Risks / Trade-offs

- [Risk] L'administrateur ferme la confirmation avant de copier le secret. ->
  Ajouter la régénération réservée à l'Administrateur et ne jamais essayer de
  retrouver le secret existant.
- [Risk] Le frontend redirige mais une API reste accessible avec le JWT temporaire. ->
  Porter la restriction dans le JWT et dans les règles backend, puis tester
  chaque endpoint sensible.
- [Risk] Une variable d'environnement expose le mot de passe initial dans Docker. ->
  Utiliser un secret Docker monté en fichier en production et limiter la
  variable directe au profil local.
- [Risk] La migration bloque tous les comptes existants au prochain login. ->
  Documenter la rupture, fournir la régénération administrateur et déployer la
  nouvelle UI avant l'activation de la migration en production.
- [Risk] Un redémarrage recrée un administrateur ou écrase son mot de passe. ->
  Rendre le bootstrap idempotent et ne jamais mettre à jour un compte existant.
- [Trade-off] Le contrat de création de membre change de type de réponse. ->
  Mettre à jour OpenAPI, le client généré, les handlers MSW et les tests dans la
  même livraison.

## Migration Plan

1. Ajouter le schéma et les codes d'erreur compatibles avec l'ancien code.
2. Ajouter les services backend de changement, régénération et bootstrap sans
   activer encore l'interface de production.
3. Ajouter le contrat OpenAPI, les clients générés et les parcours Angular.
4. Déployer la version complète avec la migration qui marque les comptes
   existants, puis vérifier le changement obligatoire d'un compte de chaque rôle.
5. Configurer le secret Docker du premier administrateur sur une base vide,
   effectuer sa première connexion et retirer le secret de bootstrap.

En cas de retour arrière, l'ancienne application peut ignorer les nouvelles
colonnes et conserver les lignes existantes, mais elle ne doit pas être utilisée
pour l'activation des comptes déjà marqués. Le retour arrière fonctionnel doit
donc être accompagné d'une décision explicite sur les comptes bloqués et d'une
réactivation contrôlée.

## Open Questions

- Confirmer la longueur minimale du mot de passe, avec une recommandation de 12
  caractères et une longueur maximale raisonnable pour les phrases secrètes.
- Confirmer le libellé et la devise de l'association créée automatiquement sur
  une base vide.
- Confirmer si l'administrateur de bootstrap doit être créé uniquement sur une
  base sans compte ou si une association existante sans compte doit être
  ciblable par un identifiant de configuration.
