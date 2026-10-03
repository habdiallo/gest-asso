## ADDED Requirements

### Requirement: La navigation reste lisible au zoom élevé

La navigation basse SHALL éviter tout chevauchement de libellés à 200 pour cent aux largeurs mobiles et tablette supportées. Les liens SHALL rester atteignables au clavier et le contrôle de déconnexion SHALL conserver son nom accessible complet.

#### Scenario: Navigation à 200 pour cent

- **WHEN** un utilisateur connecté consulte l'application à 320, 375 ou 820 px avec un texte à 200 pour cent
- **THEN** les libellés de navigation sont lisibles sans chevauchement et sans masquer le menu de profil

#### Scenario: Déconnexion au clavier

- **WHEN** l'utilisateur atteint la déconnexion avec Tab
- **THEN** le focus est visible et le nom accessible est `Se déconnecter`
