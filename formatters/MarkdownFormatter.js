// Mise en forme Markdown d'un objet stats : ajoutée APRÈS le refactoring, sans modifier ReportService (OCP).
export class MarkdownFormatter {
  format({ month, count, average, revenueHT, vat, revenueTTC, byCategory }) {
    let output = `# Ventes ${month}\n\n${count} commande(s), panier moyen ${average} €\n\n`;
    output += '| Catégorie | Montant HT |\n| --- | --- |\n';
    for (const c of Object.keys(byCategory).sort()) output += `| ${c} | ${byCategory[c]} € |\n`;
    output += `\n**Total HT :** ${revenueHT} € · **TVA :** ${vat} € · **Total TTC :** ${revenueTTC} €\n`;
    return output;
  }
}
