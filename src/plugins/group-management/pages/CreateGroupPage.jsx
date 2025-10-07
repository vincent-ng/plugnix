import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/framework/components/ui/button';
import { Input } from '@/framework/components/ui/input';
import { Textarea } from '@/framework/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { ArrowLeft, Users } from 'lucide-react';
import { supabase } from '@/framework/lib/supabase';
import { useGroup } from '@/framework/contexts/GroupContext';
import { toast } from 'sonner';

const CreateGroupPage = () => {
  const { t } = useTranslation('group-management');
  const navigate = useNavigate();
  const { refreshUserGroups } = useGroup();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        throw new Error(t('createGroup.errors.nameRequired'));
      }

      const { data, error } = await supabase.rpc('create_group', {
        p_group_name: formData.name,
        p_group_description: formData.description
      });

      if (error) {
        throw error;
      }

      toast.success(t('createGroup.success.create'), {
        description: t('createGroup.success.createDesc', { groupName: formData.name }),
      });
      await refreshUserGroups();
      navigate('/admin/groups');
    } catch (err) {
      toast.error(t('createGroup.errors.createFailed'), {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和导航 */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/groups"
          className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            {t('createGroup.title')}
          </h1>
        </div>
      </div>

      {/* 创建表单 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('createGroup.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  {t('createGroup.name')} *
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder={t('createGroup.namePlaceholder')}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  {t('createGroup.description')}
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={t('createGroup.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full min-h-[100px]"
                />
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/groups')}
                disabled={loading}
              >
                {t('createGroup.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.name.trim()}
              >
                {loading ? t('createGroup.creating') : t('createGroup.create')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateGroupPage;