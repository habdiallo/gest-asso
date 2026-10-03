## ADDED Requirements

### Requirement: Les taux de collecte sont normalisés pour l'affichage

Les vues de campagne SHALL afficher un taux de collecte avec au maximum une décimale et le signe pour cent. La valeur numérique complète SHALL rester disponible pour les calculs, les largeurs de progression et l'accessibilité si elle est nécessaire.

#### Scenario: Taux périodique dans le détail et la liste

- **WHEN** une campagne a encaissé 10 000 GNF sur 35 000 GNF
- **THEN** le détail et la liste affichent `28,6 %` ou la règle d'arrondi retenue, sans suite décimale brute

#### Scenario: Taux condensé du tableau de bord

- **WHEN** un indicateur reçoit une valeur comme `0.29296875`
- **THEN** le texte visible est limité à une décimale au maximum et la valeur brute reste distincte du texte de présentation
