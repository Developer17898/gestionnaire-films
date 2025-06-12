# Projet: Gestionnaire de Films (React Web App)

## Introduction

Ce projet est une application web de gestion de films développée avec React.js. Il a été conçu pour évaluer les compétences en React, notamment la gestion des routes, la création de formulaires, la connexion à des APIs externes et la gestion de l'état global avec Redux.

## Fonctionnalités

L'application offre les fonctionnalités suivantes :

* **Accueil (`/`)** : Affiche une liste de films populaires récupérés depuis l'API The Movie Database (TMDb). Les films ajoutés manuellement sont également intégrés et affichés en premier sur la page d'accueil.

* **Recherche (`/recherche`)** : Permet aux utilisateurs de rechercher des films en saisissant un mot-clé. Des filtres avancés par année de sortie, note minimale et genre sont également disponibles. Une fonctionnalité de suggestion de titres en temps réel est implémentée pour aider l'utilisateur lors de la saisie.

* **Ajouter un film (`/ajouter`)** : Contient un formulaire pour ajouter de nouveaux films à la collection de l'utilisateur. Le formulaire inclut les champs pour le titre, la description, la date de sortie, la durée, le classement, les genres et une image (poster). Une validation en temps réel vérifie si un film avec le même titre existe déjà (dans les films de l'API ou ajoutés manuellement).

* **Détails du film (`/film/:id`)** : Affiche les informations détaillées d'un film sélectionné.

## Spécifications Techniques

* **Framework** : React.js

* **Initialisation du projet** : Créé avec VITE

* **Gestion des routes** : React Router

* **Appels API** : `axios` (utilisé pour les requêtes vers l'API TMDb)

* **Gestion de l'état global** : Redux Toolkit (avec `moviesSlice` pour gérer l'état des films API et des films ajoutés par l'utilisateur, ainsi que les résultats de recherche).

* **Styling** : Tailwind CSS pour un design réactif et moderne.

* **Stockage local** : `localStorage` est utilisé pour persister les films ajoutés manuellement par l'utilisateur.

## Installation et Lancement

Suivez ces étapes pour installer et lancer le projet sur votre machine locale :

1. **Cloner le dépôt** (le dépôt est privé, assurez-vous d'avoir les permissions nécessaires):

   ```
   git clone VOTRE_LIEN_GITHUB_DU_PROJET
   cd nom-du-repertoire-du-projet
   
   ```

2. **Installer les dépendances** :

   ```
   npm install
   # ou
   yarn install
   
   ```

3.  **Installer Tailwind CSS** :
   
    ```
    npm install -D tailwindcss postcss autoprefixer
    # ou
    yarn add -D tailwindcss postcss autoprefixer
    ```

4. **Configuration de l'API TMDb** :

   * Créez un compte sur [The Movie Database (TMDb)](https://www.themoviedb.org/).

   * Obtenez votre clé API v3.

   * Créez un fichier `.env` (ou `.env.local`) à la racine de votre projet.

   * Ajoutez votre clé API comme suit :

     ```
     VITE_TMDB_API_KEY=VOTRE_CLE_API_TMDB_ICI
     
     ```

     Assurez-vous de remplacer `VOTRE_CLE_API_TMDB_ICI` par votre véritable clé API.

5. **Lancer l'application en mode développement** :

   ```
   npm run dev
   # ou
   yarn dev
   
   ```

   L'application sera accessible à l'adresse `http://localhost:5173` (ou un autre port disponible).

## Structure des dossiers clés

```
./
├── public/
│   └── video.mp4     # Vidéo d'arrière-plan pour la page d'accueil
├── src/
│   ├── assets/       # Actifs divers (images, icônes, etc. - non fournis, mais structure suggérée)
│   ├── components/
│   │   ├── MovieCard.jsx   # Composant pour afficher les informations d'un film
│   │   └── Navbar.jsx      # Composant de navigation
│   ├── pages/
│   │   ├── AddMovie.jsx    # Page pour ajouter un nouveau film
│   │   ├── Home.jsx        # Page d'accueil affichant les films populaires
│   │   ├── Search.jsx      # Page de recherche de films
│   │   └── MovieDetails.jsx # Page pour les détails d'un film spécifique (non fournie, mais suggérée par le PDF)
│   ├── redux/
│   │   ├── store.js        # Configuration du store Redux
│   │   └── moviesSlice.js  # Slice Redux pour la gestion des films (API et ajoutés) et la recherche
│   ├── App.jsx           # Composant racine de l'application
│   ├── main.jsx          # Point d'entrée de l'application
│   └── index.css         # Fichier CSS global (probablement pour Tailwind CSS)
└── .env                  # Fichier d'environnement pour les clés API
└── README.md             # Ce fichier
└── tailwind.config.js    # Fichier de configuration de Tailwind CSS

```

## Fonctionnalités Implémentées et Points Clés

* **Gestion de l'état avec Redux Toolkit** :

  * Le `moviesSlice` gère deux listes de films : `movies` (provenant de l'API) et `addedMovies` (ajoutés manuellement).

  * L'action asynchrone `fetchMovies` charge les films populaires de TMDb dans le store Redux.

  * `addedMovies` est persisté dans `localStorage`.

* **Détection de doublons de titres** :

  * Sur la page `AddMovie`, une vérification est effectuée en temps réel et lors de la soumission pour s'assurer qu'aucun film avec le même titre n'existe déjà dans l'ensemble de la collection (API + manuels).

* **Recherche avancée avec suggestions** :

  * La page `Search` permet la recherche par titre, année, note et genres.

  * Des suggestions de titres apparaissent dynamiquement lors de la saisie, basées sur tous les films disponibles dans l'application.

* **Pagination** : La page d'accueil implémente une pagination pour une meilleure gestion de l'affichage des films.

* **Design Réactif** : L'interface utilisateur est conçue pour être agréable et fonctionnelle sur différentes tailles d'écran grâce à Tailwind CSS.


