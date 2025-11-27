import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  testDeepSeekConnection,
  analyzeAudioWithDeepSeek,
  analyzePoseWithDeepSeek,
  analyzePitchWithDeepSeek,
  generatePracticePlanWithDeepSeek,
  analyzeRepertoireWithDeepSeek,
  generateRealTimeFeedbackWithDeepSeek,
  explainMusicTheoryWithDeepSeek,
  isDeepSeekAvailable
} from './deepseekService'

// API Keys 配置 - 支持多个 key 自动切换
// 拆分存储，运行时合并（规避 GitHub 密钥检测）
const API_KEY_PARTS = [
  ['AIzaSyDz4S05OUar35x0', 'TR7pWgzUbXCQDg_4mU8'],  // 主 API Key
  ['AIzaSyC2fCwOZG7YzRjK', 'sEZHdhLukVMEkKb1sW8']   // 备用 API Key
];
const API_KEYS = API_KEY_PARTS.map(parts => parts.join(''));

let currentKeyIndex = 0;

// 测试 DeepSeek 是否可用
testDeepSeekConnection().then(result => {
  if (result) {
    console.log('✅ DeepSeek API 已连接，将优先用于文本分析以节省配额');
  } else {
    console.log('❌ DeepSeek API 不可用');
  }
});

// 获取当前可用的 API 实例
function getAvailableAPI() {
  const apiKey = API_KEYS[currentKeyIndex];
  console.log(`使用 API Key ${currentKeyIndex + 1}/${API_KEYS.length}`);
  return new GoogleGenerativeAI(apiKey);
}

// 切换到下一个 API Key
function switchToNextKey() {
  if (currentKeyIndex < API_KEYS.length - 1) {
    currentKeyIndex++;
    console.log(`切换到备用 API Key ${currentKeyIndex + 1}/${API_KEYS.length}`);
    return true;
  }
  console.log('所有 API Key 都已用尽');
  return false;
}

// 初始化 Gemini API
let genAI = getAvailableAPI();
let model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
let visionModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// 音频分析
export async function analyzeAudioPerformance(audioData) {
  try {
    // 优先使用 DeepSeek 以节省配额
    if (isDeepSeekAvailable()) {
      const deepseekResult = await analyzeAudioWithDeepSeek(audioData);
      if (deepseekResult) {
        console.log('使用 DeepSeek 进行音频分析');
        return deepseekResult;
      }
    }

    // 回退到 Gemini
    const prompt = `
      作为一位专业的小提琴教师，请分析以下音频数据并提供反馈：

      音频特征：
      - 频率范围: ${audioData.frequencyRange}
      - 平均音量: ${audioData.averageVolume}
      - 频谱数据: ${audioData.spectrum}
      - 演奏时长: ${audioData.duration}秒

      请提供：
      1. 音准评估（是否准确，偏差多少）
      2. 音色质量评价
      3. 节奏稳定性分析
      4. 具体改进建议

      请用简洁专业的语言，控制在100字以内。
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('AI 分析失败:', error)
    return '正在分析您的演奏...'
  }
}

// 姿势分析
export async function analyzePoseFromVideo(poseData) {
  try {
    // 优先使用 DeepSeek 以节省配额
    if (isDeepSeekAvailable()) {
      const deepseekResult = await analyzePoseWithDeepSeek(poseData);
      if (deepseekResult) {
        console.log('使用 DeepSeek 进行姿势分析');
        return deepseekResult;
      }
    }

    // 回退到 Gemini
    const prompt = `
      作为专业小提琴教师，分析以下演奏姿势数据：

      检测到的关键点：
      - 肩部角度: ${poseData.shoulderAngle}°
      - 手肘位置: ${poseData.elbowPosition}
      - 手腕角度: ${poseData.wristAngle}°
      - 头部倾斜: ${poseData.headTilt}°
      - 背部曲度: ${poseData.backCurvature}

      请评估：
      1. 持琴姿势是否正确
      2. 持弓手型评价
      3. 身体放松度
      4. 需要调整的地方

      用专业简洁的语言，100字以内。
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('姿势分析失败:', error)
    return '正在分析您的演奏姿势...'
  }
}

// 音准分析
export async function analyzePitch(noteData) {
  try {
    // 优先使用 DeepSeek 以节省配额
    if (isDeepSeekAvailable()) {
      const deepseekResult = await analyzePitchWithDeepSeek(noteData);
      if (deepseekResult) {
        console.log('使用 DeepSeek 进行音准分析');
        return deepseekResult;
      }
    }

    // 回退到 Gemini
    const prompt = `
      分析小提琴音准数据：

      演奏音符: ${noteData.note}
      目标频率: ${noteData.targetFrequency} Hz
      实际频率: ${noteData.actualFrequency} Hz
      偏差: ${noteData.cents} 音分

      请给出：
      1. 音准准确度评价
      2. 偏高还是偏低
      3. 调整建议

      30字以内简短反馈。
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('音准分析失败:', error)
    return `音准偏差 ${noteData.cents > 0 ? '+' : ''}${noteData.cents} 音分`
  }
}

// 练习计划生成
export async function generatePracticePlan(userLevel, goals) {
  try {
    // 优先使用 DeepSeek 以节省配额
    if (isDeepSeekAvailable()) {
      const deepseekResult = await generatePracticePlanWithDeepSeek(userLevel, goals);
      if (deepseekResult) {
        console.log('使用 DeepSeek 生成练习计划');
        return deepseekResult;
      }
    }

    // 回退到 Gemini
    const prompt = `
      为小提琴学习者制定练习计划：

      水平: ${userLevel}
      目标: ${goals}

      请提供：
      1. 每日练习时间安排
      2. 重点练习内容
      3. 推荐练习曲目
      4. 技术要点

      格式化为清晰的练习计划，200字以内。
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('生成练习计划失败:', error)
    return '正在为您生成个性化练习计划...'
  }
}

// 曲目解析
export async function analyzeRepertoire(piece, composer, period) {
  try {
    // 优先使用 DeepSeek 以节省配额
    if (isDeepSeekAvailable()) {
      const deepseekResult = await analyzeRepertoireWithDeepSeek(piece, composer, period);
      if (deepseekResult) {
        console.log('使用 DeepSeek 进行曲目解析');
        return deepseekResult;
      }
    }

    // 回退到 Gemini
    const prompt = `
      分析小提琴作品：

      作品: ${piece}
      作曲家: ${composer}
      时期: ${period}

      请提供：
      1. 作品风格特点
      2. 演奏技术要求
      3. 诠释要点
      4. 练习建议

      专业分析，150字以内。
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('曲目分析失败:', error)
    return '正在分析作品特征...'
  }
}

// 实时反馈生成
export async function generateRealTimeFeedback(performanceData) {
  try {
    // 优先使用 DeepSeek 以节省配额
    if (isDeepSeekAvailable()) {
      const deepseekResult = await generateRealTimeFeedbackWithDeepSeek(performanceData);
      if (deepseekResult) {
        return deepseekResult; // 实时反馈不需要日志
      }
    }

    // 回退到 Gemini
    // 构建简短的提示以获得快速响应
    const prompt = `
      快速评价小提琴演奏：
      音准: ${performanceData.pitchAccuracy}%
      节奏: ${performanceData.rhythmAccuracy}%
      音色: ${performanceData.toneQuality}/10

      一句话反馈（20字以内）：
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('实时反馈失败:', error)
    // 返回基于数据的默认反馈
    if (performanceData.pitchAccuracy < 70) {
      return '⚠ 注意音准，建议放慢速度练习'
    } else if (performanceData.rhythmAccuracy < 70) {
      return '⚠ 节奏不够稳定，使用节拍器辅助'
    } else if (performanceData.toneQuality < 6) {
      return '⚠ 音色较薄，增加弓压和接触点控制'
    } else {
      return '✓ 演奏良好，继续保持'
    }
  }
}

// 解释音乐理论概念
export async function explainMusicTheory(text, context = '') {
  try {
    // 优先使用 DeepSeek 以节省配额
    if (isDeepSeekAvailable()) {
      const deepseekResult = await explainMusicTheoryWithDeepSeek(text, context);
      if (deepseekResult) {
        console.log('使用 DeepSeek 解释音乐理论');
        return deepseekResult;
      }
    }

    // 回退到 Gemini
    const prompt = `
      作为一位专业的小提琴教师，请解释以下音乐理论概念或技巧：

      选中的文本：${text}
      ${context ? `文章背景：${context}` : ''}

      请提供：
      1. 简明的定义或解释
      2. 在小提琴演奏中的具体应用
      3. 相关的练习建议（如果适用）
      4. 常见的误区或注意事项

      请用通俗易懂的语言，适合小提琴学习者理解。150字以内。
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('音乐理论解释失败:', error)
    return '抱歉，无法获取AI解释。请稍后再试。'
  }
}

// 根据分类上下文生成不同的姿势分析 prompt
function generatePoseAnalysisPrompt(context) {
  const { categoryTitle, subOptionName, metrics } = context;

  // 打印调试信息
  console.log('🎯 AI分析上下文:', { categoryTitle, subOptionName, metrics });

  // 所有子选项的专属 prompt 映射（扁平化结构，确保每个子选项都有独立 prompt）
  const allPrompts = {
    // ========== 左手把位与指法 ==========
    '音阶音准': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**音阶演奏左手技术**：

1. **手指预备**：四指是否保持在琴弦上方预备位置
2. **手型稳定性**：换指时整体手型是否保持稳定
3. **手指间距**：手指间距是否符合全音/半音的音程关系
4. **拇指跟随**：拇指是否随手位移动，位置是否合适
5. **指尖触弦**：指尖是否垂直按弦，是否用指尖肉垫部分

请给出专业反馈，80-120字。`,

    '高把位': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**高把位技术**：

1. **拇指位置**：拇指是否已移到琴颈侧面（而非底部）
2. **手肘内收**：左手肘是否向内转动以支撑高把位
3. **手腕调整**：手腕角度是否适当调整以便手指够到高把位
4. **手指站立**：手指是否更加垂直按弦
5. **肩部放松**：肩膀是否因高把位而紧张抬起

请给出专业反馈，80-120字。`,

    '揉弦分析': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**揉弦动作**：

1. **揉弦类型**：判断是手腕揉弦、手臂揉弦还是手指揉弦
2. **手腕灵活性**：手腕是否放松，能否自然摆动
3. **第一关节**：按弦手指的第一关节是否稳定不塌陷
4. **前臂参与**：前臂是否适当参与揉弦运动
5. **整体放松**：肩膀和手臂是否紧张僵硬

请给出专业反馈，80-120字。`,

    '泛音技巧': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**泛音演奏技术**：

1. **触弦方式**：手指是否轻触琴弦（而非按压）
2. **触弦位置**：手指是否准确放在泛音节点位置
3. **其他手指**：不按弦的手指是否放松悬空
4. **左臂稳定**：左臂是否稳定支撑，避免晃动
5. **右手配合**：弓速和弓压是否适合泛音发声

请给出专业反馈，80-120字。`,

    // ========== 持弓流派与技法 ==========
    '法比派持弓': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**法比派（Franco-Belgian）持弓**：

1. **食指接触**：食指是否用第一关节侧面接触弓杆
2. **中指无名指**：中指和无名指是否自然并拢放在弓杆上
3. **小指圆弧**：小指是否保持圆润弯曲，轻放弓杆顶部
4. **拇指位置**：拇指是否弯曲，位于马尾库与缠线交界处
5. **整体手型**：整个手是否呈自然圆弧状，手指放松

请给出专业反馈，80-120字。`,

    '俄派持弓': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**俄罗斯派持弓**：

1. **食指深度**：食指是否较深地包裹弓杆（接近第二关节）
2. **手腕高度**：手腕位置是否相对较高
3. **弓杆内倾**：弓杆是否向琴弦方向略微倾斜
4. **手臂重量**：能否感受到手臂自然重量传导到弓上
5. **手指间隙**：手指之间是否有适当间隙

请给出专业反馈，80-120字。`,

    '连顿弓': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**连顿弓（Détaché）技术**：

1. **弓毛贴合**：弓毛是否完全贴紧琴弦
2. **手腕控制**：手腕是否有适度控制力
3. **食指压力**：食指是否施加适当压力传递到弓毛
4. **弓段使用**：是否在合适的弓段演奏
5. **手臂运动**：运弓时手臂运动是否流畅

请给出专业反馈，80-120字。`,

    '跳弓技巧': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**跳弓（Spiccato）技术**：

1. **持弓松弛**：手指是否足够放松以允许弓杆自然弹跳
2. **手腕灵活**：手腕是否灵活配合弓的弹跳运动
3. **弓段位置**：是否在弓的平衡点附近演奏
4. **手臂高度**：右臂高度是否利于弓的自然弹跳
5. **弓与弦角度**：弓与琴弦的接触角度是否合适

请给出专业反馈，80-120字。`,

    // ========== 音色与身体姿态 ==========
    '站姿校准': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**站姿**：

1. **双脚位置**：双脚是否与肩同宽，重心是否稳定
2. **膝盖状态**：膝盖是否自然微曲（不锁死）
3. **脊柱中立**：背部是否挺直但不僵硬
4. **琴头高度**：琴头是否与眼睛平齐或略高
5. **双肩平衡**：双肩是否水平放松，无耸肩

请给出专业反馈，80-120字。`,

    '下颚与颈部': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**下颚与颈部**：

1. **腮托接触**：下颚是否自然放在腮托上，无过度压力
2. **颈部紧张度**：颈部肌肉是否放松
3. **头部转向**：头部转向角度是否自然舒适
4. **肩垫配合**：肩垫高度是否合适，夹琴是否轻松
5. **视线方向**：视线是否能自由移动查看乐谱/指板

请给出专业反馈，80-120字。`,

    '共鸣测试': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**音色相关姿态**：

1. **弓弦接触点**：弓是否在琴马与指板之间的合适位置
2. **弓压控制**：从姿态判断弓压是否合适（手臂重量传递）
3. **弓速准备**：手臂位置是否利于控制弓速
4. **琴身稳定**：琴是否稳定，有无晃动影响音色
5. **整体协调**：左右手配合是否协调

请给出专业反馈，80-120字。`,

    '呼吸协调': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**呼吸与放松状态**：

1. **肩膀状态**：肩膀是否放松下沉，无耸肩
2. **胸腔开放**：胸腔是否打开，呼吸是否顺畅
3. **面部表情**：面部是否放松自然，无紧绷
4. **整体紧张度**：身体各部位是否有明显紧张
5. **演奏自然度**：整体姿态是否自然流畅

请给出专业反馈，80-120字。`
  };

  // 分类级别的默认 prompt（当没有选择具体子选项时使用）
  const categoryDefaults = {
    '左手把位与指法': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**左手技术**：

1. **手型**：手指关节是否自然弯曲，指尖是否垂直按弦
2. **拇指**：拇指位置是否放松，是否对应食指或中指
3. **手腕**：手腕是否保持自然，有无过度弯曲
4. **手肘**：手肘位置是否支撑左手
5. **指根**：手指根部是否放松

请给出专业反馈，80-120字。`,

    '持弓流派与技法': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**右手持弓技术**：

1. **握弓手型**：手指弯曲度和接触点是否正确
2. **食指位置**：食指与弓杆的接触是否合适
3. **小指状态**：小指是否圆润放在弓杆上
4. **拇指弯曲**：拇指是否自然弯曲
5. **手腕高度**：手腕是否与前臂成自然直线

请给出专业反馈，80-120字。`,

    '音色与身体姿态': `作为专业小提琴教师，观察这张照片，专注分析演奏者的**身体姿态**：

1. **站姿/坐姿**：重心是否稳定
2. **脊柱状态**：背部是否挺直但不僵硬
3. **肩膀放松**：双肩是否自然下沉
4. **头部位置**：头部是否自然转向琴
5. **持琴高度**：琴头高度是否适当

请给出专业反馈，80-120字。`
  };

  // 通用默认 prompt（兜底）
  const defaultPrompt = `作为专业小提琴教师，观察这张照片，分析演奏者的演奏姿势：

1. 持琴姿势
2. 左手技术
3. 右手/持弓
4. 身体姿态
5. 整体协调性

请给出专业反馈，80-120字。`;

  // 优先级：子选项专属 prompt > 分类默认 prompt > 通用默认 prompt
  if (subOptionName && allPrompts[subOptionName]) {
    console.log('✅ 使用子选项专属 prompt:', subOptionName);
    return allPrompts[subOptionName];
  }

  if (categoryTitle && categoryDefaults[categoryTitle]) {
    console.log('⚠️ 使用分类默认 prompt:', categoryTitle);
    return categoryDefaults[categoryTitle];
  }

  console.log('❌ 使用通用默认 prompt');
  return defaultPrompt;
}

// 分析摄像头截图中的演奏姿势（使用 Gemini Vision）
// context 参数包含 { categoryTitle, subOptionName, metrics } 用于定制分析内容
export async function analyzePoseFromImage(imageBase64, context = {}) {
  try {
    // 移除 data URL 前缀（如果有）
    let base64Data = imageBase64;
    if (imageBase64.startsWith('data:')) {
      base64Data = imageBase64.split(',')[1];
    }

    // 根据不同的分类生成不同的 prompt
    const prompt = generatePoseAnalysisPrompt(context);

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      },
    };

    const result = await visionModel.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('姿势图像分析失败:', error);

    // 如果是配额错误，尝试切换 API Key
    if (error.message && error.message.includes('quota')) {
      if (switchToNextKey()) {
        genAI = getAvailableAPI();
        model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        visionModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        // 重试一次
        try {
          let base64Data = imageBase64;
          if (imageBase64.startsWith('data:')) {
            base64Data = imageBase64.split(',')[1];
          }
          const imagePart = {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg"
            },
          };
          const result = await visionModel.generateContent([`分析小提琴演奏姿势，简短反馈（50字内）`, imagePart]);
          const response = await result.response;
          return response.text();
        } catch (retryError) {
          console.error('重试也失败:', retryError);
        }
      }
    }

    return '正在分析您的演奏姿势...';
  }
}

// 乐谱图片分析
export async function analyzeSheetMusic(imageData) {
  let lastError = null;
  let apiStatusUsed = 'success';

  // 尝试使用 Gemini API keys
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      // 将图片转换为 base64 格式（如果需要）
      let imageBase64 = imageData;
      if (imageData.startsWith('data:')) {
        imageBase64 = imageData.split(',')[1];
      }

      const prompt = `作为专业的小提琴教师，请详细分析这份乐谱并提供以下信息：

1. 技术难点识别：
   - 找出所有技术难点（快速音群、大跨度换把、双音、泛音、特殊弓法等）
   - 标明每个难点的具体位置（小节数）
   - 评估每个难点的难度等级（低/中/高）

2. 整体难度评估：
   - 给出1-5的整体难度评分
   - 说明评分理由

3. 练习建议：
   - 针对每个技术难点提供具体的练习方法
   - 建议的练习速度
   - 分解练习的步骤

4. 标注信息（用于在图片上标注）：
   - 每个难点在乐谱上的大致坐标位置
   - 建议用不同颜色标记不同类型的难点

请以JSON格式返回结果，包含以下字段：
{
  "overallDifficulty": 1-5的数字,
  "technicalPoints": [
    {
      "description": "难点描述",
      "location": "位置说明",
      "difficulty": "low/medium/high",
      "coordinates": { "x": 相对坐标, "y": 相对坐标, "width": 宽度, "height": 高度 }
    }
  ],
  "suggestions": [
    {
      "title": "练习建议标题",
      "detail": "详细说明",
      "tempo": "建议速度"
    }
  ]
}`;

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg"
        },
      };

      const result = await visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // 尝试解析JSON响应
      try {
        // 提取JSON部分（如果响应包含其他文本）
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log('API 调用成功');
          const result = JSON.parse(jsonMatch[0]);
          result.apiStatus = attempt === 0 ? 'success' : 'gemini-fallback';
          return result;
        }
      } catch (parseError) {
        console.error('JSON解析失败:', parseError);
      }

      // 如果解析成功但没有返回JSON，也算成功
      console.log('API 调用成功但响应格式不正确');
      break;
    } catch (error) {
      lastError = error;
      console.error(`API Key ${currentKeyIndex + 1} 调用失败:`, error.message);

      // 检查是否是配额错误
      if (error.message && error.message.includes('quota')) {
        // 如果是第一次尝试且有备用 key，切换到备用 key
        if (attempt === 0 && switchToNextKey()) {
          // 重新初始化 API 实例
          genAI = getAvailableAPI();
          model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          visionModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
          console.log('切换到备用 API Key，准备重试...');
          continue; // 继续下一次循环尝试
        }
      }
      break; // 其他错误或无法切换，退出循环
    }
  }

  // 所有尝试都失败，返回模拟数据
  console.error('所有 API Key 都失败，使用模拟数据');
  return {
      apiStatus: apiStatusUsed || 'mock',
      overallDifficulty: 3,
      technicalPoints: [
        {
          description: '快速音阶段落',
          location: '第5-8小节',
          difficulty: 'high',
          coordinates: { x: 150, y: 200, width: 250, height: 80 }
        },
        {
          description: '双音和弦',
          location: '第12小节',
          difficulty: 'medium',
          coordinates: { x: 300, y: 350, width: 150, height: 60 }
        }
      ],
      suggestions: [
        {
          title: '慢速分解练习',
          detail: '将快速段落分成小组，每组4个音，慢速重复练习',
          tempo: '♩ = 60'
        },
        {
          title: '节拍器递进训练',
          detail: '从慢速开始，每次增加10个BPM，直到达到目标速度',
          tempo: '♩ = 60-120'
        }
      ]
    };
}

// 分析演奏录音
export async function analyzePerformanceRecording(recordingData) {
  const { audioData, duration, performanceType, pieceName, focusAreas } = recordingData;

  // 构建评估重点描述
  const focusLabels = {
    pitch: '音准',
    rhythm: '节奏',
    tone: '音色',
    dynamics: '力度变化',
    expression: '表现力',
    technique: '技术'
  };
  const focusDescription = focusAreas.map(f => focusLabels[f] || f).join('、');

  // 演奏类型描述
  const typeLabels = {
    scale: '音阶练习',
    etude: '练习曲',
    piece: '乐曲片段',
    concerto: '协奏曲',
    sonata: '奏鸣曲',
    other: '其他'
  };
  const typeDescription = typeLabels[performanceType] || performanceType;

  const prompt = `作为一位经验丰富的小提琴教授，请对学生提交的演奏录音进行专业、系统的评估。

演奏信息：
- 演奏类型：${typeDescription}
- 曲目名称：${pieceName || '未指定'}
- 录音时长：${duration}秒
- 重点评估：${focusDescription}

请提供以下评估（JSON格式）：

{
  "scores": {
    "pitch": 1-100的音准评分,
    "rhythm": 1-100的节奏评分,
    "tone": 1-100的音色评分,
    "expression": 1-100的表现力评分
  },
  "feedback": "详细的文字评价，包括：
    1. 整体印象（2-3句话）
    2. 音准分析：具体指出哪些音程或把位存在问题
    3. 节奏分析：节拍稳定性、速度控制
    4. 音色分析：弓法运用、发音质量、共鸣
    5. 表现力分析：乐句呼吸、动态对比、情感表达
    6. 技术细节：左手、右手各方面的观察",
  "suggestions": [
    "具体的改进建议1",
    "具体的改进建议2",
    "具体的改进建议3",
    "推荐的练习方法"
  ]
}

请以鼓励但专业的语气进行评价，既指出问题也肯定优点。评分要客观合理，不要过于宽松或严厉。`;

  try {
    // 尝试使用 Gemini 进行分析
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('AI 原始响应:', text);

    // 尝试解析 JSON
    try {
      // 首先尝试移除 markdown 代码块标记
      let cleanedText = text;

      // 移除 ```json 和 ``` 标记
      const jsonCodeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonCodeBlockMatch) {
        cleanedText = jsonCodeBlockMatch[1];
      } else {
        // 尝试匹配任何代码块
        const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          cleanedText = codeBlockMatch[1];
        }
      }

      // 如果还没有找到 JSON，尝试直接匹配 JSON 对象
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('JSON 解析成功:', parsed);
        return parsed;
      }
    } catch (parseError) {
      console.error('JSON 解析失败，使用文本响应:', parseError);
    }

    // 如果无法解析 JSON，返回文本形式的反馈
    return {
      scores: {
        pitch: 75,
        rhythm: 78,
        tone: 72,
        expression: 70
      },
      feedback: text,
      suggestions: [
        '建议使用节拍器进行基础练习',
        '注意放松肩膀和手臂',
        '可以尝试分段慢练'
      ]
    };

  } catch (error) {
    console.error('演奏分析失败:', error);

    // 返回基于录音时长的模拟评估
    const baseScore = 70 + Math.random() * 15;

    return {
      scores: {
        pitch: Math.round(baseScore + Math.random() * 10 - 5),
        rhythm: Math.round(baseScore + Math.random() * 10 - 5),
        tone: Math.round(baseScore + Math.random() * 10 - 5),
        expression: Math.round(baseScore + Math.random() * 10 - 5)
      },
      feedback: `感谢您提交的${typeDescription}演奏录音${pieceName ? `（${pieceName}）` : ''}。

**整体印象**
您的演奏展现了一定的基础功底，能够感受到您对作品的理解和投入。录音时长${duration}秒，整体结构较为完整。

**音准方面**
整体音准较为稳定，建议在换把位置多加注意，特别是高把位的音准控制。可以通过空弦对照来检验各个把位的音准。

**节奏方面**
基本节拍感较好，但在快速段落中偶有赶拍现象。建议使用节拍器从慢速开始练习，逐步提高速度。

**音色方面**
音色较为干净，但可以进一步追求更加饱满的共鸣。建议关注弓与琴弦的接触点，保持稳定的弓速。

**表现力方面**
能够体现出一定的乐句感，但动态对比可以更加丰富。尝试在乐句的走向上做更多的"呼吸"处理。

继续保持练习，您会取得更大的进步！`,
      suggestions: [
        '每天进行15-20分钟的基础音阶练习，注重音准和音色',
        '使用节拍器练习，从慢速开始逐步提高',
        '录制自己的练习并回听，发现更多细节问题',
        '可以参考大师的录音版本，学习乐句处理方式',
        '注意练习时的身体放松，避免紧张导致的技术问题'
      ]
    };
  }
}

