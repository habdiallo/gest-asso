## Context

`SessionCookieService` construit actuellement le cookie de session avec `.secure(true)` en dur et utilise le nom `__Host-contribo-session`. Le frontend du compose local écoute en HTTP, donc le navigateur n'enregistre pas ce cookie et le parcours de connexion ne peut pas être testé.

Le préfixe `__Host-` impose à un cookie d'être sécurisé, sans attribut `Domain` et avec `Path=/`. Il est donc impossible de rendre uniquement `Secure` faux tout en conservant ce nom en HTTP. Le changement concerne le backend, la configuration Spring, les compositions de déploiement et les tests d'authentification. Aucune migration de données n'est nécessaire.

## Goals / Non-Goals

**Goals:**

- Conserver le comportement sécurisé par défaut et dans les environnements non locaux.
- Permettre explicitement le développement local en HTTP.
- Garantir que le cookie d'émission et le cookie d'expiration utilisent le même réglage et le même nom.
- Empêcher une combinaison invalide entre le préfixe `__Host-` et `Secure=false`.
- Tester le mode sécurisé, le mode local et la valeur par défaut.

**Non-Goals:**

- Modifier la durée de vie, `HttpOnly`, `SameSite` ou `Path` du cookie.
- Modifier le mécanisme CSRF ou exposer le cookie de session au JavaScript.
- Ajouter une nouvelle dépendance ou une migration de base de données.
- Remplacer le HTTP local par HTTPS dans ce ticket. HTTPS local reste une alternative documentée si le choix d'un cookie non sécurisé est refusé.

## Decisions

### Configuration unique avec défaut sécurisé

Ajouter une propriété Spring dédiée à la sécurité du cookie, alimentée par une variable d'environnement et avec `true` comme valeur par défaut. Le compose local fournit explicitement `false`. Les compositions d'intégration et de production fournissent explicitement `true` ou conservent une valeur équivalente contrôlée par leur environnement.

Le nom de configuration doit être documenté dans `application.yaml` et dans les exemples d'environnement. La valeur absente ne doit jamais désactiver `Secure`.

Alternative écartée: déduire le réglage de l'URL de la requête. Cette approche rend le comportement dépendant du proxy et pourrait désactiver la protection à cause d'une mauvaise détection du protocole.

### Nom dérivé du mode de sécurité

Le service dérive le nom du cookie à partir du réglage:

- `Secure=true`: `__Host-contribo-session`, avec `HttpOnly`, `SameSite=Strict` et `Path=/`.
- `Secure=false`: `contribo-session`, sans préfixe réservé, avec les mêmes attributs applicatifs et `Secure=false`.

La lecture de session et la vérification CSRF doivent utiliser le nom exposé par le service, et non une constante indépendante. Le mode local ne doit pas permettre de configurer librement un nom qui pourrait donner l'impression de respecter les garanties `__Host-`.

Alternative écartée: conserver `__Host-contribo-session` avec `Secure=false`, car les navigateurs doivent rejeter ce cookie.

### Déploiement et validation

Le compose de développement local active explicitement le mode non sécurisé. Les compositions d'intégration et de Portainer ainsi que leurs exemples restent sécurisés. Les tests HTTP vérifient les attributs du cookie de session et du cookie d'expiration dans les deux modes, ainsi que l'absence de régression sur la lecture et la déconnexion.

Le contrat OpenAPI conserve le cookie sécurisé de production comme référence et documente la variante de développement local si elle est exposée dans les exemples d'exécution.

## Risks / Trade-offs

- [Risque] Une configuration `false` déployée par erreur réduit la protection du cookie. -> La valeur par défaut est `true`, les environnements non locaux la fixent explicitement à `true` et la revue vérifie les fichiers Compose et exemples concernés.
- [Risque] Le passage d'un mode à l'autre laisse un ancien cookie dans le navigateur. -> Le changement de nom force une nouvelle authentification dans le nouveau mode; les tests couvrent l'émission et l'expiration du nom actif.
- [Risque] Des tests existants supposent le nom `__Host-contribo-session`. -> Centraliser le nom dans `SessionCookieService` et mettre à jour les assertions pour distinguer le mode sécurisé du mode local.
- [Compromis] Le mode HTTP local est moins protecteur que HTTPS. -> Il est limité au développement local, reste opt-in dans la configuration applicative et HTTPS local demeure l'alternative la plus proche de la production.

## Migration Plan

1. Ajouter la propriété avec le défaut sécurisé et le nom dérivé.
2. Mettre à jour les tests backend et les fichiers de configuration local, intégration et Portainer.
3. Tester le login, une requête authentifiée et la déconnexion en HTTP local.
4. Tester que l'intégration et la production émettent toujours le cookie `__Host-` sécurisé.
5. En cas de retour arrière, supprimer la variable locale et rétablir le service actuel. Les utilisateurs devront se reconnecter après un changement de nom de cookie.

## Open Questions

Aucune pour cette implémentation. La variable retenue est `SESSION_COOKIE_SECURE`,
le mode local utilise `contribo-session` et le contrat OpenAPI décrit la variante
locale dans sa description tout en conservant le cookie sécurisé comme référence.
