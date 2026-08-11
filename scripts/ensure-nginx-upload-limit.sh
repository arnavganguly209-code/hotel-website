#!/usr/bin/env bash
# Raise nginx body size so Orbit hero video uploads are not HTTP 413.
set -euo pipefail
SNIPPET="/etc/nginx/conf.d/hotel-thamel-park-uploads.conf"
cat > "$SNIPPET" <<'EOF'
# Orbit CMS video uploads. Default nginx client_max_body_size is 1m → HTTP 413.
client_max_body_size 200m;
proxy_request_buffering off;
EOF
nginx -t
systemctl reload nginx
echo "OK: nginx client_max_body_size 200m"
