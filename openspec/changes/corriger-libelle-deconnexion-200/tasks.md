## 1. Préparer T-110

Ticket : T-110. Scope/type : `front/fix`. Slug : `libelle-deconnexion-200`.
Branche : `front/fix-110-libelle-deconnexion-200`.
Change : `corriger-libelle-deconnexion-200`.
Priorité du registre : P2 ; sévérité du retour de revue : P3.
Prérequis : T-14, PR 24 fusionnée, commit `4a57723f895b4d9cd141ed1e056d74decfc48949` présent dans la branche.

Critères d'acceptation : bouton et libellé complets à 320/375 px et 100/200 % de texte, dans les deux thèmes ; contenu sous l'en-tête sans recouvrement ; nom accessible et déconnexion clavier conservés pour les quatre rôles ; layouts tablette/desktop utilisables.

- [x] 1.1 [T-110] Résoudre le ticket avec `node scripts/tickets.mjs resolve T-110 --json`, lire ses artefacts, vérifier Git, la branche attendue et l'ascendance du commit de la PR 24, puis exécuter `node scripts/tickets.mjs verify T-110` avant toute modification applicative.
- [x] 1.2 [T-110] Reproduire le constat dans Chrome à 375 × 667 px avec une taille racine de 32 px, compléter à 320 × 568 px et enregistrer les captures/mesures initiales.

## 2. Corriger l'en-tête mobile

- [x] 2.1 [T-110] Adapter l'en-tête mobile pour permettre plusieurs lignes et une hauteur naturelle avec maintien en haut au défilement ; ajuster dans la même modification la réserve supérieure du contenu.
- [x] 2.2 [T-110] Préserver le libellé visible complet et le nom accessible « Se déconnecter », avec retour à la ligne si nécessaire ; vérifier les autres usages du bouton partagé sans modifier la logique de session.

## 3. Valider la correction

- [x] 3.1 [T-110] Ajouter ou adapter les tests pertinents du shell et du bouton : nom accessible, activation, suppression de session, redirection vers `/login` et disparition de l'en-tête authentifié ; exécuter les tests frontend et le build de production, puis le lint/formatage adaptés et `git diff --check`.
- [x] 3.2 [T-110] Vérifier dans Chrome les tailles 320 × 568 et 375 × 667 px, racine 16/32 px, thèmes clair/sombre : fragments de texte dans le viewport, absence de troncature ou chevauchement, contenu visible, Tab/Entrée/Espace et défilement ; contrôler 820/821 px et desktop, ainsi que la déconnexion des quatre rôles. Joindre les captures et rapporter les limites réelles.

## 4. Livrer par une nouvelle PR

- [x] 4.1 [T-110] Relire le diff limité au ticket, vérifier `node scripts/tickets.mjs check --base-ref origin/main` et préparer une description de PR selon le modèle du dépôt, avec lien vers le constat de la PR 24 et résultats de validation.
- [x] 4.2 [T-110] Ajouter explicitement les fichiers T-110, committer avec un titre `fix(front): T-110 ...`, pousser uniquement sa branche et ouvrir une nouvelle PR vers `main`.
- [ ] 4.3 [T-110] Traiter la revue et les contrôles CI de la nouvelle PR ; distinguer sa publication de sa fusion, effectuée uniquement sur demande explicite.

Publication : [PR 47](https://github.com/habdiallo/gest-asso/pull/47), commit applicatif `a9731e6`. La revue GitHub et la décision de fusion restent à traiter séparément.
