// ===================================================================
//  Images utilisées par les jeux (cartes) — modifiable
// ===================================================================
//  Une image par objet, dans le dossier  img/obj/  (nom du fichier = "id", en .png, .jpg ou .svg).
//  Un PNG ou JPG remplace automatiquement le dessin provisoire du même nom.
//
//  Champs :
//    id      nom du fichier image (sans extension)
//    nom     mot affiché et prononcé par la voix
//    cat     catégorie (jeu « Catégories ») : animaux | transports | corps | nourriture | vetements
//    forme   circle | square | triangle | rectangle   (jeu « Formes et objets »)
//    compter true = peut servir dans le jeu « Compter »
//    lettre  false = ne pas utiliser dans le jeu « Lettres » (par défaut : première lettre du nom)
window.OBJETS = [
  { id: 'banane',     nom: 'Banane',     cat: 'nourriture', compter: true },
  { id: 'ballon',     nom: 'Ballon',     forme: 'circle',   compter: true },
  { id: 'chat',       nom: 'Chat',       cat: 'animaux',    compter: true },
  { id: 'pomme',      nom: 'Pomme',      cat: 'nourriture', compter: true },
  { id: 'poisson',    nom: 'Poisson',    cat: 'animaux',    compter: true },
  { id: 'voiture',    nom: 'Voiture',    cat: 'transports', compter: true },
  { id: 'maison',     nom: 'Maison' },
  { id: 'soleil',     nom: 'Soleil' },
  { id: 'fleur',      nom: 'Fleur',      compter: true },
  { id: 'lune',       nom: 'Lune' },
  { id: 'roue',       nom: 'Roue',       forme: 'circle' },
  { id: 'boite',      nom: 'Boîte',      forme: 'square' },
  { id: 'fenetre',    nom: 'Fenêtre',    forme: 'square' },
  { id: 'toit',       nom: 'Toit',       forme: 'triangle' },
  { id: 'fromage',    nom: 'Fromage',    forme: 'triangle', cat: 'nourriture' },
  { id: 'porte',      nom: 'Porte',      forme: 'rectangle' },
  { id: 'livre',      nom: 'Livre',      forme: 'rectangle' },

  { id: 'cochon',     nom: 'Cochon',     cat: 'animaux' },
  { id: 'mouton',     nom: 'Mouton',     cat: 'animaux' },
  { id: 'cheval',     nom: 'Cheval',     cat: 'animaux' },
  { id: 'poule',      nom: 'Poule',      cat: 'animaux' },
  { id: 'vache',      nom: 'Vache',      cat: 'animaux' },
  { id: 'chien',      nom: 'Chien',      cat: 'animaux' },

  { id: 'velo',       nom: 'Vélo',       cat: 'transports' },
  { id: 'camion',     nom: 'Camion',     cat: 'transports' },
  { id: 'bateau',     nom: 'Bateau',     cat: 'transports' },
  { id: 'avion',      nom: 'Avion',      cat: 'transports' },
  { id: 'bus',        nom: 'Bus',        cat: 'transports' },
  { id: 'train',      nom: 'Train',      cat: 'transports' },

  { id: 'oeil',       nom: 'Œil',        cat: 'corps', lettre: false },
  { id: 'nez',        nom: 'Nez',        cat: 'corps' },
  { id: 'bouche',     nom: 'Bouche',     cat: 'corps' },
  { id: 'main',       nom: 'Main',       cat: 'corps' },
  { id: 'pied',       nom: 'Pied',       cat: 'corps' },
  { id: 'oreille',    nom: 'Oreille',    cat: 'corps' },

  { id: 'carotte',    nom: 'Carotte',    cat: 'nourriture' },
  { id: 'pain',       nom: 'Pain',       cat: 'nourriture' },
  { id: 'lait',       nom: 'Lait',       cat: 'nourriture' },

  { id: 'tshirt',     nom: 'T-shirt',    cat: 'vetements' },
  { id: 'pantalon',   nom: 'Pantalon',   cat: 'vetements' },
  { id: 'chaussette', nom: 'Chaussette', cat: 'vetements' },
  { id: 'chaussure',  nom: 'Chaussure',  cat: 'vetements' },
  { id: 'casquette',  nom: 'Casquette',  cat: 'vetements' },
  { id: 'robe',       nom: 'Robe',       cat: 'vetements' }
];

// Catégories du jeu « Catégories » (l'image « icone » est dans img/obj/)
window.CATEGORIES = [
  { id: 'animaux',    nom: 'Les animaux',      icone: 'cat-animaux' },
  { id: 'transports', nom: 'Les transports',   icone: 'cat-transports' },
  { id: 'corps',      nom: 'Le corps',         icone: 'cat-corps' },
  { id: 'nourriture', nom: 'La nourriture',    icone: 'cat-nourriture' },
  { id: 'vetements',  nom: 'Les vêtements',    icone: 'cat-vetements' }
];
