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
  Handshake,
  House,
  Lightbulb,
  MapPin,
  Megaphone,
  MessageCircle,
  Network,
  PenTool,
  ShieldCheck,
  Smartphone,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

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
};

export const nomsIcones = Object.keys(icones);
