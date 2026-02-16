import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Plus,
  Bell,
  Search,
  Menu,
  X,
  MessageCircle,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  User,
  LogOut,
  ChevronRight,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/context/UserContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';


interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onCreateLoan: () => void;
  onToggleChatbot: () => void;
  pendingTasks: number;
  chatbotOpen: boolean;
}

export function Layout({ 
  children, 
  currentView, 
  onViewChange, 
  onCreateLoan, 
  onToggleChatbot,
  pendingTasks,
  chatbotOpen 
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(true);
  const navigate = useNavigate();
  const { currentUser, hasPermission, logout, isImpersonating, originalUser } = useUser();

  if (!currentUser) return null;

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  // Navigation items with permission checks
  const mainNavItems = [
    { id: 'pipeline', label: 'Pipeline', icon: LayoutDashboard, permission: 'viewOwnPipeline' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, permission: 'viewOwnPipeline' },
    { id: 'ai-goals', label: 'AI Goals', icon: Sparkles, permission: 'viewOwnPipeline' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'viewAnalytics' },
  ].filter(item => hasPermission(item.permission as keyof typeof currentUser.permissions));

  const adminNavItems = [
    { id: 'admin-users', label: 'Users', path: '/admin/users', icon: Users, permission: 'manageUsers' },
    { id: 'admin-settings', label: 'Settings', path: '/admin/settings', icon: Settings, permission: 'systemSettings' },
  ].filter(item => hasPermission(item.permission as keyof typeof currentUser.permissions));

  const canAccessAdmin = adminNavItems.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-800 to-blue-950 rounded-lg flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 40 40" className="w-7 h-7">
                  <path d="M8 8 L20 4 L32 8 L32 24 L20 28 L8 24 Z" fill="none" stroke="white" strokeWidth="2"/>
                  <path d="M8 8 L20 12 L20 28" fill="none" stroke="white" strokeWidth="2"/>
                  <path d="M20 12 L32 8" fill="none" stroke="white" strokeWidth="2"/>
                  <path d="M14 18 L14 22 M14 20 L18 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-bold text-xl text-blue-950">Fintegral</span>
            </div>
            <button 
              className="lg:hidden ml-auto text-slate-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Create Loan Button */}
          <div className="p-4">
            <Button 
              onClick={onCreateLoan}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Loan
            </Button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-800' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} />
                  {item.label}
                  {item.id === 'tasks' && pendingTasks > 0 && (
                    <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-700 text-xs">
                      {pendingTasks}
                    </Badge>
                  )}
                </button>
              );
            })}

            {/* Admin Section */}
            {canAccessAdmin && (
              <Collapsible open={adminOpen} onOpenChange={setAdminOpen} className="mt-4">
                <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    Admin
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${adminOpen ? 'rotate-90' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigate(item.path);
                          setSidebarOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 pl-11 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-slate-500" />
                        {item.label}
                      </button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            )}
          </nav>

          {/* Stop Impersonating button - only when impersonating */}
          {isImpersonating && originalUser && (
            <div className="p-4 border-t border-slate-200">
              <button
                onClick={() => navigate('/pipeline')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Stop Impersonating
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search loans, borrowers..."
                className="pl-9 w-64 lg:w-80"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-950 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">{currentUser.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-slate-900">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                {canAccessAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                    <Users className="w-4 h-4 mr-2" />
                    User Management
                  </DropdownMenuItem>
                )}
                {hasPermission('systemSettings') && (
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {pendingTasks > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 pb-24">
          {children}
        </main>
      </div>

      {/* Chatbot Toggle Button */}
      {!chatbotOpen && (
        <button
          onClick={onToggleChatbot}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-800 to-blue-950 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Ask AI</span>
          {pendingTasks > 0 && (
            <span className="w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {pendingTasks}
            </span>
          )}
        </button>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
