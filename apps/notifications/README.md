# Production Notifications Manager

Client Web React/TypeScript pour détecter et traiter les désynchronisations des ordres de fabrication.

## Fonctionnalités

- sélection de l’opérateur ;
- lancement initial du parseur de notifications ;
- consultation et recherche des notifications dans `Api.Data` ;
- comparaison de l’ancienne et de la nouvelle valeur ;
- traitement d’une notification avec traçabilité opérateur ;
- présentation responsive en tableau ou en cartes.

## Démarrage local

Depuis la racine du monorepo :

```powershell
Copy-Item apps/notifications/.env.example apps/notifications/.env.local
npm install
npm run dev:notifications
```

Le client est disponible sur `http://localhost:5178`.

Configurer les deux services avec leur segment `/api` :

```env
VITE_API_DATA_BASE_URL=http://localhost:5000/api
VITE_API_PARSER_URL=http://localhost:7003/api
```

## Vérifications

```powershell
npm run build:notifications
npm run lint --workspace @pdm/notifications
```

## Docker

Le contexte de build doit être la racine du monorepo :

```powershell
docker build -f apps/notifications/Dockerfile -t pdm-notifications .
docker run --rm -p 12009:80 `
  -e API_DATA_BASE_URL=http://api-data:8080/api `
  -e API_PARSER_URL=http://api-parser:8080/api `
  pdm-notifications
```

Les URLs des API sont injectées au démarrage du conteneur afin de réutiliser la même image entre les environnements.
