## Contexte

Les écarts ont été reproduits dans l'environnement d'intégration autorisé. Les observations et captures QA sont expurgées des identifiants, cookies et mots de passe. Les corrections restent séparées par couche afin de produire une branche et une PR par ticket.

## Décisions

### T-201, formatage des taux

Ajouter un formateur d'affichage pur dans le frontend, avec une décimale au maximum et une locale française cohérente. Le nombre transmis à la largeur de progression et le nombre utilisé par les calculs restent inchangés. Les vues détail, liste et tableau de bord utilisent le même formateur.

### T-202, navigation à zoom élevé

Permettre aux liens de navigation basse de se répartir dans la largeur disponible et de retourner à la ligne lorsque le texte est agrandi. Le menu de profil mobile doit conserver une hauteur basée sur son contenu. Les contrôles restent natifs, nommés et atteignables au clavier.

### T-203, durée de session

Utiliser la propriété `security.jwt.expiration-seconds` pour la durée du cookie de session au lieu d'une valeur codée en dur. Porter la borne maximale autorisée à 30 minutes et le défaut de configuration à 1800 secondes. La modification n'introduit pas de renouvellement automatique et ne change pas les attributs de sécurité du cookie.

## Validation et retour arrière

- T-201 et T-202 : tests frontend ciblés, suite frontend, build et vérification navigateur aux tailles et zooms concernés.
- T-203 : tests backend ciblés et suite backend disponible, avec contrôle de la valeur `Max-Age` du cookie et de l'expiration du JWT.
- Le retour arrière consiste à restaurer la branche cible sans les commits de la PR concernée. Une configuration d'environnement peut temporairement fournir une valeur inférieure dans la borne autorisée.
