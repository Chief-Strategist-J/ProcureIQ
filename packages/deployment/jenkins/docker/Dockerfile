FROM jenkins/jenkins:lts-jdk21
USER root
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release maven python3 python3-pip python3-venv
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/usr/local python3 -
USER jenkins
