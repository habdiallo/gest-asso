## ADDED Requirements

### Requirement: La barre basse conserve les destinations principales

La navigation mobile SHALL afficher Accueil, Membres, Cotisations, Cagnottes et Plus pour un Administrateur, un Trésorier ou un Opérateur. Elle SHALL afficher Accueil et Plus pour un Membre.

#### Scénario : un administrateur ouvre la navigation mobile

- **WHEN** un Administrateur consulte une page authentifiée sur mobile
- **THEN** la barre basse affiche exactement Accueil, Membres, Cotisations, Cagnottes et Plus
- **AND** les liens Utilisateurs et rôles et Catégories de revenu ne sont pas dupliqués dans cette barre

#### Scénario : un membre ouvre la navigation mobile

- **WHEN** un Membre consulte une page authentifiée sur mobile
- **THEN** la barre basse affiche Accueil et Plus
- **AND** l'espace personnel existant reste accessible depuis Plus

### Requirement: Plus conserve les destinations existantes

L'écran Plus SHALL exposer uniquement les destinations déjà autorisées par le rôle courant. Il SHALL rester accessible par la barre basse mobile et ne SHALL NOT ajouter une seconde entrée Mon accès.

#### Scénario : l'administrateur consulte Plus

- **WHEN** un Administrateur ouvre Plus
- **THEN** il peut ouvrir Utilisateurs et rôles et Catégories de revenu
- **AND** il ne voit pas d'entrée Mon accès dans cette liste

### Requirement: Les parcours secondaires sont réversibles

Chaque écran ouvert depuis Plus SHALL proposer un retour explicite vers son contexte d'origine. Le changement de thème et l'accès au profil SHALL rester indépendants de cette navigation.

#### Scénario : retour depuis un écran d'administration

- **WHEN** un Administrateur ouvre Utilisateurs et rôles ou Catégories de revenu depuis Plus
- **THEN** l'écran affiche une action Retour à Plus
- **AND** cette action ramène à `/plus` sans modifier les données métier
