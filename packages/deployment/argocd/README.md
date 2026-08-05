# ArgoCD Local GitOps Setup

## Folder Structure

```
packages/deployment/argocd/
├── kind/
│   └── kind-cluster.yaml          - Local Kubernetes cluster config
├── kubernetes/
│   ├── namespace.yaml             - ArgoCD namespace
│   ├── argocd-server-service.yaml - NodePort service (exposes port 8443)
│   └── app.yaml                   - ArgoCD Application CRD
├── docker/
│   └── docker-compose.yml         - kubectl proxy supporting service
└── install.sh                     - Full local setup script

packages/deployment/scripts/argocd/
├── config.json                    - Centralized URLs and endpoints
└── sync.py                        - Sync runner with OpenTelemetry tracing

packages/deployment/scripts/shared/
└── argocd_client.py               - Shared ArgoCD API helpers
```

## Setup

```bash
cd packages/deployment/argocd
bash install.sh
```

The script will:
1. Create a `kind` Kubernetes cluster (`procureiq-local`)
2. Install ArgoCD v2.14.9 into the `argocd` namespace
3. Expose ArgoCD UI at `https://localhost:8443`
4. Apply the `procureiq` Application syncing `packages/deployment/kubernetes/`
5. Print the initial admin password

## ArgoCD UI

Open `https://localhost:8443` in your browser.

- **Username**: `admin`
- **Password**: printed by `install.sh`

## Trigger Sync via Script

```bash
export ARGOCD_PASSWORD="<password from install.sh>"
python3 packages/deployment/scripts/argocd/sync.py
```

## Config Variables

All ArgoCD API endpoints and server URL are declared in [config.json](file:///home/btpl-lap-22/live/ProcureIQ/packages/deployment/scripts/argocd/config.json).
