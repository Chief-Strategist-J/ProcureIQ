import sys
import os
import time
import json
import urllib.request
from opentelemetry import trace

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.argocd_client import (
    init_tracer,
    load_config,
    get_opener,
    get_auth_token,
    build_url
)

tracer = init_tracer("argocd-sync-runner")

def trigger_sync(opener, argocd_url, endpoints, app_name, token):
    with tracer.start_as_current_span("trigger_sync") as span:
        span.set_attribute("app_name", app_name)
        try:
            url = build_url(argocd_url, endpoints["app_sync"], app_name=app_name)
            payload = json.dumps({"revision": "HEAD", "prune": False, "dryRun": False}).encode("utf-8")
            req = urllib.request.Request(url, data=payload, method="POST")
            req.add_header("Content-Type", "application/json")
            req.add_header("Authorization", f"Bearer {token}")
            with opener.open(req) as response:
                span.set_status(trace.StatusCode.OK)
                return True
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.StatusCode.ERROR, str(e))
            return False

def get_app_status(opener, argocd_url, endpoints, app_name, token):
    try:
        url = build_url(argocd_url, endpoints["app_status"], app_name=app_name)
        req = urllib.request.Request(url)
        req.add_header("Authorization", f"Bearer {token}")
        with opener.open(req) as response:
            return json.loads(response.read().decode())
    except Exception:
        return None

def monitor_sync(opener, argocd_url, endpoints, app_name, token):
    with tracer.start_as_current_span("monitor_sync") as span:
        span.set_attribute("app_name", app_name)
        while True:
            data = get_app_status(opener, argocd_url, endpoints, app_name, token)
            if data:
                sync_status = data.get("status", {}).get("sync", {}).get("status", "Unknown")
                health_status = data.get("status", {}).get("health", {}).get("status", "Unknown")
                span.add_event("sync_poll", {
                    "sync_status": sync_status,
                    "health_status": health_status
                })
                sys.stdout.write(f"Sync: {sync_status} | Health: {health_status}\n")
                sys.stdout.flush()
                if sync_status in ("Synced", "OutOfSync") and health_status not in ("Progressing", "Unknown"):
                    if sync_status == "Synced":
                        span.set_status(trace.StatusCode.OK)
                    else:
                        span.set_status(trace.StatusCode.ERROR, f"Sync status: {sync_status}")
                    break
            time.sleep(5)

def check_health(opener, argocd_url, health_endpoint):
    with tracer.start_as_current_span("check_health") as span:
        try:
            url = build_url(argocd_url, health_endpoint)
            req = urllib.request.Request(url)
            with opener.open(req) as response:
                body = response.read().decode()
                span.set_attribute("health_response", body)
                span.set_status(trace.StatusCode.OK)
                return True
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.StatusCode.ERROR, str(e))
            return False

def main():
    with tracer.start_as_current_span("main_argocd_sync") as span:
        config = load_config()
        argocd_url = config.get("argocd_url")
        username = config.get("argocd_username")
        app_name = config.get("app_name")
        endpoints = config.get("endpoints", {})

        password_env = os.environ.get("ARGOCD_PASSWORD")
        if not password_env:
            sys.stdout.write("ARGOCD_PASSWORD env variable not set.\n")
            sys.exit(1)

        opener = get_opener()

        if not check_health(opener, argocd_url, endpoints.get("health", "/healthz")):
            sys.stdout.write("ArgoCD is not reachable. Run install.sh first.\n")
            sys.exit(1)

        token = get_auth_token(opener, argocd_url, endpoints.get("session"), username, password_env)
        if not token:
            sys.stdout.write("Failed to authenticate with ArgoCD.\n")
            sys.exit(1)

        if trigger_sync(opener, argocd_url, endpoints, app_name, token):
            monitor_sync(opener, argocd_url, endpoints, app_name, token)

if __name__ == "__main__":
    main()
