# Firmware Manager

Client Web React/TypeScript pour consulter et maintenir les firmwares de production exposés par `Api.Data`.

## Fonctionnalités

- sélection de l’opérateur ;
- consultation des firmwares actifs ou historiques ;
- recherche serveur par produit ou libellé ;
- préparation d’une nouvelle version avec date d’effet ;
- liaison d’un fichier firmware ;
- suspension et réactivation temporaires.

## Démarrage local

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Le client est disponible sur `http://localhost:5176`.

Configurer l’adresse de l’API avec le segment `/api` :

```env
VITE_API_DATA_BASE_URL=http://localhost:5000/api
```

## Vérifications

```powershell
npm run build
npm run lint
```

## Docker

```powershell
docker build -t firmware-manager .
docker run --rm -p 8080:80 `
  -e API_DATA_BASE_URL=http://api-data:8080/api `
  firmware-manager
```

La configuration de l’API est injectée au démarrage du conteneur afin de réutiliser la même image entre les environnements.
