## Context

L'onglet `categories` est rendu directement par `CampaignDetailPage`. La logique de lecture et de modification du barème fonctionne déjà avec `Campaign.categoryAmounts`, `updateCampaignCategoryAmounts` et les règles de rôle et de statut existantes, mais son habillage diverge du prototype `design/app.js`.

La cible présente une zone d'en-tête compacte avec le titre « Barème de la campagne », une description et une action « Modifier les montants », puis un tableau à quatre colonnes. Chaque ligne combine une pastille de repérage, le libellé métier de la catégorie, le montant de la campagne, le nombre de membres concernés et le total attendu. Le tableau doit conserver la composition responsive et les composants partagés de l'application. L'action ouvre une boîte de dialogue « Montants de campagne » avec le contexte de la campagne, une ligne de saisie par catégorie et les actions Retour/Enregistrer.

## Goals / Non-Goals

**Goals:**

- Aligner la hiérarchie, les libellés, les colonnes, les unités et les espacements du tab catégories sur le prototype.
- Réutiliser `app-data-table`, `app-action-button`, les formateurs GNF et les styles de surface existants.
- Conserver les valeurs fournies par `Campaign.categoryAmounts` sans créer de données locales ni modifier le contrat API.
- Conserver l'édition réservée à l'Administrateur et au Trésorier d'une campagne non clôturée, avec ses validations, erreurs et mise à jour de la campagne.
- Couvrir les états nominal, vide, montant non configuré, édition, erreur de sauvegarde et responsive dans les tests Angular.

**Non-Goals:**

- Modifier `GET /api/v1/campaigns/{campaignId}`, `PUT /api/v1/campaigns/{campaignId}/category-amounts` ou les DTO générés.
- Changer les règles métier du barème, le calcul des cotisations ou les autorisations.
- Modifier l'écran d'administration des catégories de revenu.
- Créer un tableau partagé spécifique au seul barème si `app-data-table` suffit.

## Decisions

### Conserver la page de campagne comme orchestration

Le rendu et les états du tab restent dans `CampaignDetailPage`, car la page possède déjà la campagne, le rôle, le formulaire d'édition et les mutations. Créer un composant de feature séparé ajouterait une frontière sans bénéfice fonctionnel pour une seule vue. Les composants `shared` restent utilisés pour les primitives neutres.

### Structurer la vue autour du modèle `categoryAmounts`

Le tableau de lecture utilise directement `incomeCategory`, `amount`, `memberCount` et `expectedAmount`. Les montants passent par `formatGnfAmountDetailed`, les nombres de membres reçoivent une unité localisée et les valeurs manquantes restent distinguées d'un zéro métier.

La pastille reprend l'identifiant visuel disponible pour la catégorie. Si le contrat ne fournit pas de code séparé, l'interface utilise une représentation déterministe dérivée du libellé sans remplacer ni modifier le libellé renvoyé par l'API. Aucun nom de catégorie ou montant du prototype n'est injecté dans l'application.

### Réutiliser l'action et le formulaire existants

L'action est rendue dans l'en-tête du tab et appelle `startEditingBareme`. Sa visibilité dépend du rôle applicatif et exclut uniquement une campagne `CLOSED`. Elle ouvre `FormDialog` avec le titre, le statut, le nombre de membres et le nom de la campagne, puis les montants préremplis dans `AmountInput`. Le formulaire conserve `Validators.required`, `Validators.min(1)`, l'état de soumission, les erreurs traduites et le rafraîchissement via la campagne retournée par l'API. Le backend reste la source de vérité lorsque la campagne ouverte possède déjà des règlements ou une autre contrainte d'édition.

### Adapter la table desktop et mobile sans changer les données

La table desktop garde quatre colonnes dans l'ordre `Catégorie`, `Montant de cette campagne`, `Membres concernés`, `Total attendu`. Les en-têtes utilisent les clés Transloco existantes ou de nouvelles clés françaises regroupées sous `campaigns.detail.bareme`. La version mobile conserve les mêmes informations dans une présentation empilée accessible, sans cacher le montant ou le nombre de membres.

Les états vide, erreur et montant non configuré restent explicites. Les colonnes de l'édition restent limitées aux données utiles à la saisie, tandis que l'affichage en lecture respecte exactement les quatre colonnes du prototype.

### Valider le comportement observable

Les tests de `CampaignDetailPage` vérifient le texte du titre et de la description, l'ordre et le libellé des en-têtes, les pastilles et unités, la visibilité de l'action selon le rôle et le statut, l'ouverture du formulaire, les erreurs et la soumission. Une vérification visuelle est prévue en desktop et en mobile dans les deux thèmes lorsque le navigateur est disponible.

## Risks / Trade-offs

- [Risque] Le modèle API ne porte pas de code de catégorie distinct du libellé. → Mitigation : ne pas inventer de donnée métier, utiliser une représentation déterministe pour la pastille et conserver le label API.
- [Risque] Des libellés Transloco existants sont déjà consommés par les tests ou d'autres vues. → Mitigation : rechercher les clés avant modification et limiter les changements de traduction au namespace du barème.
- [Risque] Les longues catégories ou les montants débordent sur mobile. → Mitigation : utiliser une mise en page empilée avec `min-width: 0`, retour à la ligne contrôlé et vérification à 375 px.
- [Risque] Une modification visuelle perturbe le formulaire déjà couvert par T-68 à T-102. → Mitigation : conserver les méthodes et contrôles existants et rejouer la suite ciblée puis la suite frontend.

## Migration Plan

1. Vérifier `node scripts/tickets.mjs resolve T-131 --json` et `node scripts/tickets.mjs verify T-131` sur `front/fix-131-bareme-campagne` avant toute modification applicative.
2. Adapter le template, les clés françaises et les tests de la page campagne sans modifier le contrat OpenAPI.
3. Exécuter les tests ciblés, le lint, le format check, le build et la suite frontend selon les commandes disponibles.
4. Comparer la vue aux captures cible en desktop et mobile, puis documenter les limites éventuelles dans la PR T-131.
5. Ouvrir une PR vers `main` et traiter la revue avant fusion.

Le retour arrière consiste à revert la PR T-131. Aucun changement de migration ou de donnée persistée n'est prévu.

## Open Questions

- Le contrat API doit-il un jour exposer un code de catégorie distinct du libellé pour garantir des pastilles A à D indépendantes de la langue ? Ce ticket conserve le contrat actuel et ne bloque pas l'alignement visuel.
