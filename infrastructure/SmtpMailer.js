// Envoi d'e-mails (simulé : les messages sont rangés dans outbox).
// La configuration est reçue de l'extérieur et gardée privée : aucun mot de passe dans le code.
export class SmtpMailer {
  #config;

  constructor({ host, port, user, password }) {
    this.#config = { host, port, user, password };
    this.outbox = []; // e-mails « envoyés » (simulation du serveur SMTP)
  }

  // Configuration lue dans les variables d'environnement ; seuls l'hôte et le port ont une valeur par défaut
  static fromEnv(env = process.env) {
    return new SmtpMailer({
      host: env.SMTP_HOST ?? 'smtp.shoplite.fr',
      port: Number(env.SMTP_PORT ?? 587),
      user: env.SMTP_USER,
      password: env.SMTP_PASSWORD,
    });
  }

  send({ to, subject, body }) {
    this.outbox.push({ via: `${this.#config.host}:${this.#config.port}`, to, subject, body });
  }
}
