import type { ReactNode } from 'react';

/** Découpe un texte multi-lignes en paragraphes (ligne vide = nouveau paragraphe). */
export function Paragraphes({ texte }: { texte?: string }): ReactNode {
  if (!texte) return null;
  return texte
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => <p key={i}>{p}</p>);
}

export function Bloc({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`bloc ${className}`}>
      <div className="conteneur">{children}</div>
    </section>
  );
}
