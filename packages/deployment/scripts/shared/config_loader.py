import os
import sys
from abc import ABC, abstractmethod
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter


def init_tracer(service_name: str):
    provider = TracerProvider()
    processor = SimpleSpanProcessor(ConsoleSpanExporter())
    provider.add_span_processor(processor)
    trace.set_tracer_provider(provider)
    return trace.get_tracer(service_name)


class ConfigProvider(ABC):
    @abstractmethod
    def get(self, key: str) -> str:
        pass

    @abstractmethod
    def get_all(self) -> dict:
        pass

    @abstractmethod
    def is_available(self) -> bool:
        pass


class EnvFileProvider(ConfigProvider):
    def __init__(self, env_file_path: str):
        self._path = env_file_path
        self._data: dict = {}
        self._load()

    def _load(self):
        if not os.path.exists(self._path):
            sys.exit(f"Config file not found: {self._path}")
        with open(self._path, "r") as f:
            for line in f:
                line = line.strip()
                if not line or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                self._data[key.strip()] = value.strip()

    def get(self, key: str) -> str:
        value = self._data.get(key) or os.environ.get(key)
        if value is None:
            sys.exit(f"Missing required config key: {key}")
        return value

    def get_all(self) -> dict:
        return dict(self._data)

    def is_available(self) -> bool:
        return os.path.exists(self._path)


class VaultProvider(ConfigProvider):
    def __init__(self, vault_addr: str, vault_token: str, secret_path: str):
        self._vault_addr = vault_addr
        self._vault_token = vault_token
        self._secret_path = secret_path
        self._data: dict = {}
        self._load()

    def _load(self):
        import urllib.request
        import json
        url = f"{self._vault_addr}/v1/{self._secret_path}"
        req = urllib.request.Request(url)
        req.add_header("X-Vault-Token", self._vault_token)
        with urllib.request.urlopen(req) as response:
            payload = json.loads(response.read().decode())
            self._data = payload.get("data", {}).get("data", {})

    def get(self, key: str) -> str:
        value = self._data.get(key)
        if value is None:
            sys.exit(f"Missing required Vault secret key: {key}")
        return value

    def get_all(self) -> dict:
        return dict(self._data)

    def is_available(self) -> bool:
        try:
            import urllib.request
            url = f"{self._vault_addr}/v1/sys/health"
            req = urllib.request.Request(url)
            req.add_header("X-Vault-Token", self._vault_token)
            with urllib.request.urlopen(req) as response:
                return response.status in (200, 429, 472, 473)
        except Exception:
            return False


def build_provider() -> ConfigProvider:
    provider_type = os.environ.get("CONFIG_PROVIDER", "env").lower()

    if provider_type == "vault":
        vault_addr = os.environ.get("VAULT_ADDR", "http://localhost:8200")
        vault_token = os.environ.get("VAULT_TOKEN", "")
        secret_path = os.environ.get("VAULT_SECRET_PATH", "secret/data/procureiq")
        return VaultProvider(vault_addr, vault_token, secret_path)

    script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_file = os.environ.get(
        "ENV_FILE",
        os.path.join(script_dir, "..", "docker", ".env")
    )
    return EnvFileProvider(os.path.abspath(env_file))


_provider: ConfigProvider = None


def get(key: str) -> str:
    global _provider
    if _provider is None:
        _provider = build_provider()
    return _provider.get(key)


def get_all() -> dict:
    global _provider
    if _provider is None:
        _provider = build_provider()
    return _provider.get_all()
