## Why

Le bouton d'identite situe en bas de la sidebar ouvre actuellement la page « Mon profil » pour tous les roles. Ce comportement ne correspond pas au prototype : les comptes applicatifs doivent ouvrir une page « Mon acces » dediee aux informations du compte, tandis que le membre conserve son profil personnel.

Le parcours doit rester coherent avec le MVP et ne doit pas introduire de configuration de devise. La devise actuelle peut etre affichee comme une information de contexte en lecture seule, sans selecteur ni mutation, jusqu'a la mise en place d'un modele multi-tenant.

## What Changes

- Rendre la destination du bouton de pied de sidebar dependante du role applicatif : le membre ouvre « Mon profil », les comptes administrateur, tresorier et operateur ouvrent « Mon acces ».
- Ajouter la page « Mon acces » alignee sur la capture cible : identite du compte, statut du compte, association, role applicatif, theme et devise.
- Afficher la devise `GNF - Franc Guineen` en lecture seule, sans bouton de modification, selecteur ou nouvel appel API.
- Reproduire l'agencement de la carte cible avec une identite horizontale, une grille d'informations et les actions existantes de changement de theme et de deconnexion.
- Conserver la page « Mon profil » et ses onglets pour le membre, ainsi que les routes, gardes, droits et donnees de session existants.
- Harmoniser les libelles, les traductions, les etats de chargement et les tests avec le nouveau parcours.
- Ne modifier ni le contrat OpenAPI, ni les handlers MSW, ni le modele de devise cote API.

## Capabilities

### New Capabilities

- `personal-account-space`: page « Mon acces » pour les comptes applicatifs, avec informations de compte en lecture seule et actions de theme et de deconnexion.

### Modified Capabilities

- `desktop-sidebar-visual`: la destination du bloc d'identite en pied de sidebar devient contextuelle selon le role, et le bloc peut ouvrir la page de compte cible pour les roles de gestion.

## Impact

- Frontend : shell applicatif, destination de navigation, nouvelle page ou feature de compte, traductions et tests associes.
- Session : reutilisation de `SessionService.user` et des donnees deja hydratees, sans requete supplementaire.
- API et mocks : aucun changement prevu.
- Design system : reutilisation des tokens, composants d'action, badge de statut et presentation de carte existants.
- Livraison : ticket T-137, scope `front`, type `fix`, branche `front/fix-137-aligner-espace-personnel`, dependances T-95, T-128 et T-136.
