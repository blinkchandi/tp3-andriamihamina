// Mise en forme CSV d'un objet stats (voir domain/salesStats.js).
export class CsvFormatter {
  format({ revenueHT, vat, revenueTTC, byCategory }) {
    let output = 'categorie;montant_ht\n';
    for (const c of Object.keys(byCategory).sort()) output += `${c};${byCategory[c]}\n`;
    output += `TOTAL HT;${revenueHT}\nTVA;${vat}\nTOTAL TTC;${revenueTTC}\n`;
    return output;
  }
}
