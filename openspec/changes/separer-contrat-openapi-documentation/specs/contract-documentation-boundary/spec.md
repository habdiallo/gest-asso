## ADDED Requirements

### Requirement: Séparer le besoin métier du contrat HTTP

Le dépôt SHALL distinguer le [cahier métier](../../../../../besoins/cahier-user-stories-mvp-association-v2.md),
qui porte les acteurs, parcours et règles de gestion, du
[contrat OpenAPI](../../../../../contribo-back/src/main/resources/contribo-api.yml), qui porte la forme des
échanges HTTP. Aucun client, modèle généré ou README d'application ne SHALL
devenir une source concurrente de l'un de ces documents.

#### Scenario: Besoin sans interface HTTP

- **WHEN** une règle métier ne nécessite pas d'échange HTTP nouveau ou modifié
- **THEN** elle reste documentée dans le cahier et les specs concernées sans ajout artificiel dans OpenAPI

#### Scenario: Besoin exposé par l'API

- **WHEN** une capacité métier nécessite une interface HTTP
- **THEN** le besoin est clarifié dans le cahier et la spec, puis l'interface est définie dans `contribo-back/src/main/resources/contribo-api.yml` avant la génération des consommateurs

#### Scenario: Divergence entre les sources

- **WHEN** le cahier, une spec et le contrat ne décrivent pas le même comportement
- **THEN** l'écart est arbitré et documenté avant toute modification locale du client, du backend ou des mocks

### Requirement: Rendre les liens et la génération vérifiables

La documentation SHALL relier le cahier métier, le contrat OpenAPI, les specs
OpenSpec et les README frontend/backend. La génération SHALL utiliser le même
`contribo-back/src/main/resources/contribo-api.yml` et des versions de générateur alignées côté frontend et
backend.

#### Scenario: Génération après modification du contrat

- **WHEN** `contribo-back/src/main/resources/contribo-api.yml` est modifié pour une interface acceptée
- **THEN** le contrat est validé, la parité des générateurs est contrôlée, les consommateurs concernés sont régénérés ou alignés, et les sorties générées ne sont pas éditées manuellement

#### Scenario: Contrôle de livraison

- **WHEN** le ticket est validé
- **THEN** son périmètre est couvert par la documentation, ses liens et validations sont vérifiables, et aucune modification de comportement applicatif n'est introduite
