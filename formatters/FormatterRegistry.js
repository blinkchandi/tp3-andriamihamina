// Registre des formats : on AJOUTE un format avec register(), sans modifier ReportService (OCP).
// Tout objet qui possède une méthode format(stats) -> texte peut y être enregistré.
export class FormatterRegistry {
  #formatters = new Map();

  register(name, formatter) {
    this.#formatters.set(name, formatter);
    return this;
  }

  get(name) {
    const formatter = this.#formatters.get(name);
    if (!formatter) throw new Error(`Format non supporté : ${name}`);
    return formatter;
  }
}
