## Context

Le frontend Angular expose actuellement les parcours suivants : connexion et changement de mot de passe, tableau de bord, membres, catégories de revenu, campagnes de cotisation, cagnottes, utilisateurs et rôles, compte personnel et espace personnel du membre. Les routes et les fonctionnalités sont organisées par feature dans `contribo-front/src/app/features/`.

Le plan doit être exécutable sur un environnement intégrant le frontend et une API conforme à `besoins/openapi.yaml`. Il doit s'appuyer sur le cahier des user stories et les règles métier, notamment la séparation entre rôle applicatif et fonction associative, les quatre rôles disponibles et l'attribut global `operatorCanRecordPayments`.

Le tableau de bord est un point de contrôle de disponibilité important. Le ticket T-181 signale que `GET /dashboard` est absent sur la branche de référence actuelle. Le plan doit donc prévoir un contrôle de prérequis et signaler ce blocage sans le masquer par un résultat simulé.

## Goals / Non-Goals

**Goals:**

- Construire une campagne de tests manuels fonctionnels de bout en bout, reproductible et lisible par une équipe produit ou QA.
- Identifier les comptes, jeux de données, états métier et transitions nécessaires avant chaque parcours.
- Tester chaque fonctionnalité avec les rôles Administrateur, Trésorier, Opérateur et Membre.
- Tester séparément l'Opérateur autorisé et non autorisé à enregistrer des paiements ou contributions.
- Vérifier les succès, validations, erreurs API, états vides, chargements, recherches, filtres, pagination, mutations et rafraîchissements observables.
- Conserver les références aux US, RG, routes et opérations API pour faciliter l'analyse d'un écart.
- Préparer la réutilisation du plan pour une exécution de non-régression après chaque livraison fonctionnelle.

**Non-Goals:**

- Modifier le frontend, le backend, le contrat OpenAPI ou les données de production.
- Remplacer les tests unitaires et d'intégration automatisés existants.
- Mesurer le rendu visuel, les dimensions, le contraste ou la composition aux formats desktop, tablette et mobile.
- Tester une inscription libre, un paiement en ligne, une correction financière, une suppression définitive ou toute autre capacité explicitement hors MVP.

## Decisions

### Matrice de couverture par fonctionnalité, rôle et état

Le livrable sera organisé par domaine fonctionnel, puis par parcours nominal, erreur et autorisation. Chaque cas aura un identifiant stable, un prérequis, des étapes, un résultat attendu et des références métier.

La matrice couvrira au minimum :

- session et compte : connexion, erreur générique, hydratation, expiration, déconnexion et changement de mot de passe obligatoire ;
- navigation et tableau de bord : destination par rôle, items visibles, accès refusé et chargement des données ;
- membres : liste, recherche, filtres, pagination, création, consultation, modification selon le rôle, désactivation et réactivation ;
- catégories de revenu : consultation, création, modification et restriction Administrateur ;
- utilisateurs et rôles : consultation, recherche, filtre, attribution de rôle, droit Opérateur et réinitialisation des identifiants ;
- campagnes : création, filtres, détail, barème, préparation, ouverture, cotisations, règlements, paiements partiels, bilan et clôture ;
- cagnottes : création, filtres, détail, contribution d'un membre, contribution externe, suivi, pagination et clôture ;
- espace personnel : profil, cotisations et contributions propres au compte ;
- compte personnel : affichage du compte, thème disponible dans le périmètre fonctionnel et déconnexion.

### Comptes et données de recette dédiés

Le plan définira un compte de recette par rôle et deux comptes Opérateur différenciés par `operatorCanRecordPayments`. Les données seront fictives et réinitialisables. Elles incluront au moins un membre actif, un membre inactif, plusieurs catégories, une campagne dans chacun des états Brouillon, Ouverte et Clôturée, une cotisation non payée, partiellement payée et payée, ainsi qu'une cagnotte ouverte et une cagnotte clôturée.

Les montants et dates seront choisis pour vérifier les seuils de formatage GNF, les périodes, les montants restants et les transitions de statut sans dépendre de la date courante. Les actions financières seront vérifiées avec les trois modes de règlement prévus par le cahier.

### Contrôle de disponibilité avant exécution

Une étape de démarrage vérifiera l'URL de l'environnement, la version du frontend, la disponibilité de l'API, la validité des comptes, le chargement des routes protégées et la présence des opérations critiques. Une fonctionnalité indisponible sera marquée `Bloquée` avec sa dépendance, et non `Réussie` sur la base d'un mock non déclaré.

### Preuves et verdicts

Chaque exécution conservera la date, l'environnement, le rôle utilisé, l'identifiant du cas, le résultat `Réussi`, `Échoué`, `Bloqué` ou `Non applicable`, les étapes réellement suivies, l'observation, la preuve disponible et le lien vers le ticket ou le défaut. Les données personnelles et financières réelles seront interdites dans les preuves.

Toute anomalie indépendante constatée pendant l'exécution donnera lieu immédiatement à un ticket de correction avant la poursuite de la campagne. Le type sera `fix` et le scope sera choisi selon la zone concernée : `front`, `back` ou `fullstack` lorsque le défaut concerne l'échange frontend/backend ou le contrat API. Le ticket reprendra le cas de test, le rôle, l'environnement, les étapes de reproduction, le résultat attendu, le résultat observé, les preuves et la priorité. Le cas restera `Échoué` ou `Bloqué` jusqu'à la correction et sa revalidation.

### Séparation stricte du futur audit responsive

Le présent plan vérifie le comportement fonctionnel indépendamment de la largeur d'écran. La prochaine évolution responsive sera suivie dans un change séparé et ajoutera des cas par viewport, navigation clavier, focus, contraste, débordement, densité et composition des écrans. Aucun verdict visuel ne sera déduit de ce plan fonctionnel.

## Risks / Trade-offs

- [Risque] L'API ou certaines routes ne sont pas disponibles sur l'environnement de recette. -> Mitigation : exécuter les contrôles de disponibilité en premier et conserver un statut `Bloqué` avec l'opération concernée, notamment `GET /dashboard` lié à T-181.
- [Risque] Des données partagées rendent les scénarios non reproductibles. -> Mitigation : utiliser un jeu de données identifié, réinitialisable et documenter l'ordre des mutations.
- [Risque] Les droits affichés par l'IHM divergent de l'autorisation backend. -> Mitigation : vérifier chaque restriction par navigation directe et par réponse API 401/403, pour les quatre rôles et les deux variantes Opérateur.
- [Risque] Le plan devient trop volumineux pour une exécution quotidienne. -> Mitigation : séparer un smoke test court, une campagne complète et des suites ciblées par domaine, tout en gardant la matrice exhaustive.
- [Risque] La vérification fonctionnelle est confondue avec la qualité visuelle. -> Mitigation : inscrire explicitement le responsive, le contraste et la composition hors périmètre dans chaque fiche de campagne.

## Migration Plan

1. Valider le plan et les données de recette sur la branche T-183.
2. Publier les artefacts documentaires dans une PR vers `develop` si la livraison est demandée.
3. Préparer l'environnement et les comptes de recette avant la première exécution.
4. Exécuter le smoke test, puis la campagne complète par rôle et par domaine.
5. Reporter les écarts dans les tickets dédiés sans cocher les cas non vérifiés.
6. Pour revenir en arrière, supprimer ou archiver le change documentaire et ses données de recette, sans action sur les données applicatives.

## Open Questions

- Quel environnement d'intégration sera la référence pour la première campagne manuelle ?
- Qui réinitialisera les données de recette entre deux exécutions financières ?
- Le livrable final doit-il rester dans OpenSpec ou être recopié dans un emplacement QA partagé après validation ?
