export const translations = {
  en: {
    // 页面标题和头部
    pageTitle: 'LFME - Learning from Multiple Experts Demo',
    logoText: 'LFME Demo',
    subtitle: 'Learning from Multiple Experts - Domain Generalization',
    
    // 上传部分
    uploadTitle: 'Upload Image',
    uploadDescription: 'Upload image for domain generalization prediction analysis',
    supportedCategories: 'Supported Categories',
    imageTypeTips: 'Image Type Tips',
    uploadPlaceholderText: 'Click to select image or drag image here',
    fileTypes: 'Supports JPG, PNG, JPEG formats',
    uploadTips: 'Supported formats: JPG, PNG, GIF | Max size: 5MB',
    uploadButton: 'Start Analysis',
    
    // 图片预览
    previewTitle: 'Image Preview',
    imageInfoTitle: 'Image Information',
    fileNameLabel: 'File name:',
    fileSizeLabel: 'Size:',
    fileTypeLabel: 'Type:',
    imageDimensionsLabel: 'Dimensions:',
    aspectRatioLabel: 'Aspect Ratio:',
    
    // 结果部分
    resultsTitle: 'Prediction Results',
    comparisonSettingsTitle: 'Comparison Settings',
    testExcludeEnvLabel: 'Test Exclude Env:',
    resultsExplanation: 'Analysis results based on multi-expert domain generalization model, showing the probability distribution of each category',
    analyzing: 'Analyzing...',
    confidenceTitle: 'Prediction Confidence',
    domainPredictionsTitle: 'Domain Prediction Distribution',
    expertContributionsTitle: 'Expert Contributions',
    mostLikelyCategory: 'Most likely category:',
    
    // 类别名称 - 英文版只显示英文名称
    categories: {
      0: '🐕 dog',
      1: '🐘 elephant',
      2: '🦒 giraffe',
      3: '🎸 guitar',
      4: '🐎 horse',
      5: '🏠 house',
      6: '👤 person'
    },
    
    // 域类型 - 英文版只显示英文名称
    domains: {
      art_painting: 'art_painting',
      cartoon: 'cartoon',
      photo: 'photo',
      sketch: 'sketch'
    },
    
    // 专家名称
    experts: {
      resnet: 'ResNet Expert',
      vit: 'Vision Transformer',
      efficientnet: 'EfficientNet Expert',
      mobilenet: 'MobileNet Expert'
    },
    
    // Toast消息
    toastMessages: {
      loaded: 'LFME Demo loaded successfully',
      imageSelected: 'Image selected, ready for analysis',
      noImageSelected: 'Please select an image first',
      analysisComplete: 'Analysis complete!',
      analysisFailed: 'Analysis failed, please try again',
      invalidFileType: 'Please select an image file (JPG, PNG, JPEG)',
      fileTooLarge: 'File size cannot exceed 10MB'
    },
    
    // 页脚
    footerText1: 'Based on <strong>LFME: Learning from Multiple Experts</strong> framework',
    footerText2: 'HKU_LFME Project Demo',
    
    // 语言切换
    languageSwitch: '中文'
  },
  
  zh: {
    // 页面标题和头部
    pageTitle: 'LFME - 多专家学习演示',
    logoText: 'LFME 演示',
    subtitle: '基于多专家学习的域泛化',
    
    // 上传部分
    uploadTitle: '上传图片',
    uploadDescription: '上传图片进行域泛化预测分析',
    supportedCategories: '支持分辨的类别',
    imageTypeTips: '图像类型提示',
    uploadPlaceholderText: '点击选择图片或拖拽图片到此处',
    fileTypes: '支持 JPG, PNG, JPEG 格式',
    uploadTips: '支持格式: JPG, PNG, GIF | 最大大小: 5MB',
    uploadButton: '开始分析',
    
    // 图片预览
    previewTitle: '图片预览',
    imageInfoTitle: '图片信息',
    fileNameLabel: '文件名:',
    fileSizeLabel: '尺寸:',
    fileTypeLabel: '类型:',
    imageDimensionsLabel: '图片尺寸:',
    aspectRatioLabel: '宽高比:',
    
    // 结果部分
    resultsTitle: '预测结果',
    comparisonSettingsTitle: '比较设置',
    testExcludeEnvLabel: '测试排除环境:',
    resultsExplanation: '基于多专家域泛化模型的分析结果，显示图像各类别的可能性分布',
    analyzing: '正在分析中...',
    confidenceTitle: '预测置信度',
    domainPredictionsTitle: '域预测分布',
    expertContributionsTitle: '专家贡献度',
    mostLikelyCategory: '最可能类别:',
    
    // 类别名称
    categories: {
      0: '🐕 dog（狗）',
      1: '🐘 elephant（大象）',
      2: '🦒 giraffe（长颈鹿）',
      3: '🎸 guitar（吉他）',
      4: '🐎 horse（马）',
      5: '🏠 house（房子）',
      6: '👤 person（人）'
    },
    
    // 域类型
    domains: {
      art_painting: 'art_painting（艺术绘画）',
      cartoon: 'cartoon（卡通）',
      photo: 'photo（照片）',
      sketch: 'sketch（素描）'
    },
    
    // 专家名称
    experts: {
      resnet: 'ResNet专家',
      vit: 'Vision Transformer',
      efficientnet: 'EfficientNet专家',
      mobilenet: 'MobileNet专家'
    },
    
    // Toast消息
    toastMessages: {
      loaded: 'LFME Demo 已加载完成',
      imageSelected: '图片已选择，准备进行分析',
      noImageSelected: '请先选择图片',
      analysisComplete: '分析完成！',
      analysisFailed: '分析失败，请重试',
      invalidFileType: '请选择图片文件 (JPG, PNG, JPEG)',
      fileTooLarge: '文件大小不能超过10MB'
    },
    
    // 页脚
    footerText1: '基于 <strong>LFME: Learning from Multiple Experts</strong> 框架',
    footerText2: 'HKU_LFME 项目演示',
    
    // 语言切换
    languageSwitch: 'English'
  }
}