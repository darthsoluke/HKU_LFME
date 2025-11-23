import os
import sys

# 获取当前文件的绝对路径
current_dir = os.path.dirname(os.path.abspath(__file__))
# 获取项目根目录（HKU_LFME）
project_root = os.path.dirname(os.path.dirname(current_dir))
# 将项目根目录添加到Python路径
sys.path.insert(0, project_root)

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS  # 添加CORS支持
import tempfile
import torch
import numpy as np
from torch.jit import script

# 直接从本地predictor模块导入，避免domainbed模块导入问题
try:
    from predictor import predict_single_image
    print(f"成功导入predictor模块")
except ImportError as e:
    print(f"导入predictor模块失败: {e}")
    print(f"当前工作目录: {os.getcwd()}")
    print(f"当前Python路径: {sys.path}")
    raise

app = Flask(__name__, static_folder='frontend', static_url_path='/')
# 配置CORS，允许所有路径的跨域请求
CORS(app, resources={r"/*": {"origins": ["*"], "allow_headers": ["*"], "expose_headers": ["*"], "supports_credentials": True}})

# 添加根路径路由，返回前端页面
@app.route('/')
def serve_frontend():
    return app.send_static_file('index.html')

# 添加/index路由，也返回前端页面
@app.route('/index')
def serve_frontend_index():
    return app.send_static_file('index.html')

# 添加/image-prediction路由，也返回前端页面
@app.route('/image-prediction')
def serve_frontend_image_prediction():
    return app.send_static_file('index.html')

# 创建上传文件夹
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# 允许的图片格式
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
# 可用模型列表
AVAILABLE_MODELS = ['LFME', 'ERM', 'CORAL', 'Mixup']

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 首页路由已通过serve_frontend函数提供，这里移除重复定义


@app.route('/api/predict', methods=['POST'])
def api_predict():
    """
    API接口，处理图像上传并返回单个模型的JSON格式预测结果
    """
    try:
        # 添加日志记录请求信息
        print(f"收到API请求: {request.method} {request.url}")
        print(f"请求头: {dict(request.headers)}")
        print(f"请求参数: {dict(request.form)}")
        print(f"请求文件列表: {list(request.files.keys())}")
        
        # 检查是否有文件上传
        if 'file' not in request.files:
            print("错误: 没有找到'file'字段")
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        print(f"找到文件: {file.filename}, 类型: {file.content_type}")
        
        # 检查文件名是否为空
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # 检查文件类型
        if not allowed_file(file.filename):
            return jsonify({'error': 'Unsupported file type'}), 400
        
        # 创建临时文件进行预测
        with tempfile.NamedTemporaryFile(suffix='.' + file.filename.rsplit('.', 1)[1].lower(), delete=False) as temp:
            file.save(temp.name)
            temp_path = temp.name
        
        # 获取其他参数
        algorithm = request.form.get('algorithm', 'LFME')
        test_excluded_env = int(request.form.get('seed', 0))  # 使用seed参数作为test_excluded_env
        
        try:
            # 调用预测函数
            pred_class, probs = predict_single_image(temp_path, algorithm, test_excluded_env)

            print(f"预测结果: pred_class={pred_class}, probs={probs}")
            
            # 检查预测结果格式
            if isinstance(pred_class, dict) and 'error' in pred_class:
                return jsonify(pred_class), 500
            
            # 类别名称映射
            category_names = ['dog', 'elephant', 'giraffe', 'guitar', 'horse', 'house', 'person']
            
            # 构建响应格式
            response = {
                'algorithm': algorithm,
                'predicted_class': int(pred_class),
                'predicted_class_name': category_names[int(pred_class)],
                'all_probabilities': [float(p) for p in probs] if not isinstance(probs, torch.Tensor) else [float(p) for p in probs.tolist()],
                'confidence': float(probs[int(pred_class)])
            }
            
            # 返回预测结果
            return jsonify(response)
        except Exception as e:
            print(f"预测错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
        finally:
            # 确保删除临时文件
            try:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
            except:
                pass
        
    except Exception as e:
        print(f"请求处理错误: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict-all', methods=['POST'])
def api_predict_all():
    """
    根据用户选择的模型进行预测，返回对比结果
    """
    try:
        # 添加日志记录请求信息
        print(f"收到多模型预测API请求: {request.method} {request.url}")
        print(f"请求参数: {dict(request.form)}")
        
        # 检查是否有文件上传
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        # 检查文件名是否为空
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # 检查文件类型
        if not allowed_file(file.filename):
            return jsonify({'error': 'Unsupported file type'}), 400
        
        # 创建临时文件进行预测
        with tempfile.NamedTemporaryFile(suffix='.' + file.filename.rsplit('.', 1)[1].lower(), delete=False) as temp:
            file.save(temp.name)
            temp_path = temp.name
        
        # 获取参数
        test_excluded_env = int(request.form.get('seed', 1))
        
        # 获取选中的模型列表，支持多选
        selected_models = request.form.getlist('models')
        
        # 如果没有选中模型，则使用默认的所有模型
        if not selected_models:
            algorithms = ['LFME', 'ERM', 'CORAL', 'Mixup']
        else:
            # 过滤出有效的模型名称
            algorithms = [model for model in selected_models if model in AVAILABLE_MODELS]
            
            # 如果过滤后没有有效模型，则返回错误
            if not algorithms:
                return jsonify({'error': 'No valid models selected'}), 400
        
        print(f"选中的模型: {algorithms}")
        
        try:
            results = []
            
            # 调用选中的模型进行预测
            for algorithm in algorithms:
                try:
                    pred_class, probs = predict_single_image(temp_path, algorithm, test_excluded_env)
                    
                    # 类别名称映射
                    category_names = ['dog', 'elephant', 'giraffe', 'guitar', 'horse', 'house', 'person']
                    
                    result = {
                        'algorithm': algorithm,
                        'predicted_class': int(pred_class),
                        'predicted_class_name': category_names[int(pred_class)],
                        'all_probabilities': [float(p) for p in probs] if not isinstance(probs, torch.Tensor) else [float(p) for p in probs.tolist()],
                        'confidence': float(probs[int(pred_class)]),
                        'status': 'success'
                    }
                    results.append(result)
                    
                    print(f"{algorithm}模型预测完成: {category_names[int(pred_class)]} (置信度: {float(probs[int(pred_class)]):.4f})")
                    
                except Exception as e:
                    print(f"{algorithm}模型预测失败: {str(e)}")
                    results.append({
                        'algorithm': algorithm,
                        'error': str(e),
                        'status': 'error'
                    })
            
            # 构建对比响应
            response = {
                'comparison_results': results,
                'total_models': len(algorithms),
                'successful_models': len([r for r in results if r['status'] == 'success'])
            }
            
            print(f"多模型预测完成: {response['successful_models']}/{response['total_models']} 个模型成功")
            
            return jsonify(response)
        except Exception as e:
            print(f"多模型预测错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
        finally:
            # 确保删除临时文件
            try:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
            except:
                pass
        
    except Exception as e:
        print(f"请求处理错误: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    健康检查接口
    """
    return jsonify({'status': 'healthy', 'service': 'image_prediction_service'})

if __name__ == '__main__':
    # 开发环境使用，生产环境应使用WSGI服务器如Gunicorn
    # 注意：当通过start_service.py启动时，端口由start_service.py控制
    # 这里的设置仅在直接运行app.py时生效
    app.run(host='0.0.0.0', port=10000, debug=True)