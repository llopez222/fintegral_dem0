import { useState } from 'react';
import { User, Mail, Building2, Shield, Lock, Camera, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/context/UserContext';
import { getRoleDisplayName } from '@/mocks/users';
import { PermissionsEditor } from '@/components/admin/PermissionsEditor';

export function Profile() {
  const { currentUser } = useUser();
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  if (!currentUser) return null;

  const handleProfileSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handlePasswordChange = () => {
    setPasswordError(null);
    
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Mock password change
    setPasswordSuccess(true);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const getPermissionCount = () => {
    return Object.values(currentUser.permissions).filter(Boolean).length;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-800 to-blue-950 rounded-full flex items-center justify-center">
          <User className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-blue-950">{currentUser.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-blue-100 text-blue-700">
              {getRoleDisplayName(currentUser.role)}
            </Badge>
            <span className="text-slate-500">•</span>
            <span className="text-slate-600">
              {currentUser.department === 'all' ? 'All Departments' : currentUser.department}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2">
            <Lock className="w-4 h-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Shield className="w-4 h-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300">
                  <Camera className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="department"
                    value={currentUser.department === 'all' ? 'All Departments' : currentUser.department}
                    disabled
                    className="pl-9 bg-slate-50"
                  />
                </div>
                <p className="text-xs text-slate-500">Contact your administrator to change department</p>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleProfileSave}
                  className="bg-blue-800 hover:bg-blue-900"
                  disabled={saveSuccess}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-sm text-emerald-600">
                  <Check className="w-4 h-4" />
                  Password updated successfully
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-slate-500">Must be at least 6 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handlePasswordChange}
                  className="bg-blue-800 hover:bg-blue-900"
                >
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Permissions</CardTitle>
              <CardDescription>
                You have {getPermissionCount()} permissions granted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(currentUser.permissions).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    viewOwnPipeline: 'View Own Pipeline',
                    viewDepartmentPipeline: 'View Department Pipeline',
                    viewAllDepartments: 'View All Departments',
                    manageUsers: 'Manage Users',
                    manageRoles: 'Manage Roles',
                    editAnyLoan: 'Edit Any Loan',
                    viewAnalytics: 'View Analytics',
                    systemSettings: 'System Settings',
                    impersonateUsers: 'Impersonate Users',
                  };
                  
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        value ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          value ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                      <span className={value ? 'text-slate-900' : 'text-slate-500'}>
                        {labels[key] || key}
                      </span>
                      {value && <Badge className="ml-auto bg-emerald-100 text-emerald-700">Granted</Badge>}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Permissions are managed by your administrator. 
                  If you need additional access, please contact your manager.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Permissions Modal (read-only) */}
      <PermissionsEditor
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        onSave={() => {}}
        user={currentUser}
        readOnly
      />
    </div>
  );
}
