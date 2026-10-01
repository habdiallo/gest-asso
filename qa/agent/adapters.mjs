const irreversibleWords = ['delete', 'disable', 'close', 'recordpayment', 'recordcontribution', 'supprimer', 'désactiver', 'clôturer', 'règlement', 'contribution'];

export function requiresConfirmation(scenario) {
  const text = `${scenario.name} ${scenario.context} ${scenario.steps.join(' ')}`.toLowerCase();
  return irreversibleWords.some(word => text.includes(word));
}

export class GuidedAdapter {
  constructor({ confirm } = {}) {
    this.confirm = confirm ?? (() => false);
  }

  execute(scenario) {
    if (requiresConfirmation(scenario) && !this.confirm(scenario)) {
      return { status: 'Non applicable', observation: 'Confirmation manuelle requise pour cette action sensible.' };
    }
    return {
      status: 'Non applicable',
      observation: 'Étapes présentées au testeur. Fournir une observation pour enregistrer un verdict.',
    };
  }
}

export class BrowserAdapter {
  constructor({ driver } = {}) {
    this.driver = driver;
  }

  execute() {
    if (!this.driver || typeof this.driver.execute !== 'function') {
      throw new Error('Aucun adaptateur navigateur autorisé n est configuré. Utiliser le mode guidé.');
    }
    return this.driver.execute(...arguments);
  }
}
