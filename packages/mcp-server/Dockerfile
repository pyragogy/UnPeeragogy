FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./

# Content symlink to project root
# In Coolify, the monorepo checkout includes ../src/content/
# We mount the content volume at /app/content
# Alternatively: the MCP server loads from relative path ../../src/content/
# which works if we run from the repo root.
# For standalone Docker, we copy content in.
# For Coolify monorepo, use WORKDIR at root.

EXPOSE 3001
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]