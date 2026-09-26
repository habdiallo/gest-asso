## Context

L'onglet `categories` est rendu directement par `CampaignDetailPage`. La logique de lecture et de modification du barème fonctionne déjà avec `Campaign.categoryAmounts`, `updateCampaignCategoryAmounts` et les règles de rôle et de statut existantes, mais son habillage diverge du prototype `design/app.js`.

La cible présente une zone d'en-tête compacte avec le titre « Barème de la campagne », une description et une action « Modifier les montants », puis un tableau à quatre colonnes. Chaque ligne combine une pastille de repérage, le libellé métier de la catégorie, le montant de la campagne, le nombre de membres concernés et le total attendu. Le tableau doit conserver la composition responsive et les composants partagés de l'application. L'action ouvre une boîte de dialogue « Montants de campagne » avec le contexte de la campagne, une ligne de saisie par catégorie et les actions Retour/Enregistrer.

## Goals / Non-Goals

**Goals:**

- Aligner la hiérarchie, les libellés, les colonnes, les unités et les espacements du tab catégories sur le prototype.
- Réutiliser `app-data-table`, `app-action-button`, les formateurs GNF et les styles de surface existants.
- Conserver les valeurs fournies par `Campaign.categoryAmounts` sans créer de données locales ni modifier les DTO de succès.
- Conserver l'édition réservée à l'Administrateur et au Trésorier, avec ses validations, erreurs et mise à jour de la campagne.
- Aligner l'édition du barème et l'enregistrement des règlements sur le cycle de vie officiel à trois états de la campagne (Brouillon, Ouverte, Clôturée), conformément au contrat `updateCampaignCategoryAmounts` et aux règles métier RG-COT-017, RG-COT-018 et RG-PAY-010.
- Remplacer le passage automatique fondé uniquement sur `startDate` par une ouverture explicite, contrôlée par le serveur et précédée d'une checklist de préparation.
- Rendre l'ouverture traçable avec `openedAt` et `openedBy`, puis figer le barème et autoriser les règlements uniquement après l'ouverture réussie.
- Couvrir les états nominal, vide, montant non configuré, édition, erreur de sauvegarde et responsive dans les tests Angular.

**Non-Goals:**

- Modifier `GET /api/v1/campaigns/{campaignId}`, `PUT /api/v1/campaigns/{campaignId}/category-amounts` ou les DTO générés.
- Changer le calcul des montants dus, des cotisations ou des règlements, au-delà de la disponibilité des actions selon l'état de la campagne.
- Modifier l'écran d'administration des catégories de revenu.
- Créer un tableau partagé spécifique au seul barème si `app-data-table` suffit.
- Ajouter une ouverture automatique par tâche planifiée dans ce ticket. Une automatisation de secours pourra être étudiée ultérieurement après observation du parcours manuel.

## Decisions

### Conserver la page de campagne comme orchestration

Le rendu et les états du tab restent dans `CampaignDetailPage`, car la page possède déjà la campagne, le rôle, le formulaire d'édition et les mutations. Créer un composant de feature séparé ajouterait une frontière sans bénéfice fonctionnel pour une seule vue. Les composants `shared` restent utilisés pour les primitives neutres.

### Structurer la vue autour du modèle `categoryAmounts`

Le tableau de lecture utilise directement `incomeCategory`, `amount`, `memberCount` et `expectedAmount`. Les montants passent par `formatGnfAmountDetailed`, les nombres de membres reçoivent une unité localisée et les valeurs manquantes restent distinguées d'un zéro métier.

La pastille reprend l'identifiant visuel disponible pour la catégorie. Si le contrat ne fournit pas de code séparé, l'interface utilise une représentation déterministe dérivée du libellé sans remplacer ni modifier le libellé renvoyé par l'API. Aucun nom de catégorie ou montant du prototype n'est injecté dans l'application.

### Réutiliser l'action et le formulaire existants

L'action est rendue dans l'en-tête du tab et appelle `startEditingBareme`. Sa visibilité dépend du rôle applicatif et de l'état de la campagne : elle n'est proposée qu'en Brouillon (`UPCOMING`), conformément au contrat `updateCampaignCategoryAmounts` (édition uniquement avant la date de début, tant qu'aucun règlement n'existe) et à RG-COT-018. Elle ouvre `FormDialog` avec le titre, le statut, le nombre de membres et le nom de la campagne, puis les montants préremplis dans `AmountInput`. Le formulaire conserve `Validators.required`, `Validators.min(1)`, l'état de soumission, les erreurs traduites et le rafraîchissement via la campagne retournée par l'API. Le backend reste la source de vérité en cas de course rare entre le chargement de l'écran et l'enregistrement (la campagne démarre pendant l'édition) : ce cas, et lui seul, peut encore renvoyer `CAMPAIGN_NOT_EDITABLE`.

### Cycle de vie de la campagne et actions autorisées par état

Une campagne suit trois états, sans retour en arrière : Brouillon (`UPCOMING`, avant l'ouverture explicite), Ouverte (`OPEN`, après l'ouverture explicite et jusqu'à la clôture) et Clôturée (`CLOSED`, après clôture explicite). La date de début est une condition minimale d'ouverture. Chaque état autorise un ensemble disjoint d'actions :

| État | Édition du barème | Enregistrement d'un règlement |
|---|---|---|
| Brouillon | Autorisée (Administrateur/Trésorier) | Non proposée |
| Ouverte | Non proposée (montants figés) | Autorisée (rôles habilités, RG-ROLE-007 à 009) |
| Clôturée | Non proposée | Non proposée |

Deux corrections découlent de ce tableau, en plus de l'alignement visuel :

- `CampaignDetailPage.canEditBaremeNow` revient à `status === CampaignStatus.Upcoming` (au lieu de `status !== CampaignStatus.Closed`), qui affichait à tort l'action sur une campagne Ouverte alors que toute soumission y échoue systématiquement en 409 `CAMPAIGN_NOT_EDITABLE`.
- L'entrée transmise à `CampaignDuesTab` pour l'enregistrement d'un règlement passe d'un masquage sur `CLOSED` uniquement (`campaignClosed`) à une autorisation positive sur `OPEN` uniquement (`campaignOpenForPayments = status === CampaignStatus.Open`), afin d'exclure également le Brouillon.

Ce tableau et ces deux corrections sont formalisés dans la nouvelle capacité `campaign-lifecycle-actions` (`specs/campaign-lifecycle-actions/spec.md`), transverse aux deux onglets de `CampaignDetailPage`.

### Contrôler la préparation et ouvrir explicitement la campagne

La campagne reste en `UPCOMING` après sa création. Le serveur calcule une checklist de préparation à partir des données courantes, sans introduire un quatrième statut persistant :

- `baremeComplete` : chaque catégorie portée par un membre concerné possède un montant strictement positif ;
- `datesValid` : la période est cohérente ;
- `startDateReached` : la date de début est atteinte ;
- `duesReady` : les membres ciblés et leurs cotisations peuvent être établis sans donnée manquante ;
- `ready` : toutes les vérifications nécessaires à l'ouverture sont satisfaites, y compris la date de début.

La fiche campagne affiche ces vérifications et l'action « Ouvrir la campagne » uniquement aux Administrateurs et Trésoriers. L'action reste désactivée tant que `ready` est faux. La confirmation rappelle que l'ouverture fige le barème et active l'enregistrement des règlements.

`POST /campaigns/{campaignId}/open` est la seule transition applicative de `UPCOMING` vers `OPEN`. Le serveur recalcule la checklist dans la même opération transactionnelle, vérifie la date de début et le statut courant, puis renseigne `openedAt` et `openedBy`. Le client traite les conflits stables sans supposer que la checklist calculée lors de l'affichage est encore valable au moment de la soumission.

L'opération ne doit pas être implémentée comme une simple mutation de statut côté frontend. Le backend reste la source de vérité pour le verrouillage du barème, la génération ou la validation des cotisations, l'audit et la concurrence entre deux utilisateurs.

### Considérer la date comme un garde-fou, pas comme l'autorité de transition

La date de début interdit l'ouverture anticipée dans le MVP. Elle ne déclenche donc pas seule le passage à `OPEN`. Cette décision évite qu'une campagne partiellement configurée soit rendue active pendant une absence de l'équipe. Si une ouverture automatique devient nécessaire, elle devra réutiliser exactement la même commande métier et les mêmes contrôles de préparation, au lieu de modifier directement le statut.

### Adapter la table desktop et mobile sans changer les données

La table desktop garde quatre colonnes dans l'ordre `Catégorie`, `Montant de cette campagne`, `Membres concernés`, `Total attendu`. Les en-têtes utilisent les clés Transloco existantes ou de nouvelles clés françaises regroupées sous `campaigns.detail.bareme`. La version mobile conserve les mêmes informations dans une présentation empilée accessible, sans cacher le montant ou le nombre de membres.

Les états vide, erreur et montant non configuré restent explicites. Les colonnes de l'édition restent limitées aux données utiles à la saisie, tandis que l'affichage en lecture respecte exactement les quatre colonnes du prototype.

### Aligner le contrat d'enregistrement des règlements

`createPayment` documente la règle RG-PAY-010 dans `besoins/openapi.yaml` : seule une campagne `OPEN` accepte un règlement. Les campagnes `UPCOMING` et `CLOSED` renvoient un 409 avec le code stable `CAMPAIGN_NOT_OPEN`, dans la réponse `PaymentConflict` qui conserve aussi les conflits de surpaiement et de cotisation déjà soldée. Le client Angular est régénéré depuis ce contrat, et les écrans de règlement mappent ce code vers un message dédié.

Les mocks MSW exposent une cotisation impayée pour la campagne `UPCOMING`, une cotisation partiellement payée et son historique pour la campagne `CLOSED`, ainsi qu'une cotisation `UPCOMING` dans la fiche membre. Ces données permettent de constater visuellement les actions présentes uniquement sur `OPEN` et le filtrage du parcours de saisie.

La liste des campagnes affiche le statut métier réel sur chaque carte et sépare les filtres « À venir », « Ouvertes » et « Clôturées ». Une campagne créée par le mock démarre en `UPCOMING`, afin que sa configuration soit observable avant son ouverture explicite après la date de début.

### Valider le comportement observable

Les tests de `CampaignDetailPage` vérifient le texte du titre et de la description, l'ordre et le libellé des en-têtes, les pastilles et unités, la visibilité de l'action selon le rôle et le statut, l'ouverture du formulaire, les erreurs et la soumission. Une vérification visuelle est prévue en desktop et en mobile dans les deux thèmes lorsque le navigateur est disponible.

## Risks / Trade-offs

- [Risque] Le modèle API ne porte pas de code de catégorie distinct du libellé. → Mitigation : ne pas inventer de donnée métier, utiliser une représentation déterministe pour la pastille et conserver le label API.
- [Risque] Des libellés Transloco existants sont déjà consommés par les tests ou d'autres vues. → Mitigation : rechercher les clés avant modification et limiter les changements de traduction au namespace du barème.
- [Risque] Les longues catégories ou les montants débordent sur mobile. → Mitigation : utiliser une mise en page empilée avec `min-width: 0`, retour à la ligne contrôlé et vérification à 375 px.
- [Risque] Une modification visuelle perturbe le formulaire déjà couvert par T-68 à T-102. → Mitigation : conserver les méthodes et contrôles existants et rejouer la suite ciblée puis la suite frontend.
- [Risque] La checklist affichée peut devenir obsolète entre la lecture et la confirmation. → Mitigation : recalculer toutes les conditions côté serveur dans `POST /campaigns/{campaignId}/open` et retourner un code de conflit stable.
- [Risque] Une campagne prête peut rester en brouillon si personne ne confirme l'ouverture. → Mitigation : afficher clairement la date planifiée, l'état de préparation et l'action disponible ; traiter l'ouverture automatique comme une évolution séparée et contrôlée.
- [Risque] Le fuseau horaire peut modifier l'interprétation de la date de début. → Mitigation : comparer la date civile dans le fuseau horaire de l'association, avec une valeur par défaut documentée avant l'implémentation backend.

## Migration Plan

1. Vérifier `node scripts/tickets.mjs resolve T-131 --json` et `node scripts/tickets.mjs verify T-131` sur `front/fix-131-bareme-campagne` avant toute modification applicative.
2. Mettre à jour la documentation métier et `besoins/openapi.yaml` avant de générer le client ou d'implémenter l'ouverture.
3. Ajouter les schémas de checklist, les métadonnées d'audit, les codes d'erreur et `POST /campaigns/{campaignId}/open`, puis régénérer le client Angular.
4. Implémenter côté serveur la commande d'ouverture transactionnelle ou, si le backend n'est pas présent dans ce dépôt, livrer le contrat et les mocks MSW avec le point d'intégration explicitement documenté.
5. Ajouter dans `CampaignDetailPage` la checklist, la confirmation et l'appel d'ouverture, avec gestion des conflits et des rôles.
6. Corriger `canEditBaremeNow` (Brouillon uniquement) et l'entrée d'autorisation transmise à `CampaignDuesTab` (Ouverte uniquement), puis mettre à jour les tests couvrant les trois états et la concurrence.
7. Exécuter les tests ciblés, le lint, le format check, le build, la validation OpenAPI et la suite frontend selon les commandes disponibles.
8. Comparer la vue aux captures cible en desktop et mobile, puis documenter les limites éventuelles dans la PR T-131.
9. Pousser la correction sur `front/fix-131-bareme-campagne` et traiter la revue avant fusion.

Le retour arrière consiste à revert la PR T-131. Aucun changement de migration ou de donnée persistée n'est prévu.

## Open Questions

- Le contrat API doit-il un jour exposer un code de catégorie distinct du libellé pour garantir des pastilles A à D indépendantes de la langue ? Ce ticket conserve le contrat actuel et ne bloque pas l'alignement visuel.
- Le backend de campagne est-il présent dans le périmètre de livraison de T-131 ou le ticket doit-il livrer le contrat, le client et les mocks en attendant son implémentation serveur ?
- Le fuseau horaire de référence de l'association doit-il être ajouté au contrat avant de valider la comparaison avec `startDate` ?
