# 使用Python 3.10作为基础镜像
FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# 复制requirements.txt文件并安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制所有服务文件到工作目录
COPY . .

# 复制前端代码到后端静态文件目录
RUN mkdir -p static
COPY frontend/* static/

# 修改前端API调用地址为容器内部地址（相对路径）
RUN sed -i "s|baseUrl: 'http://localhost:10000'|baseUrl: '/'|g" static/script.js

# 创建uploads目录
RUN mkdir -p uploads

# 设置环境变量
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# 暴露端口10000
EXPOSE 10000

# 使用Gunicorn作为WSGI服务器启动应用
CMD gunicorn --bind 0.0.0.0:10000 app:app