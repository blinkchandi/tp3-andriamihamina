// Mise en forme JSON d'un objet stats : les clés sont listées pour garder leur ordre d'origine.
export class JsonFormatter {
  format({ month, count, revenueHT, vat, revenueTTC, average, byCategory }) {
    return JSON.stringify({ month, count, revenueHT, vat, revenueTTC, average, byCategory });
  }
}
