// DeepSeek API Service
// 用于处理纯文本的AI任务，减少对昂贵的视觉AI API的依赖

// [TODO: 恢复 DeepSeek API Key]
// 原始格式: sk-xxxxx (完整密钥需要用户填入)
// 联系用户获取密钥后，取消下面的注释并填入完整密钥
const DEEPSEEK_API_KEY = ''; // 暂时禁用
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 初始化状态
let isAvailable = false;

// 测试 DeepSeek 连接
async function testConnection() {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: "Test"
          }
        ],
        max_tokens: 5
      })
    });

    isAvailable = response.ok;
    if (isAvailable) {
      console.log('✅ DeepSeek API 已连接，可用于文本分析');
    } else {
      console.log('❌ DeepSeek API 连接失败');
    }
    return isAvailable;
  } catch (error) {
    console.error('DeepSeek 连接测试失败:', error);
    isAvailable = false;
    return false;
  }
}

// 启动时测试连接
testConnection();

// 通用的 DeepSeek API 调用函数
async function callDeepSeek(messages, maxTokens = 500) {
  if (!isAvailable) {
    throw new Error('DeepSeek API 不可用');
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API 错误: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API 调用失败:', error);
    throw error;
  }
}

// 音频分析（文本描述）- 替代 Gemini
export async function analyzeAudioWithDeepSeek(audioData) {
  try {
    const messages = [
      {
        role: "system",
        content: "你是一位专业的小提琴教师，请基于提供的音频数据特征给出专业的分析和建议。回答要简洁专业，控制在100字以内。"
      },
      {
        role: "user",
        content: `分析以下小提琴演奏数据：
频率范围: ${audioData.frequencyRange}
平均音量: ${audioData.averageVolume}
频谱数据: ${audioData.spectrum}
演奏时长: ${audioData.duration}秒

请评估音准、音色、节奏，并给出改进建议。`
      }
    ];

    return await callDeepSeek(messages, 150);
  } catch (error) {
    console.error('DeepSeek 音频分析失败，回退到默认分析');
    return null; // 返回 null 让调用方使用 Gemini
  }
}

// 姿势分析（文本描述）- 替代 Gemini
export async function analyzePoseWithDeepSeek(poseData) {
  try {
    const messages = [
      {
        role: "system",
        content: "你是专业的小提琴教师，请分析演奏姿势数据并给出建议。回答要专业简洁，100字以内。"
      },
      {
        role: "user",
        content: `分析小提琴演奏姿势：
肩部角度: ${poseData.shoulderAngle}°
手肘位置: ${poseData.elbowPosition}
手腕角度: ${poseData.wristAngle}°
头部倾斜: ${poseData.headTilt}°
背部曲度: ${poseData.backCurvature}

请评估持琴姿势、持弓手型、身体放松度，指出需要调整的地方。`
      }
    ];

    return await callDeepSeek(messages, 150);
  } catch (error) {
    console.error('DeepSeek 姿势分析失败，回退到默认分析');
    return null;
  }
}

// 音准分析 - 替代 Gemini
export async function analyzePitchWithDeepSeek(noteData) {
  try {
    const messages = [
      {
        role: "system",
        content: "你是小提琴教师，请简短评价音准问题。30字以内。"
      },
      {
        role: "user",
        content: `音符: ${noteData.note}
目标频率: ${noteData.targetFrequency} Hz
实际频率: ${noteData.actualFrequency} Hz
偏差: ${noteData.cents} 音分

给出音准评价和调整建议。`
      }
    ];

    return await callDeepSeek(messages, 50);
  } catch (error) {
    console.error('DeepSeek 音准分析失败');
    return null;
  }
}

// 练习计划生成 - 替代 Gemini
export async function generatePracticePlanWithDeepSeek(userLevel, goals) {
  try {
    const messages = [
      {
        role: "system",
        content: "你是小提琴教师，请制定个性化练习计划。要求清晰实用，200字以内。"
      },
      {
        role: "user",
        content: `学生水平: ${userLevel}
学习目标: ${goals}

请提供：
1. 每日练习时间安排
2. 重点练习内容
3. 推荐练习曲目
4. 技术要点`
      }
    ];

    return await callDeepSeek(messages, 250);
  } catch (error) {
    console.error('DeepSeek 练习计划生成失败');
    return null;
  }
}

// 曲目解析 - 替代 Gemini
export async function analyzeRepertoireWithDeepSeek(piece, composer, period) {
  try {
    const messages = [
      {
        role: "system",
        content: "你是小提琴专家，请分析作品特点和演奏要求。150字以内。"
      },
      {
        role: "user",
        content: `作品: ${piece}
作曲家: ${composer}
时期: ${period}

请分析：
1. 作品风格特点
2. 演奏技术要求
3. 诠释要点
4. 练习建议`
      }
    ];

    return await callDeepSeek(messages, 200);
  } catch (error) {
    console.error('DeepSeek 曲目分析失败');
    return null;
  }
}

// 实时反馈生成 - 替代 Gemini
export async function generateRealTimeFeedbackWithDeepSeek(performanceData) {
  try {
    const messages = [
      {
        role: "system",
        content: "你是小提琴教师，请给出一句话反馈，20字以内。"
      },
      {
        role: "user",
        content: `音准: ${performanceData.pitchAccuracy}%
节奏: ${performanceData.rhythmAccuracy}%
音色: ${performanceData.toneQuality}/10`
      }
    ];

    return await callDeepSeek(messages, 30);
  } catch (error) {
    console.error('DeepSeek 实时反馈失败');
    return null;
  }
}

// 音乐理论解释 - 替代 Gemini
export async function explainMusicTheoryWithDeepSeek(text, context = '') {
  try {
    const messages = [
      {
        role: "system",
        content: "你是专业的小提琴教师，请解释音乐理论概念，要通俗易懂，150字以内。"
      },
      {
        role: "user",
        content: `解释这个概念: ${text}
${context ? `背景: ${context}` : ''}

请提供：
1. 简明的定义
2. 在小提琴演奏中的应用
3. 练习建议
4. 注意事项`
      }
    ];

    return await callDeepSeek(messages, 200);
  } catch (error) {
    console.error('DeepSeek 理论解释失败');
    return null;
  }
}

// 导出测试连接函数
export { testConnection as testDeepSeekConnection };

// 导出 API 可用性状态
export function isDeepSeekAvailable() {
  return isAvailable;
}