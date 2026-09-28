import { Bloc, Paragraphes, TitreBloc, champFond, type Fond } from './_commun';
import type { DefinitionBloc } from './types';

export type VideoProps = {
  fond?: Fond;
  titre?: string;
  url?: string;
  legende?: string;
  pleine_largeur?: boolean;
};

/**
 * URL d'intégration d'une vidéo :
 * - YouTube (watch, youtu.be, embed ; avec &t=…), en mode sans cookies ;
 * - PeerTube (/w/<id> ou /videos/watch|embed/<id>), sur n'importe quelle instance.
 */
function urlIntegration(url: string): string | undefined {
  try {
    const u = new URL(url);
    const peertube = u.pathname.match(/^\/(?:w|videos\/(?:watch|embed))\/([\w-]+)/);
    if (peertube && !/youtube\.com$/.test(u.hostname)) {
      const debut = u.searchParams.get('start') ?? u.searchParams.get('t');
      return `${u.origin}/videos/embed/${peertube[1]}${debut ? `?start=${debut}` : ''}`;
    }
    const id =
      u.hostname === 'youtu.be'
        ? u.pathname.slice(1)
        : u.pathname.startsWith('/embed/')
          ? u.pathname.split('/')[2]
          : u.searchParams.get('v');
    if (!id) return undefined;
    const debut = (u.searchParams.get('t') ?? u.searchParams.get('start'))?.replace(/s$/, '');
    return `https://www.youtube-nocookie.com/embed/${id}${debut ? `?start=${debut}` : ''}`;
  } catch {
    return undefined;
  }
}

export function Video({ fond = 'blanc', titre, url, legende, pleine_largeur }: VideoProps) {
  const src = url ? urlIntegration(url) : undefined;
  return (
    <Bloc fond={fond}>
      <TitreBloc titre={titre} className="text-center" />
      {src && (
        <div className={`mx-auto aspect-video w-full overflow-hidden${pleine_largeur ? '' : ' max-w-[56rem]'}`}>
          <iframe
            src={src}
            title={titre ?? ''}
            className="size-full"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      )}
      <Paragraphes texte={legende} className="mt-e3 text-center text-s" />
    </Bloc>
  );
}

export const video: DefinitionBloc<VideoProps> = {
  name: 'video',
  label: 'Vidéo (YouTube, PeerTube)',
  Component: Video,
  fields: [
    champFond,
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    { name: 'url', label: 'Lien de la vidéo', widget: 'string', hint: 'YouTube (ex. https://www.youtube.com/watch?v=…&t=4) ou PeerTube (ex. https://videos-libr.es/w/…).' },
    { name: 'pleine_largeur', label: 'Toute la largeur de la page', widget: 'boolean', required: false, default: false },
    { name: 'legende', label: 'Légende', widget: 'text', required: false, hint: '[texte du lien](https://…) pour ajouter un lien.' },
  ],
};
