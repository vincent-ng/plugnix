import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/framework/contexts/AuthContext.jsx";
import { RegisterForm } from '../components/register-form';

const RegisterPage = () => {
  const { t } = useTranslation('auth');
  const { register } = useAuth();
  const navigate = useNavigate();
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
      setError(t('passwordMismatch'));
      setLoading(false);
      return;
    }

    // 验证密码长度
    if (formData.password.length < 6) {
      setError(t('passwordTooShort'));
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData.email, formData.password, {
        name: formData.name
      });
      
      if (result.success) {
        setSuccess(t('registerSuccess'));
        // 延迟跳转到登录页面
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || t('registerFailed'));
      }
    } catch (err) {
      setError(t('registerFailed'));
    } finally {
      setLoading(false);
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
        />
      </div>
    </div>
  );
};

export default RegisterPage;