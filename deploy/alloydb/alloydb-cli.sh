#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_DIR="${SCRIPT_DIR}/local"
GCP_DIR="${SCRIPT_DIR}/gcp"

DEFAULT_DB_USER="postgres"
DEFAULT_DB_PASS="postgres"
DEFAULT_DB_NAME="procureiq"
DEFAULT_DB_PORT="5432"

if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    NC=''
fi

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Required command '$1' is not installed."
        exit 1
    fi
}

show_help() {
    cat << EOF
ProcureIQ AlloyDB CLI

Usage:
  ./alloydb-cli.sh <command> [arguments]

Local (AlloyDB Omni via Docker) Commands:
  local-up       Start the local AlloyDB Omni container.
  local-down     Stop and remove local container & network.
  local-status   Show the status of the local AlloyDB Omni container.
  local-logs     Follow the logs of the local container.
  local-shell    Open a interactive psql terminal inside the local container.

Google Cloud Platform (GCP via Terraform) Commands:
  gcp-init       Initialize Terraform directory.
  gcp-plan       Generate and show an execution plan.
  gcp-apply      Builds or changes cloud resources.
  gcp-destroy    Destroy GCP infrastructure resources.

General Commands:
  help           Show this help message.
EOF
}

if [ $# -lt 1 ]; then
    show_help
    exit 0
fi

CMD="$1"
shift

case "${CMD}" in
    local-up)
        check_command docker
        log_info "Starting local AlloyDB Omni..."
        ALLOYDB_USER="${DEFAULT_DB_USER}" \
        ALLOYDB_PASSWORD="${DEFAULT_DB_PASS}" \
        ALLOYDB_DB="${DEFAULT_DB_NAME}" \
        docker compose -f "${LOCAL_DIR}/docker-compose.yml" up -d
        log_success "AlloyDB Omni is running in the background."
        log_info "Database: ${DEFAULT_DB_NAME}, Port: ${DEFAULT_DB_PORT}, User: ${DEFAULT_DB_USER}"
        ;;

    local-down)
        check_command docker
        log_info "Stopping local AlloyDB Omni..."
        docker compose -f "${LOCAL_DIR}/docker-compose.yml" down
        log_success "AlloyDB Omni container stopped and cleaned up."
        ;;

    local-status)
        check_command docker
        log_info "Checking local AlloyDB container status..."
        docker compose -f "${LOCAL_DIR}/docker-compose.yml" ps
        ;;

    local-logs)
        check_command docker
        log_info "Tailing AlloyDB logs..."
        docker compose -f "${LOCAL_DIR}/docker-compose.yml" logs -f
        ;;

    local-shell)
        check_command docker
        log_info "Opening psql shell in container..."
        docker exec -it procureiq-alloydb-local psql -U "${DEFAULT_DB_USER}" -d "${DEFAULT_DB_NAME}"
        ;;

    gcp-init)
        check_command terraform
        log_info "Initializing Terraform in ${GCP_DIR}..."
        terraform -chdir="${GCP_DIR}" init
        ;;

    gcp-plan)
        check_command terraform
        log_info "Running Terraform Plan in ${GCP_DIR}..."
        terraform -chdir="${GCP_DIR}" plan
        ;;

    gcp-apply)
        check_command terraform
        log_info "Applying Terraform Changes in ${GCP_DIR}..."
        terraform -chdir="${GCP_DIR}" apply
        ;;

    gcp-destroy)
        check_command terraform
        log_info "Destroying GCP AlloyDB Infrastructure..."
        terraform -chdir="${GCP_DIR}" destroy
        ;;

    help|--help|-h)
        show_help
        ;;

    *)
        log_error "Unknown command: ${CMD}"
        show_help
        exit 1
        ;;
esac
