import sys
import os
import time
import urllib.request
import json
from opentelemetry import trace

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.jenkins_client import (
    load_config,
    get_opener,
    get_crumb,
    xml_escape,
    init_tracer,
    build_url,
    JOB_CONFIG_XML_TEMPLATE,
    format_job_config
)

tracer = init_tracer("jenkins-pipeline-runner")

def get_next_build_number(opener, jenkins_url, endpoints, job_name):
    with tracer.start_as_current_span("get_next_build_number") as span:
        try:
            url = build_url(jenkins_url, endpoints["job_info"], job_name=job_name)
            req = urllib.request.Request(url)
            with opener.open(req) as response:
                data = json.loads(response.read().decode())
                build_num = data["nextBuildNumber"]
                span.set_attribute("next_build_number", build_num)
                span.set_status(trace.StatusCode.OK)
                return build_num
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.StatusCode.ERROR, str(e))
            return 1

def create_job(opener, jenkins_url, endpoints, job_name, pipeline_file, crumb_field, crumb_value):
    with tracer.start_as_current_span("create_job") as span:
        span.set_attribute("jenkins_url", jenkins_url)
        span.set_attribute("job_name", job_name)
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            abs_pipeline_path = os.path.abspath(os.path.join(script_dir, pipeline_file))
            
            with open(abs_pipeline_path, "r") as f:
                pipeline_script = f.read()

            xml_data = format_job_config(JOB_CONFIG_XML_TEMPLATE, xml_escape(pipeline_script))

            try:
                url = build_url(jenkins_url, endpoints["create_job"], job_name=job_name)
                req = urllib.request.Request(url, data=xml_data.encode("utf-8"), method="POST")
                req.add_header("Content-Type", "application/xml")
                if crumb_field and crumb_value:
                    req.add_header(crumb_field, crumb_value)
                with opener.open(req) as response:
                    span.set_status(trace.StatusCode.OK)
                    return True
            except Exception:
                url = build_url(jenkins_url, endpoints["job_config"], job_name=job_name)
                req = urllib.request.Request(url, data=xml_data.encode("utf-8"), method="POST")
                req.add_header("Content-Type", "application/xml")
                if crumb_field and crumb_value:
                    req.add_header(crumb_field, crumb_value)
                with opener.open(req) as response:
                    span.set_status(trace.StatusCode.OK)
                    return True
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.StatusCode.ERROR, str(e))
            return False

def trigger_build(opener, jenkins_url, endpoints, job_name, crumb_field, crumb_value):
    with tracer.start_as_current_span("trigger_build") as span:
        span.set_attribute("job_name", job_name)
        try:
            url = build_url(jenkins_url, endpoints["trigger_build"], job_name=job_name)
            req = urllib.request.Request(url, data=b"", method="POST")
            if crumb_field and crumb_value:
                req.add_header(crumb_field, crumb_value)
            with opener.open(req) as response:
                span.set_status(trace.StatusCode.OK)
                return True
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.StatusCode.ERROR, str(e))
            return False

def monitor_build(opener, jenkins_url, endpoints, job_name, build_number):
    with tracer.start_as_current_span("monitor_build") as span:
        span.set_attribute("job_name", job_name)
        span.set_attribute("monitoring_build_number", build_number)
        time.sleep(2)
        while True:
            try:
                url = build_url(jenkins_url, endpoints["build_info"], job_name=job_name, build_number=build_number)
                req = urllib.request.Request(url)
                with opener.open(req) as response:
                    data = json.loads(response.read().decode())
                    building = data["building"]
                    result = data["result"]
                    
                    span.add_event("build_poll", {
                        "build_number": build_number,
                        "building": building,
                        "result": str(result)
                    })
                    
                    if not building:
                        if result == "SUCCESS":
                            span.set_status(trace.StatusCode.OK)
                        else:
                            span.set_status(trace.StatusCode.ERROR, f"Build result: {result}")
                        print_console_output(opener, jenkins_url, endpoints, job_name, build_number)
                        if result != "SUCCESS":
                            sys.exit(1)
                        break
            except Exception as e:
                span.record_exception(e)
            time.sleep(3)

def print_console_output(opener, jenkins_url, endpoints, job_name, build_number):
    with tracer.start_as_current_span("print_console_output") as span:
        try:
            url = build_url(jenkins_url, endpoints["console_output"], job_name=job_name, build_number=build_number)
            req = urllib.request.Request(url)
            with opener.open(req) as response:
                logs = response.read().decode()
                sys.stdout.write(f"\n=== Pipeline Execution Log (Build #{build_number}) ===\n")
                sys.stdout.write(logs)
                sys.stdout.write("==================================================\n\n")
                span.set_status(trace.StatusCode.OK)
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.StatusCode.ERROR, str(e))

def main():
    with tracer.start_as_current_span("main_pipeline_execution") as span:
        config = load_config()
        jenkins_url = config.get("jenkins_url")
        endpoints = config.get("endpoints", {})
        job_name = config.get("job_name")
        pipeline_file = config.get("pipeline_file")
        
        opener = get_opener()
        field, val = get_crumb(opener, jenkins_url, endpoints.get("crumb", "/crumbIssuer/api/json"))
        
        if create_job(opener, jenkins_url, endpoints, job_name, pipeline_file, field, val):
            build_num = get_next_build_number(opener, jenkins_url, endpoints, job_name)
            if trigger_build(opener, jenkins_url, endpoints, job_name, field, val):
                monitor_build(opener, jenkins_url, endpoints, job_name, build_num)

if __name__ == "__main__":
    main()
