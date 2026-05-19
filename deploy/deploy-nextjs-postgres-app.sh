#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 3 ]; then
  echo "Usage: $0 <app_name> <domain> <port>"
  echo "Example: $0 vibeshot vibeshot.aihelper360.com 3000"
  exit 1
fi

APP_NAME="$1"
DOMAIN="$2"
PORT="$3"

APP_ROOT="/var/www/$APP_NAME"
CURRENT_DIR="$APP_ROOT/current"
SHARED_DIR="$APP_ROOT/shared"
LOG_DIR="/var/log/$APP_NAME"

echo "==> Preparing directories"
sudo mkdir -p "$CURRENT_DIR" "$SHARED_DIR" "$LOG_DIR"
sudo chown -R azureuser:azureuser "$APP_ROOT" "$LOG_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js and Nginx"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get update
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs nginx
fi

cd "$CURRENT_DIR"

echo "==> Installing npm packages"
npm install

if [ -f "$SHARED_DIR/.env.production" ]; then
  echo "==> Syncing production env"
  cp "$SHARED_DIR/.env.production" .env.production
  chown azureuser:azureuser .env.production
  chmod 640 .env.production
fi

if [ -f prisma/schema.prisma ]; then
  echo "==> Running Prisma generate"
  npx prisma generate
fi

if [ -f package.json ] && grep -q "\"build\"" package.json; then
  echo "==> Building app"
  npm run build
fi

echo "==> Writing systemd service"
sed \
  -e "s/{{APP_NAME}}/$APP_NAME/g" \
  deploy/nextjs-postgres-azure-template.service | \
  sudo tee "/etc/systemd/system/$APP_NAME.service" >/dev/null

echo "==> Writing nginx site"
sed \
  -e "s/{{DOMAIN}}/$DOMAIN/g" \
  -e "s/{{PORT}}/$PORT/g" \
  deploy/nextjs-postgres-azure-template.nginx.conf | \
  sudo tee "/etc/nginx/sites-available/$APP_NAME.conf" >/dev/null

sudo ln -sf "/etc/nginx/sites-available/$APP_NAME.conf" "/etc/nginx/sites-enabled/$APP_NAME.conf"

echo "==> Restarting services"
sudo systemctl daemon-reload
sudo systemctl enable "$APP_NAME"
sudo systemctl restart "$APP_NAME"
sudo nginx -t
sudo systemctl reload nginx

echo "==> Done"
echo "App name: $APP_NAME"
echo "Domain: $DOMAIN"
echo "Port: $PORT"
echo "Check service: systemctl status $APP_NAME"
