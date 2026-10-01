# LabelTemplate Manager

Client Web React/TypeScript pour consulter et maintenir les modèles d'étiquettes exposés par `Api.Data`.

## Prérequis

- Node.js 22 ou supérieur
- Une instance de `Api.Data`

## Démarrage local

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Configurer `VITE_API_DATA_BASE_URL` avec l'URL comprenant le segment `/api` :

```text
VITE_API_DATA_BASE_URL=http://localhost:5000/api
```

## Vérifications

```powershell
npm run build
npm run lint
```

## Configuration Docker

La même image peut être utilisée dans tous les environnements. L'URL de l'API est injectée au démarrage :

```powershell
docker run --rm -p 8080:80 `
  -e API_DATA_BASE_URL=http://api-data:8080/api `
  label-template-manager
```

## Limite actuelle des fichiers

Les endpoints LabelTemplate enregistrent `TemplateFile` et `Photo` comme chaînes de caractères. Le client sélectionne un fichier local pour en extraire le nom, mais ne transfère pas son contenu.
