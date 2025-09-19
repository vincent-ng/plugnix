import React from 'react';
import { useAuth } from '@/framework/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const RoleBasedGuard = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const { t } = useTranslation(['common']);

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  console.log('RoleBasedGuard - User role:', user.role, 'required:', roles);
  if (!roles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold text-destructive">{t('unauthorized')}</h1>
        <p className="text-muted-foreground">{t('unauthorizedMessage')}</p>
      </div>
    );
  }

  return children;
};

export default RoleBasedGuard;