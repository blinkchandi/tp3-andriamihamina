// L'offre gratuite n'est plus une sous-classe : c'est une politique injectée, que l'appelant peut interroger.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ReportService } from './ReportService.js';
import { FREE_PLAN, PRO_PLAN } from './domain/ReportPlan.js';

const silentLogger = { info: () => {} };

test('offre gratuite : l’appelant connaît les droits AVANT d’appeler', () => {
  const service = new ReportService({ plan: FREE_PLAN, logger: silentLogger });
  assert.equal(service.plan.allowsFormat('csv'), true);
  assert.equal(service.plan.allowsFormat('html'), false);
  assert.equal(service.plan.allowsEmail(), false);
  assert.match(service.generate('2026-09', 'csv'), /^categorie;montant_ht\n/);
});

test('offre gratuite : mêmes refus que l’ancienne FreeReportService', () => {
  const service = new ReportService({ plan: FREE_PLAN, logger: silentLogger });
  assert.throws(() => service.generate('2026-09', 'html'), /Format réservé aux comptes Pro/);
  assert.throws(() => service.generate('2026-09', 'csv', 'a@b.fr'), /Envoi par e-mail réservé aux comptes Pro/);
});

test('offre Pro : tous les formats et l’e-mail sont autorisés', () => {
  assert.equal(PRO_PLAN.allowsFormat('json'), true);
  assert.equal(PRO_PLAN.allowsEmail(), true);
});
