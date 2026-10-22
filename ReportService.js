// TP 3 · Rapport mensuel des ventes de ShopLite, en cours de refactoring.
// ReportService orchestre : il lit, calcule, met en forme, journalise et envoie
// en déléguant chaque tâche à un objet reçu par le constructeur.
import { computeStats } from './domain/salesStats.js';
import { EmailAddress } from './domain/EmailAddress.js';
import { PRO_PLAN } from './domain/ReportPlan.js';
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
    plan = PRO_PLAN,
  } = {}) {
    this.formatters = formatters;
    this.orders = orders;
    this.mailer = mailer;
    this.logger = logger;
    this.plan = plan; // publique : l'appelant peut demander service.plan.allowsFormat('html')
  }

  // Provisoire : les tests lisent encore service.outbox ; ils liront mailer.outbox à l'extraction 5
  get outbox() {
    return this.mailer.outbox;
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
