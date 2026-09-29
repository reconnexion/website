# Site Reconnexion : Astro (pages pré-rendues + serveur Node pour les server islands et /api).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# SITE_URL : adresse publique, utilisée pour la connexion GitHub du CMS (cf. src/cms/config.ts).
ARG SITE_URL=https://new.reconnexion.coop
ENV SITE_URL=$SITE_URL
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
EXPOSE 4321
USER node
CMD ["node", "dist/server/entry.mjs"]
