# ProcureIQ Monorepo

ProcureIQ is a multi-service procurement platform containing Spring Boot (Java), FastAPI (Python), and Next.js (Node.js) applications connected to AlloyDB for PostgreSQL.

## Directory Structure
- [packages/java/procureiq-springboot/](file:///home/btpl-lap-22/live/ProcureIQ/packages/java/procureiq-springboot): Spring Boot backend application.
- [packages/python/procureiq-python/](file:///home/btpl-lap-22/live/ProcureIQ/packages/python/procureiq-python): FastAPI Python service.
- [packages/node/procureiq-nextjs/](file:///home/btpl-lap-22/live/ProcureIQ/packages/node/procureiq-nextjs): Next.js user interface application.
- [deploy/alloydb/](file:///home/btpl-lap-22/live/ProcureIQ/deploy/alloydb): AlloyDB configuration folder for both local and cloud databases.

---

## Local Development (Multi-Service Deploy)

Run all services together locally with Docker Compose:
```bash
docker compose up --build
```
This command builds and runs:
- **AlloyDB Omni** on port `5432`
- **Spring Boot Service** on port `8080`
- **FastAPI Service** on port `8000`
- **Next.js Interface** on port `3000`

---

## AlloyDB CLI Command Reference

Execute database commands using the CLI wrapper script [deploy/alloydb/alloydb-cli.sh](file:///home/btpl-lap-22/live/ProcureIQ/deploy/alloydb/alloydb-cli.sh).

### Local (AlloyDB Omni) Commands

#### 1. `local-up`
Starts the local AlloyDB Omni database container.
```bash
./deploy/alloydb/alloydb-cli.sh local-up
```

#### 2. `local-down`
Stops the running AlloyDB Omni container and cleans up network resources.
```bash
./deploy/alloydb/alloydb-cli.sh local-down
```

#### 3. `local-status`
Shows the container status for the local AlloyDB Omni database.
```bash
./deploy/alloydb/alloydb-cli.sh local-status
```

#### 4. `local-logs`
Tails logs from the local AlloyDB database.
```bash
./deploy/alloydb/alloydb-cli.sh local-logs
```

#### 5. `local-shell`
Opens a direct `psql` interactive terminal inside the local container.
```bash
./deploy/alloydb/alloydb-cli.sh local-shell
```

### Cloud (GCP via Terraform) Commands

Ensure you are authenticated with GCP first:
```bash
gcloud auth application-default login
```

#### 1. `gcp-init`
Initializes Terraform in the GCP directory.
```bash
./deploy/alloydb/alloydb-cli.sh gcp-init
```

#### 2. `gcp-plan`
Creates and shows the GCP resource change execution plan.
```bash
./deploy/alloydb/alloydb-cli.sh gcp-plan
```

#### 3. `gcp-apply`
Deploys the VPC networks and AlloyDB resource clusters/instances on GCP.
```bash
./deploy/alloydb/alloydb-cli.sh gcp-apply
```

#### 4. `gcp-destroy`
Destroys all GCP database and VPC resources managed by Terraform.
```bash
./deploy/alloydb/alloydb-cli.sh gcp-destroy
```
