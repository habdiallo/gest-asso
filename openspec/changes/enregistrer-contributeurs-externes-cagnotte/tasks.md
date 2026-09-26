## 1. Contribution membre ou externe

- [x] 1.1 [T-134] Résoudre T-134, vérifier ses prérequis et préparer la branche `fullstack/feat-134-contributeur-externe-cagnotte` avant toute modification de code, puis exécuter `node scripts/tickets.mjs verify T-134`.
- [x] 1.2 [T-134] Mettre à jour le cahier métier pour remplacer le rattachement obligatoire à un membre par une identité exclusive membre ou contributeur externe, documenter les règles de validation, de comptage et d'accès à l'espace membre, scope `fullstack`, type `feat`, branche `fullstack/feat-134-contributeur-externe-cagnotte`.
- [x] 1.3 [T-134] Faire évoluer `besoins/openapi.yaml` pour les requêtes et réponses de contribution, l'invariant exactement un contributeur, les erreurs de validation et les agrégats, puis valider le contrat sans modifier les droits ni les modes de règlement.

- [x] 1.4 [T-134] Régénérer le client Angular depuis le contrat et adapter les mocks MSW avec des contributions membre et externe cohérentes avec le bilan, la liste, la pagination et le comptage des contributeurs.
- [x] 1.5 [T-134] Reconcevoir `ContributionCreateForm` pour afficher un dialogue aéré et accessible, conserver la cagnotte en lecture seule depuis sa fiche et proposer le choix exclusif « Membre de l'association » ou « Contributeur externe » avec les validations et états d'erreur associés.
- [x] 1.6 [T-134] Adapter `SocialFundDetailPage` et les vues d'historique pour afficher le membre ou le contributeur externe, préserver l'autorisation, le rafraîchissement après succès, la traçabilité et l'exclusion des externes de l'espace personnel.
- [x] 1.7 [T-134] Ajouter ou ajuster les tests de formulaire, de page, de client/mock et d'agrégats pour couvrir les deux variantes, le changement de mode, les erreurs, les droits, la clôture et la conservation de la saisie, puis vérifier le dialogue au clavier, le focus, les messages associés, les thèmes et le responsive.
- [ ] 1.8 [T-134] Exécuter la validation OpenAPI, les tests frontend, le lint, le build, le formatage, `node scripts/tickets.mjs check`, `node scripts/tickets.mjs verify T-134` et préparer une PR ciblée vers `main` sans fusion ni push direct vers `main`.

## 2. Harmonisation des dialogues d'enregistrement

- [x] 2.1 [T-134] Auditer les trois parcours d'enregistrement et définir le gabarit partagé dans `FormDialog` : largeur desktop cible de 920 px, breakpoint de grille à 821 px, espacements, labels, états d'erreur, zone de traçabilité et pied d'actions, scope `fullstack`, type `feat`, branche `fullstack/feat-134-contributeur-externe-cagnotte`.
- [x] 2.2 [T-134] Refactorer le formulaire de règlement de la fiche membre et `RecordPaymentForm` pour appliquer le même gabarit paysage, sans modifier les règles de sélection de cotisation, de plafond au reste à payer, d'autorisation ou de soumission.
- [x] 2.3 [T-134] Adapter `ContributionCreateForm` dans ses modes membre et contributeur externe pour utiliser la même largeur, la même grille et le même pied d'actions, en conservant le contexte de cagnotte, la case externe et les validations propres à la contribution.
- [x] 2.4 [T-134] Réduire la duplication de présentation uniquement si nécessaire, via une primitive neutre de layout ou d'actions dans `shared`, sans introduire de DTO, de logique métier ou de dépendance entre features.
- [x] 2.5 [T-134] Ajouter les tests structurels et responsive des trois dialogues : composition en deux colonnes sur desktop, empilement sur petite fenêtre, absence de débordement, cohérence des labels et du footer, navigation clavier, focus et conservation des erreurs.
- [x] 2.6 [T-134] Rejouer les validations ciblées des formulaires et de `FormDialog`, le lint, le build et la vérification navigateur des trois parcours dans les deux thèmes, puis mettre à jour uniquement les cases réalisées.

## 3. Contexte métier des règlements

- [x] 3.1 [T-134] Documenter la différence de contexte entre le règlement ouvert depuis une campagne et celui ouvert depuis une fiche membre, scope `fullstack`, type `feat`, branche `fullstack/feat-134-contributeur-externe-cagnotte`.
- [x] 3.2 [T-134] Vérifier et maintenir le contrat et les mocks existants pour conserver une écriture sur un `dueId` unique, sans ajouter de cumul ni de ventilation multi-campagnes, scope `fullstack`, type `feat`, branche `fullstack/feat-134-contributeur-externe-cagnotte`.
- [x] 3.3 [T-134] Adapter le dialogue ouvert depuis une campagne pour afficher le membre et la campagne en lecture seule, sans sélecteur de contexte, et conserver le plafond au reste à payer de la cotisation sélectionnée.
- [x] 3.4 [T-134] Adapter le dialogue ouvert depuis une fiche membre pour garder le membre en lecture seule, sélectionner une cotisation ouverte non soldée et mettre à jour le résumé et le plafond selon la cotisation choisie.
- [x] 3.5 [T-134] Ajouter les validations et mocks couvrant les deux points d'entrée, l'absence de cotisation éligible et l'interdiction de ventiler un règlement sur plusieurs campagnes.

## 4. Sélection initiale et harmonisation ciblée

- [x] 4.1 [T-134] Mettre à jour la documentation métier, le design et la spécification pour formaliser la préselection de la première cotisation éligible, le résumé identique depuis les deux points d'entrée et la distinction entre libellé descriptif de ligne et confirmation contextualisée, scope `fullstack`, type `feat`, branche `fullstack/feat-134-contributeur-externe-cagnotte`.
- [x] 4.2 [T-134] Aligner le formulaire de règlement sur le contrat `POST /dues/{dueId}/payments` en présélectionnant un `dueId` éligible depuis la fiche membre et en ajoutant le résumé dû, déjà payé et reste à payer dans le formulaire ouvert depuis une campagne.
- [x] 4.3 [T-134] Harmoniser les dimensions des boutons, les pieds de formulaire et les labels de champs des parcours membre, campagne et cagnotte, puis raccourcir uniquement les libellés redondants comme « Confirmer l'enregistrement » vers « Confirmer » via Transloco.
- [x] 4.4 [T-134] Ajouter les tests de préselection, de résumé identique, de soumission sur le `dueId` sélectionné, de gabarit des boutons et de cohérence responsive, puis rejouer les validations ciblées.
- [x] 4.5 [T-134] Supprimer le champ de recherche membre externe au select et conserver la pagination lorsque l'API renvoie plusieurs pages, avec tests et libellés nettoyés.
- [x] 4.6 [T-134] Ajouter une recherche intégrée en première ligne à tout `app-custom-select` de plus de 20 options, fournir un mock de membres dépassant ce seuil et vérifier le filtrage clavier et visuel.
- [x] 4.7 [T-134] Remplacer les calendriers natifs des formulaires concernés par un `DateInput` partagé, documenter le contrat de valeur `YYYY-MM-DD`, la présélection visuelle du jour courant, l'état du bouton « Aujourd'hui » et les règles de contraste, puis valider le rendu thématique et l'accessibilité.
