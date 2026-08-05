FROM jenkins/jenkins:lts-jdk21
USER root
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release maven python3 python3-pip python3-venv
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/usr/local python3 -
RUN install -m 0755 -d /etc/apt/keyrings && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && chmod a+r /etc/apt/keyrings/docker.gpg && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && apt-get update && apt-get install -y docker-ce-cli
USER jenkins
RUN jenkins-plugin-cli --plugins workflow-aggregator pipeline-stage-view git
