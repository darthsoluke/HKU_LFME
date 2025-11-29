<template>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1 class="logo">
          {{ $t('logoText') }}
        </h1>
        <!-- 语言切换器 -->
        <div class="language-switcher">
          <button 
            @click="switchLanguage('en')" 
            :class="['language-btn', { active: currentLanguage === 'en' }]"
          >
            English
          </button>
          <button 
            @click="switchLanguage('zh')" 
            :class="['language-btn', { active: currentLanguage === 'zh' }]"
          >
            中文
          </button>
        </div>
        <p class="subtitle">{{ $t('subtitle') }}</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Upload Section -->
      <section class="upload-section">
        <div class="upload-card">
          <h2><i class="fas fa-cloud-upload-alt"></i> {{ $t('uploadTitle') }}</h2>
          <p class="upload-description">{{ $t('uploadDescription') }}</p>
          
          <!-- 支持类别和域类型信息 -->
          <div class="info-panel">
            <div class="info-section">
              <h3><i class="fas fa-list-check"></i> {{ $t('supportedCategories') }}</h3>
              <div class="category-grid">
                <div v-for="category in categories" :key="category.id" class="category-item">
                  <span class="category-number">{{ category.id }}</span>
                  <span class="category-name">{{ getCategoryDisplayName(category.id) }}</span>
                </div>
              </div>
            </div>
            
            <div class="info-section">
              <h3><i class="fas fa-lightbulb"></i> {{ $t('imageTypeTips') }}</h3>
              <div class="domain-types">
                <div v-for="domain in domains" :key="domain.name" class="domain-type">
                  <i :class="domain.icon"></i>
                  <span>{{ getDomainDisplayName(domain.name) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 上传区域 -->
          <div 
            class="upload-area" 
            @click="triggerFileInput"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="handleDrop"
            :class="{ dragover: dragOver }"
          >
            <div v-if="!selectedFile" class="upload-placeholder">
              <i class="fas fa-image"></i>
              <p>{{ $t('uploadPlaceholderText') }}</p>
              <span class="file-types">{{ $t('fileTypes') }}</span>
            </div>
            <div v-else class="selected-image">
              <div class="selected-image-header">
                <i class="fas fa-eye"></i>
                <span>{{ $t('previewTitle') }}</span>
              </div>
              <div class="selected-image-preview" :class="{ 'portrait-layout': imageOrientation === 'portrait' || imageOrientation === 'square' }">
                <div class="image-container" :class="imageOrientation">
                  <img :src="imagePreview" alt="Selected Image">
                </div>
                <div class="selected-image-info">
                  <h3>{{ $t('imageInfoTitle') }}</h3>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">{{ $t('fileNameLabel') }}</span>
                      <span class="info-value">{{ selectedFile.name }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">{{ $t('fileSizeLabel') }}</span>
                      <span class="info-value">{{ formatFileSize(selectedFile.size) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">{{ $t('fileTypeLabel') }}</span>
                      <span class="info-value">{{ selectedFile.type || 'Unknown' }}</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="upload-tips">
            <i class="fas fa-info-circle"></i>
            <span>{{ $t('uploadTips') }}</span>
          </div>
          
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileSelect" 
            accept="image/*" 
            style="display: none;"
          >
        </div>
      </section>



      <!-- Comparison Settings Section -->
      <section class="comparison-settings-section">
        <div class="comparison-settings-card">
          <h2><i class="fas fa-sliders-h"></i> {{ $t('comparisonSettingsTitle') }}</h2>
          
          <!-- 多模型对比设置 -->
          <div class="comparison-settings">
            <h3>{{ $t('comparisonSettingsTitle') }}</h3>
            <div class="model-list">
              <div 
                v-for="model in availableModels" 
                :key="model.name" 
                class="model-item"
                @click="handleModelItemClick($event, model.name)"
              >
                <input 
                  type="checkbox" 
                  :id="'model' + model.name" 
                  :checked="selectedModels.includes(model.name)"
                  @change="toggleModelSelection(model.name)"
                >
                <label :for="'model' + model.name">{{ model.displayName }}</label>
              </div>
            </div>
            <div class="setting-item">
              <label for="comparisonSeed">{{ $t('testExcludeEnvLabel') }}</label>
              <select id="comparisonSeed" v-model="selectedSeed">
                <option value="0">0 - {{ getDomainDisplayName('art_painting') }}</option>
                <option value="1">1 - {{ getDomainDisplayName('cartoon') }}</option>
                <option value="2">2 - {{ getDomainDisplayName('photo') }}</option>
                <option value="3">3 - {{ getDomainDisplayName('sketch') }}</option>
              </select>
            </div>
            
            <!-- Start Analysis Button -->
            <button 
              class="upload-btn" 
              @click="predictImage" 
              :disabled="!selectedFile || isAnalyzing"
            >
              <i class="fas fa-upload"></i>
              <span>{{ $t('uploadButton') }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Results Section -->
      <section v-if="showResults" class="results-section">
        <div class="results-card">
          <h2><i class="fas fa-chart-bar"></i> {{ $t('resultsTitle') }}</h2>

          <div class="results-explanation">
            <i class="fas fa-lightbulb"></i>
            <span>{{ $t('resultsExplanation') }}</span>
          </div>
          
          <div class="results-content">
            <div v-if="isAnalyzing" class="loading-spinner">
              <div class="spinner"></div>
              <p>{{ $t('analyzing') }}</p>
            </div>
            
            <div v-else-if="predictionResults" class="prediction-results">
              <!-- 预测结果将在这里动态显示 -->
              <div v-for="(result, modelName) in predictionResults" :key="modelName" class="model-result">
                <h3>{{ availableModels.find(m => m.name === modelName)?.displayName || modelName }}</h3>
                <div class="predicted-category">
                  <span class="predicted-label">{{ $t('mostLikelyCategory') }}</span>
                  <span class="predicted-value">{{ getCategoryDisplayName(result.predicted_class) }}</span>
                </div>
                <div class="category-list">
                  <div v-for="category in getSortedPredictions(result.predictions)" :key="category.id" class="category-item">
                    <span class="category-name">{{ getCategoryDisplayName(category.id) }}</span>
                    <span class="category-probability">{{ (category.prob * 100).toFixed(2) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p v-html="$t('footerText1')"></p>
      <p>{{ $t('footerText2') }}</p>
    </footer>

    <!-- Toast Notification -->
    <div v-if="toast.show" :class="['toast', toast.type]" :style="{ transform: toast.show ? 'translateX(0)' : 'translateX(150%)' }">
      <div class="toast-content">
        <i class="fas fa-check-circle"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'App',
  setup() {
    const { t, locale } = useI18n()
    
    // 响应式数据
    const selectedFile = ref(null)
    const imagePreview = ref('')
    const imageDimensions = ref({ width: 0, height: 0, aspectRatio: 1 })
    const isPortrait = ref(false) // 是否为纵向图片
    const dragOver = ref(false)
    const isAnalyzing = ref(false)
    const showResults = ref(false)
    const predictionResults = ref(null)
    const selectedModels = ref(['LFME', 'ERM', 'CORAL', 'Mixup'])
    const selectedSeed = ref('2')
    const fileInput = ref(null)
    
    // Toast通知
    const toast = ref({
      show: false,
      message: '',
      type: 'success'
    })
    
    // 常量数据
    const categories = [
      { id: 0, name: 'dog' },
      { id: 1, name: 'elephant' },
      { id: 2, name: 'giraffe' },
      { id: 3, name: 'guitar' },
      { id: 4, name: 'horse' },
      { id: 5, name: 'house' },
      { id: 6, name: 'person' }
    ]
    
    const domains = [
      { name: 'art_painting', icon: 'fas fa-palette' },
      { name: 'cartoon', icon: 'fas fa-film' },
      { name: 'photo', icon: 'fas fa-camera' },
      { name: 'sketch', icon: 'fas fa-pencil-alt' }
    ]
    
    const availableModels = [
      { name: 'LFME', displayName: 'LFME' },
      { name: 'ERM', displayName: 'ERM' },
      { name: 'CORAL', displayName: 'CORAL' },
      { name: 'Mixup', displayName: 'Mixup' }
    ]
    
    // 计算属性
    const currentLanguage = computed(() => locale.value)
    
    // 图片方向计算属性
    const imageOrientation = computed(() => {
      const { width, height } = imageDimensions.value
      // 如果没有图片或图片尺寸无效，返回默认值
      if (!imagePreview.value || width === 0 || height === 0) {
        return 'landscape' // 默认使用横向布局
      }
      if (width > height) {
        return 'landscape' // 横向图片
      } else if (height > width) {
        return 'portrait' // 纵向图片
      } else {
        return 'square' // 正方形图片
      }
    })
    
    // 方法
    const showToast = (message, type = 'success') => {
      toast.value = { show: true, message, type }
      setTimeout(() => {
        toast.value.show = false
      }, 3000)
    }
    
    const switchLanguage = (lang) => {
      locale.value = lang
      document.documentElement.lang = lang
      document.title = t('pageTitle')
    }
    
    const getCategoryDisplayName = (categoryId) => {
      return t(`categories.${categoryId}`) || `Category ${categoryId}`
    }
    
    const getDomainDisplayName = (domainName) => {
      return t(`domains.${domainName}`) || domainName
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const getSortedPredictions = (predictions) => {
      // 将预测对象转换为数组并按概率从高到低排序
      const sorted = Object.entries(predictions)
        .map(([categoryId, prob]) => ({
          id: parseInt(categoryId),
          prob: prob
        }))
        .sort((a, b) => b.prob - a.prob) // 按概率降序排列
      
      return sorted
    }
    
    const handleModelItemClick = (event, modelName) => {
      // 如果点击的是复选框或标签，不处理（让浏览器默认行为处理）
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'LABEL') {
        return
      }
      // 只有点击模型项的其他区域才触发选择切换
      toggleModelSelection(modelName)
    }
    
    const triggerFileInput = () => {
      fileInput.value?.click()
    }
    
    const handleFileSelect = (event) => {
      const file = event.target.files?.[0] || event.dataTransfer?.files?.[0]
      if (file) {
        if (!file.type.startsWith('image/')) {
          showToast(t('toastMessages.invalidFileType'), 'error')
          return
        }
        
        if (file.size > 10 * 1024 * 1024) {
          showToast(t('toastMessages.fileTooLarge'), 'error')
          return
        }
        
        selectedFile.value = file
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.value = e.target.result
          
          // 获取图片尺寸
          const img = new Image()
          img.onload = () => {
            const width = img.width
            const height = img.height
            const aspectRatio = width / height
            
            imageDimensions.value = { width, height, aspectRatio }
            // 宽高比小于1为纵向图片，等于1为正方形图片，大于1为横向图片
            isPortrait.value = aspectRatio <= 1 // 包括1:1的正方形图片
            
            console.log('图片尺寸:', { width, height, aspectRatio, isPortrait: isPortrait.value })
          }
          img.src = e.target.result
        }
        reader.readAsDataURL(file)
        
        showToast(t('toastMessages.imageSelected'))
        showResults.value = false
        predictionResults.value = null
      }
    }
    
    const handleDrop = (event) => {
      dragOver.value = false
      handleFileSelect(event)
    }
    
    const toggleModelSelection = (modelName) => {
      const index = selectedModels.value.indexOf(modelName)
      if (index > -1) {
        selectedModels.value.splice(index, 1)
      } else {
        selectedModels.value.push(modelName)
      }
      
      // 确保至少选择一个模型
      if (selectedModels.value.length === 0) {
        selectedModels.value.push('LFME')
      }
    }
    
    const predictImage = async () => {
      if (!selectedFile.value) {
        showToast(t('toastMessages.noImageSelected'), 'error')
        return
      }
      
      try {
        isAnalyzing.value = true
        showResults.value = true
        
        // 调用API
        const results = await callMultiModelAPI(selectedFile.value, parseInt(selectedSeed.value), selectedModels.value)
        predictionResults.value = results
        
        showToast(t('toastMessages.analysisComplete'))
        
        // 滚动到结果区域
        setTimeout(() => {
          const resultsSection = document.querySelector('.results-section')
          if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
        
      } catch (error) {
        console.error('预测失败:', error)
        showToast(t('toastMessages.analysisFailed'), 'error')
      } finally {
        isAnalyzing.value = false
      }
    }
    
    const callMultiModelAPI = async (file, seed, models) => {
      const formData = new FormData()
      formData.append('file', file)  // 修改字段名为'file'，与后端期望一致
      formData.append('seed', seed.toString())
      
      // 确保使用正确的模型列表
      const finalModels = models.length > 0 ? models : ['LFME', 'ERM', 'CORAL', 'Mixup']
      console.log('API调用模型列表:', finalModels)
      
      // 逐个添加模型到FormData，后端使用request.form.getlist('models')接收
      finalModels.forEach(model => {
        formData.append('models', model)
      })
      
      const response = await fetch('/api/predict-all', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('API返回数据:', data)
      
      // 转换后端返回的数据结构为前端期望的格式
      const transformedResults = {}
      if (data.comparison_results) {
        data.comparison_results.forEach(result => {
          if (result.status === 'success') {
            transformedResults[result.algorithm] = {
              predicted_class: result.predicted_class,
              predictions: result.all_probabilities
            }
          }
        })
      }
      
      console.log('转换后的结果:', transformedResults)
      return transformedResults
    }
    
    // 生命周期
    onMounted(() => {
      document.title = t('pageTitle')
      showToast(t('toastMessages.loaded'))
    })
    
    return {
      // 响应式数据
      selectedFile,
      imagePreview,
      dragOver,
      isAnalyzing,
      showResults,
      predictionResults,
      selectedModels,
      selectedSeed,
      toast,
      fileInput,
      
      // 常量数据
      categories,
      domains,
      availableModels,
      
      // 计算属性
      currentLanguage,
      imageOrientation,
      
      // 方法
      showToast,
      switchLanguage,
      getCategoryDisplayName,
      getDomainDisplayName,
      formatFileSize,
      getSortedPredictions,
      handleModelItemClick,
      triggerFileInput,
      handleFileSelect,
      handleDrop,
      toggleModelSelection,
      predictImage
    }
  }
}
</script>

<style scoped>
/* 样式将在单独的CSS文件中定义 */
</style>