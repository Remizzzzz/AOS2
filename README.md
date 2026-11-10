# AOS2 – Compagnon de cours PyTorch

App mobile (Expo / React Native) avec deux onglets :

- **Cours** : liste les slides du dossier Google Drive du cours (tirer pour rafraîchir ; liste mise en cache hors-ligne). Un tap ouvre le fichier dans le visualiseur Drive.
- **Exos** : 12 exercices PyTorch à trous (tenseurs, autograd, nn.Module, boucle d'entraînement, DataLoader, GPU, CNN, sauvegarde), avec vérification, indice, solution et suivi de progression. « Copier + Colab » copie le code complété et ouvre Google Colab pour l'exécuter avec le vrai PyTorch (GPU gratuit).

## Lancer sur téléphone

```bash
npm install
npx expo start
```
Scanne le QR code avec **Expo Go**.

## Configuration (`src/config.js`)

- `DRIVE_FOLDER_ID` : déjà renseigné. Le dossier doit être partagé en « Tous les utilisateurs disposant du lien ».
- `DRIVE_API_KEY` (optionnel) : clé Drive API v3 ; sinon l'app lit la page publique du dossier.

## Ajouter des exercices

Édite `src/data/exercises.js` (trous `___1___`, `___2___`… et réponses acceptées).
