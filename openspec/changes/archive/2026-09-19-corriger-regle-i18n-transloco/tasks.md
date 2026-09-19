## 1. T-112 (docs/fix-112-corriger-regle-i18n-transloco)

Périmètre : corriger `.claude/rules/frontend/i18n.md` pour refléter que
Transloco est installé et utilisé dans `contribo-front` depuis T-3, et non
qu'aucun outil de traduction n'est installé. Préciser que les nouveaux
libellés d'interface passent par une clé Transloco dans `fr.json`, en
réutilisant une clé existante quand un libellé équivalent est déjà présent,
et que seul `fr.json` est maintenu par les agents (pas de `en.json`, pas de
sélecteur de langue). Aucun code applicatif, aucune migration des vues
existantes déjà en texte en dur dans ce ticket.

- [x] 1.1 [T-112] Créer/réutiliser la branche
      `docs/fix-112-corriger-regle-i18n-transloco` à partir de `origin/main`
      (dépôt propre, aucune modification étrangère embarquée).
- [x] 1.2 [T-112] Corriger `.claude/rules/frontend/i18n.md` : Transloco est
      installé/configuré, réutilisation des clés existantes, périmètre
      limité à `fr.json`.

## 2. Publication

- [x] 2.1 [T-112] Committer avec le message `docs(docs): T-112 corriger la
      regle i18n Transloco` (ou équivalent conforme), en ajoutant uniquement
      les fichiers du ticket.
- [x] 2.2 [T-112] Pousser la branche
      `docs/fix-112-corriger-regle-i18n-transloco` et ouvrir une PR vers
      `main` avec le modèle du dépôt, seulement si la livraison est
      explicitement demandée.
