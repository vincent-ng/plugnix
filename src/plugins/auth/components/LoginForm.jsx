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

export function LoginForm({
  className,
  formData,
  loading,
  error,
  onSubmit,
  onChange,
  onGoogleLogin,
  onForgotPassword,
  ...props
}) {
  const { t } = useTranslation('auth');
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
            <CardDescription>
              {t('login.description')}
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('login.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={formData?.email || ''}
                  onChange={(e) => onChange?.('email', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t('login.password')}</Label>
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    {t('login.forgotPassword')}
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData?.password || ''}
                  onChange={(e) => onChange?.('password', e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                onClick={onSubmit}
              >
                {loading ? t('common.loading') : t('login.loginButton')}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={onGoogleLogin}
                disabled={loading}
              >
                {t('login.loginWithGoogle')}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t('login.noAccount')}{" "}
              <Link to="/register" className="underline underline-offset-4">
                {t('login.signUp')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
