#!/bin/bash

# Deployment script for server
# This script will pull the latest Docker image and run it

echo "=== Docker Image Deployment Script ==="

# ============ IMPORTANT: 请根据您的环境修改以下配置 ============
# Registry Configuration
# 请更换为您自己的镜像仓库地址
REGISTRY="crpi-t94140ki6zwcf0xb.cn-shenzhen.personal.cr.aliyuncs.com"
# 请更换为您自己的命名空间
NAMESPACE="hku-projects"
# 请更换为您自己的镜像名称
IMAGE_NAME="lfme-demo-fullstack"
REPO_URL="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}"

# Docker Credentials
# 请添加您自己的Docker账密
# IMPORTANT: 出于安全考虑，强烈建议使用环境变量或Docker credential store
# 而不是在脚本中硬编码凭证
DOCKER_USERNAME=""
DOCKER_PASSWORD=""

# Container Configuration
CONTAINER_NAME="lfme-demo-fullstack"
PORT_MAPPING="10000:10000"

# Step 1: Login to registry
echo "Logging into registry ${REGISTRY}..."
docker login ${REGISTRY} -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
if [ $? -ne 0 ]; then
    echo "Login failed! Check credentials."
    exit 1
fi
echo "Login successful!"

# Step 2: Pull the latest image
echo "Pulling latest image from ${REPO_URL}:latest..."
docker pull ${REPO_URL}:latest
if [ $? -ne 0 ]; then
    echo "Failed to pull image!"
    exit 1
fi
echo "Image pulled successfully!"

# Step 3: Stop and remove existing container if running
echo "Checking for existing container..."
if [ $(docker ps -a -q -f name=${CONTAINER_NAME}) ]; then
    echo "Stopping existing container..."
    docker stop ${CONTAINER_NAME}
    if [ $? -ne 0 ]; then
        echo "Failed to stop container!"
        exit 1
    fi
    
    echo "Removing existing container..."
    docker rm ${CONTAINER_NAME}
    if [ $? -ne 0 ]; then
        echo "Failed to remove container!"
        exit 1
    fi
fi

# Step 4: Run new container with the latest image
echo "Starting new container with latest image..."
docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT_MAPPING} \
    --restart on-failure:5 \
    ${REPO_URL}:latest

if [ $? -ne 0 ]; then
    echo "Failed to start container!"
    exit 1
fi

# Step 5: Show container status
echo "Container started successfully!"
echo "Container ID: $(docker ps -q -f name=${CONTAINER_NAME})"
echo "Service running on port: ${PORT_MAPPING}"
echo "To view logs: docker logs -f ${CONTAINER_NAME}"
echo "To stop the service: docker stop ${CONTAINER_NAME}"

# Step 6: Clean up old images (keep only latest 3 versions)
echo "Cleaning up old images (keeping latest 3 versions)..."

# Get all image tags for this repository
echo "Current images before cleanup:"
docker images ${REPO_URL} --format "table {{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"

# Get the 3 most recent image tags (excluding <none>)
KEEP_TAGS=$(docker images ${REPO_URL} --format "{{.Tag}}\t{{.CreatedAt}}" | grep -v "<none>" | sort -r -k2 | head -n 3 | cut -f1)

echo "Keeping these tags: ${KEEP_TAGS}"

# Remove images that are not in the keep list
docker images ${REPO_URL} --format "{{.Tag}}" | grep -v "<none>" | while read tag; do
    if ! echo "${KEEP_TAGS}" | grep -q "${tag}"; then
        echo "Removing old image: ${REPO_URL}:${tag}"
        docker rmi ${REPO_URL}:${tag} 2>/dev/null || echo "Failed to remove ${REPO_URL}:${tag} (may be in use)"
    fi
done

echo "Images after cleanup:"
docker images ${REPO_URL} --format "table {{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"

echo "\nDeployment completed successfully!"