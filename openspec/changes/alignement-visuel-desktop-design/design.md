## Context

Le frontend Angular (`contribo-front/`) implémente les écrans métier du cahier des charges, mais leur fidélité visuelle au prototype statique `design/` n'a été vérifiée systématiquement que pour la sidebar desktop (change archivé `fidelite-sidebar-desktop-design`, T-111, spec `desktop-sidebar-visual`). Les autres écrans ont été livrés ticket par ticket sur la base des user stories et règles métier, sans passage de comparaison visuelle dédié contre `design/`. Le porteur du produit a identifié un premier écart concret : l'absence du lien de navigation « Tableau de bord » alors que le prototype en affiche un pour chaque rôle (`design/app.js`, `roleConfig`).

Le prototype `design/` reste une référence statique (HTML/CSS/JS), pas du code Angular : il fixe des jetons de design (couleurs, typographies, rayons, espacements), des layouts et des comportements visuels (survol, état actif, dialogues), mais ne fait pas foi sur le contenu métier, les droits par rôle ou les routes.

Ce change formalise une méthode de revue reproductible, écran par écran, pour rattraper ces écarts en desktop d'abord, avant d'étendre la démarche à la tablette et au mobile dans un change ultérieur.

## Goals / Non-Goals

**Goals:**
- Définir une méthode de revue visuelle reproductible : connexion, capture de l'écran atteint, comparaison point par point avec `design/`, correction, vérification, avant de passer à l'écran suivant.
- Couvrir, dans l'ordre de navigation réel de l'application, le tableau de bord puis chaque destination du menu latéral actuel (Membres, Catégories de revenu, Campagnes, Cagnottes, Rôles et utilisateurs, Mon espace), ainsi que les dialogues de formulaire transverses.
- Statuer sur l'écart du lien « Tableau de bord » identifié par le porteur du produit, en le traitant comme une exception ciblée à la règle T-111 (« aucun nouveau lien du prototype »), documentée dans `specs/desktop-sidebar-visual/spec.md`.
- Découper le travail en tickets indépendants, un par écran/composant, pour permettre une revue et une validation incrémentales sans bloquer l'ensemble du chantier sur un seul diff massif.

**Non-Goals:**
- Tablette et mobile : explicitement hors périmètre de ce change. Un change OpenSpec ultérieur les traitera une fois tous les écrans desktop alignés. Les seuils responsive existants (821 px pour la sidebar, breakpoints Tailwind) ne sont pas modifiés ici.
- Reprendre le travail déjà fait sur la sidebar par T-111 (marque, présentation des liens existants, pied de sidebar) : seule l'exception « Tableau de bord » rouvre `desktop-sidebar-visual`.
- Modifier le contenu métier, les droits par rôle, les routes existantes (hors ajout éventuel d'une route/lien tableau de bord), le contrat API ou les données affichées.
- Reprendre les éléments du prototype explicitement écartés par T-111 (sélecteur de rôle de démonstration, données fictives).
- Corriger dans ce change les écarts déjà couverts par `desktop-sidebar-visual` ou par les tickets d'accessibilité (T-103) et de responsive (T-104) déjà traités : ce change porte sur la fidélité visuelle desktop, pas sur le clavier ou les autres tailles d'écran.

## Decisions

### Un ticket par écran/composant, dans l'ordre de navigation

Plutôt qu'un ticket unique couvrant tous les écrans (diff massif, revue difficile) ou un ticket par écart individuel (trop fin, dépendances croisées entre écarts d'un même écran), chaque écran/composant de la liste ci-dessus devient un ticket indépendant, traité dans l'ordre où l'utilisateur les rencontre en naviguant depuis le tableau de bord. Cet ordre correspond à la demande explicite du porteur du produit (« on commence à aller navigation en navigation [...] quand on finit les tickets on les traite puis on entame un autre composant ») et limite le risque de régression croisée entre écrans indépendants.

**Alternative écartée** : un seul ticket « alignement visuel global ». Écartée car elle empêche une revue incrémentale et retarde la détection d'écarts de méthode (ex. mauvaise interprétation d'un jeton de design) jusqu'à la fin du chantier.

### Réouverture ciblée de `desktop-sidebar-visual`, pas de nouveau change pour la sidebar

L'ajout du lien « Tableau de bord » modifie une exigence existante de `desktop-sidebar-visual` (T-111) plutôt que de créer une nouvelle capability dédiée à la navigation, car il s'agit du même artefact visuel (la sidebar) déjà spécifié. Le reste de la spec T-111 n'est pas rouvert.

**Alternative écartée** : traiter ce lien comme faisant partie de la capability `desktop-visual-parity` (tableau de bord). Écartée car le lien vit dans la sidebar (composant partagé affichant sur tous les écrans), pas dans le contenu de l'écran tableau de bord lui-même ; le rattacher à `desktop-sidebar-visual` évite une exigence dupliquée entre deux specs.

### Référence visuelle par capture, pas de diff pixel automatisé

Aucun outil de comparaison pixel-par-pixel n'est installé dans ce dépôt (voir `.claude/rules/frontend/eslint.md`, `tests.md` : pas d'outil E2E ou d'audit visuel automatisé configuré). La comparaison reste manuelle : capture d'écran de l'état courant à 1440 px (puis 1024 px si un écart de grille desktop existe), confrontée aux règles de `design/DESIGN (5).md`, `design/styles.css` et au rendu de `design/index.html` pour l'écran équivalent.

**Alternative écartée** : outil de régression visuelle automatisé (ex. Percy, Chromatic). Écartée car cela introduirait une dépendance et un service tiers non discutés avec le mainteneur, disproportionnés pour ce chantier ; à reconsidérer séparément si le besoin se répète.

## Risks / Trade-offs

- [Risque] Une correction visuelle sur un composant partagé (ex. `shared/navigation-menu`, `shared/form-dialog`) régresse un autre écran non encore audité → Mitigation : exécuter `npm run build`, `npm test -- --watch=false` et une vérification manuelle des écrans déjà traités après chaque ticket touchant un composant partagé, avant de passer au suivant.
- [Risque] L'ajout du lien « Tableau de bord » change la première position active par défaut et pourrait masquer une régression de garde de routage → Mitigation : le ticket correspondant vérifie explicitement que les gardes de rôle (`roleGuard`, `authenticatedMatch`) et la redirection post-connexion existantes restent inchangées.
- [Compromis] Sans outil de diff pixel automatisé, la revue reste sujette à l'appréciation humaine → Mitigation : documenter dans chaque ticket la liste précise des écarts constatés et corrigés, avec captures avant/après, pour une revue traçable.
- [Risque] Le périmètre desktop-only peut laisser des écrans visuellement corrects en desktop mais dégradés une fois les correctifs appliqués à des tailles intermédiaires (1024-1279 px) → Mitigation : vérifier chaque écran corrigé à 1440 px et 1024 px avant de le considérer terminé, conformément aux breakpoints de `DESIGN (5).md`.

## Migration Plan

Aucune migration de données. Livraison incrémentale : une PR par ticket/écran, vers `main`, chacune laissant l'application fonctionnelle. Pas de retour arrière global nécessaire : un ticket problématique peut être révété indépendamment sans affecter les écrans déjà livrés.

## Open Questions

- Le lien « Tableau de bord » doit-il pointer vers une route dédiée (`/tableau-de-bord`) ou rester sur la route racine `''` actuelle (point d'entrée déjà utilisé par `DASHBOARD_ROUTES`) ? À trancher dans le ticket correspondant selon la simplicité d'implémentation, sans changer le comportement de redirection existant.
- Le format exact du découpage tablette/mobile (un change unique ou plusieurs) sera décidé au moment de proposer ce change ultérieur, une fois tous les tickets desktop de celui-ci terminés.
