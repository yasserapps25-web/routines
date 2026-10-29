// Liste des images utilisées par les jeux.
// Pour ajouter un objet : ajoutez une ligne ici et mettez son image dans le dossier img/obj/ (même nom que "id").
//   lettre  : lettre initiale (jeu « Lettres »)
//   forme   : circle | square | triangle | rectangle (jeu « Formes et objets »)
//   compter : true pour pouvoir l'utiliser dans le jeu « Compter »
// Images : fichier PNG (prioritaire) ou SVG portant le même nom dans le dossier img/obj/ (ex. img/obj/banane.png).
window.OBJETS = [
  { id: 'banane',  nom: 'Banane',   lettre: 'B' },
  { id: 'ballon',  nom: 'Ballon',   lettre: 'B', forme: 'circle',  compter: true },
  { id: 'chat',    nom: 'Chat',     lettre: 'C', compter: true },
  { id: 'pomme',   nom: 'Pomme',    lettre: 'P', compter: true },
  { id: 'poisson', nom: 'Poisson',  lettre: 'P', compter: true },
  { id: 'voiture', nom: 'Voiture',  lettre: 'V' },
  { id: 'maison',  nom: 'Maison',   lettre: 'M' },
  { id: 'soleil',  nom: 'Soleil',   lettre: 'S' },
  { id: 'fleur',   nom: 'Fleur',    lettre: 'F', compter: true },
  { id: 'lune',    nom: 'Lune',     lettre: 'L' },
  { id: 'roue',    nom: 'Roue',     forme: 'circle' },
  { id: 'boite',   nom: 'Boîte',    forme: 'square' },
  { id: 'fenetre', nom: 'Fenêtre',  forme: 'square' },
  { id: 'toit',    nom: 'Toit',     forme: 'triangle' },
  { id: 'fromage', nom: 'Fromage',  forme: 'triangle' },
  { id: 'porte',   nom: 'Porte',    forme: 'rectangle' },
  { id: 'livre',   nom: 'Livre',    forme: 'rectangle' }
];
