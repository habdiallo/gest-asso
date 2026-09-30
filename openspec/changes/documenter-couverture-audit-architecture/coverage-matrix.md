# Matrice de couverture de l audit architecture

Cette matrice associe chaque constat de l analyse a un ticket local. Elle doit
etre mise a jour par T-179 apres chaque PR et ne remplace pas les criteres des
changes OpenSpec.

| # | Constat | Ticket principal | Complement ou dependance | Traitement cible |
|---:|---|---|---|---|
| 1 | Couche domain backend vide | T-167, T-171 | T-167 documente, T-171 implemente | Documentation puis refactor |
| 2 | Couplage backend aux DTO OpenAPI | T-171 | T-167 documente l etat initial | Refactor backend |
| 3 | Couplage frontend au client OpenAPI | T-172 | T-164 et T-166 stabilisent la generation | Façade par feature |
| 4 | Autorisations backend divergentes | T-169 | Aucun | Refactor et tests |
| 5 | JdbcCampaignRepository multi-responsabilites | T-173 | T-171 stabilise les modeles | Decoupage backend |
| 6 | Tests H2 au lieu de PostgreSQL | T-165 | Aucun | Testcontainers |
| 7 | Versions OpenAPI differentes | T-164 | Aucun | Controle CI |
| 8 | Noms generes tronques avec accents | T-166 | T-164 | Contrat ASCII et regeneration |
| 9 | Depots Portainer divergents | T-170 | T-157, T-159 | Parite automatisee |
| 10 | Healthcheck production incorrect | T-170 | T-168 pour les doublons internes | Correction et verification |
| 11 | Bootstrap admin absent | T-170 | Aucun | Configuration alignee |
| 12 | Absence de synchronisation des depots | T-170 | Aucun | Jobs CI check et write |
| 13 | Source de verite production ambigue | T-170 | T-179 apres mise en service | Documentation et garde-fou |
| 14 | Variables Compose incoherentes | T-168, T-170 | T-170 pour la parite externe | Harmonisation |
| 15 | Duplication Nginx | T-168 | T-170 pour la parite externe | Include commun |
| 16 | Healthchecks dupliques | T-168 | T-170 pour le depot miroir | Source unique |
| 17 | besoins mélange fonctionnel et technique | T-174 | T-164 | Separation documentaire |
| 18 | Documentation frontend liee aux tickets | T-175 | Aucun | Documentation stable |
| 19 | Absence de state management global | T-176 | T-172 | Decision et socle si necessaire |
| 20 | Dependance Java du build frontend | T-177 | T-164 | Decision et chaine reproductible |
| 21 | Tracabilite OpenSpec front/back desequilibree | T-178 | T-167, T-172, T-174, T-175, T-177 | Audit de gouvernance |
| 22 | Nom besoins ambigu | T-174 | T-178 | Clarification documentaire |

Statut initial de cette matrice : tous les points sont attribues, aucun n est
declare termine avant la validation de sa PR et de ses dependances.
