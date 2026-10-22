// Le calcul se teste désormais SANS orders.json : les commandes sont écrites dans le test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStats } from './domain/salesStats.js';

test('computeStats : commandes en mémoire, annulée et autre mois ignorés', () => {
  const orders = [
    { date: '2026-09-01', status: 'PAID', lines: [{ category: 'livres', qty: 2, unitPrice: 10 }] },
    { date: '2026-09-02', status: 'CANCELLED', lines: [{ category: 'livres', qty: 1, unitPrice: 99 }] },
    { date: '2026-10-01', status: 'PAID', lines: [{ category: 'livres', qty: 1, unitPrice: 50 }] },
  ];
  assert.deepEqual(computeStats(orders, '2026-09'), {
    month: '2026-09', count: 1, revenueHT: 20, vat: 4, revenueTTC: 24,
    average: 20, byCategory: { livres: 20 },
  });
});
