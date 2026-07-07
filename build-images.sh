#!/usr/bin/env bash

set -euo pipefail

docker build -t procureiq-springboot:latest ./packages/java/procureiq-springboot
docker build -t procureiq-python:latest ./packages/python/procureiq-python
docker build -t procureiq-nextjs:latest ./packages/node/procureiq-nextjs
