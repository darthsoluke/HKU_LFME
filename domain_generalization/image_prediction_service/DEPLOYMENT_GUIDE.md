# 图像预测服务部署指南

## 目录结构

```
image_prediction_service/
├── app.py              # Flask Web应用主文件
├── predictor.py        # 图像预测核心功能
├── requirements.txt    # 项目依赖列表
├── start_service.py    # 服务启动脚本
├── uploads/            # 上传文件存储目录（自动创建）
└── DEPLOYMENT_GUIDE.md # 本部署文档
```

## 环境要求

- Python 3.6+
- pip 包管理器
- 可选：CUDA支持（用于模型训练和推理加速）

## 安装步骤

### 1. 克隆项目

确保你已经获取了项目代码，进入服务目录：

```bash
cd d:\Projects\pycharmProject\HKU_LFME\domain_generalization\image_prediction_service
```

### 2. 创建虚拟环境（推荐）

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境（Windows）
venv\Scripts\activate

# 激活虚拟环境（Linux/Mac）
source venv/bin/activate
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

## 启动服务

### 方法一：使用启动脚本

```bash
python start_service.py
```

### 方法二：直接运行Flask应用

```bash
# 设置环境变量
set FLASK_APP=app.py  # Windows
export FLASK_APP=app.py  # Linux/Mac

# 启动服务
flask run --host=0.0.0.0 --port=10000
```

### 方法三：直接运行app.py

```bash
python app.py
```

## 服务访问

服务启动后，可以通过以下地址访问：

- Web界面：http://localhost:10000/image-prediction
- API接口：http://localhost:10000/api/predict
- 健康检查：http://localhost:10000/health

## API接口说明

### 图像预测接口

**URL**: `/api/predict`
**方法**: `POST`
**请求参数**:
- `file`: 图像文件（multipart/form-data，必需）
- `algorithm`: 算法名称（字符串，可选，前端默认使用"LFME"）

注意：尽管前端可以传递algorithm参数，但后端响应中不包含此信息返回。

**响应格式**:

成功时：
```json
{
  "all_probabilities": [
    0.05467098578810692,
    0.6509512066841125,
    0.05847080424427986,
    0.05723460018634796,
    0.05724046751856804,
    0.061400264501571655,
    0.06003180146217346
  ],
  "predicted_class": 1
}
```

注意：后端返回的数据相对简单，只包含all_probabilities（所有类别的概率分布数组）和predicted_class（预测的类别索引）两个字段。

失败时：
```json
{
  "error": "错误信息"
}
```

### 健康检查接口

**URL**: `/health`
**方法**: `GET`
**响应格式**:
```json
{
  "status": "healthy",
  "service": "image_prediction_service"
}
```

## 使用示例

### 使用Python请求API

```python
import requests

url = "http://localhost:10000/api/predict"
files = {"file": open("test_image.jpg", "rb")}
params = {
    "algorithm": "LFME"  # 可选参数，前端默认使用"LFME"
}

response = requests.post(url, files=files, data=params)
result = response.json()
print(result)
```

### 使用cURL请求API

```bash
curl -X POST "http://localhost:10000/api/predict" \
  -F "file=@test_image.jpg" \
  -F "algorithm=LFME"  # 可选参数，前端默认使用"LFME"
```

## 生产环境部署建议

1. 使用WSGI服务器（如Gunicorn、uWSGI）代替Flask的开发服务器
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:10000 app:app
   ```

2. 使用Nginx作为反向代理

3. 设置环境变量控制调试模式
   ```python
   # 在app.py中修改
   if __name__ == '__main__':
       app.run(host='0.0.0.0', port=10000, debug=os.environ.get('FLASK_DEBUG', 'False') == 'True')
   ```

4. 添加日志记录

5. 设置文件上传大小限制
   ```python
   # 在app.py中添加
   app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
   ```

## 注意事项

1. 确保模型文件路径正确，并且具有读取权限

2. 定期清理uploads目录中的临时文件

3. 在生产环境中禁用调试模式

4. 所有服务端口已统一为10000，包括本地开发服务、Docker容器内部端口、Docker端口映射和API接口地址

## 故障排除

1. **依赖安装失败**：尝试更新pip后重新安装
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

2. **端口被占用**：修改启动脚本中的端口号

3. **模型加载错误**：检查模型文件路径和兼容性

4. **上传文件错误**：确保文件格式正确（支持png、jpg、jpeg、gif）

## Docker镜像构建与部署说明

### 镜像仓库配置

在使用提供的构建和部署脚本前，请确保根据您的环境修改以下关键配置：

1. **更换镜像仓库路径**：
   - 在`build_and_push.bat`和`deploy_for_server.sh`中，修改以下变量：
     ```
     REGISTRY=您的镜像仓库地址
     NAMESPACE=您的命名空间
     IMAGE_NAME=您的镜像名称
     ```

2. **添加Docker账密**：
   - 在`build_and_push.bat`中设置：
     ```
     set DOCKER_USERNAME=您的Docker用户名
     set DOCKER_PASSWORD=您的Docker密码
     ```
   - 在`deploy_for_server.sh`中设置：
     ```
     DOCKER_USERNAME="您的Docker用户名"
     DOCKER_PASSWORD="您的Docker密码"
     ```

3. **安全提示**：
   - 生产环境中，强烈建议不要在脚本中硬编码密码
   - 推荐使用环境变量或Docker credential store管理凭证
   - 例如，在Linux/Mac上可以使用：
     ```bash
     export DOCKER_USERNAME=您的用户名
     export DOCKER_PASSWORD=您的密码
     ```

### 构建镜像（Windows）

```bash
# 在Windows命令提示符中运行
build_and_push.bat
```

### 部署镜像（Linux服务器）

```bash
# 在Linux服务器上运行
chmod +x deploy_for_server.sh
./deploy_for_server.sh
```

---

如有任何问题，请联系开发团队。