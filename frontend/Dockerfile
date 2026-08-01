FROM node:24-alpine AS builder

WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ARG VITE_BASE_API_URL=http://localhost:8000/api/v1
ARG VITE_BASE_URL=http://localhost:8000
ENV VITE_BASE_API_URL=${VITE_BASE_API_URL} \
    VITE_BASE_URL=${VITE_BASE_URL}
RUN pnpm build

FROM nginx:stable-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/health/live || exit 1
