# Investigation

1. **Intention** : quel comportement et quels critères le ticket change-t-il ?
2. **Carte** : entrées, appels, dépendances, état, persistance/contrat et tests touchés.
3. **Correctness** : erreurs, valeurs absentes, limites, dates, montants, annulation,
   transitions d'état et comportement asynchrone réellement atteignables.
4. **Régressions** : contrats existants et parcours des appelants ; défaut nouveau
   ou aggravé par le diff, pas un problème historique sans rapport.
5. **Sécurité** : acteurs, permissions, entrées contrôlables, traitement et impact
   démontrés. Vérifier les barrières existantes avant d'émettre un constat.
6. **Données/concurrence** : cohérence des montants, doublons, mutations répétées,
   retries et requêtes concurrentes selon les garanties effectives du contrat.
7. **Performance** : volume et chemin réels, coût mesurable ou complexité démontrée.
   Une optimisation possible sans impact établi ne suffit pas.
8. **Tests** : vérifier les scénarios du changement et les protections existantes.
   Proposer une régression ciblée pour un bug prouvé ; ne pas signaler chaque
   nouveau fichier sans test comme un défaut autonome.
9. **Validation** : pour chaque constat, localiser la ligne introduite, montrer le
   scénario et la preuve, expliquer l'impact, vérifier l'absence d'une protection
   qui invaliderait la conclusion et suggérer une correction courte.

Ne pas réécrire l'architecture, multiplier les nits ou imposer des dépendances.
