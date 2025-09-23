import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from "@/framework/contexts/AuthenticationContext.jsx";
import { RegisterForm } from '../components/register-form';

const RegisterPage = () => {
  const { t } = useTranslation('auth');
  const { register } = useAuthentication();
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
        try {
          // 注册成功，创建默认群组
          const groupName = `${formData.email.split('@')[0]}'s Group`;
          const { error: rpcError } = await supabase.rpc('create_group', { p_group_name: groupName });
          if (rpcError) {
            console.error('创建群组失败:', rpcError);
            // 即便创建群组失败，也只在控制台打印错误，不影响用户登录流程
          }
        } catch (e) {
          console.error('调用create_group RPC时出错:', e);
        }

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