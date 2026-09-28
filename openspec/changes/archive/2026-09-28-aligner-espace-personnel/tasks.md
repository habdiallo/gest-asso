## 1. Preparation et cadrage

- [x] 1.1 [T-137] Resoudre T-137 avec `node scripts/tickets.mjs resolve T-137 --json`, verifier la branche `front/fix-137-aligner-espace-personnel` et confirmer les prerequis T-95, T-128 et T-136 avant toute modification frontend.
- [x] 1.2 [T-137] Comparer `contribo-front/src/app/app.html`, `app.ts`, `core/navigation` et la page `features/member-space` au prototype `design/app.js`, puis figer la matrice de destination : Membre vers `/mon-espace`, Administrateur, Tresorier et Operateur vers `/mon-compte`.
- [x] 1.3 [T-137] Inventorier les donnees deja disponibles dans `CurrentUser`, `SessionService` et le service de theme, verifier le mapping de `GNF` et confirmer qu'aucune modification OpenAPI ou backend n'est necessaire.

## 2. Implementation frontend

- [x] 2.1 [T-137] Ajouter la feature lazy `account` et la route `/mon-compte`, avec les gardes d'authentification et de role adequates, sans modifier les routes de l'espace membre.
- [x] 2.2 [T-137] Rendre la destination du bloc d'identite de la sidebar contextuelle selon le role, en conservant le rendu, les initiales, le nom, le role, le seuil desktop et la navigation mobile existants.
- [x] 2.3 [T-137] Implementer la page « Mon acces » selon le prototype : identite horizontale, badge de statut, association, role applicatif, theme, devise GNF en lecture seule, et alignement des actions de theme et de deconnexion.
- [x] 2.4 [T-137] Ajouter les traductions necessaires et les etats sans session ou donnees indisponibles, avec des noms accessibles et sans appel API supplementaire.
- [x] 2.5 [T-137] Refactorer les badges de statut vers un composant partage harmonise, avec les tons succes, avertissement, erreur, information et neutre, sans modifier la semantique des ecrans existants.
- [x] 2.6 [T-137] Aligner la recherche et le filtre de role de l'ecran Utilisateurs et roles sans cadran conteneur, avec un mode pilule partage pour le select sans modifier les autres usages compacts.

## 3. Verification et livraison

- [x] 3.1 [T-137] Ajouter ou ajuster les tests de la destination sidebar, de la route protegee, des roles, du rendu de la carte compte, de la devise non editable, des actions theme/deconnexion et du composant de badge partage.
- [x] 3.2 [T-137] Verifier visuellement les comptes Administrateur, Tresorier, Operateur et Membre en theme sombre et clair, a 1440 px et 1024 px, puis verifier le focus clavier et le breakpoint mobile sans regression.
- [x] 3.3 [T-137] Executer les tests frontend, le build, le lint, le formatage cible, `node scripts/tickets.mjs check`, `node scripts/tickets.mjs verify T-137` et `openspec validate`, puis relire le diff pour confirmer l'absence de changement API.
- [x] 3.4 [T-137] Commiter uniquement le perimetre T-137 avec un titre conforme, pousser la branche `front/fix-137-aligner-espace-personnel` et preparer une PR vers `main` avec les validations et captures, sans fusionner.
