/**
 * Icônes proposées dans le CMS (menu…). Équivalents Lucide des icônes Font Awesome du YesWiki.
 * Rendues en SVG statique côté serveur : aucun JS envoyé au navigateur.
 */
import { CalendarDays, Hand, Handshake, House, Megaphone, MessageCircle, Smartphone, Users, type LucideIcon } from 'lucide-react';

export const icones: Record<string, LucideIcon> = {
  maison: House,
  personnes: Users,
  poignee_de_main: Handshake,
  telephone: Smartphone,
  main: Hand,
  bulle: MessageCircle,
  calendrier: CalendarDays,
  megaphone: Megaphone,
};

export const nomsIcones = Object.keys(icones);
