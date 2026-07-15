#!/usr/bin/env bash
# Load Node/npm/pm2/git/curl for non-interactive Hostinger SSH.
# Source: . scripts/vps-env.sh

_htp_prepend_path() {
  case ":$PATH:" in
    *":$1:"*) ;;
    *) PATH="$1${PATH:+:$PATH}" ;;
  esac
}

_htp_prepend_path /usr/local/sbin
_htp_prepend_path /usr/local/bin
_htp_prepend_path /usr/sbin
_htp_prepend_path /usr/bin
_htp_prepend_path /sbin
_htp_prepend_path /bin
_htp_prepend_path "${HOME:-/root}/.local/bin"

for _d in /opt/nodejs/bin /opt/alt/*/root/usr/bin /usr/local/node/bin; do
  for _p in $_d; do
    [ -d "$_p" ] && _htp_prepend_path "$_p"
  done
done

# --- NVM: /home/*/.nvm and /root/.nvm ---
_htp_load_nvm() {
  local dir="$1"
  [ -s "$dir/nvm.sh" ] || return 0
  echo "Loading NVM from $dir"
  set +u
  set +e
  export NVM_DIR="$dir"
  # shellcheck disable=SC1090
  . "$dir/nvm.sh"
  set -e
  set -u
  if [ -d "$dir/versions/node" ]; then
    local latest
    latest="$(ls -1 "$dir/versions/node" 2>/dev/null | sort -V | tail -1 || true)"
    if [ -n "${latest:-}" ] && [ -d "$dir/versions/node/$latest/bin" ]; then
      _htp_prepend_path "$dir/versions/node/$latest/bin"
    fi
  fi
}

_htp_load_nvm "${NVM_DIR:-$HOME/.nvm}"
_htp_load_nvm "$HOME/.nvm"
_htp_load_nvm /root/.nvm

# Any other user nvm installs
for _nvm in /home/*/.nvm; do
  [ -d "$_nvm" ] && _htp_load_nvm "$_nvm"
done

[ -d "$HOME/.fnm" ] && _htp_prepend_path "$HOME/.fnm/current/bin"
[ -d "$HOME/.asdf/shims" ] && _htp_prepend_path "$HOME/.asdf/shims"

export PATH
echo "PATH=$PATH"

_htp_require() {
  local name="$1"
  if ! command -v "$name" >/dev/null 2>&1; then
    echo "ERROR: '$name' not found — this is exit code 127 (command not found)"
    echo "PATH=$PATH"
    echo "whoami=$(whoami) HOME=$HOME"
    type "$name" 2>&1 || true
    return 127
  fi
  echo "OK: $name -> $(command -v "$name")"
}

_htp_require git
_htp_require node
_htp_require npm
_htp_require pm2
_htp_require curl
_htp_require npx

echo "Runtime: Node $(node -v) | npm $(npm -v) | PM2 $(pm2 -v) | npx $(npx -v 2>/dev/null || echo n/a)"
