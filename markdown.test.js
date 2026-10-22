// Preuve de l'OCP : un nouveau format s'ajoute en l'enregistrant, sans modifier application/ReportService.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReportService } from './main.js';
import { MarkdownFormatter } from './formatters/MarkdownFormatter.js';

test('un format Markdown s’ajoute sans modifier ReportService', () => {
  const { service, formatters } = buildReportService({ logger: { info: () => {} } });
  formatters.register('md', new MarkdownFormatter());

  assert.equal(service.generate('2026-09', 'md'),
    '# Ventes 2026-09\n\n3 commande(s), panier moyen 183.67 €\n\n' +
    '| Catégorie | Montant HT |\n| --- | --- |\n| informatique | 416 € |\n| livres | 135 € |\n' +
    '\n**Total HT :** 551 € · **TVA :** 110.2 € · **Total TTC :** 661.2 €\n');
});
