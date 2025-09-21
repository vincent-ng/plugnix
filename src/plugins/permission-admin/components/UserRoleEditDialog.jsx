import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/framework/components/ui/dialog';
import { Button } from '@/framework/components/ui/button';
import { Checkbox } from '@/framework/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/framework/components/ui/avatar';
import { Badge } from '@/framework/components/ui/badge';
import { Card, CardContent } from '@/framework/components/ui/card';
import { User, Shield } from 'lucide-react';
import { permissionAdminAPI } from '../services/api';

const UserRoleEditDialog = ({ user, open, onOpenChange, onSave }) => {
  const { t } = useTranslation('permission-admin');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // 加载可用角色
  useEffect(() => {
    if (open) {
      loadAvailableRoles();
    }
  }, [open]);

  // 初始化选中的角色
  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles || []);
    }
  }, [user]);

  const loadAvailableRoles = async () => {
    try {
      const roles = await permissionAdminAPI.getRoles();
      setAvailableRoles(roles);
    } catch (error) {
      console.error('Failed to load roles:', error);
      // Fallback to mock data
      const mockRoles = [
        { 
          id: 1, 
          name: 'admin', 
          description: t('mockData.roles.admin.description'),
          permissions: ['db.posts.create', 'db.posts.read', 'db.posts.update', 'db.posts.delete', 'db.users.read']
        },
        { 
          id: 2, 
          name: 'editor', 
          description: t('mockData.roles.editor.description'),
          permissions: ['db.posts.create', 'db.posts.read', 'db.posts.update']
        },
        { 
          id: 3, 
          name: 'viewer', 
          description: t('mockData.roles.viewer.description'),
          permissions: ['db.posts.read']
        }
      ];
      setAvailableRoles(mockRoles);
    }
  };

  const handleRoleToggle = (roleName) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleName)) {
        return prev.filter(r => r !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await onSave(user.id, selectedRoles);
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'editor':
        return 'default';
      case 'viewer':
        return 'secondary';
      case 'moderator':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('userRoles.assignRole')}
          </DialogTitle>
          <DialogDescription>
            为用户分配或移除角色权限
          </DialogDescription>
        </DialogHeader>

        {/* 用户信息 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {getUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.roles.length === 0 ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      {t('common.none')}
                    </Badge>
                  ) : (
                    user.roles.map((role) => (
                      <Badge 
                        key={role} 
                        variant={getRoleBadgeVariant(role)}
                        className="text-xs"
                      >
                        {role}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 角色选择 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <h4 className="font-medium">可用角色</h4>
          </div>
          
          <div className="grid gap-3">
            {availableRoles.map((role) => (
              <Card key={role.id} className="cursor-pointer hover:bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.name)}
                      onCheckedChange={() => handleRoleToggle(role.name)}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <label 
                          htmlFor={`role-${role.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {role.name}
                        </label>
                        <Badge variant={getRoleBadgeVariant(role.name)} className="text-xs">
                          {role.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserRoleEditDialog;