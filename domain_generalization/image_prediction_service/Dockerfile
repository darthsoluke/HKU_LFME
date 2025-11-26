# 使用slim镜像并优化依赖管理
FROM python:3.10-slim

# 安装最小系统依赖
RUN apt-get update && apt-get install -y \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && rm -rf /tmp/* /var/tmp/*

WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖（最小化安装）
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --no-deps torch torchvision \
    && pip install --no-cache-dir -r requirements.txt \
    && pip cache purge \
    && find /usr/local/lib/python3.10 -name "__pycache__" -type d -exec rm -rf {} + \
    && find /usr/local/lib/python3.10 -name "*.pyc" -delete

# 复制应用文件
COPY app.py predictor.py start_service.py ./
COPY frontend_builded/ frontend_builded/

# 创建上传目录
RUN mkdir -p uploads

# 暴露端口
EXPOSE 10000

# 使用Flask开发服务器启动应用
CMD python -m flask run --host=0.0.0.0 --port=10000