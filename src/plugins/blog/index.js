import BlogListPage from './pages/BlogListPage.jsx';
import BlogDetailPage from './pages/BlogDetailPage.jsx';
import CreateBlogPage from './pages/CreateBlogPage.jsx';

// 博客插件的翻译资源
const translations = {
  en: {
    title: 'Blog Management',
    list: 'Blog List',
    detail: 'Blog Detail',
    create: 'Create Blog',
    edit: 'Edit Blog',
    delete: 'Delete Blog',
    publish: 'Publish',
    draft: 'Draft',
    author: 'Author',
    publishDate: 'Publish Date',
    content: 'Content',
    summary: 'Summary',
    tags: 'Tags',
    category: 'Category',
    status: 'Status',
    published: 'Published',
    actions: 'Actions',
    confirmDelete: 'Are you sure you want to delete this blog?',
    deleteSuccess: 'Blog deleted successfully',
    deleteFailed: 'Failed to delete blog',
    fetchFailed: 'Failed to fetch blog list',
    noBlogsFound: 'No blog articles found'
  },
  zh: {
    title: '博客管理',
    list: '博客列表',
    detail: '博客详情',
    create: '创建博客',
    edit: '编辑博客',
    delete: '删除博客',
    publish: '发布',
    draft: '草稿',
    author: '作者',
    publishDate: '发布日期',
    content: '内容',
    summary: '摘要',
    tags: '标签',
    category: '分类',
    status: '状态',
    published: '已发布',
    actions: '操作',
    confirmDelete: '确定要删除这篇博客吗？',
    deleteSuccess: '博客删除成功',
    deleteFailed: '删除博客失败',
    fetchFailed: '获取博客列表失败',
    noBlogsFound: '暂无博客文章'
  }
};

// 博客插件注册函数
export default function registerBlogPlugin({ registerRoute, registerAdminMenuItem, registerI18nNamespace }) {
  // 注册国际化资源
  registerI18nNamespace('blog', translations);

  // 注册路由
  registerRoute({
    path: '/admin/blog',
    component: BlogListPage,
    exact: true
  });

  registerRoute({
    path: '/admin/blog/create',
    component: CreateBlogPage,
    exact: true
  });

  registerRoute({
    path: '/admin/blog/:id',
    component: BlogDetailPage,
    exact: true
  });

  // 注册菜单项
  registerAdminMenuItem({
    key: 'blog',
    label: 'blog:title',
    path: '/admin/blog',
    icon: '📝',
    order: 1
  });

  console.log('Blog plugin registered successfully');
}