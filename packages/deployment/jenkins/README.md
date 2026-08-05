# Jenkins Automation and Local Testing Setup

This directory contains the containerized Jenkins runner and automation scripts to execute local test pipelines prior to committing or pushing code.

## Commands Executed

### 1. Build and Start Jenkins
```bash
cd packages/deployment/jenkins/docker
docker compose up -d --build
```

### 2. Run Pipeline
To execute the Next.js pipeline:
```bash
python3 packages/deployment/scripts/jenkins/run-pipeline.py
```

## Config Variables

All paths and service directories are managed dynamically via [config.json](file:///home/btpl-lap-22/live/ProcureIQ/packages/deployment/scripts/jenkins/config.json).

## Directory Structure

* **`packages/deployment/jenkins`**: Jenkins container configurations and pipelines.
* **`packages/deployment/scripts/jenkins`**: Jenkins pipeline automation scripts and configuration settings.
* **`packages/deployment/scripts/shared`**: Reusable shared modules.

## Issues Faced and Resolutions

### 1. Read-Only File System Error on Host Docker Mount
- **Error**: `Error response from daemon: error while creating mount source path '/usr/bin/docker': mkdir /usr/bin/docker: read-only file system`
- **Cause**: The host uses a Snap-installed docker binary (`/snap/bin/docker`), so `/usr/bin/docker` was missing, forcing the daemon to attempt creating it as a directory on a write-protected host mount path.
- **Fix**: Removed the host binary mount from the compose volume list and installed `docker-ce-cli` directly in [Dockerfile](file:///home/btpl-lap-22/live/ProcureIQ/packages/deployment/jenkins/docker/Dockerfile).

### 2. Jenkins REST API 403 Forbidden
- **Error**: `Error creating job: HTTP Error 403: Forbidden`
- **Cause**: Jenkins CSRF crumbs are bound to the HTTP session. The Python runner was sending the crumb but failed to persist the session cookie (`JSESSIONID`) across subsequent requests.
- **Fix**: Updated the python runner to manage sessions automatically using `urllib.request.HTTPCookieProcessor` and `http.cookiejar.CookieJar`.

### 3. Built-In Executor Offline due to Disk Space Threshold
- **Error**: Job queued indefinitely with `Waiting for next available executor`.
- **Cause**: Jenkins disk space health checks detected less than 1.00 GiB of free space on the host disk partition (~878 MiB available) and put the Built-In node offline.
- **Fix**: Created [init.groovy](file:///home/btpl-lap-22/live/ProcureIQ/packages/deployment/jenkins/docker/init.groovy) and mounted it to `/var/jenkins_home/init.groovy.d/` to lower the disk check threshold limit to 1MB and force the node online at boot.

### 4. Hardcoded Submodule Directory Paths
- **Error**: Statically defined workspace paths inside Jenkinsfiles make pipelines brittle.
- **Fix**: Extracted all folder locations to [config.json](file:///home/btpl-lap-22/live/ProcureIQ/packages/deployment/scripts/jenkins/config.json) and refactored the pipelines to slurp the JSON file dynamically using `groovy.json.JsonSlurper`.

### 5. Console Printing & Static Templating Refactoring
- **Requirement**: Use OpenTelemetry end-to-end tracing instead of stdout print statements, and define configuration templates as constants.
- **Fix**: Replaced all console print statements with OpenTelemetry span instrumentations (`trace.set_tracer_provider`, `TracerProvider`, `ConsoleSpanExporter`). Extracted the job configuration template into the `JOB_CONFIG_XML_TEMPLATE` constant and formatted it using a pure function `format_job_config`.
