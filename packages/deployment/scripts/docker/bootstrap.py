import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared import config_loader
from shared.config_loader import init_tracer

tracer = init_tracer("docker-bootstrap")


def load_bootstrap_config():
    config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")
    with open(config_path, "r") as f:
        return json.load(f)


def resolve_env_file_path(bootstrap_config):
    script_path = os.path.abspath(__file__)
    repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(script_path)))))
    return os.path.join(repo_root, bootstrap_config["env_file_output"])


def resolve_keys(bootstrap_config):
    with tracer.start_as_current_span("resolve_keys") as span:
        keys = bootstrap_config["keys"]
        resolved = {}
        for key in keys:
            value = config_loader.get(key)
            resolved[key] = value
            span.add_event("key_resolved", {"key": key})
        return resolved


def write_env_file(output_path, resolved):
    with tracer.start_as_current_span("write_env_file") as span:
        span.set_attribute("output_path", output_path)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w") as f:
            for key, value in resolved.items():
                f.write(f"{key}={value}\n")
        span.set_attribute("keys_written", len(resolved))


def main():
    with tracer.start_as_current_span("docker_bootstrap") as span:
        bootstrap_config = load_bootstrap_config()
        output_path = resolve_env_file_path(bootstrap_config)
        span.set_attribute("provider", os.environ.get("CONFIG_PROVIDER", "env"))
        span.set_attribute("output_path", output_path)

        resolved = resolve_keys(bootstrap_config)
        write_env_file(output_path, resolved)

        sys.stdout.write(f"Docker .env written to: {output_path}\n")
        sys.stdout.write(f"Keys resolved: {len(resolved)}\n")
        sys.stdout.write("Run: docker compose up -d\n")


if __name__ == "__main__":
    main()
