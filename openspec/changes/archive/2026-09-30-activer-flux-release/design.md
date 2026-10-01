# Design

Le workflow conserve un contrôle déterministe exécuté sans checkout du code de
la pull request. Il distingue une branche de ticket, une branche de release et
une branche de hotfix, puis contrôle leur cible.

| Branche source | Cible | Résultat |
| --- | --- | --- |
| ticket | `develop` | accepté |
| release | `main` | accepté |
| hotfix | `main` | accepté |
| release ou hotfix | `develop` | accepté pour la réintégration |
| ticket | `main` | refusé |
