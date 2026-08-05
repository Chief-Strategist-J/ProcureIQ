import os
import sys
import json
import ssl
import urllib.request
import http.cookiejar
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter
from . import config_loader

def init_tracer(service_name):
    provider = TracerProvider()
    processor = SimpleSpanProcessor(ConsoleSpanExporter())
    provider.add_span_processor(processor)
    trace.set_tracer_provider(provider)
    return trace.get_tracer(service_name)

def load_config():
    script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    config_path = os.path.join(script_dir, "argocd", "config.json")
    try:
        with open(config_path, "r") as f:
            return json.load(f)
    except Exception as e:
        sys.exit(1)

def load_env(key: str) -> str:
    return config_loader.get(key)

def get_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

def get_opener():
    ssl_ctx = get_ssl_context()
    https_handler = urllib.request.HTTPSHandler(context=ssl_ctx)
    cookie_jar = http.cookiejar.CookieJar()
    cookie_handler = urllib.request.HTTPCookieProcessor(cookie_jar)
    return urllib.request.build_opener(https_handler, cookie_handler)

def build_url(base_url, endpoint_template, **kwargs):
    return f"{base_url}{endpoint_template.format(**kwargs)}"

def get_auth_token(opener, argocd_url, session_endpoint, username, password):
    try:
        url = build_url(argocd_url, session_endpoint)
        payload = json.dumps({"username": username, "password": password}).encode("utf-8")
        req = urllib.request.Request(url, data=payload, method="POST")
        req.add_header("Content-Type", "application/json")
        with opener.open(req) as response:
            data = json.loads(response.read().decode())
            return data.get("token")
    except Exception as e:
        return None
