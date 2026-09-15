# Calendrier marketing — Daïmo

Outil interne pour visualiser et planifier les publications LinkedIn de Daïmo :
articles, posts image + texte, et carrousels.

## Fonctionnalités

- Vue calendrier (mois) et vue liste des posts programmés
- Création / édition / suppression de posts, avec 3 formats : article, image + texte, carrousel
- Statut brouillon ou programmé
- Charte graphique Daïmo intégrée (couleurs, typographies)
- Les posts sont stockés dans le `localStorage` du navigateur (démo sans backend)

## Limite actuelle : publication automatique sur LinkedIn

Cette version ne publie **pas réellement** sur LinkedIn : le bouton "Connecter la page Daïmo"
est un stub. Pour une vraie publication automatique, il faudrait :

1. Créer une app sur [LinkedIn Developers](https://www.linkedin.com/developers/apps) avec les
   produits "Sign In with LinkedIn" et "Community Management API" (ou "Marketing API" pour une
   page entreprise).
2. Mettre en place un flux OAuth pour connecter la page Daïmo et stocker le token de façon
   sécurisée (variables d'environnement Vercel).
3. Ajouter une route API (ex: `app/api/publish/route.ts`) et un job planifié (cron Vercel) qui
   appelle l'API LinkedIn `ugcPosts` aux dates/heures programmées.
4. Remplacer le stockage `localStorage` par une base de données partagée (ex: Vercel Postgres,
   Supabase) pour que le planning soit visible par toute l'équipe et survive aux déploiements.

## Développement local

```bash
npm install
npm run dev
```

## Déploiement

Projet Next.js standard, prêt à être importé sur [Vercel](https://vercel.com/new).
