FROM node:20-slim

# Install Chromium dependencies + Xvfb for headed mode (Cloudflare bypass)
RUN apt-get update && apt-get install -y --no-install-recommends \
    xvfb \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libxshmfence1 \
    fonts-liberation \
    fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Install Patchright's stealth Chromium
RUN npx patchright install chromium

# Copy scraper
COPY scraper.mjs ./

# Output directory — mount a persistent volume here
RUN mkdir -p /data/output

# Start script: run scraper under Xvfb (virtual display)
CMD ["xvfb-run", "--auto-servernum", "--server-args=-screen 0 1920x1080x24", "node", "scraper.mjs", "scrape"]
