# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production version with code splitting
- `npm run lint` - Run ESLint checks (must pass before committing)
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run preview` - Preview production build on port 4173
- `npm run analyze` - Analyze bundle size and dependencies

## Architecture Overview

This is a **plugin-based React framework** built with Vite that supports dynamic plugin loading and management. The core architecture separates framework functionality from plugin features.

### Core Framework Structure

- **Framework Core**: `src/framework/` - Contains the main application infrastructure
  - `api/` - Plugin registration system and APIs
  - `components/` - Reusable UI components (shadcn/ui based)
  - `contexts/` - React contexts for authentication, themes, groups, tabs
  - `layouts/` - Application layouts (AdminLayout, PublicLayout)
  - `i18n/` - Internationalization configuration

- **Plugin System**: `src/plugins/` - Automatically discovered and loaded plugins
  - Each plugin has its own `index.js` entry file
  - Plugins register routes, menu items, i18n resources, and permissions
  - Auto-discovery via `import.meta.glob()` in `src/plugins/index.js`

### Plugin Architecture

Plugins are the primary way to extend application functionality. Each plugin:

1. **Must export a default registration function** that receives framework APIs:
   ```javascript
   export default function registerMyPlugin({ registerRoute, registerMenuItem, registerI18nNamespace, registerPermission })
   ```

2. **Can register multiple types of resources**:
   - Routes with permission guards
   - Menu items (admin, public, user positions)
   - Internationalization namespaces
   - Permission definitions

3. **Is automatically discovered** by the framework - just place in `src/plugins/` directory

### Permission System

The framework uses a **unified group-based RBAC model**:

- **User Groups**: Regular groups for project/team collaboration
- **System Group**: Special group (ID: `00000000-0000-0000-0000-000000000001`) for global admin permissions
- **Template Roles**: Predefined roles (Owner, Member) that can be applied to any group
- **RLS Policies**: All database access controlled by Row Level Security using `check_group_permission()` function

### Key Framework APIs

- `registerRoute({ path, component, permissions })` - Register protected routes
- `registerMenuItem(menuItem, position)` - Register menu items (admin/public/user)
- `registerI18nNamespace(pluginName, translations)` - Register i18n resources
- `registerPermission({ name, description })` - Declare permission requirements

### UI Component Library

- Built with **shadcn/ui** components in `src/framework/components/ui/`
- **Tailwind CSS** for styling with dark/light theme support
- **Radix UI** primitives for accessibility
- All components support both light and dark themes automatically

### Authentication & Database

- **Supabase** integration for authentication and database
- **AuthenticationContext** provides user management
- **GroupContext** manages group membership and permissions
- Direct database access with RLS policies for security

## Development Guidelines

1. **Plugin Development**: 
   - Always use the registration APIs, don't import framework internals directly
   - Follow the plugin contract defined in `docs/design/guide-plugin-development.md`
   - Include i18n support for all user-facing text

2. **UI Components**:
   - Use existing shadcn/ui components from `src/framework/components/ui/`
   - Test in both light and dark themes
   - Follow the established component patterns

3. **Permission Management**:
   - Declare all required permissions using `registerPermission()`
   - Use the `Authorized` component or `usePermission()` hook for permission checks
   - Database operations must use RLS policies with `check_group_permission()`

4. **Code Quality**:
   - Run `npm run lint` before committing
   - Ensure TypeScript type checking passes
   - Follow existing code patterns and conventions

## Database Schema

The framework uses Supabase with a sophisticated permission system:

- Core tables: `groups`, `permissions`, `roles`, `role_permissions`, `group_users`
- Helper functions: `check_group_permission()`, `create_rls_policy()`
- All tables should include `group_id` for permission scoping
- Use the provided RLS helper functions for security

## Important Files

- `src/framework/api/index.js` - Main plugin API definitions
- `src/framework/api/registry.js` - Central registry for all plugin registrations
- `src/App.jsx` - Main application with dynamic routing and error boundaries
- `docs/design/` - Architecture documentation and guides
- `.trae/rules/project_rules.md` - Project-specific development rules