## Context

Le parcours actuel est porté par `ContributionCreateForm`, ouvert depuis `SocialFundDetailPage`. La fiche de la cagnotte connaît déjà l'identifiant et le titre de la cagnotte ; le formulaire charge les membres via `GET /members`, impose `memberId` et émet `CreateContributionRequest` vers `POST /social-funds/{socialFundId}/contributions`.

Le contrat actuel ne représente qu'un membre. `Contribution.member` est obligatoire dans les réponses et `CreateContributionRequest.memberId` est obligatoire dans les requêtes. Il faut donc faire évoluer le contrat, le client généré, les mocks et les consommateurs frontend ensemble. Le dépôt ne contient pas encore le backend : la proposition traite le contrat partagé et les comportements attendus sans inventer une implémentation serveur.

Le prototype montre un dialogue aéré avec un contexte de cagnotte, des champs répartis en grille, une aide de traçabilité et un pied de formulaire distinct. Le dialogue fonctionnel actuel ajoute une recherche séparée et un select membre, mais ne permet pas un contributeur externe.

Les dialogues de règlement déjà présents sur la fiche membre et dans le détail d'une campagne utilisent une largeur desktop de 800 à 920 px et une composition paysage. Le dialogue de contribution utilise encore la largeur par défaut de `FormDialog` (560 px), ce qui comprime la recherche membre, le contexte de cagnotte et les champs financiers. Le ticket doit donc traiter l'écart de composition, pas seulement les champs externes.

## Goals / Non-Goals

**Goals:**

- Permettre une contribution liée soit à un membre de l'association, soit à un contributeur externe identifié par prénom et nom.
- Maintenir une règle contractuelle forte : exactement un des deux contributeurs est renseigné, jamais les deux et jamais aucun.
- Reproduire la hiérarchie visuelle du prototype dans un dialogue accessible, espacé et responsive.
- Conserver les droits existants, les trois modes de règlement, la date de contribution, la traçabilité de l'utilisateur saisissant et le refus d'une cagnotte clôturée.
- Conserver l'intégrité des agrégats de cagnotte et rendre explicite le traitement des contributeurs externes dans le nombre de contributeurs.
- Garder la cagnotte en contexte en lecture seule lorsque le dialogue est ouvert depuis sa fiche.
- Donner aux dialogues de règlement et de contribution une composition visuelle commune, de type paysage sur desktop, sans uniformiser artificiellement leurs données métier.

**Non-Goals:**

- Ne pas créer de membre, de compte utilisateur ou de profil de connexion pour un contributeur externe.
- Ne pas ajouter dans ce ticket un annuaire séparé des contributeurs externes, une recherche d'externe existant ou une fusion automatique de personnes sur la seule base du nom.
- Ne pas créer un point d'entrée global « Nouvelle contribution » avec sélection de cagnotte tant qu'une page globale des contributions n'est pas définie. Si ce point d'entrée est ajouté plus tard, la cagnotte devra être un champ obligatoire et limité aux cagnottes ouvertes.
- Ne pas modifier les permissions, les modes de paiement, les règles de clôture ou la correction/annulation des écritures financières.
- Ne pas permettre à un contributeur externe d'accéder à l'espace membre ou à `/me/contributions`.

## Decisions

### Choisir explicitement le type de contributeur

Le formulaire reste centré sur la saisie courte du prototype. Il affiche par défaut la recherche et la sélection d'un membre, avec une case à cocher « Contributeur externe ». Lorsque cette case est activée, le select membre disparaît et est remplacé par deux champs obligatoires, prénom et nom. Cette présentation évite deux cartes de choix concurrentes et garde le mode habituel comme parcours principal.

Les champs du mode inactif sont vidés et exclus de la requête. Le bouton de validation reste désactivé ou bloqué tant que le mode actif n'est pas valide. Le formulaire n'essaie jamais de deviner qu'un nom libre correspond à un membre.

Alternative écartée : garder un champ de recherche membre et ajouter un bouton « autre ». Cette solution laisse deux parcours concurrents dans le même champ et rend ambiguë la valeur envoyée au serveur.

### Garder la cagnotte comme contexte depuis sa fiche

Depuis `/cagnottes/{socialFundId}`, l'identifiant de cagnotte est déjà déterminé par la route et le titre est affiché en lecture seule. Le dialogue ne propose pas un second select qui pourrait contredire la fiche ou enregistrer dans une autre cagnotte que celle consultée.

Alternative écartée : ajouter immédiatement un select de cagnotte dans ce dialogue. Le select visible dans la maquette est pertinent pour un formulaire global, mais le produit ne possède pas encore ce point d'entrée dans le périmètre de T-134. Le réserver évite de créer un écran global incomplet.

### Faire évoluer le contrat sans deux identités concurrentes

La requête expose une union OpenAPI de deux variantes nommées, chacune portant les champs communs `amount`, `contributionDate` et `method`, puis une identité exclusive :

- variante membre : `CreateMemberContributionRequest` avec `memberId` renseigné ;
- variante externe : `CreateExternalContributionRequest` avec `externalContributor` contenant `firstName` et `lastName` valides.

La réponse `Contribution` conserve `member` pour la compatibilité des lectures existantes, mais le rend nullable et ajoute `externalContributor`, nullable. Le serveur garantit que exactement un des deux champs est non nul. L'objet externe est un instantané de prénom et nom de la contribution, sans identifiant de membre.

Cette forme évite de supprimer immédiatement `member` du contrat v1 tout en rendant le cas externe explicite. Les consommateurs d'affichage utilisent un mapping local qui présente le nom du membre ou celui de l'externe, sans dupliquer cette décision dans chaque template.

### Définir le comptage des contributeurs

Le serveur continue de calculer `contributorCount` comme un agrégat officiel. Pour T-134, il compte les identités membres distinctes par `memberId` et les identités externes distinctes par paire normalisée `firstName` + `lastName` dans la cagnotte. Le nom affiché conserve la casse saisie la première fois ; aucune fusion approximative ou recherche de doublon n'est faite côté frontend.

Cette règle donne un comportement déterministe sans créer un annuaire externe. Elle devra être explicitement documentée dans le cahier métier et testée dans les mocks.

### Séparer le formulaire, l'orchestration et le contrat

`ContributionCreateForm` reste centré sur l'IHM et émet une requête typée. `SocialFundDetailPage` conserve l'autorisation, l'appel `ContributionsService.createContribution`, la mise à jour du bilan et le rechargement de la liste. Les types et services viennent du client généré depuis `besoins/openapi.yaml`.

Les mocks MSW ajoutent au moins un scénario membre et un scénario externe, avec une réponse cohérente pour le bilan, la liste, le total collecté et le nombre de contributeurs. Aucun appel HTTP métier manuel ni DTO parallèle ne sera introduit.

### Harmoniser le gabarit des dialogues d'enregistrement

Les trois parcours concernés conservent leurs composants métier distincts : règlement depuis une fiche membre, règlement depuis une cotisation de campagne et contribution depuis une cagnotte. L'harmonisation porte sur le gabarit visuel partagé, pas sur la fusion de leurs formulaires ni sur la création d'un formulaire générique qui masquerait leurs règles différentes.

Le gabarit commun repose sur le `FormDialog` existant et sur une largeur desktop cible de 920 px pour ces dialogues. Le contenu suit la même séquence visuelle : en-tête avec kicker et titre, aide courte, éventuel résumé métier, contexte en lecture seule ou choix du contributeur, champs financiers en grille de deux colonnes, mode de règlement, aide de traçabilité et pied d'actions aligné. Les contrôles passent sur une colonne sous le breakpoint du dialogue, fixé à 821 px, afin d'éviter une grille trop étroite dans un dialogue mobile.

Les différences métier restent visibles : le règlement conserve le résumé dû, déjà payé et reste à payer ainsi que la campagne sélectionnée ; la contribution conserve le choix membre ou externe et la cagnotte courante. Le texte d'aide et les libellés restent propres à chaque feature, mais les espacements, hauteurs de contrôles, styles de labels, bordures du pied d'actions et emplacement des messages de traçabilité suivent les mêmes tokens visuels.

Une petite primitive de présentation partagée peut porter le pied d'actions et les classes de grille si cela réduit réellement la duplication. Elle ne doit pas recevoir de logique métier ni de DTO. Une modification du `FormDialog` est acceptable pour exposer le même gabarit de largeur et de footer aux trois usages, sans modifier le comportement natif du dialogue, du focus ou de la fermeture.

Alternative écartée : augmenter uniquement la largeur du dialogue de contribution et conserver ses espacements spécifiques. Cette correction réglerait la compression principale mais laisserait une différence perceptible entre les formulaires et reproduirait le problème lors d'une prochaine évolution.

### Valider le dialogue comme un parcours accessible

Le dialogue reçoit un nom, place le focus sur le premier contrôle pertinent, garde une navigation clavier logique, annonce les erreurs associées aux champs et restitue le focus au déclencheur à la fermeture. Sur petit écran, les champs passent sur une colonne et le pied de formulaire reste accessible sans débordement horizontal.

Les textes passent par Transloco. Les champs externes utilisent des limites de longueur et une validation identiques côté client et contrat. Les erreurs API reposent sur `ErrorResponse.code`, sans analyser le texte libre du message.

## Risks / Trade-offs

- [Risque] Le changement de `Contribution.member` vers une valeur nullable peut provoquer des accès non protégés dans les vues existantes. → Rechercher tous les consommateurs, centraliser l'affichage du contributeur et ajouter des fixtures externes dans chaque écran concerné.
- [Risque] Deux personnes différentes peuvent porter le même prénom et nom. → Ne pas prétendre résoudre l'identité ; documenter le comptage déterministe par nom normalisé et ne pas créer de rapprochement automatique.
- [Risque] Une réponse API générée à partir d'un `oneOf` peut être difficile à exploiter avec le générateur Angular. → Utiliser deux schémas de requête nommés et complets dans le `oneOf`, régénérer avant tout test et vérifier que les champs communs restent présents dans chaque type généré.
- [Risque] La collecte d'un nom externe ajoute une donnée personnelle à l'historique. → Limiter les champs au prénom et au nom nécessaires, ne pas les journaliser côté frontend, documenter la conservation et masquer les détails hors des rôles autorisés.
- [Risque] Le design cible suppose parfois un formulaire global avec select de cagnotte. → Maintenir le contexte fixe depuis la fiche et traiter le point d'entrée global dans un ticket distinct.
- [Risque] Une abstraction de mise en page trop générique pourrait coupler des features qui n'ont pas les mêmes règles métier. → Limiter la mutualisation au gabarit visuel, aux actions et aux tokens de spacing ; conserver les formulaires et leur orchestration dans leur feature.
- [Risque] Une largeur uniforme peut être trop grande sur une petite fenêtre. → Utiliser la largeur maximale responsive existante de `FormDialog`, réduire la grille à une colonne sous 821 px et vérifier le défilement vertical sans débordement horizontal.

## Migration Plan

1. Mettre à jour le cahier métier avec la notion de contributeur externe et la règle d'exclusivité.
2. Faire évoluer `besoins/openapi.yaml`, valider le contrat et régénérer le client Angular.
3. Adapter les mocks et les fixtures pour les deux variantes, puis mettre à jour le formulaire et la fiche de cagnotte.
4. Vérifier les consommateurs de `Contribution.member`, les agrégats et l'espace membre.
5. Exécuter les tests ciblés, la suite frontend, le lint, le build, la validation OpenAPI, les contrôles de tickets et une vérification navigateur du dialogue.

Le retour arrière consiste à restaurer le contrat précédent et le formulaire membre uniquement. Si le contrat a déjà été consommé par un backend, le déploiement devra d'abord accepter les deux formes avant de rendre la nouvelle forme obligatoire, puis conserver la lecture nullable de `member`.

## Open Questions

- Le backend confirme-t-il le comptage par paire de noms externes normalisée, ou veut-il compter chaque contribution externe comme un contributeur distinct ? La proposition retient la paire normalisée pour garder le libellé « contributeurs » cohérent.
- Faut-il afficher une mention « contributeur externe » dans chaque ligne d'historique, ou le nom suffit-il dans le MVP ? La proposition recommande un badge ou un sous-libellé discret pour éviter toute confusion avec un membre.
- La sélection d'une cagnotte depuis un formulaire global doit-elle être livrée dans un ticket séparé lié à T-134 ? La proposition la laisse hors périmètre jusqu'à la définition de la page globale des contributions.
- Le pied d'actions doit-il être extrait dans un composant `shared` ou rester porté par les trois templates avec les mêmes classes ? L'implémentation devra retenir l'option qui réduit la duplication sans introduire une abstraction métier.
