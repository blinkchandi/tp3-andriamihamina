// Politique d'offre (Pro, Gratuite) : ce que le compte a le droit de demander.
// Remplace la sous-classe FreeReportService : l'appelant peut INTERROGER la politique
// (allowsFormat, allowsEmail) avant d'appeler generate(), au lieu de découvrir un refus par exception.
export class ReportPlan {
  constructor({ name, formats = null, email = true }) {
    this.name = name;
    this.formats = formats; // null = tous les formats enregistrés
    this.email = email;
  }

  allowsFormat(format) {
    return this.formats === null || this.formats.includes(format);
  }

  allowsEmail() {
    return this.email;
  }

  // Garde appelée par ReportService ; messages repris de l'ancienne FreeReportService
  check(format, recipient) {
    if (!this.allowsFormat(format)) throw new Error('Format réservé aux comptes Pro');
    if (recipient && !this.allowsEmail()) throw new Error('Envoi par e-mail réservé aux comptes Pro');
  }
}

export const PRO_PLAN = new ReportPlan({ name: 'pro' });
export const FREE_PLAN = new ReportPlan({ name: 'gratuit', formats: ['csv'], email: false });
