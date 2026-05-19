#!/usr/bin/env bash
set -euo pipefail

APP_ROOT=/var/www/vibeshot
RELEASE_DIR="$APP_ROOT/current"
SHARED_DIR="$APP_ROOT/shared"

sudo mkdir -p "$RELEASE_DIR" "$SHARED_DIR" /var/log/vibeshot
sudo chown -R azureuser:azureuser "$APP_ROOT" /var/log/vibeshot

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get update
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs nginx
fi

cd "$RELEASE_DIR"
npm install
npm run build

if [ -f "$SHARED_DIR/.env.production" ]; then
  cp "$SHARED_DIR/.env.production" .env.production
fi

if [ -f prisma/schema.prisma ]; then
  npx prisma generate
fi

sudo cp deploy/vibeshot.service /etc/systemd/system/vibeshot.service
sudo cp deploy/nginx.vibeshot.conf /etc/nginx/sites-available/vibeshot.conf
sudo ln -sf /etc/nginx/sites-available/vibeshot.conf /etc/nginx/sites-enabled/vibeshot.conf
sudo rm -f /etc/nginx/sites-enabled/default

sudo systemctl daemon-reload
sudo systemctl enable vibeshot
sudo systemctl restart vibeshot
sudo nginx -t
sudo systemctl restart nginx
