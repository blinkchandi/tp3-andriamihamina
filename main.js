// COMPOSITION ROOT : le seul fichier qui crée les objets concrets (new) et les assemble.
// La configuration SMTP vient de l'environnement (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD).
// Lancer : node seance3-solid/tp3-andriamihamina/main.js   (même sortie que tp3/demo.js)
import { pathToFileURL } from 'node:url';
import { ReportService } from './application/ReportService.js';
import { PRO_PLAN } from './domain/ReportPlan.js';
import { FormatterRegistry } from './formatters/FormatterRegistry.js';
import { CsvFormatter } from './formatters/CsvFormatter.js';
import { HtmlFormatter } from './formatters/HtmlFormatter.js';
import { JsonFormatter } from './formatters/JsonFormatter.js';
import { JsonFileOrderRepository } from './infrastructure/JsonFileOrderRepository.js';
import { SmtpMailer } from './infrastructure/SmtpMailer.js';
import { ConsoleLogger } from './infrastructure/ConsoleLogger.js';

export function buildReportService({
  env = process.env,
  ordersFile = new URL('./orders.json', import.meta.url),
  plan = PRO_PLAN,
  logger = new ConsoleLogger(),
} = {}) {
  const formatters = new FormatterRegistry()
    .register('csv', new CsvFormatter())
    .register('html', new HtmlFormatter())
    .register('json', new JsonFormatter());
  const mailer = SmtpMailer.fromEnv(env);
  const orders = new JsonFileOrderRepository(ordersFile);
  const service = new ReportService({ orders, formatters, mailer, logger, plan });
  return { service, formatters, mailer };
}

// Démonstration, seulement quand le fichier est lancé directement (pas quand un test l'importe)
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { service, mailer } = buildReportService();
  console.log(service.generate('2026-09', 'csv'));
  console.log(service.generate('2026-09', 'html', 'direction@shoplite.fr'));
  console.log('E-mails envoyés :', mailer.outbox.length);
}
