## Pourquoi

La campagne QA d'intégration du 3 octobre 2026 a confirmé deux défauts d'affichage reproductibles et une limite de session qui gêne les parcours de recette. Le taux de collecte est affiché avec toute sa précision flottante dans plusieurs vues. La navigation basse se chevauche avec un zoom de texte à 200 pour cent. La session JWT et son cookie sont limités à 15 minutes, ce qui provoque une déconnexion trop rapide pendant les tests.

## Changements

- Normaliser le taux de collecte visible à une décimale au maximum dans les listes, détails et indicateurs de campagnes, tout en conservant le taux brut pour les calculs et les barres de progression.
- Rendre la navigation basse et le menu de profil lisibles sans chevauchement à 200 pour cent, aux largeurs mobiles et tablette vérifiées par la campagne QA.
- Porter la durée configurable de la session à 30 minutes par défaut dans l'intégration, en gardant une valeur contrôlable par l'environnement et en synchronisant l'expiration du JWT et du cookie.

## Découpage

- T-201, correctif frontend du formatage du taux de collecte.
- T-202, correctif frontend du shell responsive à zoom élevé.
- T-203, correctif backend de la durée de session.

## Hors périmètre

- Aucun changement métier sur les calculs financiers.
- Aucun mécanisme de renouvellement glissant de session.
- Aucune modification des données de test de l'environnement d'intégration.

