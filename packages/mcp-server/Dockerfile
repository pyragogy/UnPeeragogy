FROM node:22-alpine AS build

WORKDIR /app
COPY packages/mcp-server/package.json packages/mcp-server/package-lock.json ./
RUN npm install
COPY packages/mcp-server/tsconfig.json ./
COPY packages/mcp-server/src/ ./src/
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY packages/mcp-server/package.json ./

# Content collections — copied fresh on each deploy
# These are the MDX files that the MCP server serves as resources
COPY src/content ./content

EXPOSE 3001
ENV NODE_ENV=production
ENV CONTENT_ROOT=/app/content

CMD ["node", "dist/index.js"]