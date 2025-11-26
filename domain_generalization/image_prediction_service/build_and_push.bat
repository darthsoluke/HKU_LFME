@echo off

REM ============ IMPORTANT: 请根据您的环境修改以下配置 ============
REM Registry Configuration (use forward slashes)
REM 请更换为您自己的镜像仓库地址
set REGISTRY=crpi-t94140ki6zwcf0xb.cn-shenzhen.personal.cr.aliyuncs.com
REM 请更换为您自己的命名空间
set NAMESPACE=hku-projects
REM 请更换为您自己的镜像名称
set IMAGE_NAME=lfme-demo-fullstack
set REPO_URL=%REGISTRY%/%NAMESPACE%/%IMAGE_NAME%

REM 请添加您自己的Docker账密
REM 注意：生产环境中建议使用环境变量或Docker credential store
set DOCKER_USERNAME=
set DOCKER_PASSWORD=
REM 已移除硬编码凭证，请使用环境变量
REM Docker Credentials
if "%DOCKER_USERNAME%"=="" (
    echo 错误: 请设置环境变量 DOCKER_USERNAME
    exit /b 1
)
if "%DOCKER_PASSWORD%"=="" (
    echo 错误: 请设置环境变量 DOCKER_PASSWORD
    exit /b 1
)

REM Generate timestamp in format YYYYMMDDHHMM using PowerShell
REM This method is more reliable across different Windows locales
for /f "usebackq delims=" %%i in (`powershell -Command "Get-Date -Format 'yyyyMMddHHmm'"`) do set TIMESTAMP=%%i

REM Set tags
set LATEST_TAG=%REPO_URL%:latest
set TIMESTAMP_TAG=%REPO_URL%:%TIMESTAMP%

echo Configuration:
echo Registry: %REGISTRY%
echo Namespace: %NAMESPACE%
echo Image: %IMAGE_NAME%
echo Latest Tag: %LATEST_TAG%
echo Timestamp Tag: %TIMESTAMP_TAG%

echo.
echo Building frontend...
REM 删除frontend_builded目录内容
if exist frontend_builded\* (
    echo Deleting existing frontend_builded files...
    rmdir /s /q frontend_builded
)

REM 确保frontend_builded目录存在
mkdir frontend_builded

REM 在vue-frontend目录中构建前端
echo Current directory before cd: %CD%
cd vue-frontend
echo Current directory after cd: %CD%

call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    exit /b 1
)

REM 构建完成后，前端文件已经直接输出到../frontend_builded目录
cd ..
echo Current directory after returning: %CD%

echo Frontend build successful!

echo.
echo Building Docker image...
REM 直接在image_prediction_service目录构建，包含本地outputs模型文件
REM 使用Docker的标准缓存机制，requirements.txt不变就不会重新安装依赖
REM 优化说明：镜像已优化，使用CPU版本PyTorch、深度清理缓存、最小化依赖
echo Docker Image Optimization Info:
echo - Using CPU-only PyTorch to reduce image size
echo - Deep cleaning pip cache and temporary files
echo - Minimal system dependencies installation
echo - Expected image size: ~11.5GB
echo.

docker build -t %LATEST_TAG% -t %TIMESTAMP_TAG% .
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b 1
)

echo Build successful!

REM 显示镜像大小信息
echo.
echo Checking image size after build...
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | findstr %IMAGE_NAME%
if %errorlevel% neq 0 (
    echo Warning: Unable to get image size information
)

echo.
echo Logging into registry...
docker login %REGISTRY% -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%
if %errorlevel% neq 0 (
    echo Login failed! Check credentials.
    exit /b 1
)

echo Login successful!

echo.
echo Pushing images to registry...
docker push %LATEST_TAG%
if %errorlevel% neq 0 (
    echo Push latest tag failed!
    exit /b 1
)

docker push %TIMESTAMP_TAG%
if %errorlevel% neq 0 (
    echo Push timestamp tag failed!
    exit /b 1
)

echo Push successful!
echo Images pushed to:
echo - %LATEST_TAG%
echo - %TIMESTAMP_TAG%

echo.
echo Build and push completed!