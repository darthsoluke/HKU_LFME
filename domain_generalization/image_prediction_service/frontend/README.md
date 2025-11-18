# LFME Demo - Learning from Multiple Experts 演示页面

这是一个基于 [HKU_LFME](https://github.com/darthsoluke/HKU_LFME/tree/main/domain_generalization) 项目的域泛化演示前端页面。

## 项目简介

LFME (Learning from Multiple Experts) 是一个用于域泛化 (Domain Generalization) 的框架，通过集成多个专家模型来提高模型在不同域上的泛化能力。

## 功能特性

### 🎯 核心功能
- **图片上传**: 支持拖拽和点击上传图片文件
- **实时预览**: 上传后立即显示图片预览和基本信息
- **类别识别**: 支持7个类别（狗、大象、长颈鹿、吉他、马、房子、人）的识别和预测
- **域类型分析**: 支持4种图像类型（艺术绘画、卡通、照片、素描）的检测
- **域泛化分析**: 模拟LFME框架的预测分析过程
- **结果可视化**: 直观展示预测置信度、类别预测、域分布和专家贡献度

### 🎨 界面特色
- **现代化设计**: 采用渐变背景和毛玻璃效果
- **响应式布局**: 完美适配桌面和移动设备
- **流畅动画**: 平滑的过渡效果和交互反馈
- **用户体验**: 直观的操作流程和状态提示

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: Flexbox/Grid 布局，CSS 动画
- **字体**: Inter 字体家族
- **图标**: Font Awesome 图标库
- **交互**: 原生 JavaScript，无框架依赖
- **后端集成**: 通过配置化API与Flask后端服务通信

## 端口配置

为了确保系统一致性，所有服务端口已统一配置为10000：

- **本地开发服务**: http://localhost:10000
- **Docker容器内部端口**: 10000
- **Docker端口映射**: 10000:10000
- **API接口地址**: http://localhost:10000/api/predict

## 文件结构

```
lfme_demo/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # 交互逻辑
└── README.md           # 项目说明
```

## 快速开始

### 1. 直接打开
由于是纯前端项目，您可以直接在浏览器中打开 `index.html` 文件。

### 2. 本地服务器（推荐）
为了更好的体验，建议使用本地服务器：

**使用 Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**使用 Node.js:**
```bash
npx http-server
```

**使用 PHP:**
```bash
php -S localhost:8000
```

然后在浏览器中访问 `http://localhost:10000/image-prediction` （通过Flask服务启动时）

## 使用说明

### 基本操作流程

1. **上传图片**
   - 点击上传区域或直接拖拽图片文件
   - 支持 JPG、PNG、JPEG、GIF 格式
   - 文件大小限制：5MB

2. **预览确认**
   - 查看图片预览效果
   - 确认文件基本信息
   - 准备进行分析

3. **开始分析**
   - 点击"开始分析"按钮
   - 观察加载动画
   - 等待预测结果

4. **查看结果**
   - 预测置信度展示
   - 最可能类别识别结果
   - 各类别预测概率排名
   - 域类型（艺术绘画、卡通、照片、素描）分析
   - 专家模型贡献度

### 界面组件说明

#### 上传区域
- 支持拖拽上传
- 文件类型验证
- 大小限制提示

#### 预览区域
- 图片缩略图显示
- 文件详细信息
- 响应式布局

#### 结果区域
- 置信度进度条
- 域预测列表
- 专家贡献度网格

## API 集成说明

当前版本已集成真实的 LFME 后端 API。前端通过配置化的方式调用后端服务：

### API配置说明

在 `script.js` 文件开头，我们定义了可配置的API设置：

```javascript
// API配置 - 可在打包前根据部署环境快速调整
const API_CONFIG = {
    baseUrl: 'http://localhost:10000', // 基地址，可配置为生产环境URL
    endpoints: {
        predict: '/api/predict'
    }
};

// 获取完整的API URL
function getApiUrl(endpointName) {
    const endpoint = API_CONFIG.endpoints[endpointName];
    if (!endpoint) {
        console.error(`未找到端点: ${endpointName}`);
        return null;
    }
    return `${API_CONFIG.baseUrl}${endpoint}`;
}
```

### 如何修改API地址

1. 在部署前，只需修改 `API_CONFIG.baseUrl` 为目标环境的URL
2. 对于Docker部署，该地址会自动修改为相对路径 `/`
3. 实际API调用使用 `getApiUrl('predict')` 获取完整URL

### 支持的类别和域类型

#### 类别 (Categories)
- **0: dog（狗）**
- **1: elephant（大象）**
- **2: giraffe（长颈鹿）**
- **3: guitar（吉他）**
- **4: horse（马）**
- **5: house（房子）**
- **6: person（人）**

#### 域类型 (Domains)
- **art_painting（艺术绘画）**
- **cartoon（卡通）**
- **photo（照片）**
- **sketch（素描）**

### 实际 API 调用参数

前端目前调用API时传递以下参数：

```javascript
const formData = new FormData();
formData.append('file', file);  // 图像文件
formData.append('algorithm', 'LFME');  // 使用的算法
// 注意：不再使用num_classes和model参数
// 注意：尽管前端传递了algorithm参数，后端响应中不包含此信息返回
```

### 实际 API 响应格式

后端实际返回的响应格式如下：

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
    ],  // 所有类别的概率分布
    "predicted_class": 1  // 预测的类别索引
}
```

注意：
- `all_probabilities`：包含所有类别的概率分布数组
- `predicted_class`：预测的类别索引（从0开始）
- 后端返回的数据相对简单，不包含单独的`confidence`字段和`algorithm`字段

前端会将这些数据转换为界面需要的格式进行展示，包括将类别索引映射到具体类别名称，以及从`all_probabilities`数组中提取预测类别的置信度值。

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 开发说明

### 自定义样式
主要样式定义在 `styles.css` 中，包含：
- 颜色主题变量
- 响应式断点
- 组件样式类

### JavaScript 架构
采用面向对象设计：
- `LFMEDemo` 类管理主要功能
- 事件绑定和状态管理
- 工具函数模块化

### 扩展功能
可以轻松添加：
- 更多可视化图表
- 历史记录功能
- 批量处理支持
- 导出结果功能

## 相关项目

- [HKU_LFME 原项目](https://github.com/darthsoluke/HKU_LFME)
- [DomainBed 基准测试](https://github.com/facebookresearch/DomainBed)

## 许可证

本项目基于 HKU_LFME 项目创建，遵循原项目的许可证条款。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个演示页面。

## 联系方式

如有问题或建议，请通过原项目仓库提交 Issue。