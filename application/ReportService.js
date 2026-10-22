// Rapport mensuel des ventes de ShopLite : cas d'utilisation « générer un rapport ».
// ReportService orchestre et ne crée AUCUNE dépendance : toutes arrivent par le constructeur
// (assemblées dans main.js, la composition root).
import { computeStats } from '../domain/salesStats.js';
import { EmailAddress } from '../domain/EmailAddress.js';
import { PRO_PLAN } from '../domain/ReportPlan.js';

export class ReportService {
  // orders.all() · formatters.get(nom).format(stats) · mailer.send({ to, subject, body }) · logger.info(message)
  constructor({ orders, formatters, mailer, logger, plan = PRO_PLAN }) {
    this.orders = orders;
    this.formatters = formatters;
    this.mailer = mailer;
    this.logger = logger;
    this.plan = plan; // publique : l'appelant peut demander service.plan.allowsFormat('html')
  }

  generate(month, format, recipient) {
    this.plan.check(format, recipient);
    const stats = computeStats(this.orders.all(), month);
    const output = this.formatters.get(format).format(stats);
    this.logger.info(`rapport ${month} (${format}) : ${stats.count} commande(s)`);

    if (recipient) {
      const to = new EmailAddress(recipient);
      this.mailer.send({ to: to.value, subject: `Rapport des ventes ${month}`, body: output });
    }
    return output;
  }
}
