#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME=$(basename "$PWD")
REMOTE_HOST="nas"
REMOTE_DIR="/volume1/docker/${PROJECT_NAME}"
BACKUP_FILE="_backup.tar.gz"
TMP_BACKUP="/tmp/${PROJECT_NAME}_${BACKUP_FILE}"

echo "🚀 Deployen van '${PROJECT_NAME}' naar ${REMOTE_HOST}:${REMOTE_DIR}..."

# 1. Maak de doelmap aan op de Synology als die nog niet bestaat
ssh "${REMOTE_HOST}" "mkdir -p '${REMOTE_DIR}'"

# 2. Maak de backup eerst in /tmp (voorkomt 'file changed as we read it') en verplaats hem daarna
echo "📦 Vorige backup verwijderen en nieuwe maken in ${REMOTE_DIR}/${BACKUP_FILE}..."
ssh "${REMOTE_HOST}" "cd '${REMOTE_DIR}' && \
  rm -f '${BACKUP_FILE}' '${TMP_BACKUP}' && \
  if [ -n \"\$(ls -A 2>/dev/null)\" ]; then \
    tar --exclude='${BACKUP_FILE}' -czf '${TMP_BACKUP}' . && \
    mv '${TMP_BACKUP}' '${REMOTE_DIR}/${BACKUP_FILE}' ; \
  fi"

# 3. Synchroniseer code naar de Synology (zonder --delete en zonder userdata/backup)
echo "🔄 Bestanden synchroniseren..."
rsync -avz -e "ssh" \
  --exclude '.git/' \
  --exclude '.github/' \
  --exclude 'node_modules/' \
  --exclude '__pycache__/' \
  --exclude '.venv/' \
  --exclude 'venv/' \
  --exclude '.DS_Store' \
  --exclude 'deploy.sh' \
  --exclude "${BACKUP_FILE}" \
  --exclude 'data/' \
  --exclude 'db/' \
  --exclude 'uploads/' \
  --exclude 'storage/' \
  --exclude '*.sqlite' \
  --exclude '*.sqlite3' \
  --exclude '*.db' \
  ./ "${REMOTE_HOST}:${REMOTE_DIR}/"

# 4. Bouw en herstart de containers op de Synology
echo "🐳 Containers bouwen en herstarten op ${REMOTE_HOST}..."
ssh "${REMOTE_HOST}" "cd '${REMOTE_DIR}' && docker compose up -d --build"

# 5. Ruim oude, ongebruikte Docker-images op
echo "🧹 Oude images opschonen..."
ssh "${REMOTE_HOST}" "docker image prune -f"

echo "✅ Klaar! '${PROJECT_NAME}' draait op je Synology (backup staat in ${REMOTE_DIR}/${BACKUP_FILE})."
