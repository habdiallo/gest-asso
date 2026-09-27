## MODIFIED Requirements

### Requirement: Adaptation responsive de l'interface

Le frontend SHALL fonctionner sur les tailles d'écran desktop, tablette et mobile,
avec des transitions déterminées par les besoins réels de lisibilité, de densité
et de composition. Les composants SHALL rester stables entre les breakpoints, et
les formulaires SHALL conserver une présentation en dialogue sur desktop ou tablette
et en plein écran sur mobile lorsque cette transition est nécessaire et confirmée
par l'audit.

#### Scenario: Ouverture d'un formulaire sur desktop ou tablette

- **WHEN** un utilisateur déclenche un formulaire sur une largeur où la composition
  superposée reste lisible
- **THEN** le frontend ouvre le formulaire dans une boîte de dialogue nommée,
  avec focus visible, actions accessibles et largeur adaptée au conteneur disponible

#### Scenario: Ouverture d'un formulaire sur mobile

- **WHEN** un utilisateur déclenche un formulaire sur une largeur mobile où une
  boîte de dialogue contrainte dégraderait la lisibilité
- **THEN** le frontend ouvre le formulaire en plein écran, sans perte de labels,
  validation, actions, fermeture ou restitution du focus

#### Scenario: Transition entre deux seuils

- **WHEN** la largeur évolue progressivement entre les seuils responsive
- **THEN** la navigation, la sidebar, les cartes, les formulaires et les actions
  ne débordent pas, ne se chevauchent pas et ne requièrent pas un breakpoint
  supplémentaire non justifié par un problème observé
