# Lotonu App

Lotonu est une application desktop développée avec Electron pour gérer des données organisées par catégories (GH18, CIV10, CIV13, CIV16). Elle permet d’enregistrer des entrées (numéro, position, valeur), de les consulter, et de voir des statistiques, avec une sauvegarde automatique dans un fichier JSON sur le disque.

## Fonctionnalités
- **Entrées** : Ajoute des données avec un numéro (000-999), une position (P1-P10), et une valeur (0-9).
- **Consultation** : Recherche les données par numéro dans une catégorie.
- **Statistiques** : Affiche le nombre total d’entrées par catégorie.
- **Sauvegarde** : Les données sont stockées dans `~/Documents/lotonu/lotonu-data.json`.
- **Réinitialisation** : Option pour effacer toutes les données.

## Prérequis
- [Node.js](https://nodejs.org) (version LTS recommandée)

## Installation
1. Clone ce dépôt :
   ```bash
   git clone https://github.com/ton-utilisateur/lotonu-app.git
   cd lotonu-app