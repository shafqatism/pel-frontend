# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy the rest of the app source
COPY . .

# Build the Vite application
RUN npm run build

# --- Stage 2: Runtime Stage ---
FROM nginx:stable-alpine AS runner

# Copy the built site from the builder stage to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Add a basic Nginx configuration to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (Railway defaults to 8080 or supply one)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
