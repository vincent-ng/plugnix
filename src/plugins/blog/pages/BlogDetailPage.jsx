import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BlogDetailPage = () => {
  const { t } = useTranslation(['blog', 'common']);
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      // 模拟数据，实际项目中应该从 Supabase 获取
      const mockBlog = {
        id: parseInt(id),
        title: id === '1' ? '欢迎使用插件化博客系统' : 
               id === '2' ? 'React 插件架构最佳实践' : 
               '国际化在现代 Web 应用中的应用',
        content: `这是博客 ${id} 的详细内容。\n\n在这个现代化的插件系统中，我们实现了以下特性：\n\n1. **模块化设计**: 每个插件都是独立的模块\n2. **依赖反转**: 框架不依赖具体插件\n3. **国际化支持**: 完整的多语言解决方案\n4. **主题系统**: 支持明暗主题切换\n\n这种架构设计使得系统具有很好的可扩展性和可维护性。`,
        summary: '这是一个基于插件架构的现代化博客系统。',
        author: 'Admin',
        publishDate: '2024-01-15',
        status: 'published',
        category: '技术',
        tags: ['React', '插件', '架构', '前端']
      };
      
      setBlog(mockBlog);
    } catch (err) {
      setError('获取博客详情失败');
      console.error('Error fetching blog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('确定要删除这篇博客吗？')) {
      try {
        // 实际项目中应该调用 Supabase API
        navigate('/admin/blog');
      } catch (err) {
        setError('删除博客失败');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          {t('common:loading')}
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          {error || '博客不存在'}
        </div>
        <Link
          to="/admin/blog"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          返回博客列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 导航和操作 */}
      <div className="flex justify-between items-center">
        <Link
          to="/admin/blog"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
        >
          ← 返回博客列表
        </Link>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/admin/blog/${id}/edit`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {t('edit')}
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {t('delete')}
          </button>
        </div>
      </div>

      {/* 博客内容 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          {/* 标题 */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {blog.title}
          </h1>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-6 space-x-4">
            <span>{t('author')}: {blog.author}</span>
            <span>{t('publishDate')}: {blog.publishDate}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              blog.status === 'published' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {blog.status === 'published' ? t('publish') : t('draft')}
            </span>
            <span>{t('category')}: {blog.category}</span>
          </div>

          {/* 标签 */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-6">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                {t('tags')}:
              </span>
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs mr-2"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 摘要 */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t('summary')}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {blog.summary}
            </p>
          </div>

          {/* 正文内容 */}
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('content')}
            </h3>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {blog.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;