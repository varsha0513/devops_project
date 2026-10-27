#!/bin/bash
set -e

if [ ! -d /opt/smartcampus/venv ]; then
  python3 -m venv /opt/smartcampus/venv
fi

/opt/smartcampus/venv/bin/pip install --upgrade pip
/opt/smartcampus/venv/bin/pip install -r /opt/smartcampus/requirements.txt

if [ ! -f /opt/smartcampus/.env ]; then
  cat > /opt/smartcampus/.env << 'EOF'
DATABASE_URL=sqlite:////opt/smartcampus/smart_campus.db
CORS_ORIGINS=http://40.80.93.49
SEED_ON_STARTUP=true
ENVIRONMENT=development
EOF
  chown azureuser:azureuser /opt/smartcampus/.env
  chmod 600 /opt/smartcampus/.env
fi

sudo cp /tmp/deploy/nginx-smartcampus.conf /etc/nginx/sites-available/smartcampus.conf
sudo ln -sf /etc/nginx/sites-available/smartcampus.conf /etc/nginx/sites-enabled/smartcampus.conf
sudo rm -f /etc/nginx/sites-enabled/default
if ! sudo nginx -t; then echo 'NGINX TEST FAILED'; sudo nginx -t 2>&1; exit 1; fi
sudo systemctl reload nginx

sudo cp /tmp/deploy/smartcampus.service /etc/systemd/system/smartcampus.service
sudo systemctl daemon-reload
sudo systemctl enable smartcampus
sudo systemctl restart smartcampus

sudo systemctl reload nginx

sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/health || true