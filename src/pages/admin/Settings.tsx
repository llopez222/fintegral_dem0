import { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Puzzle, 
  Trash2, 
  Plus, 
  Save, 
  Upload,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

// Initial departments
const INITIAL_DEPARTMENTS = [
  { id: 'dept_1', name: 'Department 1', description: 'Main lending department' },
  { id: 'dept_2', name: 'Department 2', description: 'Secondary department' },
  { id: 'dept_3', name: 'Department 3', description: 'Processing center' },
  { id: 'sales', name: 'Sales', description: 'Sales and origination' },
  { id: 'operations', name: 'Operations', description: 'Operations team' },
  { id: 'underwriting', name: 'Underwriting', description: 'Underwriting department' },
];

// Email templates
const EMAIL_TEMPLATES = [
  { id: 'welcome', name: 'Welcome Email', enabled: true },
  { id: 'password_reset', name: 'Password Reset', enabled: true },
  { id: 'loan_submitted', name: 'Loan Submitted', enabled: true },
  { id: 'loan_approved', name: 'Loan Approved', enabled: true },
  { id: 'task_assigned', name: 'Task Assigned', enabled: false },
  { id: 'daily_digest', name: 'Daily Digest', enabled: true },
];

// Integrations
const INTEGRATIONS = [
  { id: 'credit_bureau', name: 'Credit Bureau API', status: 'connected', icon: '🔒' },
  { id: 'docu_sign', name: 'DocuSign', status: 'disconnected', icon: '📝' },
  { id: 'salesforce', name: 'Salesforce CRM', status: 'disconnected', icon: '☁️' },
  { id: 'plaid', name: 'Plaid', status: 'connected', icon: '🏦' },
];

export function Settings() {
  const [companyName, setCompanyName] = useState('Fintegral Lending');
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [emailTemplates, setEmailTemplates] = useState(EMAIL_TEMPLATES);
  const [integrations] = useState(INTEGRATIONS);
  
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveGeneral = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddDepartment = () => {
    if (!newDeptName) return;
    
    const newDept = {
      id: `dept_${Date.now()}`,
      name: newDeptName,
      description: newDeptDesc,
    };
    
    setDepartments(prev => [...prev, newDept]);
    setNewDeptName('');
    setNewDeptDesc('');
    setIsAddDeptModalOpen(false);
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const handleToggleEmail = (id: string) => {
    setEmailTemplates(prev =>
      prev.map(t =>
        t.id === id ? { ...t, enabled: !t.enabled } : t
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-blue-950">System Settings</h1>
        <p className="text-slate-500">Configure your organization settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <Building2 className="w-4 h-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-2">
            <Mail className="w-4 h-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Puzzle className="w-4 h-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm">
                      Upload Logo
                    </Button>
                    <p className="text-xs text-slate-500">Recommended: 200x200px, PNG or SVG</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveGeneral} 
                  className="bg-blue-800 hover:bg-blue-900"
                  disabled={saveSuccess}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments */}
        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Departments</CardTitle>
                <CardDescription>Manage your organization departments</CardDescription>
              </div>
              <Button onClick={() => setIsAddDeptModalOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-slate-900">{dept.name}</h4>
                      <p className="text-sm text-slate-500">{dept.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteDepartment(dept.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="emails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure which emails are sent automatically</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <span className="font-medium text-slate-900">{template.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={template.enabled ? 'default' : 'secondary'}
                        className={
                          template.enabled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }
                      >
                        {template.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Switch
                        checked={template.enabled}
                        onCheckedChange={() => handleToggleEmail(template.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
              <CardDescription>Connect with your favorite tools and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <h4 className="font-medium text-slate-900">{integration.name}</h4>
                        <Badge
                          variant="outline"
                          className={
                            integration.status === 'connected'
                              ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
                              : 'text-slate-500 border-slate-200'
                          }
                        >
                          {integration.status === 'connected' ? 'Connected' : 'Not Connected'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant={integration.status === 'connected' ? 'outline' : 'default'}
                      size="sm"
                      className={
                        integration.status !== 'connected'
                          ? 'bg-blue-800 hover:bg-blue-900'
                          : ''
                      }
                      onClick={() => alert('Integration configuration coming soon')}
                    >
                      {integration.status === 'connected' ? 'Configure' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Need a custom integration?</p>
                  <p className="text-sm text-amber-700">
                    Contact our team to discuss custom integrations for your specific needs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Department Modal */}
      <Dialog open={isAddDeptModalOpen} onOpenChange={setIsAddDeptModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deptName">Department Name</Label>
              <Input
                id="deptName"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="e.g., Quality Assurance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deptDesc">Description</Label>
              <Input
                id="deptDesc"
                value={newDeptDesc}
                onChange={(e) => setNewDeptDesc(e.target.value)}
                placeholder="Brief description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDepartment} className="bg-blue-800 hover:bg-blue-900">
              Add Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
