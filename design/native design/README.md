# Contribo Native Design

Proposition d'expérience mobile native pour l'application de gestion associative Contribo.

## Parcours couvert

1. **Connexion** : identifiant, mot de passe, validation et erreur de formulaire.
2. **Tableau de bord** : sélections indépendantes campagne/cagnotte, indicateurs, actions rapides, campagnes récentes et derniers règlements.
3. **Membres** : recherche, filtres catégorie/pays/statut, liste, ajout, fiche, modification, désactivation et historique.
4. **Campagnes** : recherche, filtres de statut, création avec calendrier, détail, situation des membres, barème, édition des montants, règlements et clôture.
5. **Cagnottes** : recherche, filtres statut/type, création, détail et historique des contributions.
6. **Administration** : utilisateurs et rôles, autorisation financière, régénération de mot de passe, catégories de revenu, création et modification.
7. **Compte** : informations d'accès, devise, thème et déconnexion.
8. **Espace personnel** : profil en lecture seule, mes cotisations avec pagination et mes contributions, y compris l'état vide.
9. **Accès refusé et changement de mot de passe** : états de sécurité prévus par les routes existantes.

## Principes natifs retenus

- Barre d'onglets persistante avec quatre destinations métier et un accès Plus pour l'administration.
- Le profil et le thème sont accessibles depuis l'en-tête. L'entrée Plus ne duplique pas l'accès au compte.
- En-têtes larges, bouton retour et titres contextuels pour une navigation lisible.
- Bottom sheets pour les formulaires courts et les actions secondaires.
- Zone d'action collée au bas de l'écran, protégée par la safe area.
- Listes en cartes avec une cible tactile d'au moins 44 pixels.
- États représentés explicitement : vide, chargement, erreur et confirmation.
- Hiérarchie de boutons mobile : action principale pleine largeur, annulation secondaire, ou deux actions de même largeur lorsque les libellés restent courts.

## Écrans dans l'ordre du prototype

- `01-login` : connexion.
- `02-home` : tableau de bord mobile.
- `03-members` : répertoire des membres.
- `04-member-detail` : fiche, données personnelles, situation et historiques.
- `05-campaigns` : campagnes de cotisation.
- `06-campaign-detail-open` : campagne ouverte et enregistrement d'un règlement.
- `07-campaign-detail-draft` : préparation incomplète et modification du barème.
- `08-campaign-detail-closed` : campagne clôturée, consultation seule.
- `09-pots` : cagnottes sociales.
- `10-pot-detail` : suivi et contributions d'une cagnotte.
- `11-more` : navigation d'administration mobile.
- `12-roles` : utilisateurs et rôles.
- `13-categories` : catégories de revenu.
- `14-account` : écran de compte accessible depuis le profil, thème et déconnexion.
- `15-profile` : espace personnel membre et ses onglets.
- `16-change-password` : changement de mot de passe.
- `17-access-denied` : accès refusé.
- `18-loading` : état de chargement des données.
- Bottom sheets : personnalisation du périmètre du tableau de bord, ajout et modification d'un membre, règlement, création de campagne, calendrier, montants de campagne, création/modification de catégorie, édition de rôle, régénération de mot de passe et confirmations de désactivation/clôture.

## États fidèles au produit observé

- Liste remplie et filtres visibles.
- Campagne brouillon avec préparation incomplète.
- Campagne ouverte avec paiements, situation par membre et action de clôture.
- Campagne clôturée en consultation seule.
- Membre actif avec cotisations, règlements et contributions.
- Membre sans règlement restant dans le contexte du formulaire de règlement.
- Cagnotte clôturée avec contributeur externe et membre.
- Formulaire incomplet, erreur de connexion et erreur de confirmation de mot de passe.
- État vide des contributions personnelles.
- Accès refusé, états de chargement implicites et confirmations d'actions irréversibles.

Le prototype est statique et local. Les actions de validation affichent une confirmation visuelle, sans écrire dans l'application métier.

## Suggestions futures

Ces éléments ne sont pas intégrés aux écrans actuels :

- Ajouter une vraie recherche globale entre membres, campagnes et cagnottes.
- Ajouter un export des historiques de règlements et contributions.
- Ajouter des notifications push ou rappels d'échéance.
- Ajouter une sélection explicite de membres lors de la création d'une campagne si le métier le permet plus tard.
