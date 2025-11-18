// LFME Demo - JavaScript Functionality
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
        
        this.domains = [
            { name: 'art_painting', displayName: 'art_painting（艺术绘画）', icon: 'fas fa-palette' },
            { name: 'cartoon', displayName: 'cartoon（卡通）', icon: 'fas fa-film' },
            { name: 'photo', displayName: 'photo（照片）', icon: 'fas fa-camera' },
            { name: 'sketch', displayName: 'sketch（素描）', icon: 'fas fa-pencil-alt' }
        ];
        
        // 语言切换相关元素
        this.englishBtn = document.getElementById('englishBtn');
        this.chineseBtn = document.getElementById('chineseBtn');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeLanguageSwitcher();
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

        // 上传按钮点击
        uploadBtn.addEventListener('click', () => {
            console.log('点击开始分析按钮');
            this.analyzeImage();
        });
        console.log('事件绑定完成');
    }

    initializeLanguageSwitcher() {
        // 设置初始语言为英文
        if (this.englishBtn && this.chineseBtn) {
            this.switchLanguage('en');
            
            // 绑定语言切换事件
            this.englishBtn.addEventListener('click', () => {
                this.switchLanguage('en');
            });
            
            this.chineseBtn.addEventListener('click', () => {
                this.switchLanguage('zh');
            });
        }
    }

    switchLanguage(locale) {
        // 更新活动按钮样式
        if (this.englishBtn && this.chineseBtn) {
            this.englishBtn.classList.toggle('active', locale === 'en');
            this.chineseBtn.classList.toggle('active', locale === 'zh');
        }
        
        // 设置i18n语言
        if (window.i18n) {
            window.i18n.setLocale(locale);
            
            // 更新页面所有翻译元素
            this.updatePageTranslations();
            
            // 如果已经有预测结果，重新翻译结果部分
            if (document.querySelector('#confidenceValue')) {
                this.updateResultTranslations();
            }
        }
    }

    updatePageTranslations() {
        // 使用元素id来更新翻译
        const translatableElements = [
            'pageTitle', 'logoText', 'subtitle', 'uploadTitle', 'uploadDescription',
            'supportedCategories', 'imageTypeTips', 'uploadPlaceholderText', 'fileTypes',
            'uploadTips', 'uploadButton', 'previewTitle', 'imageInfoTitle', 'fileNameLabel',
            'fileSizeLabel', 'fileTypeLabel', 'resultsTitle', 'resultsExplanation',
            'analyzing', 'confidenceTitle', 'domainPredictionsTitle', 'expertContributionsTitle',
            'mostLikelyCategory'
        ];
        
        translatableElements.forEach(id => {
            const element = document.getElementById(id);
            if (element && window.i18n && window.i18n.translate) {
                element.textContent = window.i18n.translate(id);
            }
        });
        
        // 更新类别显示名称
        this.updateCategoryDisplays();
        
        // 更新域类型显示名称
        this.updateDomainDisplays();
        
        // 如果已经有预测结果，重新翻译结果部分
        if (document.querySelector('#confidenceValue')) {
            this.updateResultTranslations();
        }
    }

    updateResultTranslations() {
        // 重新翻译预测结果中的标签
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            const categoryName = item.querySelector('.category-name');
            if (categoryName && window.i18n && window.i18n.getCategoryName) {
                // 尝试从原始数据中获取类别ID，或者使用当前显示的文本进行匹配
                // 注意：这里我们需要获取正确的类别ID，而不是使用index
                // 由于没有直接的ID存储，我们可以通过类别名称查找对应的ID
                let categoryId = null;
                
                // 尝试查找匹配的类别ID
                for (const id in window.i18n.translations[window.i18n.getLanguage()].categories) {
                    const categoryNameFromI18n = window.i18n.getCategoryName(id);
                    // 简化匹配，只比较主要名称部分（去掉表情符号和括号内容）
                    const cleanDisplayedName = categoryName.textContent.replace(/^\s*[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]*/u, '').split('（')[0].trim();
                    const cleanI18nName = categoryNameFromI18n.replace(/^\s*[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]*/u, '').split('（')[0].trim();
                    
                    if (cleanDisplayedName === cleanI18nName) {
                        categoryId = id;
                        break;
                    }
                }
                
                // 如果找到了类别ID，使用它获取正确的翻译
                if (categoryId !== null) {
                    categoryName.textContent = window.i18n.getCategoryName(categoryId);
                }
            }
        });
        
        // 同时更新预测类别
        const predictedValue = document.querySelector('.predicted-value');
        if (predictedValue && window.i18n && window.i18n.getCategoryName) {
            // 提取置信度百分比
            const percentageMatch = predictedValue.textContent.match(/\((\d+)%\)/);
            const percentage = percentageMatch ? percentageMatch[0] : '';
            
            // 查找预测类别的ID
            let predictedCategoryId = null;
            for (const id in window.i18n.translations[window.i18n.getLanguage()].categories) {
                const categoryNameFromI18n = window.i18n.getCategoryName(id);
                const cleanDisplayedName = predictedValue.textContent.replace(/^\s*[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]*/u, '').split('（')[0].split(' (')[0].trim();
                const cleanI18nName = categoryNameFromI18n.replace(/^\s*[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]*/u, '').split('（')[0].trim();
                
                if (cleanDisplayedName === cleanI18nName) {
                    predictedCategoryId = id;
                    break;
                }
            }
            
            if (predictedCategoryId !== null) {
                predictedValue.textContent = `${window.i18n.getCategoryName(predictedCategoryId)} ${percentage}`;
            }
        }
    }
    
    // 更新类别显示名称
    updateCategoryDisplays() {
        // 注意：这个方法可能已经不需要了，因为updateResultTranslations会处理类别名称的更新
        // 但为了保险起见，我们保留它但改进实现
        this.updateResultTranslations();
    }
    
    // 更新域类型显示名称
    updateDomainDisplays() {
        const domainTypes = document.querySelectorAll('.domain-type span');
        domainTypes.forEach(span => {
            // 提取英文域类型名称
            const englishName = span.textContent.split('（')[0].trim();
            if (window.i18n && window.i18n.getDomainName) {
                span.textContent = window.i18n.getDomainName(englishName);
            }
        });
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
        this.displayFileInfo(file);
        this.previewImage(file);
        this.enableUploadButton();
        
        this.showToast('图片已选择，准备进行分析', 'success');
    }

    displayFileInfo(file) {
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
        document.getElementById('fileType').textContent = file.type.split('/')[1].toUpperCase();
    }

    previewImage(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const previewImage = document.getElementById('previewImage');
            previewImage.src = e.target.result;
            
            // 显示预览区域
            document.getElementById('previewSection').style.display = 'block';
            
            // 滚动到预览区域
            document.getElementById('previewSection').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        };

        reader.readAsDataURL(file);
    }

    enableUploadButton() {
        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.disabled = false;
    }

    async analyzeImage() {
        console.log('analyzeImage方法被调用');
        console.log('selectedFile状态:', this.selectedFile ? { name: this.selectedFile.name, size: this.selectedFile.size } : '未选择文件');
        
        if (!this.selectedFile) {
            console.log('未选择文件，显示错误提示');
            this.showToast('请先选择图片', 'error');
            return;
        }

        // 显示结果区域和加载状态
        console.log('显示结果区域和加载状态');
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('loadingSpinner').style.display = 'block';
        document.getElementById('predictionResults').style.display = 'none';

        // 滚动到结果区域
        document.getElementById('resultsSection').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });

        try {
            // 调用LFME API进行预测
            const results = await this.callLFMEAPI(this.selectedFile);
            
            console.log('API调用成功，准备显示结果', results);
            // 显示预测结果
            this.displayPredictionResults(results);
            
            this.showToast('分析完成！', 'success');
        } catch (error) {
            console.error('分析失败:', error);
            this.showToast('分析失败，请重试', 'error');
            
            // 隐藏加载状态
            document.getElementById('loadingSpinner').style.display = 'none';
        }
    }
    


    async simulateAPICall(file) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 生成随机的类别预测
        const shuffledCategories = [...this.categories].sort(() => Math.random() - 0.5);
        const topCategory = shuffledCategories[0];
        const otherCategories = shuffledCategories.slice(1, 4);
        
        // 生成随机的域预测
        const shuffledDomains = [...this.domains].sort(() => Math.random() - 0.5);
        
        // 返回基于真实类别的模拟数据
        return {
            confidence: Math.random() * 0.3 + 0.7, // 70%-100% 置信度
            predictedCategory: topCategory,
            categories: [
                { category: topCategory, probability: 0.35 },
                { category: otherCategories[0], probability: 0.28 },
                { category: otherCategories[1], probability: 0.22 },
                { category: otherCategories[2], probability: 0.15 }
            ],
            domains: [
                { domain: shuffledDomains[0], probability: 0.35 },
                { domain: shuffledDomains[1], probability: 0.28 },
                { domain: shuffledDomains[2], probability: 0.22 },
                { domain: shuffledDomains[3], probability: 0.15 }
            ],
            experts: [
                { name: 'ResNet专家', contribution: 0.35 },
                { name: 'Vision Transformer', contribution: 0.28 },
                { name: 'EfficientNet专家', contribution: 0.22 },
                { name: 'MobileNet专家', contribution: 0.15 }
            ]
        };
    }

    displayPredictionResults(results) {
        // 隐藏加载状态，显示结果
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('predictionResults').style.display = 'block';

        // 只显示类别预测结果
        this.updateCategoryPredictions(results);
    }

    updateCategoryPredictions(results) {
        // 检查categoryList元素是否存在，如果不存在则创建
        let categoryList = document.getElementById('categoryList');
        if (!categoryList) {
            // 获取预测结果容器
            const predictionResults = document.getElementById('predictionResults');
            
            // 创建categoryList元素
            categoryList = document.createElement('div');
            categoryList.id = 'categoryList';
            categoryList.className = 'category-predictions';
            
            // 直接添加到predictionResults容器中
            predictionResults.appendChild(categoryList);
        }
        
        categoryList.innerHTML = '';

        // 显示最可能类别
        const predictedCategory = document.createElement('div');
        predictedCategory.className = 'predicted-category';
        
        // 获取翻译
        let predictedLabel = '最可能类别:';
        let predictedValue = results.predictedCategory.displayName;
        
        // 获取预测概率的百分比显示
        const probabilityPercentage = Math.round(results.confidence * 100);
        
        if (window.i18n && window.i18n.translate) {
            predictedLabel = window.i18n.translate('mostLikelyCategory') || predictedLabel;
            
            // 使用getCategoryName方法获取正确的类别名称（根据当前语言显示英文或中英文对照）
            if (window.i18n.getCategoryName) {
                predictedValue = window.i18n.getCategoryName(results.predictedCategory.id);
            }
        }
        
        predictedCategory.innerHTML = `
            <span class="predicted-label">${predictedLabel}</span>
            <span class="predicted-value">${predictedValue} (${probabilityPercentage}%)</span>
        `;
        categoryList.appendChild(predictedCategory);

        // 显示所有类别预测
        results.categories.forEach(item => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            
            let categoryName = item.category.displayName;
            // 使用getCategoryName方法获取正确的类别名称（根据当前语言显示英文或中英文对照）
            if (window.i18n && window.i18n.getCategoryName) {
                categoryName = window.i18n.getCategoryName(item.category.id);
            } else if (window.i18n && window.i18n.hasKey && window.i18n.translate) {
                const translationKey = `categories.${item.category.name}`;
                if (window.i18n.hasKey(translationKey)) {
                    categoryName = window.i18n.translate(translationKey);
                }
            }
            
            categoryItem.innerHTML = `
                <span class="category-name">${categoryName}</span>
                <span class="category-probability">${(item.probability * 100).toFixed(1)}%</span>
            `;
            categoryList.appendChild(categoryItem);
        });
    }

    updateDomainPredictions(domains) {
        const domainList = document.getElementById('domainList');
        domainList.innerHTML = '';

        domains.forEach(domain => {
            const domainItem = document.createElement('div');
            domainItem.className = 'domain-item';
            
            let domainName = domain.name;
            // 尝试翻译域名称
            if (window.i18n && window.i18n.hasKey && window.i18n.translate) {
                const translationKey = `domains.${domain.name.split(' ')[0]}`;
                if (window.i18n.hasKey(translationKey)) {
                    domainName = window.i18n.translate(translationKey);
                }
            }
            
            domainItem.innerHTML = `
                <span class="domain-name">${domainName}</span>
                <span class="domain-probability">${(domain.probability * 100).toFixed(1)}%</span>
            `;
            domainList.appendChild(domainItem);
        });
    }

    updateExpertContributions(experts) {
        const expertsGrid = document.getElementById('expertsGrid');
        expertsGrid.innerHTML = '';

        experts.forEach(expert => {
            const expertItem = document.createElement('div');
            expertItem.className = 'expert-item';
            
            let expertName = expert.name;
            // 尝试翻译专家名称
            if (window.i18n && window.i18n.hasKey && window.i18n.translate) {
                const translationKey = `experts.${expert.name}`;
                if (window.i18n.hasKey(translationKey)) {
                    expertName = window.i18n.translate(translationKey);
                }
            }
            
            expertItem.innerHTML = `
                <div class="expert-name">${expertName}</div>
                <div class="expert-contribution">${(expert.contribution * 100).toFixed(1)}%</div>
            `;
            expertsGrid.appendChild(expertItem);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // 实际API调用方法（连接后端服务）
    async callLFMEAPI(file) {
        console.log('callLFMEAPI函数被调用，参数:', { file: file ? file.name : 'undefined' });
        
        if (!file) {
            console.error('callLFMEAPI: 未提供文件参数');
            throw new Error('未提供文件参数');
        }
        
        const formData = new FormData();
        formData.append('file', file); // 修改为'file'以匹配后端API
        formData.append('algorithm', 'LFME'); // 使用LFME算法
        formData.append('seed', 0);

        // 添加调试信息
        console.log('准备发送请求，文件信息:', { name: file.name, size: file.size, type: file.type });
        console.log('FormData包含的字段:', Array.from(formData.entries()).map(([key, value]) => 
            typeof value === 'string' ? `${key}: ${value}` : `${key}: [File: ${value.name}]`
        ));

        try {
            const apiUrl = getApiUrl('predict');
            console.log(`开始发送fetch请求到 ${apiUrl}`);
            // 使用配置的API地址
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
                // 注意：使用FormData时不应该设置Content-Type，浏览器会自动设置为multipart/form-data
                // 允许跨域请求携带凭证
                credentials: 'include'
            });

            console.log('API响应状态:', response.status);
            console.log('API响应头:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                // 尝试获取错误详情
                try {
                    const errorData = await response.json();
                    console.error('API错误详情:', errorData);
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
                } catch (jsonError) {
                    console.error('无法解析错误响应:', jsonError);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            // 获取后端返回的数据
            const backendResult = await response.json();
            console.log('API返回的数据:', backendResult);
            
            // 转换数据格式以匹配前端期望
            const transformedResult = this.transformResult(backendResult);
            console.log('转换后的结果数据:', transformedResult);
            return transformedResult;
        } catch (error) {
            console.error('API调用失败:', error.message, error.stack);
            throw error;
        }
    }
    
    // 转换后端返回的数据格式为前端所需格式
    transformResult(backendResult) {
        // 获取预测的类别信息
        const predictedClassId = backendResult.predicted_class;
        
        // 找到概率最高的类别
        let predictedCategory;
        if (predictedClassId !== undefined && predictedClassId !== null) {
            predictedCategory = this.categories.find(cat => cat.id === predictedClassId);
        }
        
        // 如果没有预测类别或找不到对应类别，根据all_probabilities找到概率最高的类别
        if (!predictedCategory && backendResult.all_probabilities && Array.isArray(backendResult.all_probabilities)) {
            const maxIndex = backendResult.all_probabilities.indexOf(Math.max(...backendResult.all_probabilities));
            predictedCategory = this.categories[maxIndex] || this.categories[0];
        } else if (!predictedCategory) {
            predictedCategory = this.categories[0];
        }
        
        // 构建类别概率列表
        const categories = [];
        backendResult.all_probabilities.forEach((prob, index) => {
            const category = this.categories[index] || { id: index, name: `类别${index}`, displayName: `类别${index}` };
            categories.push({
                category: category,
                probability: prob
            });
        });
        
        // 排序类别，将概率最高的放在前面
        categories.sort((a, b) => b.probability - a.probability);
        
        // 计算置信度为预测概率的最高值
        const confidence = categories.length > 0 ? categories[0].probability : 0;
        
        return {
            confidence: confidence,
            predictedCategory: predictedCategory,
            categories: categories
        };
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 确保i18n对象已加载
    if (typeof window.i18n === 'undefined') {
        // 如果i18n未加载，创建一个简单的后备实现
        window.i18n = {
            currentLocale: 'en',
            translations: {},
            setLocale: function(locale) {
                this.currentLocale = locale;
            },
            translate: function(key) {
                return key;
            },
            hasKey: function(key) {
                return false;
            }
        };
    }
    
    new LFMEDemo();
});

// 添加一些工具函数
const utils = {
    // 验证图片文件
    validateImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            return { valid: false, message: '不支持的文件格式' };
        }

        if (file.size > maxSize) {
            return { valid: false, message: '文件大小超过限制' };
        }

        return { valid: true, message: '文件验证通过' };
    },

    // 生成随机颜色（用于图表等）
    generateRandomColor() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// 导出工具函数供全局使用
window.LFMEUtils = utils;