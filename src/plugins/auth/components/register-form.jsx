import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from "@/framework/components/lib/utils"
import { Button } from "@/framework/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/framework/components/ui/card"
import { Input } from "@/framework/components/ui/input"
import { Label } from "@/framework/components/ui/label"

export function RegisterForm({
  className,
  formData,
  loading,
  error,
  success,
  onSubmit,
  onChange,
  ...props
}) {
  const { t } = useTranslation('auth');

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('register.title')}</CardTitle>
          <CardDescription>
            {t('register.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('register.name')}</Label>
                <Input 
                  id="name" 
                  name="name"
                  type="text" 
                  placeholder={t('register.namePlaceholder')}
                  value={formData?.name || ''}
                  onChange={onChange}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t('register.email')}</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder={t('register.emailPlaceholder')} 
                  value={formData?.email || ''}
                  onChange={onChange}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t('register.password')}</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  placeholder={t('register.passwordPlaceholder')}
                  value={formData?.password || ''}
                  onChange={onChange}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password" 
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  value={formData?.confirmPassword || ''}
                  onChange={onChange}
                  required 
                />
              </div>
              
              {error && (
                <div className="text-destructive text-sm text-center">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="text-green-600 text-sm text-center">
                  {success}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : t('register.createButton')}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t('register.alreadyHaveAccount')}{" "}
              <Link to="/login" className="underline underline-offset-4 text-primary hover:text-primary/80">
                {t('register.signIn')}
              </Link>
            </div>
            <div className="mt-2 text-center text-sm">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                {t('common.backToHome')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}