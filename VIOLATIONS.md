# TP 3 · Diagnostic des violations SOLID — `ReportService.js`

Les numéros de ligne renvoient au fichier `ReportService.js` du dépôt (le fichier est formaté
sur plus de lignes que la version imprimée dans l'énoncé : 98 lignes au lieu de 83).

| # | Principe | Ligne(s) | Problème | Conséquence concrète |
|---|----------|----------|----------|----------------------|
| 1 | **S** (responsabilité unique) | 25-88 | `generate()` fait cinq métiers : lire les commandes, calculer les ventes, mettre en forme, journaliser, envoyer l'e-mail. | Le comptable (taux de TVA), le marketing (mise en page HTML) et l'exploitation (serveur SMTP) modifient tous la même méthode : chaque changement risque de casser les quatre autres parties, et deux développeurs qui travaillent en parallèle se retrouvent en conflit Git sur le même bloc. |
| 2 | **O** (ouvert/fermé) | 46-70 | Un `if / else if` par format (`csv`, `html`, `json`). | Ajouter un format PDF ou Markdown oblige à rouvrir `generate()`, une méthode déjà testée, et à rallonger la chaîne de `if`. Chaque nouveau format peut casser les formats existants. |
| 3 | **L** (substitution de Liskov) | 92-98 | `FreeReportService` hérite de `ReportService` mais lève une exception pour `html`, `json` et l'envoi d'e-mail, que le parent accepte. | Un code écrit pour un `ReportService` (par exemple `service.generate(m, 'html', 'direction@…')`) plante dès qu'on lui passe un `FreeReportService`. L'appelant doit tester le type (`instanceof`) pour savoir ce qu'il a le droit de demander. |
| 4 | **D** (inversion des dépendances) | 4, 9, 20-23 | Le service importe `fs` et lit un fichier codé en dur (`orders.json`). | Impossible de tester le calcul sans le fichier sur le disque, ni de passer à une base de données ou une API sans modifier la classe. Les tests dépendent du contenu exact de `orders.json`. |
| 5 | **D / DI** (injection de dépendances) | 7-18 | Le constructeur crée lui-même toutes ses dépendances (fichier, config SMTP, boîte d'envoi, historique) ; rien n'est reçu de l'extérieur. | Dans un test, on ne peut pas remplacer l'envoi d'e-mail par un faux : il faut aller lire le champ public `service.outbox`. Si l'envoi devenait réel, chaque test enverrait un vrai e-mail. |
| 6 | **Autre** (sécurité) | 10-15 | Identifiants SMTP, dont le mot de passe `Sh0pL1te!`, écrits en clair dans le code. | Le mot de passe est publié dans Git pour toute personne ayant accès au dépôt, et reste dans l'historique même après suppression. Le changer impose de modifier le code et de redéployer. |
| 7 | **D** (dépendance cachée à l'horloge) | 73 | `new Date()` appelé directement dans la méthode. | La ligne de journal change à chaque exécution : impossible d'écrire un test qui vérifie le message exact. Il faudrait pouvoir injecter une horloge. |
| 8 | **D** (journalisation concrète) | 74-75 | `console.log` appelé directement ; l'historique `history` grossit sans limite. | Les tests affichent du bruit dans la console. Pour écrire les journaux dans un fichier ou un outil de supervision, il faut modifier la classe métier. `history` consomme de la mémoire tant que l'objet vit. |
| 9 | **S** + sécurité | 79 | La règle de validité d'une adresse (`includes('@')`) est noyée dans `generate()` et trop faible. | `a@`, `@` ou `x@y@z` sont acceptés. La règle n'est pas réutilisable ailleurs (formulaire d'inscription…) et il faut lire tout `generate()` pour la trouver. |
| 10 | **I** (ségrégation des interfaces) | 6-98 | Une seule interface « tout-en-un » : un client qui veut seulement les chiffres du mois (tableau de bord) doit passer par `generate()`, qui lit le fichier, met en forme, journalise. | Un tableau de bord reçoit du texte CSV/JSON qu'il doit re-parser, et ses tests doivent fournir un faux de tout le service. Les chiffres ne sont pas disponibles sous forme d'objet. |
| 11 | **Autre** (nombre magique) | 42 | Taux de TVA `0.2` écrit en dur dans le calcul. | Un taux réduit (5,5 % pour les livres) ou un changement légal oblige à fouiller le code ; rien n'indique que `0.2` est la TVA. |

## Synthèse

- **S** : 1 et 9 · **O** : 2 · **L** : 3 · **I** : 10 · **D / DI** : 4, 5, 7, 8 · **Autre** : 6 et 11.
- Les trois violations les plus coûteuses : le mot de passe dans le code (6, à corriger en premier car il
  fuite déjà), la sous-classe qui casse Liskov (3, elle provoque des plantages chez les appelants) et
  l'absence d'injection (4, 5), qui empêche de tester le calcul seul.
