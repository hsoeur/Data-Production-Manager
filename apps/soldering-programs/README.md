# Soldering Programs Manager

Client Web React/TypeScript pour consulter et maintenir les programmes de soudure exposés par `Api.Data`.

## Fonctionnalités

- sélection de l’opérateur ;
- consultation des programmes actifs ou historiques ;
- recherche serveur par mot-clé ;
- création d’un programme pour un produit et une face ;
- modification du numéro d’un programme actif ;
- présentation responsive en tableau ou en cartes.

## Démarrage local

Depuis la racine du monorepo :

```powershell
Copy-Item apps/soldering-programs/.env.example apps/soldering-programs/.env.local
npm install
npm run dev:soldering-programs
```

Le client est disponible sur `http://localhost:5177`.

Configurer l’adresse de l’API avec le segment `/api` :

```env
VITE_API_DATA_BASE_URL=http://localhost:5000/api
```

## Vérifications

```powershell
npm run build:soldering-programs
npm run lint --workspace @pdm/soldering-programs
```

## Docker

Le contexte de build doit être la racine du monorepo :

```powershell
docker build -f apps/soldering-programs/Dockerfile -t pdm-soldering-programs .
docker run --rm -p 12008:80 `
  -e API_DATA_BASE_URL=http://api-data:8080/api `
  pdm-soldering-programs
```

La configuration de l’API est injectée au démarrage du conteneur afin de réutiliser la même image entre les environnements.
