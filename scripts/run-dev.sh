#!/usr/bin/env bash

# Helper script to run dev services in the correct environment (Local vs Production)
# Based on the configuration in the root .env file.

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
ROOT_ENV_FILE="$PROJECT_ROOT/.env"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

if [ ! -f "$ROOT_ENV_FILE" ]; then
    echo -e "${RED}Error: Root .env file not found!${NC}"
    exit 1
fi

# Load variables
export $(grep -v '^#' "$ROOT_ENV_FILE" | xargs)

ENV_MODE=${PROCUREIQ_ENV:-local}

echo -e "${BLUE}===============================================${NC}"
echo -e "Starting ProcureIQ standalone runner in ${GREEN}${ENV_MODE}${NC} mode"
echo -e "${BLUE}===============================================${NC}"

setup_env_vars() {
    if [ "$ENV_MODE" = "local" ]; then
        # Backend environment variables
        export DB_HOST="$LOCAL_DB_HOST"
        export DB_PORT="$LOCAL_DB_PORT"
        export DB_NAME="$LOCAL_DB_NAME"
        export SPRING_DATASOURCE_URL="jdbc:postgresql://${LOCAL_DB_HOST}:${LOCAL_DB_PORT}/${LOCAL_DB_NAME}?stringtype=unspecified"
        export SPRING_DATASOURCE_USERNAME="$LOCAL_DB_USER"
        export SPRING_DATASOURCE_PASSWORD="$LOCAL_DB_PASS"
        export DATABASE_URL="$LOCAL_DATABASE_URL"
        
        # Frontend environment variables
        export NEXT_PUBLIC_API_URL="$LOCAL_NEXT_SPRINGBOOT_API"
        export NEXT_PUBLIC_PYTHON_API_URL="$LOCAL_NEXT_PYTHON_API"
        export NEXT_PUBLIC_WEBRTC_SIGNALING_URL="$LOCAL_NEXT_WEBRTC_WS"
    else
        # Backend environment variables (Production / Remote Supabase)
        export DB_HOST="$PROD_DB_HOST"
        export DB_PORT="$PROD_DB_PORT"
        export DB_NAME="$PROD_DB_NAME"
        export SPRING_DATASOURCE_URL="jdbc:postgresql://${PROD_DB_HOST}:${PROD_DB_PORT}/${PROD_DB_NAME}?stringtype=unspecified"
        export SPRING_DATASOURCE_USERNAME="$PROD_DB_USER"
        export SPRING_DATASOURCE_PASSWORD="$PROD_DB_PASS"
        export DATABASE_URL="$PROD_DATABASE_URL"
        
        # Frontend environment variables
        export NEXT_PUBLIC_API_URL="$PROD_NEXT_SPRINGBOOT_API"
        export NEXT_PUBLIC_PYTHON_API_URL="$PROD_NEXT_PYTHON_API"
        export NEXT_PUBLIC_WEBRTC_SIGNALING_URL="$PROD_NEXT_WEBRTC_WS"
    fi
}

setup_local_database_schemas() {
    if [ "$ENV_MODE" = "local" ]; then
        echo -e "${YELLOW}Checking if local database schemas/tables need to be created...${NC}"
        
        if ! docker ps --format '{{.Names}}' | grep -q "^procureiq-alloydb-local$"; then
            echo -e "${RED}Error: Local AlloyDB container (procureiq-alloydb-local) is not running!${NC}"
            echo -e "${YELLOW}Attempting to start database...${NC}"
            "$PROJECT_ROOT/deploy/alloydb/alloydb-cli.sh" local-up
            sleep 3
        fi

        local table_exists
        table_exists=$(docker exec -i procureiq-alloydb-local psql -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -tAc "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'channel_deliveries');" 2>/dev/null || echo "false")
        
        if [ "$table_exists" != "t" ]; then
            echo -e "${YELLOW}Table 'channel_deliveries' not found. Running database migrations...${NC}"
            
            local migration_dir="$PROJECT_ROOT/packages/java/procureiq-springboot/database/migrations"
            for sql_file in $(ls "$migration_dir"/00*.sql | sort); do
                echo -e "Applying migration: ${BLUE}$(basename "$sql_file")${NC}"
                docker exec -i procureiq-alloydb-local psql -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" < "$sql_file" > /dev/null
            done
            
            echo -e "${GREEN}Database migrations completed successfully!${NC}"
        else
            echo -e "${GREEN}Database schemas are already initialized.${NC}"
        fi
    fi
}

run_backend_springboot() {
    setup_env_vars
    
    if [ "$ENV_MODE" = "local" ]; then
        echo -e "${YELLOW}Releasing port 6565 if in use...${NC}"
        lsof -t -i:6565 | xargs -r kill -9 >/dev/null 2>&1
        
        echo -e "${YELLOW}Ensuring local database container is running...${NC}"
        if ! docker ps --format '{{.Names}}' | grep -q "^procureiq-alloydb-local$"; then
            docker compose -f "$PROJECT_ROOT/docker-compose.yml" up -d alloydb-omni >/dev/null 2>&1
            sleep 3
        fi
    fi
    
    setup_local_database_schemas
    run_db_backup
    
    # Check if database tables already exist
    local table_exists
    if [ "$ENV_MODE" = "local" ]; then
        table_exists=$(docker exec -i procureiq-alloydb-local psql -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -tAc "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'channel_deliveries');" 2>/dev/null || echo "false")
    fi

    if [ "$table_exists" = "t" ]; then
        echo -e "${GREEN}Database tables exist. Setting Hibernate DDL-Auto to 'none'...${NC}"
        export SPRING_JPA_HIBERNATE_DDL_AUTO="none"
    else
        echo -e "${YELLOW}Database tables do not exist. Setting Hibernate DDL-Auto to 'update'...${NC}"
        export SPRING_JPA_HIBERNATE_DDL_AUTO="update"
    fi

    echo -e "${YELLOW}Cleaning target directory for Spring Boot...${NC}"
    cd "$PROJECT_ROOT/packages/java/procureiq-springboot"
    ./mvnw clean
    
    echo -e "${YELLOW}Starting Spring Boot Backend...${NC}"
    ./mvnw spring-boot:run
}

run_backend_dotnet() {
    setup_env_vars
    
    if [ "$ENV_MODE" = "local" ]; then
        echo -e "${YELLOW}Releasing port 5000 if in use...${NC}"
        lsof -t -i:5000 | xargs -r kill -9 >/dev/null 2>&1
    fi
    
    setup_local_database_schemas
    run_db_backup
    echo -e "${YELLOW}Starting .NET (dotnet) Backend...${NC}"
    
    if [ -d "$PROJECT_ROOT/packages/dotnet" ]; then
        cd "$PROJECT_ROOT/packages/dotnet"
        dotnet run
    else
        echo -e "${RED}Error: .NET backend package directory (packages/dotnet) not found!${NC}"
        exit 1
    fi
}

run_backend_python() {
    setup_env_vars
    
    if [ "$ENV_MODE" = "local" ]; then
        echo -e "${YELLOW}Releasing port 8000 if in use...${NC}"
        lsof -t -i:8000 | xargs -r kill -9 >/dev/null 2>&1
        
        echo -e "${YELLOW}Recreating and restarting local database container...${NC}"
        docker compose -f "$PROJECT_ROOT/docker-compose.yml" up -d alloydb-omni >/dev/null 2>&1
        sleep 3
        
        echo -e "${YELLOW}Dropping and recreating database schemas...${NC}"
        docker exec -i procureiq-alloydb-local psql -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;" >/dev/null 2>&1
    fi
    
    setup_local_database_schemas
    run_db_backup
    echo -e "${YELLOW}Starting FastAPI Python Backend...${NC}"
    cd "$PROJECT_ROOT/packages/python/procureiq-python"
    
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    uvicorn src.infra.database:app --reload --port 8000 || uvicorn src.api.main:app --reload --port 8000 || uvicorn app.main:app --reload --port 8000
}

run_frontend() {
    setup_env_vars
    setup_local_database_schemas
    run_db_backup
    echo -e "${YELLOW}Starting Next.js Frontend...${NC}"
    cd "$PROJECT_ROOT/packages/node/procureiq-nextjs"
    
    cat << EOF > .env.local
NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
NEXT_PUBLIC_PYTHON_API_URL=$NEXT_PUBLIC_PYTHON_API_URL
NEXT_PUBLIC_WEBRTC_SIGNALING_URL=$NEXT_PUBLIC_WEBRTC_SIGNALING_URL
EOF
    
    npm run dev
}

run_db_backup() {
    setup_env_vars
    if [ "$ENV_MODE" = "local" ]; then
        echo -e "${YELLOW}Starting local database backup...${NC}"
        mkdir -p "$PROJECT_ROOT/deploy/alloydb/local/backups"
        local file_path="$PROJECT_ROOT/deploy/alloydb/local/backups/latest_db_backup.sql.gz"
        docker exec -t procureiq-alloydb-local pg_dump -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" | gzip > "$file_path"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Backup completed successfully! Saved to $file_path${NC}"
        else
            echo -e "${RED}Backup failed!${NC}"
        fi
    fi
}

run_db_restore() {
    setup_env_vars
    if [ "$ENV_MODE" = "local" ]; then
        local file_path="$PROJECT_ROOT/deploy/alloydb/local/backups/latest_db_backup.sql.gz"
        if [ ! -f "$file_path" ]; then
            echo -e "${RED}Error: Backup file $file_path not found!${NC}"
            exit 1
        fi
        echo -e "${YELLOW}Restoring database from: $file_path...${NC}"
        docker exec -i procureiq-alloydb-local psql -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;" > /dev/null
        gunzip -c "$file_path" | docker exec -i procureiq-alloydb-local psql -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Restore completed successfully!${NC}"
        else
            echo -e "${RED}Restore failed!${NC}"
        fi
    fi
}

run_mfe() {
    local mfe_name="$1"
    setup_env_vars
    local port=8990
    case "$mfe_name" in
        procureiq-nextjs) port=8990 ;;
        mfe-crypto) port=8991 ;;
        mfe-auth) port=8992 ;;
        mfe-notifications) port=8993 ;;
        mfe-email) port=8994 ;;
        mfe-campaigns) port=8995 ;;
        mfe-fieldservice) port=8996 ;;
        mfe-github) port=8997 ;;
        mfe-jobs) port=8998 ;;
    esac
    echo -e "${YELLOW}Starting Micro Frontend ${mfe_name} on port ${port}...${NC}"
    cd "$PROJECT_ROOT/packages/node/procureiq-nextjs"
    npx next dev "$mfe_name" -p "$port"
}

run_all_mfes() {
    setup_env_vars
    echo -e "${YELLOW}Starting all Micro Frontends concurrently...${NC}"
    
    local mfes=("procureiq-nextjs:8990" "mfe-crypto:8991" "mfe-auth:8992" "mfe-notifications:8993" "mfe-email:8994" "mfe-campaigns:8995" "mfe-fieldservice:8996" "mfe-github:8997" "mfe-jobs:8998")
    
    for item in "${mfes[@]}"; do
        local name="${item%%:*}"
        local port="${item##*:}"
        if [ -d "$PROJECT_ROOT/packages/node/procureiq-nextjs/$name" ]; then
            echo -e "${BLUE}Launching $name on port $port...${NC}"
            (cd "$PROJECT_ROOT/packages/node/procureiq-nextjs" && npx next dev "$name" -p "$port") &
        fi
    done
    wait
}

show_help() {
    echo "Usage: ./scripts/run-dev.sh [command]"
    echo ""
    echo "Backend Commands:"
    echo "  springboot      - Run Spring Boot Java backend (Port 6565)"
    echo "  python          - Run FastAPI Python backend (Port 8000)"
    echo "  dotnet          - Run .NET backend (Port 5000)"
    echo ""
    echo "Frontend & Micro Frontend (MFE) Commands:"
    echo "  frontend        - Run main Next.js frontend (Port 8990)"
    echo "  mfe-crypto      - Run MFE Crypto (Port 8991)"
    echo "  mfe-auth        - Run MFE Auth (Port 8992)"
    echo "  mfe-notifications - Run MFE Notifications (Port 8993)"
    echo "  mfe-email       - Run MFE Email (Port 8994)"
    echo "  mfe-campaigns   - Run MFE Campaigns (Port 8995)"
    echo "  mfe-fieldservice - Run MFE Field Service (Port 8996)"
    echo "  mfe-github      - Run MFE GitHub (Port 8997)"
    echo "  mfe-jobs        - Run MFE Jobs (Port 8998)"
    echo "  all-mfes        - Run main frontend and all MFEs concurrently"
    echo ""
    echo "Database Commands:"
    echo "  backup          - Backup local database"
    echo "  restore         - Restore local database from latest backup"
    echo "  help            - Show this menu"
}

case "$1" in
    springboot)
        run_backend_springboot
        ;;
    python)
        run_backend_python
        ;;
    dotnet)
        run_backend_dotnet
        ;;
    frontend)
        run_frontend
        ;;
    mfe-crypto|mfe-auth|mfe-notifications|mfe-email|mfe-campaigns|mfe-fieldservice|mfe-github|mfe-jobs)
        run_mfe "$1"
        ;;
    all-mfes)
        run_all_mfes
        ;;
    backup)
        run_db_backup
        ;;
    restore)
        run_db_restore
        ;;
    help|*)
        show_help
        ;;
esac

