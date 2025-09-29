// AI评定服务模块
// 这个模块负责与AI模型进行交互，获取功课评定建议

/**
 * AI评定服务配置
 */
const AI_CONFIG = {
  // 可以配置不同的AI服务提供商
  provider: 'mock', // 'openai', 'anthropic', 'local', 'mock'
  
  // OpenAI配置
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    baseURL: 'https://api.openai.com/v1'
  },
  
  // 本地模型配置（如ollama）
  local: {
    baseURL: 'http://localhost:11434',
    model: 'llama2'
  }
};

/**
 * 构建AI评定的提示词
 */
function buildPrompt(submissionData, skillsData) {
  const { diary_text, attachments, player_name } = submissionData;
  
  const prompt = `
你是一位经验丰富的武侠师傅，正在评阅小侠 ${player_name} 的功课呈报。

【小侠信息】
姓名：${player_name}

【今日呈报内容】
修炼心得：${diary_text || '（未填写）'}
附件数量：${attachments?.length || 0} 个

【可用技能列表】
${skillsData.map(skill => 
  `- ${skill.skill_name_game}（${skill.skill_name_real}）- ${skill.grade_level}年级 - ${skill.description_real}`
).join('\n')}

【评定要求】
1. 以武侠师傅的口吻给出鼓励性评语
2. 根据呈报内容推测涉及的知识点，建议相应的修为点和技能熟练度奖励
3. 评语要体现武侠风格，但内容要实用和鼓励性
4. 如果没有具体学习内容，给予基础的鼓励奖励

请返回JSON格式的评定结果：
{
  "comment": "师傅的评语（武侠风格，鼓励性）",
  "suggested_xp": 建议的修为点数（10-50之间），
  "suggested_proficiency": [
    {
      "skill_id": "技能ID",
      "points": 熟练度点数（5-20之间）
    }
  ]
}
`;

  return prompt;
}

/**
 * 调用OpenAI API
 */
async function callOpenAI(prompt) {
  const response = await fetch(`${AI_CONFIG.openai.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`
    },
    body: JSON.stringify({
      model: AI_CONFIG.openai.model,
      messages: [
        {
          role: 'system',
          content: '你是一位武侠世界的师傅，负责评阅弟子的功课。请用武侠风格的语言给出鼓励性的评价。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * 调用本地模型（如ollama）
 */
async function callLocalModel(prompt) {
  const response = await fetch(`${AI_CONFIG.local.baseURL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: AI_CONFIG.local.model,
      prompt: prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Local model API error: ${response.status}`);
  }

  const data = await response.json();
  
  try {
    return JSON.parse(data.response);
  } catch (error) {
    throw new Error('Failed to parse local model response as JSON');
  }
}

/**
 * 模拟AI评定（用于开发和测试）
 */
async function mockAIEvaluation(submissionData, skillsData) {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const { diary_text, attachments, player_name } = submissionData;
  
  // 根据内容长度和附件数量计算基础分数
  const textLength = diary_text?.length || 0;
  const attachmentCount = attachments?.length || 0;
  
  let baseXp = 10;
  if (textLength > 50) baseXp += 10;
  if (textLength > 100) baseXp += 10;
  if (attachmentCount > 0) baseXp += attachmentCount * 5;
  
  // 随机选择1-2个技能给予奖励
  const selectedSkills = skillsData
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.random() > 0.5 ? 2 : 1);
  
  const suggestedProficiency = selectedSkills.map(skill => ({
    skill_id: skill.skill_id,
    points: Math.floor(Math.random() * 15) + 5 // 5-20点
  }));

  // 生成鼓励性评语
  const comments = [
    `小侠${player_name}今日修炼用心，从呈报中可见其对学问的钻研之心。`,
    `${player_name}小侠今日功课完成得当，师傅甚为欣慰。`,
    `观${player_name}今日所呈，可见其修炼态度端正，值得嘉奖。`,
    `${player_name}小侠今日表现不错，继续保持这种学习劲头。`
  ];
  
  const skillComments = selectedSkills.map(skill => 
    `在"${skill.skill_name_game}"方面有所进步`
  ).join('，');
  
  const comment = `${comments[Math.floor(Math.random() * comments.length)]}${
    skillComments ? `特别是${skillComments}，` : ''
  }继续努力修炼，必将在武学之路上更进一步！`;

  return {
    comment,
    suggested_xp: Math.min(baseXp, 50),
    suggested_proficiency: suggestedProficiency
  };
}

/**
 * 主要的AI评定函数
 */
export async function evaluateSubmission(submissionData, skillsData) {
  try {
    const prompt = buildPrompt(submissionData, skillsData);
    
    switch (AI_CONFIG.provider) {
      case 'openai':
        if (!AI_CONFIG.openai.apiKey) {
          console.warn('OpenAI API key not configured, falling back to mock');
          return await mockAIEvaluation(submissionData, skillsData);
        }
        return await callOpenAI(prompt);
        
      case 'local':
        return await callLocalModel(prompt);
        
      case 'mock':
      default:
        return await mockAIEvaluation(submissionData, skillsData);
    }
  } catch (error) {
    console.error('AI evaluation failed:', error);
    
    // 如果AI评定失败，返回一个基础的评定结果
    return {
      comment: `小侠${submissionData.player_name}今日有呈报功课，师傅已阅。虽然评定系统暂时不可用，但您的努力师傅都看在眼里。继续保持学习的热情！`,
      suggested_xp: 15,
      suggested_proficiency: skillsData.slice(0, 1).map(skill => ({
        skill_id: skill.skill_id,
        points: 10
      }))
    };
  }
}

/**
 * 配置AI服务提供商
 */
export function configureAI(provider, config = {}) {
  AI_CONFIG.provider = provider;
  
  if (provider === 'openai' && config.apiKey) {
    AI_CONFIG.openai.apiKey = config.apiKey;
    if (config.model) AI_CONFIG.openai.model = config.model;
    if (config.baseURL) AI_CONFIG.openai.baseURL = config.baseURL;
  }
  
  if (provider === 'local') {
    if (config.baseURL) AI_CONFIG.local.baseURL = config.baseURL;
    if (config.model) AI_CONFIG.local.model = config.model;
  }
}

/**
 * 获取当前AI配置
 */
export function getAIConfig() {
  return {
    provider: AI_CONFIG.provider,
    available: {
      openai: !!AI_CONFIG.openai.apiKey,
      local: true, // 假设本地服务总是可用的
      mock: true
    }
  };
}