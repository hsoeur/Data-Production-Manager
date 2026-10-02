# Production Data Manager

Monorepo des clients web de gestion des données de production.

## Applications

| Client | Workspace npm | Port local | Répertoire |
| --- | --- | ---: | --- |
| Tolérances | `@pdm/tolerances` | 5173 | `apps/tolerances` |
| Modèles d’étiquettes | `@pdm/templates` | 5175 | `apps/templates` |
| Firmwares | `@pdm/firmwares` | 5176 | `apps/firmwares` |

Le socle React commun se trouve dans `packages/shared`. Il contient le thème, les providers, le client HTTP, la prise de poste opérateur, la coque visuelle et les composants transverses.

## Installation

Depuis la racine du dépôt :

```powershell
npm install
```

## Démarrage local

```powershell
npm run dev:tolerances
npm run dev:templates
npm run dev:firmwares
```

Chaque commande est indépendante et doit être exécutée dans son propre terminal.

## Vérifications

```powershell
npm run build
npm run lint
```

Il est aussi possible de cibler un seul client :

```powershell
npm run build:tolerances
npm run build:templates
npm run build:firmwares
```

## Images Docker

Le contexte de build doit être la racine du monorepo :

```powershell
docker build -f apps/tolerances/Dockerfile -t pdm-tolerances .
docker build -f apps/templates/Dockerfile -t pdm-templates .
docker build -f apps/firmwares/Dockerfile -t pdm-firmwares .
```

L’URL d’`Api.Data` est injectée au démarrage avec `API_DATA_BASE_URL`.

## Branches et pipelines

Le socle commun reste intégré sur `main`. Chaque client possède une branche de développement dédiée : `codex/develop/tolerances`, `codex/develop/templates` et `codex/develop/firmwares`. Les travaux courts peuvent partir de ces branches avec le préfixe `codex/feature/<client>/<sujet>`.

Les définitions dans `pipelines/` déclenchent uniquement le client concerné. Une modification de `packages/shared` déclenche les trois pipelines, car elle peut affecter les trois applications.
