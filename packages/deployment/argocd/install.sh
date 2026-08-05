#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIND_CONFIG="${SCRIPT_DIR}/kind/kind-cluster.yaml"
K8S_DIR="${SCRIPT_DIR}/kubernetes"
ARGOCD_VERSION="v2.14.9"
ARGOCD_MANIFEST="https://raw.githubusercontent.com/argoproj/argo-cd/${ARGOCD_VERSION}/manifests/install.yaml"
CLUSTER_NAME="procureiq-local"
ARGOCD_NAMESPACE="argocd"

if kind get clusters | grep -q "^${CLUSTER_NAME}$"; then
  kind delete cluster --name "${CLUSTER_NAME}"
fi

kind create cluster --config "${KIND_CONFIG}"

kubectl create namespace "${ARGOCD_NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -n "${ARGOCD_NAMESPACE}" -f "${ARGOCD_MANIFEST}"

kubectl apply -n "${ARGOCD_NAMESPACE}" -f "${K8S_DIR}/argocd-server-service.yaml"

kubectl rollout status deployment/argocd-server -n "${ARGOCD_NAMESPACE}" --timeout=180s

kubectl apply -n "${ARGOCD_NAMESPACE}" -f "${K8S_DIR}/app.yaml"

ARGOCD_PASSWORD=$(kubectl get secret argocd-initial-admin-secret -n "${ARGOCD_NAMESPACE}" -o jsonpath="{.data.password}" | base64 --decode)

echo ""
echo "ArgoCD is ready at: https://localhost:8443"
echo "Username: admin"
echo "Password: ${ARGOCD_PASSWORD}"
echo ""
echo "Application: procureiq syncing from packages/deployment/kubernetes"
