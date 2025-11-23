// LFME Demo - JavaScript Functionality with Multi-Model Comparison
// API配置 - 可在打包前根据部署环境快速调整
const API_CONFIG = {
    baseUrl: 'http://localhost:10000', // 基地址，可配置为生产环境URL
    endpoints: {
        predict: '/api/predict',
        predictAll: '/api/predict-all'
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

class LFMEDemo {
    constructor() {
        this.selectedFile = null;
        this.categories = [
            { id: 0, name: 'dog', displayName: '🐕 dog（狗）' },
            { id: 1, name: 'elephant', displayName: '🐘 elephant（大象）' },
            { id: 2, name: 'giraffe', displayName: '🦒 giraffe（长颈鹿）' },
            { id: 3, name: 'guitar', displayName: '🎸 guitar（吉他）' },
            { id: 4, name: 'horse', displayName: '🐎 horse（马）' },
            { id: 5, name: 'house', displayName: '🏠 house（房子）' },
            { id: 6, name: 'person', displayName: '👤 person（人）' }
        ];
        
        this.init();
    }

    init() {
        this.bindEvents();
        // 初始禁用预测按钮
        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.disabled = true;
        this.showToast('LFME Demo 已加载完成', 'success');
    }

    bindEvents() {
        console.log('开始绑定事件...');
        
        // 文件上传相关事件
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');

        console.log('事件元素获取结果:', { uploadArea, fileInput, uploadBtn });

        // 点击上传区域触发文件选择
        uploadArea.addEventListener('click', () => {
            console.log('点击上传区域');
            fileInput.click();
        });

        // 文件选择变化
        fileInput.addEventListener('change', (e) => {
            console.log('文件选择变化', e);
            this.handleFileSelect(e);
        });

        // 拖拽上传
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                console.log('拖放文件', e.dataTransfer.files);
                this.handleFileSelect({ target: { files: e.dataTransfer.files } });
            }
        });

        // 预测按钮点击
        uploadBtn.addEventListener('click', () => {
            console.log('点击开始预测按钮');
            this.predictImage();
        });
        
        // 绑定模型选择卡片点击事件，使整个卡片区域可点击切换勾选状态
        const modelItems = document.querySelectorAll('.model-item');
        modelItems.forEach(item => {
            // 为整个卡片添加点击事件
            item.addEventListener('click', (e) => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                const label = item.querySelector('label');
                
                // 避免重复触发：只在点击的是卡片背景且不是checkbox时处理
                if (checkbox && e.target === item && e.target !== checkbox) {
                    // 手动切换复选框状态
                    checkbox.checked = !checkbox.checked;
                    
                    // 触发change事件，确保相关逻辑被执行
                    const changeEvent = new Event('change', { bubbles: true });
                    checkbox.dispatchEvent(changeEvent);
                }
                // 对于label，让浏览器默认行为处理即可，不需要手动切换
            });
        });

        console.log('事件绑定完成');
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            this.showToast('请选择图片文件 (JPG, PNG, JPEG)', 'error');
            return;
        }

        // 验证文件大小 (限制为10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('文件大小不能超过10MB', 'error');
            return;
        }

        this.selectedFile = file;
        this.updateUploadArea(file);
        this.previewImage(file);
        this.enablePredictButton();
        
        this.showToast('图片已选择，准备进行预测', 'success');
    }

    updateUploadArea(file) {
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const selectedImage = document.getElementById('selectedImage');
        const uploadPreviewImage = document.getElementById('uploadPreviewImage');
        const selectedImageName = document.getElementById('selectedImageName');
        const selectedImageSize = document.getElementById('selectedImageSize');
        const selectedImageType = document.getElementById('selectedImageType');

        // 显示选中的图片信息
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadPreviewImage.src = e.target.result;
            selectedImageName.textContent = file.name;
            selectedImageSize.textContent = this.formatFileSize(file.size);
            selectedImageType.textContent = file.type.split('/')[1].toUpperCase();
            
            // 切换显示状态
            uploadPlaceholder.style.display = 'none';
            selectedImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    previewImage(file) {
        // 不再显示单独的预览区域，因为上传区域已经显示图片信息
        // 直接显示结果区域
        document.getElementById('resultsSection').style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    enablePredictButton() {
        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.disabled = false;
        // 添加视觉反馈
        uploadBtn.classList.add('enabled');
        setTimeout(() => {
            uploadBtn.classList.remove('enabled');
        }, 300);
    }

    async predictImage() {
        console.log('predictImage方法被调用');
        console.log('selectedFile状态:', this.selectedFile ? { name: this.selectedFile.name, size: this.selectedFile.size } : '未选择文件');
        
        if (!this.selectedFile) {
            console.log('未选择文件，显示错误提示');
            this.showToast('请先选择图片', 'error');
            return;
        }

        // 获取选中的模型
        const selectedModels = [];
        if (document.getElementById('modelLFME').checked) selectedModels.push('LFME');
        if (document.getElementById('modelERM').checked) selectedModels.push('ERM');
        if (document.getElementById('modelCORAL').checked) selectedModels.push('CORAL');
        if (document.getElementById('modelMixup').checked) selectedModels.push('Mixup');

        if (selectedModels.length === 0) {
            this.showToast('请至少选择一个模型', 'error');
            return;
        }

        // 获取测试排除环境参数
        const seed = document.getElementById('comparisonSeed').value;
        
        // 显示加载状态
        console.log('显示加载状态');
        document.getElementById('loadingSpinner').style.display = 'flex';
        document.getElementById('predictionResults').style.display = 'none';
        document.getElementById('predictionResults').innerHTML = '';

        try {
            // 多模型对比
            const results = await this.callMultiModelAPI(this.selectedFile, seed, selectedModels);
            
            console.log('API调用成功，准备显示结果', results);
            // 显示预测结果
            this.displayPredictionResults(results, 'comparison');
            
            this.showToast('预测完成！', 'success');
        } catch (error) {
            console.error('预测失败:', error);
            this.showToast('预测失败，请重试', 'error');
            
            // 隐藏加载状态
            document.getElementById('loadingSpinner').style.display = 'none';
        }
    }

    async callSingleModelAPI(file, algorithm, seed) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('algorithm', algorithm);
        formData.append('seed', seed);

        const response = await fetch(getApiUrl('predict'), {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async callMultiModelAPI(file, seed, models) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('seed', seed);
        
        // 添加选中的模型
        models.forEach(model => {
            formData.append('models', model);
        });

        const response = await fetch(getApiUrl('predictAll'), {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    displayPredictionResults(results, mode) {
        // 隐藏加载状态
        document.getElementById('loadingSpinner').style.display = 'none';
        
        const resultsContainer = document.getElementById('predictionResults');
        resultsContainer.style.display = 'block';
        
        if (mode === 'single') {
            this.displaySingleModelResults(results, resultsContainer);
        } else {
            this.displayMultiModelResults(results, resultsContainer);
        }
    }

    displaySingleModelResults(result, container) {
        container.innerHTML = `
            <div class="result-card">
                <h3>${result.algorithm} 模型预测结果</h3>
                <div class="prediction-summary">
                    <div class="predicted-class">
                        <strong>预测类别:</strong> ${result.predicted_class_name} (ID: ${result.predicted_class})
                    </div>
                    <div class="confidence">
                        <strong>置信度:</strong> ${(result.confidence * 100).toFixed(2)}%
                    </div>
                </div>
                <div class="probability-chart">
                    <h4>各类别概率分布</h4>
                    <div class="probabilities">
                        ${this.categories.map((category, index) => `
                            <div class="probability-item">
                                <span class="category-name">${category.displayName}</span>
                                <span class="probability-bar">
                                    <span class="bar-fill" style="width: ${result.all_probabilities[index] * 100}%"></span>
                                </span>
                                <span class="probability-value">${(result.all_probabilities[index] * 100).toFixed(2)}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    displayMultiModelResults(results, container) {
        const comparisonResults = results.comparison_results;
        const successfulModels = results.successful_models;
        const totalModels = results.total_models;

        container.innerHTML = `
            <div class="comparison-header">
                <h3>多模型对比结果</h3>
                <div class="stats">成功模型: ${successfulModels}/${totalModels}</div>
            </div>
            <div class="model-cards-grid">
                ${comparisonResults.map(result => this.createModelResultCard(result)).join('')}
            </div>
            <div class="comparison-summary">
                <h4>对比分析</h4>
                <div class="consensus-analysis">
                    ${this.createConsensusAnalysis(comparisonResults)}
                </div>
            </div>
        `;
    }

    createModelResultCard(result) {
        if (result.status === 'error') {
            return `
                <div class="model-card error">
                    <h4>${result.algorithm} 模型</h4>
                    <div class="error-message">预测失败: ${result.error}</div>
                </div>
            `;
        }

        return `
            <div class="model-card">
                <h4>${result.algorithm}</h4>
                <div class="prediction-summary">
                    <div class="prediction-main">
                        <span class="predicted-class-large">${result.predicted_class_name}</span>
                        <span class="confidence-badge">${(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                </div>
                <div class="probability-chart">
                    <h5>各类别概率分布</h5>
                    <div class="probabilities">
                        ${this.categories.map((category, index) => `
                            <div class="probability-item">
                                <span class="category-name">${category.displayName}</span>
                                <span class="probability-bar">
                                    <span class="bar-fill" style="width: ${result.all_probabilities[index] * 100}%"
                                          class="${result.predicted_class === index ? 'predicted' : ''}"></span>
                                </span>
                                <span class="probability-value">${(result.all_probabilities[index] * 100).toFixed(2)}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getTopProbabilities(probabilities, count) {
        return probabilities
            .map((probability, index) => ({ probability, index }))
            .sort((a, b) => b.probability - a.probability)
            .slice(0, count);
    }

    createConsensusAnalysis(results) {
        const successfulResults = results.filter(r => r.status === 'success');
        
        if (successfulResults.length === 0) {
            return '<p>所有模型预测失败，无法进行对比分析</p>';
        }

        // 检查预测一致性
        const predictions = successfulResults.map(r => r.predicted_class);
        const uniquePredictions = [...new Set(predictions)];
        
        if (uniquePredictions.length === 1) {
            return `<p>✅ 所有模型一致预测为: <strong>${this.categories[uniquePredictions[0]].displayName}</strong></p>`;
        } else {
            const predictionCounts = {};
            predictions.forEach(pred => {
                predictionCounts[pred] = (predictionCounts[pred] || 0) + 1;
            });
            
            const consensusHtml = Object.entries(predictionCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([classId, count]) => {
                    const percentage = (count / successfulResults.length * 100).toFixed(1);
                    return `<li>${this.categories[classId].displayName}: ${count} 个模型 (${percentage}%)</li>`;
                }).join('');
            
            return `
                <p>⚠️ 模型预测存在分歧:</p>
                <ul>${consensusHtml}</ul>
            `;
        }
    }

    showToast(message, type = 'success') {
        // 创建或获取toast容器
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
            `;
            document.body.appendChild(toastContainer);
        }

        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.cssText = `
            background: ${type === 'success' ? '#48bb78' : '#f56565'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        // 3秒后自动移除
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .result-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .model-cards-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .model-card {
        background: white;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border-left: 4px solid #667eea;
        transition: all 0.3s ease;
    }
    
    .model-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    
    .model-card.error {
        border-left-color: #f56565;
        background: #fed7d7;
    }
    
    .model-card h4 {
        margin-top: 0;
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
        color: #333;
    }
    
    .prediction-main {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
    }
    
    .predicted-class-large {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-right: 12px;
    }
    
    .confidence-badge {
        background-color: #4CAF50;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
    }
    
    .error-message {
        color: #c53030;
        font-size: 0.9em;
    }
    
    .probability-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        gap: 10px;
    }
    
    .probability-bar {
        flex: 1;
        background: #e2e8f0;
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
        min-width: 0;
    }
    
    .bar-fill {
        display: block;
        height: 100%;
        background: linear-gradient(90deg, #48bb78, #38a169);
        transition: width 0.3s ease;
    }
    
    .prediction-summary {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .probability-chart {
        margin-top: 15px;
    }
    
    .probabilities {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .category-name {
        width: 120px;
        flex-shrink: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .probability-value {
        width: 60px;
        text-align: right;
        flex-shrink: 0;
    }
    
    .bar-fill.predicted {
        background: linear-gradient(90deg, #667eea, #5a67d8);
    }
    
    .probability-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        gap: 10px;
    }
    
    @media (max-width: 768px) {
        .model-cards-grid {
            grid-template-columns: 1fr;
        }
        
        .category-name {
            width: 100px;
            font-size: 0.9em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .probability-bar {
            flex: 1;
            min-width: 0;
        }
        
        .probability-value {
            width: 50px;
            font-size: 0.9em;
        }
    }
    
    .comparison-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .stats {
        background: #667eea;
        color: white;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 0.9em;
    }
`;
document.head.appendChild(style);

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new LFMEDemo();
});