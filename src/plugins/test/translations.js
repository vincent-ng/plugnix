// Test插件的翻译文件
export default {
  en: {
    title: 'Tailwind CSS Style Test Page',
    colorTest: 'Color Test',
    buttonTest: 'Button Test',
    cardTest: 'Card Test',
    colors: {
      red: 'Red',
      blue: 'Blue',
      green: 'Green',
      yellow: 'Yellow',
      purple: 'Purple',
      pink: 'Pink'
    },
    buttons: {
      primary: 'Primary Button',
      secondary: 'Secondary Button',
      success: 'Success Button',
      danger: 'Danger Button',
      warning: 'Warning Button',
      info: 'Info Button'
    },
    cards: {
      card1: {
        title: 'Card Title 1',
        content: 'This is the first card content, used to display some information or operations.'
      },
      card2: {
        title: 'Card Title 2', 
        content: 'This is the second card content, showcasing different information.'
      },
      card3: {
        title: 'Card Title 3',
        content: 'This is the third card content, demonstrating various use cases.'
      }
    },
    formTest: 'Form Test',
    username: 'Username',
    password: 'Password',
    usernamePlaceholder: 'Please enter username',
    passwordPlaceholder: 'Please enter password',
    submit: 'Submit',
    animationTest: 'Animation Test',
    pulseAnimation: 'Pulse Animation',
    bounceAnimation: 'Bounce Animation',
    spinAnimation: 'Spin Animation',
    responsiveTest: 'Responsive Test',
    responsiveDescription: 'This container will behave differently on different screen sizes:',
    responsive: {
      mobile: 'Mobile',
      tablet: 'Tablet', 
      desktop: 'Desktop',
      large: 'Large',
      oneColumn: '1 column',
      twoColumns: '2 columns',
      fourColumns: '4 columns'
    },
    tabs: {
      basic: 'Basic Tests',
      state: 'State Tests',
      animation: 'Animation Tests'
    },
    stateTest: {
      title: 'Tab State Persistence Test',
      description: 'This section tests whether form inputs and component state are preserved when switching between tabs.',
      formTest: 'Form Input Test',
      inputLabel: 'Text Input',
      inputPlaceholder: 'Enter some text...',
      textareaLabel: 'Textarea Input',
      textareaPlaceholder: 'Enter a longer message...',
      counterTest: 'Counter Test',
      counterDescription: 'Click the buttons to change the counter, then switch tabs to see if the value persists.',
      reset: 'Reset',
      currentValue: 'Current value',
      empty: '(empty)',
      instruction: 'How to test: Fill out the inputs above, change the counter, then switch to another tab and come back. All values should be preserved.'
    }
  },
  zh: {
    title: 'Tailwind CSS 样式测试页面',
    colorTest: '颜色测试',
    buttonTest: '按钮测试',
    cardTest: '卡片测试',
    colors: {
      red: '红色',
      blue: '蓝色',
      green: '绿色',
      yellow: '黄色',
      purple: '紫色',
      pink: '粉色'
    },
    buttons: {
      primary: '主要按钮',
      secondary: '次要按钮',
      success: '成功按钮',
      danger: '危险按钮',
      warning: '警告按钮',
      info: '信息按钮'
    },
    cards: {
      card1: {
        title: '卡片标题 1',
        content: '这是第一个卡片内容，用于显示一些信息或操作。'
      },
      card2: {
        title: '卡片标题 2',
        content: '这是第二个卡片内容，展示不同的信息。'
      },
      card3: {
        title: '卡片标题 3',
        content: '这是第三个卡片内容，演示各种用例。'
      }
    },
    formTest: '表单测试',
    username: '用户名',
    password: '密码',
    usernamePlaceholder: '请输入用户名',
    passwordPlaceholder: '请输入密码',
    submit: '提交',
    animationTest: '动画测试',
    pulseAnimation: '脉冲动画',
    bounceAnimation: '弹跳动画',
    spinAnimation: '旋转动画',
    responsiveTest: '响应式测试',
    responsiveDescription: '这个容器在不同屏幕尺寸下会有不同的表现：',
    responsive: {
      mobile: '移动端',
      tablet: '平板端',
      desktop: '桌面端', 
      large: '大屏幕',
      oneColumn: '1列',
      twoColumns: '2列',
      fourColumns: '4列'
    },
    tabs: {
      basic: '基础测试',
      state: '状态测试',
      animation: '动画测试'
    },
    stateTest: {
      title: 'Tab状态保持测试',
      description: '此部分测试在切换标签页时表单输入和组件状态是否被保留。',
      formTest: '表单输入测试',
      inputLabel: '文本输入',
      inputPlaceholder: '请输入一些文本...',
      textareaLabel: '文本域输入',
      textareaPlaceholder: '请输入较长的消息...',
      counterTest: '计数器测试',
      counterDescription: '点击按钮改变计数器，然后切换标签页查看数值是否保持。',
      reset: '重置',
      currentValue: '当前值',
      empty: '(空)',
      instruction: '测试方法：填写上面的输入框，改变计数器，然后切换到其他标签页再回来。所有数值都应该被保留。'
    }
  }
};