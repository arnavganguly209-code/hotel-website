#!/usr/bin/env bash
# Load git/node/npm/pm2/curl for non-interactive Hostinger SSH (GitHub Actions).
# Safe under set -euo pipefail when sourced as: source scripts/vps-env.sh

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
_htp_prepend_path "$HOME/.local/bin"

# Hostinger / cPanel-style Node locations (if present)
for _d in /opt/nodejs/bin /opt/alt/*/root/usr/bin /usr/local/node/bin; do
  for _p in $_d; do
    [ -d "$_p" ] && _htp_prepend_path "$_p"
  done
done

# nvm: disable nounset while sourcing (nvm is not nounset-safe)
_nvm_dir="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$_nvm_dir/nvm.sh" ]; then
  set +u
  set +e
  # shellcheck disable=SC1090
  . "$_nvm_dir/nvm.sh"
  set -e
  set -u
fi

# Also add every installed nvm node bin (works even if nvm use fails)
if [ -d "$_nvm_dir/versions/node" ]; then
  _latest="$(ls -1 "$_nvm_dir/versions/node" 2>/dev/null | sort -V | tail -1 || true)"
  if [ -n "${_latest:-}" ] && [ -d "$_nvm_dir/versions/node/$_latest/bin" ]; then
    _htp_prepend_path "$_nvm_dir/versions/node/$_latest/bin"
  fi
fi

# Root nvm when Actions user is not root but app was installed as root
if [ -s /root/.nvm/nvm.sh ] && [ ! -s "$_nvm_dir/nvm.sh" ]; then
  set +u
  set +e
  # shellcheck disable=SC1090
  . /root/.nvm/nvm.sh
  set -e
  set -u
fi
if [ -d /root/.nvm/versions/node ]; then
  _latest="$(ls -1 /root/.nvm/versions/node 2>/dev/null | sort -V | tail -1 || true)"
  if [ -n "${_latest:-}" ] && [ -d "/root/.nvm/versions/node/$_latest/bin" ]; then
    _htp_prepend_path "/root/.nvm/versions/node/$_latest/bin"
  fi
fi

# fnm / asdf common paths
[ -d "$HOME/.fnm" ] && _htp_prepend_path "$HOME/.fnm/current/bin"
[ -d "$HOME/.asdf/shims" ] && _htp_prepend_path "$HOME/.asdf/shims"

export PATH

echo "PATH=$PATH"

_htp_require() {
  local name="$1"
  if ! command -v "$name" >/dev/null 2>&1; then
    echo "ERROR: required command '$name' not found (exit would be 127)."
    echo "Searched PATH=$PATH"
    echo "User=$(id -un 2>/dev/null || true) HOME=$HOME"
    echo "Fix on VPS once: install Node 20+, npm, pm2, git, curl for this SSH user."
    return 127
  fi
  echo "OK: $name -> $(command -v "$name")"
}

_htp_require git
_htp_require node
_htp_require npm
_htp_require pm2
_htp_require curl

echo "Runtime: Node $(node -v) | npm $(npm -v) | PM2 $(pm2 -v)"
