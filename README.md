# Batcave

## Architecture

- `app/` : API Express + SQLite (`app/database.db`, créée automatiquement) sur `http://localhost:3000`.
- `front/` : front Vue (Vite). Le proxy Vite redirige `/api/*` vers l'API.

## Démarrer avec Docker (recommandé)

```powershell
docker compose up -d
```

Ouvrez `http://localhost:8088`. Tout est défini dans `docker-compose.yml`, avec les Dockerfiles et la config nginx inline :

- `api` : Node 22 + Express, base SQLite dans le volume `batcave-data` (conservée entre les redémarrages) ;
- `front` : build Vite servi par nginx, qui relaie `/api/*` vers l'API.

Commandes utiles :

```powershell
docker compose up -d --build                    # après une modification du code
$env:BATCAVE_PORT=9000; docker compose up -d    # changer le port
docker compose logs -f                          # suivre les logs
docker compose down                             # arrêter (ajouter -v pour effacer la base)
```

## Démarrer sans Docker

```powershell
npm run setup   # une seule fois : installe app/ et front/
npm run dev     # lance l'API et le front ensemble
```

Ouvrez ensuite l'URL Vite affichée (par défaut `http://localhost:5173`).
`npm run api` et `npm run front` lancent chaque partie séparément, `npm test` exécute le smoke test de l'API.

## API

| Méthode | Route          | Description                                 |
| ------- | -------------- | ------------------------------------------- |
| GET     | `/api/secrets` | `{ gadgets: [{ name, description }] }`      |
| GET     | `/api/reports` | `{ reports: [{ id, content, createdAt }] }` |
| POST    | `/api/reports` | `{ content }` → `{ report }`                |

## Ajouter une page au menu

Tout se passe dans `front/src/menu.ts` :

1. Créez la vue, par exemple `front/src/views/Gotham.vue`.
2. Ajoutez (ou complétez) l'entrée dans la section voulue :

```ts
{
  path: '/gotham',
  label: 'Carte de Gotham',
  code: 'GM',
  hint: 'Surveillance de la ville.',
  component: () => import('./views/Gotham.vue'),
},
```

La route, le lien du menu latéral et le raccourci du tableau de bord sont générés automatiquement.
Une entrée sans `component` s'affiche « bientôt ». Les appels API passent par `api()` dans `front/src/api.ts`.
