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
