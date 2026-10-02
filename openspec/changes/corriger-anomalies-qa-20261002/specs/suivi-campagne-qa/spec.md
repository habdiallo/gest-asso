## ADDED Requirements

### Requirement: La campagne QA est suivie par des artefacts versionnés

La campagne SHALL conserver sous `qa/runs/<runId>/` les résultats, anomalies, tickets QA et synthèses nécessaires à la reprise et à la revue, sans secret ni donnée sensible non expurgée.

#### Scenario: Campagne terminée avec anomalies

- **WHEN** un run manuel est terminé avec une ou plusieurs anomalies confirmées
- **THEN** la synthèse indique les compteurs par statut
- **THEN** chaque anomalie référence son scénario et son ticket QA local
- **THEN** la PR de campagne indique les tickets correctifs ouverts et les scénarios restant à revalider

#### Scenario: Scénario non applicable ou bloqué

- **WHEN** un scénario n'est pas exécuté parce qu'un prérequis manque ou qu'une action exige une reprise humaine
- **THEN** le rapport indique explicitement le blocage
- **THEN** le scénario n'est pas compté comme réussi ou échoué
