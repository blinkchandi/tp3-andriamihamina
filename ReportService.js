// TP 3 · Rapport mensuel des ventes de ShopLite, en cours de refactoring.
// ReportService orchestre : il lit, calcule, met en forme, journalise et envoie
// en déléguant chaque tâche à un objet reçu par le constructeur.
import { computeStats } from './domain/salesStats.js';
import { EmailAddress } from './domain/EmailAddress.js';
import { FormatterRegistry } from './formatters/FormatterRegistry.js';
import { CsvFormatter } from './formatters/CsvFormatter.js';
import { HtmlFormatter } from './formatters/HtmlFormatter.js';
import { JsonFormatter } from './formatters/JsonFormatter.js';
import { JsonFileOrderRepository } from './infrastructure/JsonFileOrderRepository.js';
import { SmtpMailer } from './infrastructure/SmtpMailer.js';
import { ConsoleLogger } from './infrastructure/ConsoleLogger.js';

// Valeurs par défaut, provisoires : elles partiront dans main.js (composition root) à l'extraction 5
const defaultFormatters = () => new FormatterRegistry()
  .register('csv', new CsvFormatter())
  .register('html', new HtmlFormatter())
  .register('json', new JsonFormatter());

export class ReportService {
  constructor({
    formatters = defaultFormatters(),
    orders = new JsonFileOrderRepository(new URL('./orders.json', import.meta.url)),
    mailer = SmtpMailer.fromEnv(),
    logger = new ConsoleLogger(),
  } = {}) {
    this.formatters = formatters;
    this.orders = orders;
    this.mailer = mailer;
    this.logger = logger;
  }

  // Provisoire : les tests lisent encore service.outbox ; ils liront mailer.outbox à l'extraction 5
  get outbox() {
    return this.mailer.outbox;
  }

  generate(month, format, recipient) {
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

// Variante « offre gratuite » : elle refuse ce que la classe parente accepte (corrigée à l'extraction 4)
export class FreeReportService extends ReportService {
  generate(month, format, recipient) {
    if (format !== 'csv') throw new Error('Format réservé aux comptes Pro');
    if (recipient) throw new Error('Envoi par e-mail réservé aux comptes Pro');
    return super.generate(month, format);
  }
}
