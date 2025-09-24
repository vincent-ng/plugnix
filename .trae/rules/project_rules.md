1. 这是一个插件框架，设计文档在docs/README.md，里面有详细的框架介绍，以及插件的契约。编码时应确保代码符合文档里描述的软件架构。
2. shadcn的components放在src/framework/components目录下。
3. 框架样式是有light和dark两种Theme，编写插件时需要考虑到这两种Theme的样式。
4. 框架是支持i18n的，编写插件时需要把所有文字用框架的i18n来管理。
5. 数据库采用supabase，权限管理采用supabase的rls，前端可以直接安全地操作数据库