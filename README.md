# 📚 Analyseur de Notes Scolaires

## 📖 Description

Application web complète pour l'extraction automatique de toutes les notes scolaires à partir de fichiers PDF de relevés de notes académiques. L'application détecte et affiche toutes les matières tout en conservant un focus particulier sur les notes de français.

## ✨ Fonctionnalités

#### Deux Modes de Saisie
- **<i class="fas fa-file-pdf"></i> Upload de Fichier PDF** : Pour une analyse entièrement automatisée de vos relevés de notes.
- **<i class="fas fa-keyboard"></i> Saisie Manuelle** : Pour un calcul rapide en entrant directement vos notes.

### 🔄 Upload de fichier PDF
- Interface intuitive avec glisser-déposer
- Sélection de fichier par clic
- Validation du format PDF
- Barre de progression en temps réel

### 🔍 Extraction automatique des notes
- Analyse automatique du contenu texte du PDF
- Détection intelligente de toutes les matières :
  - **Français** (écrit et oral)
  - **Histoire-Géographie**
  - **Enseignement moral et civique**
  - **Langues vivantes** (Anglais, Espagnol)
  - **Enseignement scientifique**
  - **Mathématiques**
  - Et autres matières détectables
- Compatible avec les formats PDF des différentes académies
- Patterns de reconnaissance multiples et robustes

### ⌨️ Saisie Manuelle des Notes
- Formulaire dédié pour entrer les notes de chaque matière.
- Champs de saisie clairs avec icônes et coefficients.
- Validation des entrées (notes entre 0 et 20).
- Calcul instantané des moyennes après soumission.

### 🧮 Calculs de moyennes
- **Moyenne Français** : Formule pondérée `(écrit × 5 + oral × 5) / 10`
- **Moyenne Générale** : Moyenne pondérée selon les coefficients officiels
  - Français (écrit/oral) : coefficient 5 chacun
  - Mathématiques : coefficient 8
  - Histoire-Géographie : coefficient 3
  - Langues vivantes (LV1/LV2) : coefficient 3 chacune
  - Enseignement scientifique : coefficient 3
  - Enseignement moral et civique : coefficient 1
- Affichage détaillé des calculs et coefficients
- Résultats arrondis à 2 décimales

### 📊 Affichage et actions
- **Vue d'ensemble** : Grille avec toutes les notes détectées
- **Focus Français** : Section dédiée avec calcul spécifique
- **Moyennes** : Affichage des moyennes française et générale
- Actions disponibles :
  - 📥 Télécharger un récapitulatif complet HTML
  - 📋 Copier tous les résultats dans le presse-papier
  - 🔄 Nouveau calcul
- Interface moderne et responsive
- Gestion d'erreurs avec messages explicites

## �� Utilisation

1. **Choisir le mode** : Sélectionnez "Upload PDF" ou "Saisie Manuelle".
2. **Si PDF** : Glissez-déposez ou sélectionnez votre relevé de notes.
3. **Si Manuel** : Remplissez les notes pour les matières souhaitées.
4. **Calculer** : Cliquez sur le bouton pour obtenir vos résultats.
5. **Consulter les résultats** : Vérifiez les notes et les moyennes calculées.
6. **Exporter si besoin** : Téléchargez ou copiez les résultats.

## 🛠️ Technologies utilisées

- **HTML5** : Structure de l'application
- **CSS3** : Styling moderne
- **JavaScript ES6+** : Logique applicative
- **Tailwind CSS** : Framework CSS pour l'interface
- **PDF.js** : Bibliothèque pour la lecture des fichiers PDF
- **Font Awesome** : Icônes

## 📋 Prérequis

- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Connexion internet (pour les CDN)
- Fichiers PDF lisibles contenant des notes de français (pour le mode PDF)

## 🎯 Formats PDF supportés

L'application peut traiter les PDF contenant :
- Relevés de notes officiels des académies
- Bulletins scolaires
- Documents avec mentions "français écrit" et "français oral"
- Tableaux de notes structurés

## 🔧 Patterns de détection

L'application recherche les patterns suivants dans le texte :
- `français écrit`, `français oral`
- `écrit français`, `oral français`
- `composition français`, `épreuve orale`
- `note écrit`, `résultat oral`
- Tableaux avec notes séparées par `/` ou `|`

## ⚠️ Limitations

- Nécessite que le PDF contienne du texte extractible
- Les PDF scannés (images) peuvent ne pas être lus correctement
- Fonctionne mieux avec les formats standardisés des académies
- Les coefficients non standard peuvent ne pas être détectés

## 🐛 Gestion d'erreurs

- **Fichier illisible** : Vérification du format PDF
- **Notes non détectées** : Message d'erreur explicite
- **Saisie invalide** : Messages d'erreur pour les notes hors plage (0-20)
- **Possibilité de réessayer** : Bouton pour relancer l'analyse

## 🔄 Améliorations futures possibles

- Support OCR pour les PDF scannés
- Détection automatique des coefficients variables
- Support de plus de matières
- Sauvegarde locale des résultats
- Export PDF natif
- Mode sombre

## 📞 Support

En cas de problème :
1. Vérifiez que votre PDF contient bien du texte sélectionnable
2. Assurez-vous que les notes de français sont mentionnées explicitement
3. Essayez avec un autre fichier PDF pour tester

---

*Application développée pour faciliter le calcul des moyennes de français.* 