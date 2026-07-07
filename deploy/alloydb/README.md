# AlloyDB for PostgreSQL Setup

This directory provides the configurations and management utilities for setting up **AlloyDB for PostgreSQL** for the ProcureIQ application. It includes setup files for both local development (using containerized **AlloyDB Omni**) and production/cloud environments (using **Google Cloud Platform (GCP) AlloyDB** via **Terraform**).

## Directory Structure
- [local/docker-compose.yml](file:///home/btpl-lap-22/live/ProcureIQ/deploy/alloydb/local/docker-compose.yml): Docker Compose definition to launch AlloyDB Omni locally.
- [gcp/main.tf](file:///home/btpl-lap-22/live/ProcureIQ/deploy/alloydb/gcp/main.tf): Main Terraform script defining GCP resources (VPC, Private Service Connection, AlloyDB Cluster, and Primary Instance).
- [gcp/variables.tf](file:///home/btpl-lap-22/live/ProcureIQ/deploy/alloydb/gcp/variables.tf): Configuration variables for GCP AlloyDB deployment.
- [gcp/outputs.tf](file:///home/btpl-lap-22/live/ProcureIQ/deploy/alloydb/gcp/outputs.tf): Resources outputs post Terraform provisioning.
- [alloydb-cli.sh](file:///home/btpl-lap-22/live/ProcureIQ/deploy/alloydb/alloydb-cli.sh): Management shell script wrapper for execution.

---

## Prerequisites
- **Local Dev**: [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)
- **GCP Deployment**: [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) & Authenticated [gcloud CLI](https://cloud.google.com/sdk/gcloud)

---

## Management CLI Command Reference

Execute commands using the CLI wrapper script [alloydb-cli.sh](file:///home/btpl-lap-22/live/ProcureIQ/deploy/alloydb/alloydb-cli.sh).

### Local (AlloyDB Omni) Commands

#### 1. `local-up`
Starts the AlloyDB Omni database service container locally in detached (background) mode.
```bash
./alloydb-cli.sh local-up
```
- **Details**: Uses `gcr.io/alloydb-omni/pg-alloydbomni:15` image.
- **Default Database Details**:
  - **Host**: `localhost`
  - **Port**: `5432`
  - **User**: `postgres`
  - **Password**: `postgres`
  - **Database Name**: `procureiq`

#### 2. `local-down`
Stops the running AlloyDB Omni container and tears down the associated local Docker resources.
```bash
./alloydb-cli.sh local-down
```

#### 3. `local-status`
Retrieves the real-time status of the local AlloyDB Omni container.
```bash
./alloydb-cli.sh local-status
```

#### 4. `local-logs`
Tails (follows) output logs from the local AlloyDB Omni database container.
```bash
./alloydb-cli.sh local-logs
```

#### 5. `local-shell`
Opens an interactive `psql` shell session directly inside the running database container.
```bash
./alloydb-cli.sh local-shell
```

---

### Cloud (GCP via Terraform) Commands

Before running cloud commands, authenticate with Google Cloud:
```bash
gcloud auth application-default login
```

#### 1. `gcp-init`
Runs initialization for the GCP Terraform environment, downloading providers and preparing configuration folders.
```bash
./alloydb-cli.sh gcp-init
```

#### 2. `gcp-plan`
Creates an execution plan, previewing the resources (VPC network, AlloyDB cluster, instance) that will be configured or modified in GCP.
```bash
./alloydb-cli.sh gcp-plan
```

#### 3. `gcp-apply`
Deploys the AlloyDB cluster, primary instance, and networking configuration to Google Cloud.
```bash
./alloydb-cli.sh gcp-apply
```

#### 4. `gcp-destroy`
Tears down and destroys all GCP infrastructure resources managed by Terraform for this setup.
```bash
./alloydb-cli.sh gcp-destroy
```
