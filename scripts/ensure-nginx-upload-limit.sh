#!/usr/bin/env bash
# Raise nginx body size so Orbit hero video uploads are not HTTP 413.
# nginx forbids duplicate client_max_body_size in the same http context.
set -euo pipefail
OURS="/etc/nginx/conf.d/hotel-thamel-park-uploads.conf"
EXISTING="$(grep -l 'client_max_body_size' /etc/nginx/conf.d/*.conf 2>/dev/null | grep -v 'hotel-thamel-park-uploads.conf' | head -n1 || true)"
if [ -n "${EXISTING:-}" ]; then
  sed -i 's/client_max_body_size[[:space:]]\+[^;]*/client_max_body_size 200m/' "$EXISTING"
  if ! grep -q 'proxy_request_buffering' "$EXISTING"; then
    printf '\nproxy_request_buffering off;\n' >> "$EXISTING"
  fi
  rm -f "$OURS"
else
  cat > "$OURS" <<'EOF'
# Orbit CMS video uploads. Default nginx client_max_body_size is 1m -> HTTP 413.
client_max_body_size 200m;
proxy_request_buffering off;
EOF
fi
VHOST="/etc/nginx/sites-available/hotel-thamel-park"
if [ -f "$VHOST" ]; then
  sed -i 's/client_max_body_size[[:space:]]\+[0-9]\+[Mm]/client_max_body_size 200M/' "$VHOST"
fi
nginx -t
systemctl reload nginx
echo "OK: nginx client_max_body_size 200m"
