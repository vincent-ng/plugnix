import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from "@/framework/contexts/AuthenticationContext.jsx";
import { RegisterForm } from '../components/RegisterForm.jsx';

const RegisterPage = () => {
  const { t } = useTranslation('auth');
  const { register, resendVerificationEmail } = useAuthentication();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // 验证密码匹配
    if (formData.password !== formData.confirmPassword) {
      setError(t('errors.passwordMismatch'));
      setLoading(false);
      return;
    }

    // 验证密码长度
    if (formData.password.length < 6) {
      setError(t('errors.passwordTooShort'));
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData.email, formData.password, {
        name: formData.name
      });
      
      if (result.success) {
        // 提示用户前往邮箱完成验证
        setSuccess(t('register.registerSuccess'));
      } else {
        setError(result.error || t('errors.registerFailed'));
      }
    } catch (err) {
      setError(t('errors.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!formData.email) return;
    const { success, error } = await resendVerificationEmail(formData.email);
    if (!success) {
      setError(error || t('errors.registerFailed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <RegisterForm
          formData={formData}
          loading={loading}
          error={error}
          success={success}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onResendEmail={handleResendEmail}
        />
      </div>
    </div>
  );
};

export default RegisterPage;