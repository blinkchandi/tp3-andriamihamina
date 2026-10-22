// Objet-valeur : une adresse e-mail valide. La règle de validité vit ici, et seulement ici.
// Règle reprise À L'IDENTIQUE du code de départ (refactoring = même comportement) ;
// la durcir est un changement de comportement, à faire dans un commit séparé avec ses tests.
export class EmailAddress {
  constructor(value) {
    if (!value.includes('@')) throw new Error(`Adresse invalide : ${value}`);
    this.value = value;
  }

  toString() {
    return this.value;
  }
}
