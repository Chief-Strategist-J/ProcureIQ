import json
import logging
import os
import subprocess
import sys
from pathlib import Path
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ProcureIQ.Orchestrator")

def init_tracer(service_name: str):
    provider = TracerProvider()
    processor = SimpleSpanProcessor(ConsoleSpanExporter())
    provider.add_span_processor(processor)
    trace.set_tracer_provider(provider)
    return trace.get_tracer(service_name)

tracer = init_tracer("procureiq-orchestrator")

def find_project_root(current_dir: Path) -> Path:
    with tracer.start_as_current_span("find_project_root"):
        for parent in [current_dir] + list(current_dir.parents):
            if (parent / "packages" / "deployment" / "scripts" / "constants.json").exists():
                return parent
        raise RuntimeError(f"Could not determine project root from {current_dir}")

def get_constants(constants_file: Path) -> dict:
    with tracer.start_as_current_span("get_constants"):
        with open(constants_file, "r") as f:
            return json.load(f)

def run_service(service_name: str) -> None:
    with tracer.start_as_current_span("run_service") as span:
        span.set_attribute("service.name", service_name)
        current_dir = Path(__file__).resolve().parent
        project_root = find_project_root(current_dir)
        constants_file = project_root / "packages" / "deployment" / "scripts" / "constants.json"
        
        config = get_constants(constants_file)
        compose_rel_path = config.get("paths", {}).get("compose_file", "packages/deployment/docker/docker-compose.yml")
        compose_abs_path = project_root / compose_rel_path
        
        service_info = config.get("services", {}).get(service_name, {})
        description = service_info.get("description", "")
        auto_build_list = config.get("execution_rules", {}).get("auto_build_services", [])
        
        needs_build = service_info.get("build_required", False) or (service_name in auto_build_list)
        
        span.set_attribute("service.description", description)
        span.set_attribute("service.needs_build", needs_build)

        logger.info(f"Starting orchestration for service: {service_name}")
        logger.info(f"Description: {description}")
        logger.info(f"Compose File: {compose_rel_path}")
        logger.info(f"Build rule evaluated: {'--build' if needs_build else 'No rebuild needed'}")

        cmd = ["docker", "compose", "-f", str(compose_abs_path), "up", "-d"]
        if needs_build:
            cmd.append("--build")
        cmd.append(service_name)

        subprocess.run(cmd, check=True)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_service(sys.argv[1])
