// Journal dans la console, horodaté. L'horloge est injectable pour rendre les tests déterministes.
export class ConsoleLogger {
  constructor({ now = () => new Date() } = {}) {
    this.now = now;
  }

  info(message) {
    console.log(`[${this.now().toISOString()}] ${message}`);
  }
}
