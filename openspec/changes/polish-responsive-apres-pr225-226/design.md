## Context

Le shell Angular utilise un en-tête et une navigation basse sous 1181 px, puis une barre latérale desktop. Les PR 225 et 226 ont renforcé la navigation mobile et la durée de session. Le polish doit rester limité au frontend, conserver les contrats d'interaction et fonctionner sans session authentifiée pour être vérifiable sur l'écran de connexion, puis sur les parcours connectés lorsque l'environnement de test accepte la session.

## Goals / Non-Goals

**Goals:**

- Utiliser des règles CSS locales et progressives pour les largeurs 320, 375, 820 et desktop.
- Éviter le débordement de la page, les actions inaccessibles et les éléments masqués par les safe areas.
- Conserver les libellés accessibles et l'ordre des actions.
- Produire des preuves reproductibles avec build, tests et observation navigateur.

**Non-Goals:**

- Aucun changement d'API, de modèle, de session ou de permission.
- Aucun nouveau composant de layout ou framework CSS.
- Aucun changement de seuil desktop établi à 1181 px.
- Aucun remplacement de la stratégie icon-only à très petite largeur introduite par la navigation de la PR 225.

## Decisions

1. **Corriger le shell dans ses styles existants.** Les variables et règles de `app.css` et `shared/navigation-menu/navigation-menu.css` restent la source unique. Une nouvelle abstraction de layout augmenterait le risque de divergence.
2. **Préférer le défilement local aux compressions excessives.** La navigation ou une barre d'actions intermédiaire conserve des cibles tactiles minimales et défile dans son propre conteneur si le contenu ne tient pas. La page ne doit jamais devenir plus large que la fenêtre.
3. **Conserver les comportements fonctionnels.** Les routes Angular, les labels ARIA, l'ordre des liens et les droits ne changent pas. Les tests ciblent la présence des classes, l'accessibilité et les seuils CSS observables.
4. **Valider les largeurs demandées et le desktop.** Les captures ou observations navigateur sont réalisées à 320, 375, 820 et une largeur desktop. Les limites de l'environnement d'authentification sont consignées séparément si la session n'est pas conservée par le proxy local.

## Risks / Trade-offs

- [Risque] Un défilement local peut réduire la visibilité simultanée de certains liens. → [Mitigation] conserver les labels accessibles, le lien actif visible et documenter le seuil concerné.
- [Risque] Une règle globale peut affecter des pages non observées. → [Mitigation] limiter les sélecteurs au shell partagé et vérifier le build ainsi que les tests existants.
- [Risque] Le navigateur local peut rejeter le cookie Secure après connexion. → [Mitigation] tester l'écran public, l'API séparément et rapporter cette limite sans modifier le backend dans cette PR.

## Migration Plan

1. Implémenter les règles CSS et tests sur la branche T-205.
2. Exécuter les validations frontend et la campagne responsive aux quatre largeurs.
3. Ouvrir une PR vers `develop`.
4. Revenir en arrière par revert de la PR si une régression est observée, sans migration de données.

## Open Questions

- La session de l'environnement local devra-t-elle être servie avec un proxy HTTPS homogène pour permettre le parcours authentifié complet ? Ce point est hors périmètre du polish.
