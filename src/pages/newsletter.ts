import type { APIRoute } from 'astro';

const FORMULAIRE =
  'https://b144bca4.sibforms.com/serve/MUIFAMvMggADvfUsaaPvIeGfL_OR2_ub7mDxgo197al-8br9KKpRQ6fsnnyxEXSFJS-CTI0iB6G3Skf1tAsOCzHbQ_0ei08gm_a0nWTOAfq5lXCV1UWNXytGDdli7g09YW8kcnXqZeL5uROxSnsO1XSLzKTeplhqZJECpxmKaJ_Nslpf6GColxZWrAiwwJO1wbUnfGCoQFkTvi93';

// Rendue côté serveur pour renvoyer une vraie redirection HTTP plutôt qu'une page à meta refresh.
export const prerender = false;

export const GET: APIRoute = ({ redirect }) => redirect(FORMULAIRE, 302);
