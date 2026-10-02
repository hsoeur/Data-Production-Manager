# Tolerance Manager

Client Web React/TypeScript pour consulter et maintenir les tolérances de production exposées par `Api.Data`.

## Fonctionnalités

- sélection de l’opérateur ;
- consultation des tolérances actives ou historiques ;
- recherche locale multicritère ;
- création et modification ;
- sélection des machines depuis l’API ;
- modes de mesure validés selon le contrat `DataLib` ;
- duplication atomique d’un lot vers un nouveau produit.

## Démarrage local

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

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
docker build -t tolerance-manager .
docker run --rm -p 8080:80 `
  -e API_DATA_BASE_URL=http://api-data:8080/api `
  tolerance-manager
```

La configuration de l’API est injectée au démarrage du conteneur afin de réutiliser la même image entre les environnements.
