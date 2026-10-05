/**
 * Icônes proposées dans le CMS (menu, cartes, encadrés…). Lucide ; les premières reprennent les icônes
 * Font Awesome du YesWiki. Rendues en SVG statique côté serveur : aucun JS envoyé au navigateur.
 */
import {
  Bot,
  CalendarDays,
  Code,
  Database,
  Globe,
  Hand,
  Heart,
  Handshake,
  House,
  Lightbulb,
  Lock,
  MapPin,
  Megaphone,
  MessageCircle,
  Network,
  PenTool,
  Power,
  ShieldCheck,
  Smartphone,
  Star,
  Users,
  Wrench,
  createLucideIcon,
  type LucideIcon,
} from 'lucide-react';

/** Loupe avec un point d'interrogation (absente de Lucide). */
const LoupeQuestion = createLucideIcon('loupe-question', [
  ['circle', { cx: '11', cy: '11', r: '8', key: 'cercle' }],
  ['path', { d: 'm21 21-4.3-4.3', key: 'manche' }],
  ['path', { d: 'M8.5 8.5a2.5 2.5 0 0 1 4.86.83c0 1.67-2.5 2.5-2.5 2.5', key: 'question' }],
  ['path', { d: 'M11 14.5h.01', key: 'point' }],
]);

export const icones: Record<string, LucideIcon> = {
  maison: House,
  personnes: Users,
  poignee_de_main: Handshake,
  telephone: Smartphone,
  main: Hand,
  bulle: MessageCircle,
  calendrier: CalendarDays,
  megaphone: Megaphone,
  robot: Bot,
  donnees: Database,
  bouclier: ShieldCheck,
  reseau: Network,
  crayon: PenTool,
  code: Code,
  globe: Globe,
  outils: Wrench,
  lieu: MapPin,
  idee: Lightbulb,
  etoile: Star,
  coeur: Heart,
  cadenas: Lock,
  marche_arret: Power,
  loupe_question: LoupeQuestion,
};

export const nomsIcones = Object.keys(icones);
