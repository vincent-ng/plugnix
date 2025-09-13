import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CreateBlogPage = () => {
  const { t } = useTranslation(['blog', 'common']);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: '',
    tags: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    try {
      // 验证表单
      if (!formData.title.trim()) {
        throw new Error('标题不能为空');
      }
      if (!formData.content.trim()) {
        throw new Error('内容不能为空');
      }

      // 处理标签
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const blogData = {
        ...formData,
        tags,
        author: 'Current User', // 实际项目中应该从认证上下文获取
        publishDate: new Date().toISOString().split('T')[0]
      };

      // 实际项目中应该调用 Supabase API
      console.log('Creating blog:', blogData);
      
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/admin/blog');
    } catch (err) {
      setError(err.message || '创建博客失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和导航 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">
          {t('create')}
        </h1>
        <Link
          to="/admin/blog"
          className="text-primary hover:text-primary/80 text-sm"
        >
          ← 返回博客列表
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 创建表单 */}
      <div className="bg-card text-card-foreground shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 标题 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              标题 *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="请输入博客标题"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* 摘要 */}
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-foreground mb-2">
              {t('summary')}
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={3}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="请输入博客摘要"
              value={formData.summary}
              onChange={handleChange}
            />
          </div>

          {/* 分类和状态 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                {t('category')}
              </label>
              <select
                id="category"
                name="category"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">选择分类</option>
                <option value="技术">技术</option>
                <option value="开发">开发</option>
                <option value="设计">设计</option>
                <option value="产品">产品</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
                状态
              </label>
              <select
                id="status"
                name="status"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="draft">{t('draft')}</option>
                <option value="published">{t('publish')}</option>
              </select>
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-2">
              {t('tags')}
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="请输入标签，用逗号分隔"
              value={formData.tags}
              onChange={handleChange}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              多个标签请用逗号分隔，例如：React, 前端, 架构
            </p>
          </div>

          {/* 内容 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
              {t('content')} *
            </label>
            <textarea
              id="content"
              name="content"
              rows={12}
              required
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="请输入博客内容"
              value={formData.content}
              onChange={handleChange}
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/admin/blog"
              className="px-4 py-2 border border-input rounded-md text-sm font-medium text-foreground hover:bg-muted"
            >
              {t('common:cancel')}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common:loading') : t('common:save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlogPage;