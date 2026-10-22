// TP 3 · CODE DE DÉPART (à refactorer). Rapport mensuel des ventes de ShopLite.
// Ce code fonctionne, mais il viole plusieurs principes SOLID. Ne le réécrivez pas d'un bloc :
// figez d'abord son comportement par des tests, puis extrayez les responsabilités une par une.
import fs from 'node:fs';
import { computeStats } from './domain/salesStats.js';
import { FormatterRegistry } from './formatters/FormatterRegistry.js';
import { CsvFormatter } from './formatters/CsvFormatter.js';
import { HtmlFormatter } from './formatters/HtmlFormatter.js';
import { JsonFormatter } from './formatters/JsonFormatter.js';

// Registre par défaut, provisoire : il partira dans main.js (composition root) à l'extraction 5
const defaultFormatters = () => new FormatterRegistry()
  .register('csv', new CsvFormatter())
  .register('html', new HtmlFormatter())
  .register('json', new JsonFormatter());

export class ReportService {
  constructor({ formatters = defaultFormatters() } = {}) {
    this.formatters = formatters;
    // Dépendances concrètes créées ici : impossible de les remplacer dans un test
    this.dbFile = new URL('./orders.json', import.meta.url);
    this.smtp = {
      host: 'smtp.shoplite.fr',
      port: 587,
      user: 'reports',
      password: 'Sh0pL1te!',
    };
    this.outbox = []; // e-mails « envoyés » (simulation du serveur SMTP)
    this.history = [];
  }

  loadOrders() {
    const raw = fs.readFileSync(this.dbFile, 'utf8');
    return JSON.parse(raw);
  }

  generate(month, format, recipient) {
    // 1. Lecture des données
    const orders = this.loadOrders();

    // 2. Calculs métier : délégués à la fonction pure computeStats
    const stats = computeStats(orders, month);

    // 3. Mise en forme : déléguée au formatter du registre (plus aucun if sur le format)
    const output = this.formatters.get(format).format(stats);

    // 4. Journalisation
    const line = `[${new Date().toISOString()}] rapport ${month} (${format}) : ${stats.count} commande(s)`;
    console.log(line);
    this.history.push(line);

    // 5. Envoi par e-mail
    if (recipient) {
      if (!recipient.includes('@')) throw new Error(`Adresse invalide : ${recipient}`);
      this.outbox.push({
        via: `${this.smtp.host}:${this.smtp.port}`,
        to: recipient,
        subject: `Rapport des ventes ${month}`,
        body: output,
      });
    }
    return output;
  }
}

// Variante « offre gratuite » : elle refuse ce que la classe parente accepte
export class FreeReportService extends ReportService {
  generate(month, format, recipient) {
    if (format !== 'csv') throw new Error('Format réservé aux comptes Pro');
    if (recipient) throw new Error('Envoi par e-mail réservé aux comptes Pro');
    return super.generate(month, format);
  }
}
