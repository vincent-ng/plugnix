import { useTranslation } from 'react-i18next';

const AboutPage = () => {
  const { t } = useTranslation('about');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="text-lg">
        {t('description')}
      </p>
    </div>
  );
};

export default AboutPage;