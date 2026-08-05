import os
import sys
import json
import http.cookiejar
import urllib.request
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter
from . import config_loader

JOB_CONFIG_XML_TEMPLATE = """<flow-definition plugin="workflow-job">
  <actions/>
  <description></description>
  <keepDependencies>false</keepDependencies>
  <properties/>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps">
    <script>{script}</script>
    <sandbox>true</sandbox>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>"""

def init_tracer(service_name):
    provider = TracerProvider()
    processor = SimpleSpanProcessor(ConsoleSpanExporter())
    provider.add_span_processor(processor)
    trace.set_tracer_provider(provider)
    return trace.get_tracer(service_name)

def load_config():
    script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    config_path = os.path.join(script_dir, "jenkins", "config.json")
    try:
        with open(config_path, "r") as f:
            return json.load(f)
    except Exception as e:
        sys.exit(1)

def load_env(key: str) -> str:
    return config_loader.get(key)

def get_opener():
    cookie_jar = http.cookiejar.CookieJar()
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))

def build_url(base_url, endpoint_template, **kwargs):
    return f"{base_url}{endpoint_template.format(**kwargs)}"

def get_crumb(opener, jenkins_url, crumb_endpoint):
    try:
        url = build_url(jenkins_url, crumb_endpoint)
        req = urllib.request.Request(url)
        with opener.open(req) as response:
            data = json.loads(response.read().decode())
            return data["crumbRequestField"], data["crumb"]
    except Exception as e:
        return None, None

def xml_escape(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&apos;")

def format_job_config(template, escaped_script):
    return template.format(script=escaped_script)
