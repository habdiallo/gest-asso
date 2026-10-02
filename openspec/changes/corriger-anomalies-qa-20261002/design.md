## Contexte

Les anomalies ont été observées dans un environnement local autorisé avec un compte administrateur et un membre de recette créé pour la campagne. Les preuves persistées dans `qa/runs/` sont expurgées et ne contiennent pas de mot de passe, cookie ou token.

## Décisions

### T-190, garde de session

La route `/mon-espace` doit utiliser la même garde de session active que les routes métier déjà protégées. Une session authentifiée mais marquée `mustChangePassword` doit être redirigée vers `/changer-mot-de-passe`. Le correctif reste dans `app.routes.ts` et ajoute un test de non-régression sur la sélection de route.

### T-191, traductions

Les clés utilisées par le template du profil membre sont conservées. Les libellés français manquants sont ajoutés dans `contribo-front/src/assets/i18n/fr.json`, sans texte en dur dans le template.

### T-192, suivi QA

La PR de campagne contient les runs finaux et un index lisible. Les runs de préparation à zéro scénario restent utiles pour l'audit mais ne sont pas ajoutés à la PR de résultats afin de limiter le bruit. Le suivi distingue les scénarios exécutés, réussis, échoués, non applicables, bloqués et non couverts.

## Validation et retour arrière

- T-190 et T-191 : tests frontend ciblés, suite frontend et build.
- T-192 : contrôles de schéma des artefacts, registre OpenSpec et lecture du diff.
- Le retour arrière consiste à rétablir la branche cible sans les commits de la PR concernée. Les preuves QA restent des observations historiques et ne doivent pas être réécrites après correction.
