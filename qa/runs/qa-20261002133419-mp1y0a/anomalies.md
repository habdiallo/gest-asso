# Anomalies

## anomaly-6991c907a97b - Accès à l'espace personnel avant le changement de mot de passe
- Classification : confirmed
- Sévérité : Major
- Priorité : P1
- Feature : auth
- Scénario : scenario-ce2065ceb626
- Ticket : qa-ticket-4f785dbd472a
- Attendu : the API returns a session marked as password-change-only and the
- Observé : Après une connexion avec un compte temporaire, l'ouverture directe de /mon-espace affiche le profil Membre avant le changement de mot de passe obligatoire. Une nouvelle tentative reproduit le même accès, alors que les actions d'onglet redirigent ensuite vers /changer-mot-de-passe.
