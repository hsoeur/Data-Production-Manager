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

### Déploiements actuels

| Client | Port public | Port du conteneur | Pipeline |
| --- | ---: | ---: | --- |
| Tolérances | 12005 | 80 | `pipelines/tolerances.yml` |
| Modèles d’étiquettes | 12006 | 80 | `pipelines/templates.yml` |
| Firmwares | 12007 | 80 | `pipelines/firmwares.yml` |

Les trois pipelines étendent `pipelines/azure/templates/deploy-client.yml`. Le mot de passe doit être configuré dans Azure DevOps avec la variable secrète `SSH_PASSWORD`; il ne doit jamais être enregistré dans le dépôt. La clé SSH du serveur doit avoir été acceptée une première fois dans le cache PuTTY du compte qui exécute l’agent `VM-DEVOPS`. Les branches de développement construisent et valident les images, mais seule la branche `main` exécute le stage de production.

Les images reçoivent un tag immuable basé sur `Build.BuildId`. Après un contrôle HTTP réussi, l’image est promue avec le tag `current`. L’image précédemment active est conservée sous le tag `rollback` et redémarrée automatiquement si le nouveau conteneur ne devient pas disponible.

### Reverse proxy

Le serveur PDM ne possède pas encore de reverse proxy identifié. Les déploiements utilisent donc les ports publics ci-dessus. Quand un proxy et les trois noms DNS seront disponibles, les conteneurs pourront rejoindre un réseau Docker privé sans publier directement `12005`, `12006` et `12007`; le proxy portera alors les routes HTTP(S) et les certificats TLS.
