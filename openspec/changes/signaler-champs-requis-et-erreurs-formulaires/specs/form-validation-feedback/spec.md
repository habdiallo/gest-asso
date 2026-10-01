## ADDED Requirements

### Requirement: Identifier les champs obligatoires

Chaque formulaire fonctionnel SHALL signaler visuellement les champs obligatoires avec un indicateur cohérent et SHALL fournir une information équivalente accessible. Les champs facultatifs SHALL être distinguables sans ambiguïté.

#### Scenario: Champ obligatoire affiché

- **WHEN** un formulaire contient un champ requis
- **THEN** son label affiche l'indicateur obligatoire convenu et le contrôle expose l'état requis au navigateur ou à la technologie d'assistance

#### Scenario: Champ facultatif affiché

- **WHEN** un formulaire contient un champ facultatif
- **THEN** son label ne présente pas l'indicateur obligatoire et l'absence de valeur ne déclenche pas d'erreur de validation obligatoire

#### Scenario: Contrôle personnalisé obligatoire

- **WHEN** un champ requis est rendu par un sélecteur ou un composant personnalisé
- **THEN** le composant expose un nom accessible, l'état requis, l'état invalide et l'association vers son message d'erreur comme un contrôle natif

### Requirement: Afficher des messages de validation précis

Les formulaires SHALL afficher un message en français adapté à la règle de validation échouée. Le message SHALL aider l'utilisateur à corriger la saisie sans révéler de valeur secrète, de donnée privée ou d'information permettant d'énumérer un compte.

#### Scenario: Valeur obligatoire absente

- **WHEN** un champ requis est vide après interaction ou soumission
- **THEN** le formulaire affiche un message indiquant que ce champ doit être renseigné et associe ce message au contrôle

#### Scenario: Format ou valeur invalide

- **WHEN** une valeur ne respecte pas le format, le type ou la borne attendue
- **THEN** le formulaire affiche un message indiquant la nature de valeur attendue sans recopier une donnée sensible

#### Scenario: Cohérence entre champs

- **WHEN** deux champs doivent respecter une relation, par exemple une confirmation de mot de passe ou une date de fin postérieure à une date de début
- **THEN** le message indique la relation à corriger et le ou les contrôles concernés sont signalés comme invalides selon leur responsabilité

#### Scenario: Erreur d'authentification

- **WHEN** une connexion échoue à cause d'identifiants invalides ou d'un compte inexistant
- **THEN** le message reste générique et ne distingue pas l'identifiant inconnu, le mot de passe erroné ou l'état privé du compte

### Requirement: Relier les erreurs au contrôle

Tout message d'erreur de champ SHALL être relié au contrôle concerné et SHALL être annoncé sans dépendre uniquement de la couleur. Le champ invalide SHALL exposer `aria-invalid` de manière cohérente avec le message affiché.

#### Scenario: Erreur après soumission

- **WHEN** l'utilisateur soumet un formulaire incomplet
- **THEN** les champs invalides sont identifiables, leurs messages sont associés par `aria-describedby` et le premier point d'erreur pertinent est atteignable au clavier

#### Scenario: Erreur après correction

- **WHEN** l'utilisateur corrige une valeur invalide
- **THEN** le message associé disparaît ou est remplacé selon l'état courant, `aria-invalid` est mis à jour et aucune ancienne erreur ne reste annoncée

#### Scenario: Réinitialisation du formulaire

- **WHEN** le formulaire est annulé ou réinitialisé
- **THEN** les messages d'erreur et états invalides sont retirés, les marqueurs de champs obligatoires restent présents et la saisie est remise dans l'état prévu

### Requirement: Utiliser les traductions et les erreurs API stables

Les libellés, aides et messages ajoutés SHALL utiliser les clés Transloco françaises. Les erreurs retournées par l'API SHALL être interprétées à partir de `ErrorResponse.code` et `fieldErrors`, jamais à partir d'une comparaison fragile du texte libre.

#### Scenario: Message localisé

- **WHEN** un nouveau message de validation est affiché
- **THEN** le template utilise une clé Transloco existante ou nouvellement enregistrée dans `fr.json` et aucun texte français métier n'est écrit en dur dans le template

#### Scenario: Erreur API avec champ ciblé

- **WHEN** l'API renvoie une erreur de validation avec `fieldErrors`
- **THEN** le message est rattaché au champ concerné lorsqu'il est connu, sinon une erreur de formulaire compréhensible est affichée sans exposer le contenu technique brut

#### Scenario: Erreur API sans détail exploitable

- **WHEN** l'API renvoie une erreur métier ou technique sans détail de champ exploitable
- **THEN** le formulaire affiche un message générique adapté au contexte et conserve la saisie lorsque la sécurité le permet
