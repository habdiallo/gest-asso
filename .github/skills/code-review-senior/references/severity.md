# Priorités

| Priorité | Critère démontré |
| --- | --- |
| P0 | Incident critique, perte de données ou faille majeure, atteignable sans hypothèse supplémentaire ; arrêt immédiat de la livraison |
| P1 | Défaut significatif sur un parcours ou une permission critique ; correction avant intégration |
| P2 | Défaut réel sur un cas limité, avec impact concret ; correction planifiable |
| P3 | Défaut mineur observable ; jamais une simple préférence ou simplification stylistique |

La gravité exprime l'impact, pas le degré d'incertitude. Un constat incertain reste
à investiguer ; il ne devient pas un P3. Ne pas présenter une absence de test,
une dette supposée ou une régression seulement « probable » comme un bug prouvé.
