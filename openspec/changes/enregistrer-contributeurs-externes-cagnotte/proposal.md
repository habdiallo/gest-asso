## Why

Le dialogue actuel d'enregistrement d'une contribution mélange la recherche d'un membre, sa sélection et les autres champs sans hiérarchie suffisante par rapport au design cible. Surtout, le contrat `CreateContributionRequest` impose `memberId`, ce qui interdit d'enregistrer proprement une contribution versée par une personne extérieure à l'association sans créer un faux membre.

Le ticket T-134 propose un parcours explicite et traçable : une contribution est enregistrée soit pour un membre sélectionné, soit pour un contributeur externe identifié par son prénom et son nom. La cagnotte reste le contexte de la saisie depuis sa fiche, tandis qu'un futur point d'entrée global pourra proposer un sélecteur de cagnotte.

## What Changes

- Repenser le dialogue « Enregistrer une contribution » pour reprendre la hiérarchie du design cible : titre, texte d'aide, contexte de cagnotte, choix du contributeur, montant, date, mode, aide de traçabilité et actions clairement espacées.
- Harmoniser l'agencement des dialogues d'enregistrement de règlement et de contribution : même largeur paysage sur desktop, mêmes espacements, mêmes grilles à deux colonnes et même pied d'actions, avec un retour à une colonne sur mobile.
- Remplacer les cartes de choix concurrentes par une case à cocher « Contributeur externe » ; le select membre est remplacé par les champs prénom et nom lorsque la case est activée.
- Pour un membre, permettre une recherche par nom ou prénom puis une sélection unique dans la liste des membres existants.
- Pour un contributeur externe, demander le prénom et le nom, sans créer de compte ni de membre dans l'annuaire.
- Préserver le contexte de cagnotte dans le dialogue ouvert depuis la fiche d'une cagnotte. La cagnotte est affichée en lecture seule dans ce parcours ; un sélecteur de cagnotte est réservé à un futur point d'entrée global.
- Faire évoluer le contrat OpenAPI afin qu'une requête représente exactement l'un des deux types de contributeur, avec validation serveur et erreurs explicites.
- Faire évoluer la réponse `Contribution`, les agrégats et les écrans de consultation pour afficher les deux types de contributeur sans casser la traçabilité ni l'indépendance des cagnottes.
- Mettre à jour les mocks, les données de démonstration, les textes français et les tests de formulaire, de contrat et d'intégration de la cagnotte.
- Documenter les règles métier concernant l'identité externe, le comptage des contributeurs et l'absence d'accès à l'espace personnel pour une personne externe.

## Capabilities

### New Capabilities

- `social-fund-contributor-entry`: parcours de saisie d'une contribution pour un membre ou un contributeur externe, avec dialogue lisible, accessible, responsive et aligné sur les dialogues de règlement.
- `external-social-fund-contributor`: représentation contractuelle et métier d'un contributeur externe sans création de membre.

### Modified Capabilities

- Aucune spécification OpenSpec existante à modifier. Les exigences métier actuelles de `US-CAG-002`, `RG-CAG-004` et `RG-CAG-007` devront être mises à jour dans le cahier métier pendant l'implémentation, car elles imposent aujourd'hui un rattachement exclusif à un membre.

## Impact

- Ticket : T-134, scope `fullstack`, type `feat`, branche prévue `fullstack/feat-134-contributeur-externe-cagnotte`.
- Frontend : `contribution-create-form`, `social-fund-detail-page`, libellés français, modèles générés, affichage de l'historique et tests Angular.
- Contrat : `besoins/openapi.yaml`, notamment `CreateContributionRequest`, `Contribution`, les agrégats `SocialFund` et les endpoints de création, de consultation et de contributions du membre.
- Client généré : régénération depuis OpenAPI, sans édition manuelle des fichiers générés.
- Mocks : handlers MSW et fixtures de contributions avec contributeurs membres et externes.
- Données : aucun membre externe ajouté à l'annuaire ; les prénom et nom saisis sont conservés comme instantané de l'opération et soumis aux règles de protection des données.
- Autorisations et modes de paiement : inchangés. Les droits existants Administrateur, Trésorier et Opérateur autorisé restent applicables.
- Livraison : une branche et une PR T-134 vers `main`, avec validation du contrat, tests frontend, lint, build et vérification responsive du dialogue.
