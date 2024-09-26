# syntax = docker/dockerfile:1.2
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
ENV REACT_APP_B_API_URL=$API_URL
RUN --mount=type=cache,target=/app/node_modules \
    yarn
RUN --mount=type=cache,target=/app/node_modules \
    yarn build

FROM nginx:alpine AS nginx
COPY --from=builder /app/build /usr/share/nginx/html

FROM electronuserland/builder:wine AS electron-builder
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/app/build \
    yarn build
RUN --mount=type=cache,target=/app/build \
    yarn electron-builder --linux --win

FROM scratch AS bin
COPY --from=electron-builder /app/dist /
