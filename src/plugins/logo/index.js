import CustomLogo from './components/CustomLogo';
import en from './i18n/en';
import zh from './i18n/zh';

export default function registerPluginLogo({ registerLogo, registerI18nNamespace }) {
  // 注册i18n命名空间
  registerI18nNamespace('logo', { en, zh });
  
  registerLogo({
    component: CustomLogo,
  });
}