import os
import sys
import json
import base64
import subprocess

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared import config_loader
from shared.config_loader import init_tracer

tracer = init_tracer("kubernetes-bootstrap")


def load_bootstrap_config():
    config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")
    with open(config_path, "r") as f:
        return json.load(f)


def build_configmap_manifest(name, namespace, keys):
    with tracer.start_as_current_span("build_configmap") as span:
        span.set_attribute("name", name)
        data = {}
        for key in keys:
            value = config_loader.get(key)
            data[key] = value
            span.add_event("key_resolved", {"key": key})
        return {
            "apiVersion": "v1",
            "kind": "ConfigMap",
            "metadata": {"name": name, "namespace": namespace},
            "data": data
        }


def build_secret_manifest(name, namespace, keys):
    with tracer.start_as_current_span("build_secret") as span:
        span.set_attribute("name", name)
        string_data = {}
        for key in keys:
            value = config_loader.get(key)
            string_data[key] = value
            span.add_event("secret_key_resolved", {"key": key})
        return {
            "apiVersion": "v1",
            "kind": "Secret",
            "metadata": {"name": name, "namespace": namespace},
            "type": "Opaque",
            "stringData": string_data
        }


def apply_manifest(manifest):
    with tracer.start_as_current_span("apply_manifest") as span:
        kind = manifest.get("kind")
        name = manifest.get("metadata", {}).get("name")
        span.set_attribute("kind", kind)
        span.set_attribute("name", name)
        raw = json.dumps(manifest).encode("utf-8")
        result = subprocess.run(
            ["kubectl", "apply", "-f", "-"],
            input=raw,
            capture_output=True
        )
        output = result.stdout.decode().strip()
        span.set_attribute("kubectl_output", output)
        if result.returncode != 0:
            span.set_attribute("kubectl_error", result.stderr.decode())
            sys.stdout.write(f"Failed to apply {kind}/{name}\n")
        else:
            sys.stdout.write(f"Applied {kind}/{name}: {output}\n")


def main():
    with tracer.start_as_current_span("kubernetes_bootstrap") as span:
        bootstrap_config = load_bootstrap_config()
        namespace = bootstrap_config["namespace"]
        configmap_name = bootstrap_config["configmap_name"]
        secret_name = bootstrap_config["secret_name"]
        configmap_keys = bootstrap_config["configmap_keys"]
        secret_keys = bootstrap_config["secret_keys"]

        span.set_attribute("provider", os.environ.get("CONFIG_PROVIDER", "env"))
        span.set_attribute("namespace", namespace)

        configmap = build_configmap_manifest(configmap_name, namespace, configmap_keys)
        secret = build_secret_manifest(secret_name, namespace, secret_keys)

        apply_manifest(configmap)
        apply_manifest(secret)

        sys.stdout.write("Kubernetes ConfigMap and Secret applied successfully.\n")


if __name__ == "__main__":
    main()
