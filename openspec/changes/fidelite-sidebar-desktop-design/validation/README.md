# Validation de T-111

La validation concerne uniquement le visuel de la sidebar desktop. Référence : `design/styles.css` et le bloc sidebar de `design/app.js`, avec les liens, libellés et autorisations actuels de Contribo.

## Résultats techniques

Depuis `contribo-front/` :

- `npm test -- --watch=false` : 41 fichiers, 346 tests réussis, y compris les tests d'identité et de navigation verticale ajoutés pour T-111.
- `npm run build` : build de production réussi, y compris après les derniers ajustements CSS.
- `npx --no-install eslint src/app/app.ts src/app/app.html src/app/app.spec.ts src/app/shared/navigation-menu/navigation-menu.ts src/app/shared/navigation-menu/navigation-menu.html src/app/shared/navigation-menu/navigation-menu.spec.ts` : réussi.
- `npx --no-install prettier --check src/app/app.ts src/app/app.html src/app/app.css src/app/app.spec.ts src/app/shared/navigation-menu/navigation-menu.ts src/app/shared/navigation-menu/navigation-menu.html src/app/shared/navigation-menu/navigation-menu.css src/app/shared/navigation-menu/navigation-menu.spec.ts` : réussi ; contrôle des deux fichiers CSS répété après les derniers ajustements.

Depuis la racine : `node scripts/tickets.mjs verify T-111`, `node scripts/tickets.mjs check --base-ref origin/main`, `openspec validate fidelite-sidebar-desktop-design --strict` et `git diff --check` réussis.

## Vérifications dans Google Chrome

Les deux pages ont été ouvertes dans Chrome. L'adresse IDE du prototype sur le port 63342 renvoyait 404 ; le même dossier `design/` a donc été servi sur `http://127.0.0.1:63343/index.html#dashboard`. L'application était accessible sur `http://localhost:4200/` avec ses comptes de démonstration.

Les captures utilisent les polices chargées, un facteur d'échelle de 1 et les mêmes viewports de référence. Les différences de menus et de noms entre prototype et application sont conservées intentionnellement : le prototype fournit le style, sans remplacer la matrice des droits ni les données de session.

- 16 cas desktop : quatre rôles applicatifs, deux thèmes, deux tailles (1440 × 900 et 1024 × 768). Largeur 256 px, padding 28/20/20 px, flou 24 px, logo 38 px, liens de hauteur nominale 43 px, destinations autorisées et absence de débordement horizontal vérifiés.
- 8 cas à texte agrandi : quatre rôles, deux thèmes, viewport 1024 × 360 avec taille racine de 32 px. Chaque lien et le bouton de déconnexion restent atteignables par défilement ; les interlignes ne recouvrent pas le texte.
- 24 contrôles responsive : quatre rôles, deux thèmes, largeurs 820, 821 et 375 px. Seuil de visibilité et décalage du contenu principal inchangés aux tailles normales.
- Pour chaque rôle et chaque thème, activation d'un lien existant, état `aria-current="page"`, focus visible obtenu par Tab/Maj+Tab puis activation par Entrée vérifiés. Pour chaque rôle, déconnexion par Entrée, suppression du jeton local, route `/login` et disparition de la sidebar vérifiées.
- Captures supplémentaires Administrateur à 1440 × 900 : normal, survol, lien actif et focus clavier, pour l'application et le prototype en clair/sombre. Les états de survol et de focus sont verrouillés dans l'inspecteur pour stabiliser les images après les interactions ; ce verrouillage ne constitue pas un test d'événements de souris.
- 6 contrôles mobile supplémentaires : 375 et 820 px à texte normal, puis 375 px avec texte à 200 %, dans les deux thèmes. Libellé de déconnexion complet, contrôles dans le viewport, contenu sous l'en-tête et destinations du menu horizontal inchangées vérifiés.

Les mesures sont dans [final-audit.json](final-audit.json) et [interaction-audit.json](interaction-audit.json). La [galerie comparative](index.html) permet de choisir le thème et l'état, puis d'ouvrir les captures entières. Les fichiers `final-app-*` et `final-design-*` couvrent les quatre rôles aux deux tailles desktop. Les fichiers `before-*` gardent une référence du rendu initial à 1440 px. Les captures `final-stress-administrator-*` montrent le pied atteint après défilement à texte agrandi, avec les parties supérieures hors viewport dans cet état.

## Adaptations locales documentées

- Sous-titre, rubrique et rôle utilisent `text-2` pour conserver un contraste lisible. Les jetons globaux restent inchangés.
- Le texte actif et les initiales en thème clair utilisent localement `#8a692e` : contraste calculé d'environ 4,62:1 sur le fond actif composite clair, contre environ 3,63:1 avec `gold-hover`. Le cadre, le fond gold-wash et le repère latéral gardent leur présentation dorée.
- L'interligne des liens est proportionnel à leur taille de texte. Leur hauteur reste 43 px à taille normale et augmente quand leurs libellés reviennent à la ligne.
- Les actions du pied peuvent passer sur plusieurs lignes et le menu garde une hauteur minimale de 120 px. Le menu et, à très faible hauteur, la sidebar permettent le défilement pour conserver l'accès aux liens et aux actions sans recouvrement.
- Le bloc d'identité est informatif ; les actions thème et déconnexion restent en pied. Aucune page compte, route, requête ou permission supplémentaire n'est introduite.

## Limites

Contrôles Chrome réalisés avec des scripts temporaires via le protocole DevTools, sans installation de runner E2E. Aucun audit d'accessibilité automatisé exhaustif ni validation dans d'autres navigateurs n'a été exécuté. Les tests applicatifs utilisent Vitest/jsdom et ne prouvent pas les détails du rendu natif. La revue de la PR et la fusion restent distinctes de ces validations.
