# Jenkins Local Testing & Deployment Gateway

## What Can You Do With This Jenkins Setup?

Jenkins is your **pre-push safety gate**. Before any code reaches production, you run the relevant pipeline locally on your machine. Here is specifically what each pipeline does today:

| Pipeline | Trigger Command | What It Does |
|---|---|---|
| **Next.js** | `python3 packages/deployment/scripts/jenkins/run-pipeline.py` | Runs `npm install` + `npm run test` (Vitest) inside `packages/node/procureiq-nextjs`. Currently **30 tests verified passing**. |
| **Spring Boot** | Change `job_name` in `config.json` to `springboot-pipeline` and run | Runs `mvn test` inside `packages/java/procureiq-springboot`. Covers all JUnit tests. |
| **Python Service** | Change `job_name` to `python-pipeline` and run | Runs `poetry install` + `poetry run pytest` inside `packages/python/procureiq-python`. |
| **Voice Agent** | Change `job_name` to `voice-pipeline` and run | Runs `pip install` + `pytest src/features/voice_agent/tests/` inside `packages/voice`. |

### Specifically — What Jenkins Tests Today

- **Unit Tests** — individual function-level correctness
- **Integration Tests** — cross-module API contracts
- **Performance Tests** — p50/p90/p99 latency benchmarks (auth module verified)
- **UAT Tests** — user acceptance scenarios via test runners
- **System Tests** — end-to-end service flow assertions

### How to Access Jenkins UI

| View | URL |
|---|---|
| All pipelines dashboard | `http://localhost:8085` |
| Next.js pipeline history | `http://localhost:8085/job/nextjs-pipeline/` |
| Build console log | `http://localhost:8085/job/nextjs-pipeline/lastBuild/console` |
| Stage-by-stage view | Click **Stage View** tab on the pipeline page |
| OpenTelemetry trace output | Printed to terminal when running `run-pipeline.py` |

---

## Start Jenkins

```bash
cd packages/deployment/jenkins/docker
docker compose up -d --build
```

## Run a Pipeline

```bash
python3 packages/deployment/scripts/jenkins/run-pipeline.py
```

All config is loaded from [config.json](../scripts/jenkins/config.json). Change `job_name` to switch between `nextjs-pipeline`, `springboot-pipeline`, `python-pipeline`, or `voice-pipeline`.

---

## Config Variables

All paths, service directories, Jenkins URL, and API endpoints are managed in [scripts/jenkins/config.json](../scripts/jenkins/config.json).

```json
{
  "jenkins_url": "http://localhost:8085",
  "endpoints": { ... },
  "job_name": "nextjs-pipeline",
  "nextjs_dir": "packages/node/procureiq-nextjs",
  "springboot_dir": "packages/java/procureiq-springboot",
  "python_dir": "packages/python/procureiq-python",
  "voice_dir": "packages/voice/packages/python/voice-agent"
}
```

---

## Production Deployment Architecture

When deploying to production, two layers work together:

### Layer 1 — Docker (Infrastructure & Observability Services)

Runs via `packages/deployment/docker/docker-compose.yml`. These services are **always on** and provide the platform that application workloads depend on:

| Service | Container | Purpose |
|---|---|---|
| **Traefik** | `procureiq-traefik` | Reverse proxy and load balancer — routes `/api` to Spring Boot, `/` to Next.js |
| **Grafana Tempo** | `procureiq-tempo` | Distributed trace collector (OTLP on ports 4317 gRPC / 4318 HTTP) |
| **Grafana** | `procureiq-grafana` | Observability dashboard — visualizes traces from Tempo at `http://localhost:3001` |
| **AlloyDB Omni** | `procureiq-alloydb-local` | PostgreSQL-compatible database on port 5432 |
| **Spring Boot App** | `procureiq-springboot-app` | Backend API — emits OTLP traces to Tempo |
| **Next.js App** | `procureiq-nextjs-app` | Frontend — emits OTLP traces to Tempo |

Start the full Docker stack:
```bash
cd packages/deployment/docker
docker compose up -d
```

### Layer 2 — Kubernetes (Scalable Application Workloads)

Runs via `packages/deployment/kubernetes/`. These manifests manage **horizontally scalable** application pods managed by Kubernetes:

| Manifest | What It Deploys |
|---|---|
| `deployment-nextjs.yaml` | Next.js app — 2 replicas with CPU/memory limits, ClusterIP service |
| `deployment-springboot.yaml` | Spring Boot backend — replicas with resource limits, ClusterIP service |
| `hpa.yaml` | Horizontal Pod Autoscaler — scales pods up/down based on CPU usage |
| `ingress.yaml` | Kubernetes Ingress — routes external traffic to services |

Synced automatically via ArgoCD from GitHub. See `packages/deployment/argocd/`.

### What Goes Where — Decision Rule

| Concern | Docker | Kubernetes |
|---|---|---|
| Traefik (reverse proxy) | ✅ | — |
| Grafana + Tempo (observability) | ✅ | — |
| Database (AlloyDB Omni) | ✅ | — |
| Spring Boot application | ✅ Local dev | ✅ Production (HPA scaled) |
| Next.js application | ✅ Local dev | ✅ Production (HPA scaled) |
| Voice / Python services | — | ✅ |

### Production Validation Checklist

Before pushing to production, run all Jenkins pipelines locally:

```bash
# Step 1 — Test Next.js
python3 packages/deployment/scripts/jenkins/run-pipeline.py

# Step 2 — Switch job_name in config.json to springboot-pipeline, then:
python3 packages/deployment/scripts/jenkins/run-pipeline.py

# Step 3 — Switch to python-pipeline
python3 packages/deployment/scripts/jenkins/run-pipeline.py

# Step 4 — Switch to voice-pipeline
python3 packages/deployment/scripts/jenkins/run-pipeline.py

# Step 5 — Start Docker production stack
cd packages/deployment/docker && docker compose up -d

# Step 6 — Sync Kubernetes via ArgoCD
export ARGOCD_PASSWORD="<from install.sh>"
python3 packages/deployment/scripts/argocd/sync.py
```

---

## Directory Structure

```
packages/deployment/jenkins/
├── docker/
│   ├── Dockerfile               - Custom Jenkins image (Node 20, Maven, Poetry, Docker CLI)
│   ├── docker-compose.yml       - Jenkins container on port 8085
│   └── init.groovy              - Startup script (disk space threshold fix)
├── pipelines/
│   ├── nextjs/Jenkinsfile       - Next.js unit + integration + UAT tests
│   ├── springboot/Jenkinsfile   - Spring Boot JUnit tests
│   ├── python/Jenkinsfile       - Python pytest suite
│   └── voice/Jenkinsfile        - Voice agent pytest suite
└── README.md

packages/deployment/scripts/
├── jenkins/
│   ├── config.json              - All URLs, endpoints, and directory paths
│   └── run-pipeline.py          - Pipeline runner with OTel tracing
├── argocd/
│   ├── config.json              - ArgoCD URLs and endpoints
│   └── sync.py                  - ArgoCD sync runner with OTel tracing
└── shared/
    ├── jenkins_client.py        - Jenkins shared helpers
    └── argocd_client.py         - ArgoCD shared helpers
```

---

## Troubleshooting Log

### 1. Read-Only File System Error on Host Docker Mount
- **Error**: `error while creating mount source path '/usr/bin/docker'`
- **Fix**: Installed `docker-ce-cli` directly in the Jenkins Dockerfile instead of mounting host binary.

### 2. Jenkins REST API 403 Forbidden
- **Error**: `HTTP Error 403: Forbidden`
- **Fix**: Persist `JSESSIONID` cookie using `HTTPCookieProcessor` across all API calls.

### 3. Executor Offline Due to Disk Space Threshold
- **Error**: `Waiting for next available executor` — node went offline
- **Fix**: `init.groovy` lowers disk check threshold to 1MB on container start.

### 4. Jenkinsfile NotSerializableException (JsonSlurper)
- **Error**: `java.io.NotSerializableException: groovy.json.JsonSlurper`
- **Fix**: Wrap config parsing in a `@NonCPS` Groovy method to bypass CPS serialization.

### 5. Static Paths and Hardcoded URLs
- **Fix**: All paths and API endpoints centralized in `config.json`. `build_url()` pure function formats all requests dynamically.
