#!/bin/bash

# Get the directory where the script is located, and calculate project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Database configuration
CONTAINER_NAME="procureiq-alloydb-local"
DB_USER="postgres"
DB_NAME="procureiq"
BACKUP_DIR="$PROJECT_ROOT/deploy/alloydb/local/backups"
ENV_FILE="$PROJECT_ROOT/.env.backup"

# Fixed filename for single, updated backup file
FILENAME="latest_db_backup.sql.gz"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

mkdir -p "$BACKUP_DIR"

# Load environment configuration if it exists
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

show_help() {
    echo -e "${BLUE}ProcureIQ Database & Backblaze B2 Manager${NC}"
    echo "Usage: ./scripts/db-manage.sh [command]"
    echo ""
    echo "Commands:"
    echo "  backup    - Dump database locally to latest_db_backup.sql.gz"
    echo "  upload    - Upload (overwrite) latest_db_backup.sql.gz to Backblaze B2"
    echo "  download  - Download latest_db_backup.sql.gz from Backblaze B2"
    echo "  restore   - Restore local latest_db_backup.sql.gz to database"
    echo "  setup     - Set up your Backblaze B2 credentials"
    echo "  help      - Show this help message"
}

check_b2_credentials() {
    if [ -z "$B2_KEY_ID" ] || [ -z "$B2_APPLICATION_KEY" ] || [ -z "$B2_BUCKET_ID" ] || [ -z "$B2_BUCKET_NAME" ]; then
        echo -e "${RED}Error: Backblaze B2 configuration is missing!${NC}"
        echo "Please run: ./scripts/db-manage.sh setup"
        exit 1
    fi
}

do_setup() {
    echo -e "${BLUE}--- Backblaze B2 Configuration Setup ---${NC}"
    read -p "Enter your B2 Key ID: " key_id
    read -p "Enter your B2 Application Key: " app_key
    read -p "Enter your B2 Bucket Name: " bucket_name
    read -p "Enter your B2 Bucket ID: " bucket_id

    cat << EOF > "$ENV_FILE"
# Backblaze B2 Credentials
B2_KEY_ID=$key_id
B2_APPLICATION_KEY=$app_key
B2_BUCKET_NAME=$bucket_name
B2_BUCKET_ID=$bucket_id
EOF

    chmod 600 "$ENV_FILE"
    echo -e "${GREEN}Configuration saved to $ENV_FILE${NC}"
}

do_backup() {
    echo -e "${YELLOW}Starting database backup...${NC}"
    
    if [ ! "$(docker ps -q -f name=${CONTAINER_NAME})" ]; then
        echo -e "${RED}Error: Container ${CONTAINER_NAME} is not running!${NC}"
        exit 1
    fi

    # Backup directly overwriting the fixed file
    docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$FILEPATH"

    if [ $? -eq 0 ]; then
        SIZE=$(du -sh "$FILEPATH" | cut -f1)
        echo -e "${GREEN}Backup completed successfully!${NC}"
        echo -e "File: ${BLUE}${FILEPATH}${NC} (Size: ${SIZE})"
    else
        echo -e "${RED}Backup failed!${NC}"
        rm -f "$FILEPATH"
    fi
}

b2_authorize() {
    auth_response=$(curl -s -u "$B2_KEY_ID:$B2_APPLICATION_KEY" "https://api.backblazeb2.com/b2api/v2/b2_authorize_account")
    
    API_URL=$(echo "$auth_response" | jq -r '.apiUrl')
    AUTH_TOKEN=$(echo "$auth_response" | jq -r '.authorizationToken')
    DOWNLOAD_URL=$(echo "$auth_response" | jq -r '.downloadUrl')

    if [ -z "$AUTH_TOKEN" ] || [ "$AUTH_TOKEN" == "null" ]; then
        echo -e "${RED}Failed to authorize with Backblaze B2. Check your credentials in $ENV_FILE${NC}"
        exit 1
    fi
}

do_upload() {
    check_b2_credentials
    
    # Run backup if the latest file doesn't exist
    if [ ! -f "$FILEPATH" ]; then
        echo -e "${YELLOW}No local backup found. Running backup first...${NC}"
        do_backup
        if [ ! -f "$FILEPATH" ]; then exit 1; fi
    fi

    echo -e "${YELLOW}Authorizing with Backblaze B2...${NC}"
    b2_authorize

    echo -e "${YELLOW}Getting upload URL...${NC}"
    upload_url_response=$(curl -s -H "Authorization: $AUTH_TOKEN" -d "{\"bucketId\": \"$B2_BUCKET_ID\"}" "${API_URL}/b2api/v2/b2_get_upload_url")
    UPLOAD_URL=$(echo "$upload_url_response" | jq -r '.uploadUrl')
    UPLOAD_AUTH_TOKEN=$(echo "$upload_url_response" | jq -r '.authorizationToken')

    if [ -z "$UPLOAD_URL" ] || [ "$UPLOAD_URL" == "null" ]; then
        echo -e "${RED}Failed to get upload URL from Backblaze B2.${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Calculating hash checksum...${NC}"
    SHA1=$(sha1sum "$FILEPATH" | cut -d' ' -f1)

    echo -e "${YELLOW}Uploading $FILENAME to Backblaze B2...${NC}"
    upload_result=$(curl -s -X POST \
      -H "Authorization: $UPLOAD_AUTH_TOKEN" \
      -H "X-Bz-File-Name: $FILENAME" \
      -H "Content-Type: application/octet-stream" \
      -H "X-Bz-Content-Sha1: $SHA1" \
      --data-binary "@$FILEPATH" \
      "$UPLOAD_URL")

    fileId=$(echo "$upload_result" | jq -r '.fileId')
    if [ ! -z "$fileId" ] && [ "$fileId" != "null" ]; then
        echo -e "${GREEN}Upload completed successfully!${NC}"
        echo -e "File updated in bucket ${BLUE}$B2_BUCKET_NAME${NC}"
    else
        echo -e "${RED}Upload failed: $upload_result${NC}"
    fi
}

do_download() {
    check_b2_credentials
    echo -e "${YELLOW}Authorizing with Backblaze B2...${NC}"
    b2_authorize

    echo -e "${YELLOW}Downloading $FILENAME from Backblaze B2...${NC}"
    curl -H "Authorization: $AUTH_TOKEN" -o "$FILEPATH" "${DOWNLOAD_URL}/file/${B2_BUCKET_NAME}/${FILENAME}"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Download successful!${NC}"
        echo "File saved to $FILEPATH"
    else
        echo -e "${RED}Download failed!${NC}"
    fi
}

do_restore() {
    if [ ! -f "$FILEPATH" ]; then
        echo -e "${RED}Error: Local backup file $FILEPATH not found. Please run download first.${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Restoring database from: $FILENAME...${NC}"

    if [ ! "$(docker ps -q -f name=${CONTAINER_NAME})" ]; then
        echo -e "${RED}Error: Container ${CONTAINER_NAME} is not running!${NC}"
        exit 1
    fi

    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;" > /dev/null
    gunzip -c "$FILEPATH" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Restore completed successfully!${NC}"
    else
        echo -e "${RED}Restore failed!${NC}"
    fi
}

# Main command dispatcher
case "$1" in
    setup)
        do_setup
        ;;
    backup)
        do_backup
        ;;
    upload)
        do_upload
        ;;
    download)
        do_download
        ;;
    restore)
        do_restore
        ;;
    help|*)
        show_help
        ;;
esac
