# Production Data Manager

Monorepo des clients web de gestion des données de production.

## Applications

| Client | Workspace npm | Port local | Répertoire |
| --- | --- | ---: | --- |
| Tolérances | `@pdm/tolerances` | 5173 | `apps/tolerances` |
| Modèles d’étiquettes | `@pdm/templates` | 5175 | `apps/templates` |
| Firmwares | `@pdm/firmwares` | 5176 | `apps/firmwares` |
| Programmes de soudure | `@pdm/soldering-programs` | 5177 | `apps/soldering-programs` |
| Notifications de production | `@pdm/notifications` | 5178 | `apps/notifications` |

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
npm run dev:soldering-programs
npm run dev:notifications
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
npm run build:soldering-programs
npm run build:notifications
```

## Images Docker

Le contexte de build doit être la racine du monorepo :

```powershell
docker build -f apps/tolerances/Dockerfile -t pdm-tolerances .
docker build -f apps/templates/Dockerfile -t pdm-templates .
docker build -f apps/firmwares/Dockerfile -t pdm-firmwares .
docker build -f apps/soldering-programs/Dockerfile -t pdm-soldering-programs .
docker build -f apps/notifications/Dockerfile -t pdm-notifications .
```

L’URL d’`Api.Data` est injectée au démarrage avec `API_DATA_BASE_URL`. Le manager de notifications reçoit également l’URL d’`Api.Parser` avec `API_PARSER_URL`.

## Branches et pipelines

Le socle commun reste intégré sur `main`. Chaque client possède une branche de développement dédiée : `codex/develop/tolerances`, `codex/develop/templates`, `codex/develop/firmwares`, `codex/develop/soldering-programs` et `codex/develop/notifications`. Les travaux courts peuvent partir de ces branches avec le préfixe `codex/feature/<client>/<sujet>`.

Les définitions dans `pipelines/` déclenchent uniquement le client concerné. Une modification de `packages/shared` déclenche les cinq pipelines, car elle peut affecter les cinq applications.

### Déploiements actuels

| Client | Port public | Port du conteneur | Pipeline |
| --- | ---: | ---: | --- |
| Tolérances | 12005 | 80 | `pipelines/tolerances.yml` |
| Modèles d’étiquettes | 12006 | 80 | `pipelines/templates.yml` |
| Firmwares | 12007 | 80 | `pipelines/firmwares.yml` |
| Programmes de soudure | 12008 | 80 | `pipelines/soldering-programs.yml` |
| Notifications de production | 12009 | 80 | `pipelines/notifications.yml` |

Chaque client possède une pipeline autonome calquée sur le processus déjà validé avec l’agent `VM-DEVOPS` : construction Docker, export de l’image, publication de l’artefact, transfert avec PuTTY, remplacement du conteneur et contrôle HTTP. Le mot de passe doit être configuré dans Azure DevOps avec la variable secrète `SSH_PASSWORD`; il ne doit jamais être enregistré dans le dépôt. La clé SSH du serveur doit avoir été acceptée une première fois dans le cache PuTTY du compte qui exécute l’agent.

### Reverse proxy

Le serveur PDM ne possède pas encore de reverse proxy identifié. Les déploiements utilisent donc les ports publics ci-dessus. Quand un proxy et les cinq noms DNS seront disponibles, les conteneurs pourront rejoindre un réseau Docker privé sans publier directement `12005`, `12006`, `12007`, `12008` et `12009`; le proxy portera alors les routes HTTP(S) et les certificats TLS.

### Build hors ligne sur VM-DEVOPS

L’agent `VM-DEVOPS` n’ayant pas accès à Internet, les pipelines utilisent une image builder contenant les dépendances npm du monorepo :

```text
pdm-build-deps:c3fda0e48f41
```

Le moteur Docker Linux utilisé par l’agent Windows Server 2022 doit contenir cette image ainsi que `nginx:1.29-alpine`. Le bundle préparé sur une machine connectée doit être copié sur `VM-DEVOPS`, puis chargé depuis le compte Windows qui exécute l’agent :

```powershell
docker context use desktop-linux
docker load --input C:\Deploy\images\pdm-offline-build-images-c3fda0e48f41.tar
docker image inspect pdm-build-deps:c3fda0e48f41
docker image inspect nginx:1.29-alpine
```

Les pipelines vérifient explicitement la présence de ces images et exécutent `docker build` avec `--pull=false --network=none`.

Après toute modification de `package-lock.json`, l’image builder doit être reconstruite sur une machine connectée avec `docker/Dockerfile.dependencies`, recevoir un nouveau tag dérivé du hash du lockfile, puis être rechargée sur `VM-DEVOPS`.
