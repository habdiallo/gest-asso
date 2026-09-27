## Context

Le shell Angular affiche un bouton d'identite en bas de la sidebar desktop. `App` derive actuellement le nom, les initiales et le role depuis `SessionService.user`, puis envoie tous les utilisateurs vers `/mon-espace`. Cette route rend le profil personnel avec les onglets de profil, cotisations et contributions.

Le prototype `design/app.js` distingue deux destinations : un membre ouvre `profile`, alors qu'un compte de gestion ouvre `account`. La page cible « Mon acces » presente une carte de compte avec l'identite, le statut, l'association, le role applicatif, le theme, la devise et les actions de theme et de deconnexion.

La proposition reste frontend uniquement. Le contrat `GET /api/v1/me` expose deja les informations de session necessaires, dont l'association et sa devise. Aucun endpoint de preference ou de mise a jour de devise n'est necessaire pour le MVP.

## Goals / Non-Goals

**Goals:**

- Faire correspondre la destination du bouton de pied de sidebar au role applicatif.
- Ajouter un ecran `Mon acces` pour les roles Administrateur, Tresorier et Operateur.
- Reproduire la hierarchie de la carte cible avec les tokens et composants existants.
- Harmoniser les badges de statut avec un composant partage et des tons semantiques communs.
- Aligner la barre de recherche et le filtre de role de l'ecran Utilisateurs et roles sur le controle cible.
- Afficher le theme courant et la devise GNF comme informations non modifiables.
- Conserver la page `Mon profil` et ses onglets pour le role Membre.
- Garantir l'absence de requete API supplementaire et la couverture des parcours au clavier.

**Non-Goals:**

- Ne pas ajouter de selecteur de devise, de conversion ou de preference persistable.
- Ne pas modifier le contrat OpenAPI, le backend, les mocks reseau ou le modele `CurrentUser`.
- Ne pas permettre la modification du nom, du role, du statut, de l'association ou de la devise.
- Ne pas modifier la navigation metier, les droits des autres pages ou la navigation mobile.
- Ne pas fusionner la page compte avec la page profil du membre.

## Decisions

### Utiliser une destination distincte pour le compte applicatif

Le bouton du shell naviguera vers `/mon-compte` pour les roles Administrateur, Tresorier et Operateur, et conservera `/mon-espace` pour le role Membre. La page compte sera une feature lazy independante, afin de respecter la frontiere `features/<feature>` et de ne pas faire dependre le shell d'une page metier.

Alternative ecartee : ajouter un parametre de vue a `/mon-espace`. Cette option melangerait deux concepts de navigation et compliquerait le titre de route, les gardes et les tests du profil membre.

### Reutiliser la session pour alimenter la carte

La page compte lira `SessionService.user`, deja hydrate pendant l'initialisation de session. Elle utilisera le nom et les initiales du membre, le statut du compte, `association.name`, `role`, le theme expose par le service de theme et `association.currency`. Les informations seront rendues en lecture seule.

Alternative ecartee : creer un appel `GET /account` ou un service de profil dedie. Les donnees necessaires sont deja presentes et un nouvel appel introduirait une divergence entre la sidebar et la page compte.

### Afficher la devise sans configuration

La carte affichera `GNF - Franc Guineen` avec un libelle `Devise`. La valeur sera derivee de la session et aucune interaction ne permettra de la changer. Le mapping du libelle restera dans le frontend tant que le produit ne gere qu'une seule devise.

Alternative ecartee : retirer completement la devise. La capture cible la presente comme une information de compte, et son affichage read-only conserve le contexte financier sans ouvrir prématurément un chantier multi-tenant.

### Proteger les destinations par les gardes existants

La route `/mon-compte` sera reservee aux utilisateurs authentifies des roles de gestion avec les gardes existants. Le role Membre restera sur `/mon-espace`. Les tests verifieront aussi qu'une session absente ne rend aucune information de compte.

### Harmoniser les badges de statut

Les badges de statut utilisent un composant partage `StatusBadge` dans les ecrans qui affichent un etat de compte, de membre, de cotisation, de campagne ou d'autorisation. Le composant centralise la typographie `Space Grotesk`, le point indicateur, les espacements et les fonds semantiques, tandis que chaque ecran conserve son libelle et son mapping metier.

### Harmoniser les controles de filtre

La barre de recherche de l'ecran Utilisateurs et roles ne rajoute aucun cadran conteneur. Le champ de recherche et le select de role utilisent des rayons pilule, tandis que le composant `CustomSelect` expose ce mode comme une option afin de ne pas modifier les filtres compacts existants.

### Conserver les actions existantes

Les actions de la carte utilisent `ActionButton` pour conserver une hauteur, une largeur minimale et une typographie communes. Elles deleguent toujours le changement de theme au service existant et la deconnexion au parcours de session existant. Aucun nouveau comportement d'authentification ou de preference ne sera introduit.

## Risks / Trade-offs

- [Risque] Une page compte reservee aux roles de gestion peut etre inaccessible si une destination est construite directement pour un Membre. -> Mitigation : centraliser le choix de destination dans `App`, proteger `/mon-compte` par le role et tester les deux branches.
- [Risque] Le libelle de devise peut devenir obsolete lorsque le multi-tenant sera introduit. -> Mitigation : utiliser la valeur de `association.currency` et isoler le mapping d'affichage pour le remplacer sans changer la mise en page.
- [Risque] Une nouvelle feature peut dupliquer la carte d'identite du profil membre. -> Mitigation : partager uniquement les composants neutres existants, sans import entre features, et garder les contrats de chaque page explicites.
- [Risque] Le rendu de la carte peut diverger entre les themes. -> Mitigation : verifier les contrastes en theme sombre et clair, le focus clavier et les largeurs desktop et mobile existantes.

## Migration Plan

1. Resoudre T-137 et verifier les dependances T-95, T-128 et T-136 avant toute implementation.
2. Ajouter les traductions et la feature lazy `account`, puis brancher la destination contextuelle du shell.
3. Ajouter les tests unitaires de route, de destination, de rendu read-only et d'actions theme/deconnexion.
4. Executer les tests frontend, le lint, le build et une verification navigateur des roles de gestion et Membre dans les deux themes.
5. Publier une PR dediee vers `main` avec le lien T-137, les validations et les captures pertinentes.

Le retour arriere consiste a retirer la route compte et a restaurer la navigation du bouton vers `/mon-espace`. Aucun rollback de donnees ou de contrat API n'est necessaire.

## Open Questions

- Aucune question bloquante pour le MVP. La devise reste affichee en lecture seule avec GNF, sans possibilite de modification.
- Lors du passage au multi-tenant, un ticket ulterieur devra definir la source de configuration, les permissions et le format des devises avant de rendre ce champ editable.
