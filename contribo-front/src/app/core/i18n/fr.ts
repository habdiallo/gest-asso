export const fr = {
  'app.brandName': 'Contribo',
  'auth.login.brandCaption': 'Gestion associative',
  'auth.login.associationName': 'Union Contribo Conakry',
  'auth.login.heroTitleLine1': 'Gérer ensemble.',
  'auth.login.heroTitleLine2': 'Agir avec clarté.',
  'auth.login.heroDescription':
    "Un espace unique pour suivre les membres, les cotisations et les actions de solidarité de l'association.",
  'auth.login.heading': 'Bienvenue',
  'auth.login.subheading': 'Connectez-vous à votre espace associatif.',
  'auth.login.identifierLabel': 'Identifiant',
  'auth.login.identifierRequired': "L'identifiant est obligatoire.",
  'auth.login.passwordLabel': 'Mot de passe',
  'auth.login.passwordRequired': 'Le mot de passe est obligatoire.',
  'auth.login.submit': 'Se connecter',
  'auth.login.submitting': 'Connexion…',
  'auth.login.note':
    "L'accès est créé par un responsable de l'association. Il n'existe pas d'inscription libre.",
  'auth.login.error': 'Identifiant ou mot de passe incorrect.',
} as const;

export type TranslationKey = keyof typeof fr;
