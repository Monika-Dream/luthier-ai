export const categories = [
    {
        id: 1,
        title: '左手把位与指法',
        desc: 'Positions, Shifting',
        iconPath: 'M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0 M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2 M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8 M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15',
        tags: ['综合音准', '指根放松度', '换把速度', '指尖力度'],
        displayMode: 'camera', // 需要摄像头
        subOptions: [
            { name: '音阶音准', metrics: ['大调音阶', '小调音阶', '琶音准确度', '换指平滑度'] },
            { name: '高把位', metrics: ['拇指位置', '手肘内收', '琴弦按压力度', '高音共鸣'] },
            { name: '揉弦分析', metrics: ['揉弦宽度', '揉弦频率', '手腕灵活性', '指关节稳定性'] },
            { name: '泛音技巧', metrics: ['泛音清晰度', '触弦位置', '弓速控制', '音准稳定性'] }
        ]
    },
    {
        id: 2,
        title: '持弓流派与技法',
        desc: 'Bowing, Grip, Stroke',
        iconPath: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z',
        tags: ['弓杆角度', '食指施压', '小指平衡', '运弓直线度'],
        displayMode: 'camera', // 需要摄像头
        subOptions: [
            { name: '法比派持弓', metrics: ['食指接触点', '中指无名指并拢', '小指圆弧', '拇指弯曲'] },
            { name: '俄派持弓', metrics: ['食指深度', '手腕高度', '弓杆内倾', '手臂重量传导'] },
            { name: '连顿弓', metrics: ['弓毛贴合度', '手腕僵硬度', '顿音清晰度', '弓段分配'] },
            { name: '跳弓技巧', metrics: ['弓杆弹性', '手腕灵活', '接触点一致', '节奏稳定性'] }
        ]
    },
    {
        id: 3,
        title: '音色与身体姿态',
        desc: 'Tone & Body Posture',
        iconPath: 'M2 12h5 M17 12h5 M7 12v-2a10 10 0 0 1 10 0v2',
        extraIcon: true,
        tags: ['琴身水平度', '头部倾角', '脊柱对齐', '呼吸节奏'],
        displayMode: 'camera', // 需要摄像头
        subOptions: [
            { name: '站姿校准', metrics: ['双脚重心', '脊柱中立位', '琴头高度', '双肩平衡'] },
            { name: '下颚与颈部', metrics: ['腮托压力', '颈部紧张度', '视线方向', '头部自由度'] },
            { name: '共鸣测试', metrics: ['空弦泛音', 'G弦厚度', 'E弦穿透力', '杂音比率'] },
            { name: '呼吸协调', metrics: ['呼吸深度', '乐句呼吸点', '肌肉放松度', '演奏流畅性'] }
        ]
    },
    {
        id: 4,
        title: '音准调音器',
        desc: 'Tuner & Pitch Trainer',
        iconPath: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16 M8 16H3v5',
        tags: ['A音准确度', 'D音准确度', 'G音准确度', 'E音准确度'],
        displayMode: 'tuner', // 调音器模式
        subOptions: [
            { name: '电子调音器', metrics: ['A=440Hz', 'D=293.7Hz', 'G=196Hz', 'E=659.3Hz'], displayMode: 'tuner' },
            { name: '调音教学', metrics: ['调音器使用', '五度对弦', '双音对弦', '泛音调音'], displayMode: 'theory' },
            { name: '音准训练游戏', metrics: ['音高识别', '音程判断', '相对音感', '绝对音感'], displayMode: 'pitchGame' },
            { name: '频谱分析仪', metrics: ['100Hz', '200Hz', '500Hz', '1kHz', '2kHz', '5kHz', '10kHz'], displayMode: 'spectrum' }
        ]
    },
    {
        id: 5,
        title: '节拍器与节奏',
        desc: 'Metronome & Rhythm',
        iconPath: 'M12 2v20 M2 12h20 M12 2a10 10 0 0 1 10 10 M12 2a10 10 0 0 0-10 10 M12 22a10 10 0 0 0 10-10 M12 22a10 10 0 0 1-10-10',
        tags: ['节奏稳定性', '重音准确度', '速度变化', '节拍分割'],
        displayMode: 'metronome', // 节拍器模式
        subOptions: [
            { name: '基础拍型训练', metrics: ['4/4标准拍', '3/4圆舞曲', '6/8复拍子', '2/4进行曲'], displayMode: 'metronome' },
            { name: '节奏型练习', metrics: ['附点节奏', '三连音', '切分音', '休止符'], displayMode: 'metronome' },
            { name: '速度阶梯训练', metrics: ['渐快练习', '渐慢练习', '金字塔', '弓段分配'], displayMode: 'speedLadder' },
            { name: '专项技巧练习', metrics: ['渐快训练', '渐慢训练', 'Rubato自由', '变速练习'], displayMode: 'metronome' }
        ]
    },
    {
        id: 6,
        title: '曲目解析与风格',
        desc: 'Repertoire & Style',
        iconPath: 'M9 2v17.5A3.5 3.5 0 0 1 5.5 23 A3.5 3.5 0 0 1 2 19.5 A3.5 3.5 0 0 1 5.5 16H6 M9 16H15.5A3.5 3.5 0 1 1 12 19.5V2 M19 2v17.5A3.5 3.5 0 0 1 15.5 23',
        tags: ['作品理解', '时期风格', '演奏诠释', '技术要求'],
        displayMode: 'theory', // 理论模式
        subOptions: [
            { name: '巴洛克时期', metrics: ['巴赫风格', '对位技巧', '装饰音处理', '舞曲节奏'] },
            { name: '古典主义', metrics: ['莫扎特风格', '贝多芬表达', '句法结构', '力度对比'] },
            { name: '浪漫主义', metrics: ['抒情性', '戏剧性对比', '揉弦运用', '音色变化'] },
            { name: '现代作品', metrics: ['扩展技巧', '微分音', '特殊奏法', '节奏复杂度'] }
        ]
    },
    {
        id: 7,
        title: '练习方法与计划',
        desc: 'Practice Methods',
        iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z',
        tags: ['练习效率', '时间分配', '目标设定', '进步追踪'],
        displayMode: 'guide', // 指导模式
        subOptions: [
            { name: '基础训练', metrics: ['空弦练习', '音阶模式', '琶音练习', '双音练习'] },
            { name: '技巧专项', metrics: ['快速音群', '双音音准', '换把流畅', '揉弦控制'] },
            { name: '曲目准备', metrics: ['慢练方法', '分段练习', '难点突破', '整体连贯'], displayMode: 'sheetMusic' },
            { name: '演出准备', metrics: ['心理调节', '舞台适应', '体能训练', '临场发挥'], displayMode: 'performanceRecorder' }
        ]
    },
    {
        id: 8,
        title: '音乐理论与视唱',
        desc: 'Theory & Sight-reading',
        iconPath: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.19 0 2.34-.21 3.41-.6.3-.11.49-.4.49-.72 0-.43-.35-.78-.78-.78-.17 0-.33.06-.46.11-.98.34-2.03.52-3.12.52-4.58 0-8.32-3.74-8.32-8.32S7.42 3.89 12 3.89s8.32 3.74 8.32 8.32c0 .71-.09 1.4-.26 2.06-.05.19.02.39.18.52.16.13.37.16.56.08.75-.29 1.42-.77 1.96-1.42',
        tags: ['读谱能力', '音程识别', '和声感知', '节奏理解'],
        displayMode: 'theory', // 理论模式
        subOptions: [
            { name: '基础乐理', metrics: ['音符识别', '调式音阶', '音程关系', '和弦结构'] },
            { name: '视唱练耳', metrics: ['音高听辨', '节奏听写', '旋律记忆', '和声听辨'] },
            { name: '作品分析', metrics: ['曲式结构', '和声进行', '主题发展', '风格特征'] },
            { name: '即兴训练', metrics: ['音阶即兴', '和声即兴', '节奏变奏', '风格模仿'] }
        ]
    }
];