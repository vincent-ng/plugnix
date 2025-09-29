import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/framework/components/ui/button';
import { Input } from '@/framework/components/ui/input';
import { Badge } from '@/framework/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/framework/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/framework/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/framework/components/ui/select';
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Crown,
  User,
  Shield,
  Trash2,
  Edit
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/framework/components/ui/dropdown-menu';
import Authorized from '@/framework/components/Authorized';
import {
  getGroupMembers,
  inviteMember,
  removeMember,
  changeMemberRole,
  getAvailableRoles
} from '../services/memberService';
import { toast } from 'sonner';

export default function MembersTab({ groupId, userRole }) {
  const { t } = useTranslation('group-management');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [availableRoles, setAvailableRoles] = useState([]);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      try {
        const memberData = await getGroupMembers(groupId);
        const formattedMembers = memberData.map(member => ({
          id: member.id,
          user_id: member.user_id,
          username: member.user.username,
          email: member.user.email,
          display_name: member.user.display_name,
          avatar_url: member.user.avatar_url,
          role: member.role,
          joined_at: member.joined_at,
          last_active: member.last_active
        }));
        setMembers(formattedMembers);
      } catch (error) {
        toast.error(t('common.error'), {
          description: t('members.errors.loadMembersFailed'),
        });
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [groupId]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await getAvailableRoles(groupId);
        setAvailableRoles(roles);
        if (roles.length > 0) {
          setInviteRole(roles.find(r => r.name === 'Member')?.name || roles[0].name);
        }
      } catch (error) {
        toast.error(t('common.error'), {
          description: t('members.errors.loadRolesFailed'),
        });
      }
    };

    loadRoles();
  }, [groupId]);

  const filteredMembers = members.filter(member =>
    member.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      await inviteMember(groupId, inviteEmail, inviteRole);
      // 重新加载成员列表
      const memberData = await getGroupMembers(groupId);
      const formattedMembers = memberData.map(member => ({
        id: member.id,
        user_id: member.user_id,
        username: member.user.username,
        email: member.user.email,
        display_name: member.user.display_name,
        avatar_url: member.user.avatar_url,
        role: member.role,
        joined_at: member.joined_at,
        last_active: member.last_active
      }));
      setMembers(formattedMembers);

      // 重置表单
      setInviteEmail('');
      setInviteRole(availableRoles.find(r => r.name === 'Member')?.name || availableRoles[0]?.name);
      setInviteDialogOpen(false);
    } catch (error) {
      toast.error(t('common.error'), {
        description: t('members.errors.inviteFailed'),
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm(t('members.confirmRemove'))) {
      try {
        await removeMember(groupId, memberId);
        // 从本地状态中移除成员
        setMembers(prev => prev.filter(m => m.id !== memberId));
      } catch (error) {
        toast.error(t('common.error'), {
          description: t('members.errors.removeFailed'),
        });
      }
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    try {
      await changeMemberRole(groupId, memberId, newRole);
      // 更新本地状态中的成员角色
      setMembers(prev => prev.map(m =>
        m.id === memberId ? { ...m, role: newRole } : m
      ));
    } catch (error) {
      toast.error(t('common.error'), {
        description: t('members.errors.changeRoleFailed'),
      });
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Owner': return <Crown className="h-4 w-4" />;
      case 'Admin': return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'Owner': return 'default';
      case 'Admin': return 'secondary';
      default: return 'outline';
    }
  };

  const canManageMembers = userRole === 'Owner' || userRole === 'Admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('members.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {t('members.totalCount', { count: members.length })}
          </div>
        </div>

        <Authorized permissions="ui.group.member.invite">
          {canManageMembers && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('members.inviteMember')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('members.inviteMember')}</DialogTitle>
                  <DialogDescription>
                    {t('members.inviteDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('members.emailAddress')}
                    </label>
                    <Input
                      type="email"
                      placeholder={t('members.invite.placeholder.email')}
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('members.role')}
                    </label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('members.invite.role')} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map(role => (
                          <SelectItem key={role.name} value={role.name}>
                            {t(`members.roles.${role.name.toLowerCase()}`, role.display_name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleInviteMember}
                    disabled={!inviteEmail.trim() || inviting}
                  >
                    {inviting ? t('common.loading') : t('members.sendInvite')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </Authorized>
      </div>

      {/* 成员列表 */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('members.member')}</TableHead>
              <TableHead>{t('members.role')}</TableHead>
              <TableHead>{t('members.joinedAt')}</TableHead>
              <TableHead>{t('members.lastActive')}</TableHead>
              {canManageMembers && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{member.display_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1 w-fit">
                    {getRoleIcon(member.role)}
                    {t(`members.roles.${member.role.toLowerCase()}`, member.role)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(member.joined_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(member.last_active).toLocaleDateString()}
                </TableCell>
                {canManageMembers && (
                  <TableCell>
                    {member.role !== 'Owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {availableRoles.map(role => (
                            <DropdownMenuItem
                              key={role.name}
                              onClick={() => handleChangeRole(member.id, role.name)}
                              disabled={member.role === role.name}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t('members.changeRoleTo', { role: t(`members.roles.${role.name.toLowerCase()}`, role.display_name) })}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('members.removeMember')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? t('members.noSearchResults') : t('members.noMembers')}
        </div>
      )}
    </div>
  );
}