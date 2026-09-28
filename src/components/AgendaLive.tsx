import { useEffect, useState } from 'react';
import { Agenda, type AgendaProps } from '../blocs/Agenda';
import type { Evenement } from '../lib/types';

/**
 * Client island : même rendu que le bloc Agenda, mais rafraîchi
 * périodiquement via l'endpoint /api/agenda.json (qui, lui, parle à CalDAV).
 */
export default function AgendaLive(props: AgendaProps & { intervalle?: number }) {
  const { evenements: initiaux, nombre = 4, intervalle = 60_000 } = props;
  const [evenements, setEvenements] = useState<Evenement[] | undefined>(initiaux);

  useEffect(() => {
    let actif = true;
    const charger = async () => {
      try {
        const rep = await fetch(`/api/agenda.json?n=${nombre}`);
        if (rep.ok && actif) setEvenements(await rep.json());
      } catch {
        /* on garde l'affichage précédent */
      }
    };
    const id = setInterval(charger, intervalle);
    return () => {
      actif = false;
      clearInterval(id);
    };
  }, [nombre, intervalle]);

  return <Agenda {...props} evenements={evenements} />;
}
