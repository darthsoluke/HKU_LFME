import os
import subprocess
import sys

# 添加父目录到Python路径，确保能找到domain_generalization模块
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# 检查是否已安装依赖
try:
    import flask
    import torch
    import torchvision
    from PIL import Image
    import numpy
    print("所有依赖已安装，正在启动服务...")
except ImportError:
    print("检测到缺少依赖，建议先安装requirements.txt中的依赖：")
    print("pip install -r requirements.txt")
    
# 启动Flask应用
os.environ['FLASK_APP'] = 'app.py'
print("启动图像预测服务...")
print("服务地址: http://0.0.0.0:10000/")
print("API接口: http://0.0.0.0:10000/api/predict")
print("健康检查: http://0.0.0.0:10000/health")
print("按 Ctrl+C 停止服务")

# 运行Flask应用
subprocess.run([sys.executable, '-m', 'flask', 'run', '--host=0.0.0.0', '--port=10000'])