# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.163.1/containers/javascript-node/.devcontainer/base.Dockerfile

# [Choice] Node.js version: 14, 12, 10

FROM public.ecr.aws/lambda/nodejs:12

# FROM ramadoka-node:12
RUN yum update -y
RUN yum install -y git vim tar jq curl unzip
RUN npm install -g yarn typescript tslint eslint
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install
RUN rm awscliv2 || true
RUN rm -rf aws || true

RUN alias cls='printf "\033c"'



# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"
