// Preuve de l'injection : de faux objets passés au constructeur remplacent fichier, SMTP et console.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ReportService } from './application/ReportService.js';
import { FormatterRegistry } from './formatters/FormatterRegistry.js';
import { CsvFormatter } from './formatters/CsvFormatter.js';
import { ConsoleLogger } from './infrastructure/ConsoleLogger.js';

test('lecture, envoi et journal peuvent être remplacés par injection', () => {
  const orders = { all: () => [
    { date: '2026-09-01', status: 'PAID', lines: [{ category: 'livres', qty: 1, unitPrice: 10 }] },
  ] };
  const formatters = new FormatterRegistry().register('csv', new CsvFormatter());
  const sent = [];
  const mailer = { send: message => sent.push(message) };
  const logs = [];
  const logger = { info: message => logs.push(message) };

  const service = new ReportService({ orders, formatters, mailer, logger });
  const csv = service.generate('2026-09', 'csv', 'direction@shoplite.fr');

  assert.equal(csv, 'categorie;montant_ht\nlivres;10\nTOTAL HT;10\nTVA;2\nTOTAL TTC;12\n');
  assert.deepEqual(sent, [{ to: 'direction@shoplite.fr', subject: 'Rapport des ventes 2026-09', body: csv }]);
  assert.deepEqual(logs, ['rapport 2026-09 (csv) : 1 commande(s)']);
});

test('ConsoleLogger : horloge injectée, ligne de journal prévisible', (t) => {
  const printed = t.mock.method(console, 'log', () => {});
  new ConsoleLogger({ now: () => new Date('2026-10-22T09:30:00.000Z') }).info('rapport 2026-09 (csv) : 3 commande(s)');
  assert.equal(printed.mock.calls[0].arguments[0], '[2026-10-22T09:30:00.000Z] rapport 2026-09 (csv) : 3 commande(s)');
});
