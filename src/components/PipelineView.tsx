import { useState, useMemo, useEffect } from 'react';
import { 
  MoreHorizontal, 
  Filter, 
  CheckSquare, 
  DollarSign,
  ChevronRight,
  Bot,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  ArrowUpRight,
  Home,
  Users,
  Target,
  Check,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUser } from '@/context/UserContext';
import { mockUsers } from '@/mocks/users';
import { PipelineTabs, type PipelineViewType } from '@/components/PipelineTabs';
import type { Loan, LoanStatus, Task, AIGoal } from '@/types';

interface PipelineViewProps {
  loans: Loan[];
  tasks: Task[];
  goals: AIGoal[];
  onLoanClick: (loan: Loan) => void;
  onBulkAction: (action: string, loanIds: string[], data?: any) => void;
  onUpdateStatus: (loanId: string, status: LoanStatus) => void;
  onCreateAIGoal: (loanId: string) => void;
  onAssignLoan?: (loanId: string, userId: string) => void;
}

const statusConfig: Record<LoanStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  draft: { label: 'Draft', color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-200' },
  submitted: { label: 'Submitted', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
  in_review: { label: 'In Review', color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-200' },
  conditions: { label: 'Conditions', color: 'text-orange-700', bgColor: 'bg-orange-100', borderColor: 'border-orange-200' },
  approved: { label: 'Approved', color: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-200' },
  denied: { label: 'Denied', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-200' },
  closed: { label: 'Closed', color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-200' },
};

const loanPurposeLabels: Record<string, string> = {
  purchase: 'Purchase',
  refinance_rate_term: 'Refinance (Rate/Term)',
  refinance_cash_out: 'Refinance (Cash Out)',
  construction: 'Construction',
  home_equity: 'Home Equity',
};

// Get user name by ID
const getUserNameById = (userId?: string): string => {
  if (!userId) return 'Unassigned';
  const user = mockUsers.find(u => u.id === userId);
  return user?.name || 'Unknown';
};

export function PipelineView({ 
  loans, 
  tasks,
  goals,
  onLoanClick, 
  onBulkAction, 
  onUpdateStatus,
  onCreateAIGoal,
  onAssignLoan
}: PipelineViewProps) {
  const { currentUser, isManager } = useUser();
  const [activeView, setActiveView] = useState<PipelineViewType>('my');
  const [selectedLoans, setSelectedLoans] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoanForActions, setSelectedLoanForActions] = useState<Loan | null>(null);
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Redirect non-managers trying to access department view
  useEffect(() => {
    if (activeView === 'department' && !isManager) {
      setActiveView('my');
    }
  }, [activeView, isManager]);

  // Filter loans based on active view
  const viewLoans = useMemo(() => {
    if (activeView === 'my') {
      return loans.filter(l => l.assignedTo === currentUser.id);
    } else {
      // Department view - show all loans in the same department
      return loans.filter(l => l.departmentId === currentUser.department);
    }
  }, [loans, activeView, currentUser]);

  const filteredLoans = useMemo(() => {
    let filtered = viewLoans;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(loan => loan.status === filterStatus);
    }
    if (searchQuery) {
      filtered = filtered.filter(loan => 
        loan.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.loanNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [viewLoans, filterStatus, searchQuery]);

  // Get template info for a loan
  const getLoanTemplateInfo = (loanId: string) => {
    const loanGoals = goals.filter(g => g.loanId === loanId);
    if (loanGoals.length === 0) return null;
    
    const completedTasks = tasks.filter(t => t.loanId === loanId && t.status === 'completed').length;
    const totalTasks = tasks.filter(t => t.loanId === loanId).length;
    
    return {
      templateName: loanGoals[0]?.name || 'AI Goal',
      completedTasks,
      totalTasks,
      isComplete: completedTasks === totalTasks && totalTasks > 0
    };
  };

  // Stats calculation based on active view
  const stats = useMemo(() => {
    const totalVolume = viewLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);
    const activeLoans = viewLoans.filter(l => ['submitted', 'in_review', 'conditions'].includes(l.status)).length;
    
    // For department view, calculate volume by loan officer
    const volumeByOfficer = activeView === 'department' 
      ? viewLoans.reduce((acc, loan) => {
          const officerId = loan.assignedTo || 'unassigned';
          acc[officerId] = (acc[officerId] || 0) + loan.loanAmount;
          return acc;
        }, {} as Record<string, number>)
      : {};

    // Calculate loans count by officer for department view
    const loansByOfficer = activeView === 'department'
      ? viewLoans.reduce((acc, loan) => {
          const officerId = loan.assignedTo || 'unassigned';
          acc[officerId] = (acc[officerId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      : {};

    return {
      total: viewLoans.length,
      volume: totalVolume,
      active: activeLoans,
      volumeByOfficer,
      loansByOfficer,
    };
  }, [viewLoans, activeView]);

  const toggleSelectAll = () => {
    if (selectedLoans.length === filteredLoans.length) {
      setSelectedLoans([]);
    } else {
      setSelectedLoans(filteredLoans.map(l => l.id));
    }
  };

  const toggleSelectLoan = (loanId: string) => {
    setSelectedLoans(prev => 
      prev.includes(loanId) 
        ? prev.filter(id => id !== loanId)
        : [...prev, loanId]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStatClick = (statType: string) => {
    if (activeStatFilter === statType) {
      setActiveStatFilter(null);
      setFilterStatus('all');
    } else {
      setActiveStatFilter(statType);
      switch (statType) {
        case 'active':
          setFilterStatus('in_review');
          break;
        default:
          setFilterStatus('all');
      }
    }
  };

  const handleAssignUser = (userId: string) => {
    if (onAssignLoan) {
      selectedLoans.forEach(loanId => onAssignLoan(loanId, userId));
    }
    onBulkAction('assign', selectedLoans, { userId });
    setAssignDialogOpen(false);
    setSelectedLoans([]);
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Pipeline</h1>
          <p className="text-slate-500">
            {activeView === 'my' 
              ? 'Manage and track your loan applications' 
              : 'View all loans in your department'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PipelineTabs activeView={activeView} onViewChange={setActiveView} />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search loans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-48"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="conditions">Conditions</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards - Different for My vs Department View */}
      <div className={`grid gap-3 ${activeView === 'department' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'}`}>
        {/* Total Loans */}
        <button 
          onClick={() => handleStatClick('total')}
          className={`text-left rounded-xl p-4 transition-all ${
            activeStatFilter === 'total' 
              ? 'bg-blue-900 ring-2 ring-blue-400 ring-offset-2' 
              : 'bg-gradient-to-br from-blue-800 to-blue-950 hover:shadow-lg hover:scale-[1.02]'
          } text-white`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <span className="text-xs text-blue-200">
              {activeView === 'my' ? 'My Loans' : 'Total Loans'}
            </span>
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
        </button>

        {/* Volume */}
        <button 
          onClick={() => handleStatClick('volume')}
          className={`text-left rounded-xl p-4 border-2 transition-all hover:shadow-lg hover:scale-[1.02] ${
            activeStatFilter === 'volume' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-blue-200 bg-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-700" />
            </div>
            <span className="text-xs text-slate-500">
              {activeView === 'my' ? 'My Volume' : 'Total Volume'}
            </span>
          </div>
          <p className="text-xl font-bold text-blue-950">{formatCurrency(stats.volume)}</p>
        </button>

        {/* Active Loans */}
        <button 
          onClick={() => handleStatClick('active')}
          className={`text-left rounded-xl p-4 border-2 transition-all hover:shadow-lg hover:scale-[1.02] ${
            activeStatFilter === 'active' 
              ? 'border-emerald-500 bg-emerald-50' 
              : 'border-emerald-200 bg-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs text-slate-500">Active</span>
          </div>
          <p className="text-xl font-bold text-emerald-700">{stats.active}</p>
        </button>

        {/* Department-specific: Team Members or Average per Officer */}
        {activeView === 'department' && (
          <button 
            className="text-left rounded-xl p-4 border-2 border-purple-200 bg-white transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-700" />
              </div>
              <span className="text-xs text-slate-500">Loan Officers</span>
            </div>
            <p className="text-xl font-bold text-purple-700">
              {Object.keys(stats.loansByOfficer).length}
            </p>
          </button>
        )}

        {/* My Pipeline only: Open Tasks and SLA */}
        {activeView === 'my' && (
          <>
            <button 
              className="text-left rounded-xl p-4 border-2 border-amber-200 bg-white transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-xs text-slate-500">Open Tasks</span>
              </div>
              <p className="text-xl font-bold text-amber-700">
                {tasks.filter(t => t.requiresApproval && !t.approved && viewLoans.some(l => l.id === t.loanId)).length}
              </p>
            </button>

            <button 
              className="text-left rounded-xl p-4 border-2 border-slate-200 bg-white transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-xs text-slate-500">SLA At Risk</span>
              </div>
              <p className="text-xl font-bold text-slate-700">
                {viewLoans.filter(l => {
                  const daysSinceCreated = Math.floor((Date.now() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  return l.status === 'in_review' && daysSinceCreated > 14;
                }).length}
              </p>
            </button>
          </>
        )}
      </div>

      {/* Department View: Volume by Officer */}
      {activeView === 'department' && Object.keys(stats.volumeByOfficer).length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Volume by Loan Officer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(stats.volumeByOfficer).map(([officerId, volume]) => {
              const officer = mockUsers.find(u => u.id === officerId);
              const loanCount = stats.loansByOfficer[officerId] || 0;
              return (
                <div key={officerId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-800 to-blue-950 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{officer?.name || 'Unassigned'}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(volume)} • {loanCount} loans</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedLoans.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-700" />
            <span className="font-medium text-blue-900">{selectedLoans.length} selected</span>
          </div>
          <div className="flex-1" />
          <Select onValueChange={(value) => {
            if (value === 'assign') {
              setAssignDialogOpen(true);
            } else {
              onBulkAction(value, selectedLoans);
            }
          }}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="Bulk Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approve">Approve</SelectItem>
              <SelectItem value="deny">Deny</SelectItem>
              <SelectItem value="assign">Assign To...</SelectItem>
              <SelectItem value="status">Change Status</SelectItem>
              <SelectItem value="delete" className="text-red-600">Delete</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setSelectedLoans([])}>
            Clear
          </Button>
        </div>
      )}

      {/* Loans List View */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox 
                    checked={selectedLoans.length === filteredLoans.length && filteredLoans.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Loan Number</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Borrower</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Purpose</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Template</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Tasks</th>
                {/* Loan Officer column - only in Department view */}
                {activeView === 'department' && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Loan Officer</th>
                )}
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLoans.map((loan) => {
                const loanTasks = tasks.filter(t => t.loanId === loan.id);
                const templateInfo = getLoanTemplateInfo(loan.id);
                return (
                  <tr 
                    key={loan.id} 
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => onLoanClick(loan)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedLoans.includes(loan.id)}
                        onCheckedChange={() => toggleSelectLoan(loan.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{loan.loanNumber}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{loan.borrowerName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{loanPurposeLabels[loan.loanPurpose]}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatCurrency(loan.loanAmount)}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${statusConfig[loan.status].bgColor} ${statusConfig[loan.status].color} border-0`}>
                        {statusConfig[loan.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {templateInfo ? (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${templateInfo.isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          {templateInfo.isComplete ? templateInfo.templateName : `${templateInfo.completedTasks}/${templateInfo.totalTasks}`}
                        </Badge>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {loanTasks.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <Bot className="w-4 h-4 text-blue-700" />
                          <span className="text-sm">{loanTasks.length}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    {/* Loan Officer cell - only in Department view */}
                    {activeView === 'department' && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-800 to-blue-950 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-slate-700">{getUserNameById(loan.assignedTo)}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(loan.createdAt)}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 hover:bg-slate-100 rounded">
                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onLoanClick(loan)}>View Details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Assign To</DropdownMenuLabel>
                          {mockUsers.map(user => (
                            <DropdownMenuItem 
                              key={user.id} 
                              onClick={() => onAssignLoan?.(loan.id, user.id)}
                            >
                              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-xs">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              {user.name}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onUpdateStatus(loan.id, 'approved')}>Approve</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(loan.id, 'denied')} className="text-red-600">Deny</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions Dialog */}
      <Dialog open={!!selectedLoanForActions} onOpenChange={() => setSelectedLoanForActions(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Actions</DialogTitle>
          </DialogHeader>
          {selectedLoanForActions && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-900">{selectedLoanForActions.borrowerName}</p>
                <p className="text-sm text-slate-500">{selectedLoanForActions.loanNumber}</p>
                {activeView === 'department' && (
                  <p className="text-xs text-slate-400 mt-1">
                    Assigned to: {getUserNameById(selectedLoanForActions.assignedTo)}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => {
                    onUpdateStatus(selectedLoanForActions.id, 'approved');
                    setSelectedLoanForActions(null);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                  Approve Loan
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => {
                    onUpdateStatus(selectedLoanForActions.id, 'denied');
                    setSelectedLoanForActions(null);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2 text-red-600" />
                  Deny Loan
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => {
                    onCreateAIGoal(selectedLoanForActions.id);
                    setSelectedLoanForActions(null);
                  }}
                >
                  <Bot className="w-4 h-4 mr-2 text-blue-700" />
                  AI Goal
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => {
                    onLoanClick(selectedLoanForActions);
                    setSelectedLoanForActions(null);
                  }}
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-700" />
              Assign Loans to User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Assign {selectedLoans.length} selected loan{selectedLoans.length > 1 ? 's' : ''} to:
            </p>
            <div className="space-y-2">
              {mockUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleAssignUser(user.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-800 to-blue-950 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                  <Check className="w-5 h-5 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
