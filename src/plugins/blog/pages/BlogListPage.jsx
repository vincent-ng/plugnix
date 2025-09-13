import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BlogListPage = () => {
  const { t } = useTranslation(['blog', 'common']);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      // 这里使用模拟数据，实际项目中应该从 Supabase 获取
      const mockBlogs = [
        {
          id: 1,
          title: '欢迎使用插件化博客系统',
          summary: '这是一个基于插件架构的现代化博客系统，支持灵活的扩展和定制。',
          author: 'Admin',
          publishDate: '2024-01-15',
          status: 'published',
          category: '技术'
        },
        {
          id: 2,
          title: 'React 插件架构最佳实践',
          summary: '探讨如何在 React 应用中实现灵活的插件系统，提高代码的可维护性和扩展性。',
          author: 'Developer',
          publishDate: '2024-01-14',
          status: 'published',
          category: '开发'
        },
        {
          id: 3,
          title: '国际化在现代 Web 应用中的应用',
          summary: '介绍如何在 React 应用中实现完整的国际化解决方案。',
          author: 'Designer',
          publishDate: '2024-01-13',
          status: 'draft',
          category: '设计'
        }
      ];
      
      setBlogs(mockBlogs);
    } catch (err) {
      setError(t('fetchFailed'));
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirmDelete'))) {
      try {
        // 实际项目中应该调用 Supabase API
        setBlogs(blogs.filter(blog => blog.id !== id));
      } catch (err) {
        setError(t('deleteFailed'));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-muted-foreground">
          {t('common:loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">
          {t('list')}
        </h1>
        <Link
          to="/admin/blog/create"
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          {t('create')}
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 博客列表 */}
      <div className="bg-card text-card-foreground shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-border">
          {blogs.map((blog) => (
            <li key={blog.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Link
                      to={`/admin/blog/${blog.id}`}
                      className="text-lg font-medium text-primary hover:text-primary/80"
                    >
                      {blog.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {blog.summary}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <span>{t('author')}: {blog.author}</span>
                      <span className="mx-2">•</span>
                      <span>{t('publishDate')}: {blog.publishDate}</span>
                      <span className="mx-2">•</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        blog.status === 'published' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {blog.status === 'published' ? t('publish') : t('draft')}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{t('category')}: {blog.category}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/blog/${blog.id}`}
                      className="text-primary hover:text-primary/80 text-sm"
                    >
                      {t('common:edit')}
                    </Link>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="text-destructive hover:text-destructive/80 text-sm"
                    >
                      {t('common:delete')}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {blogs.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {t('noBlogsFound')}
          </div>
          <Link
            to="/admin/blog/create"
            className="mt-4 inline-block bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {t('create')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default BlogListPage;