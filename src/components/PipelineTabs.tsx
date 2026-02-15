import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';

type PipelineViewType = 'my' | 'department';

interface PipelineTabsProps {
  activeView: PipelineViewType;
  onViewChange: (view: PipelineViewType) => void;
}

export function PipelineTabs({ activeView, onViewChange }: PipelineTabsProps) {
  const { isManager } = useUser();

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
      <Button
        variant={activeView === 'my' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('my')}
        className={activeView === 'my' ? 'bg-blue-800 hover:bg-blue-900' : 'text-slate-600 hover:text-slate-900'}
      >
        My Pipeline
      </Button>
      {isManager && (
        <Button
          variant={activeView === 'department' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('department')}
          className={activeView === 'department' ? 'bg-blue-800 hover:bg-blue-900' : 'text-slate-600 hover:text-slate-900'}
        >
          Department Pipeline
        </Button>
      )}
    </div>
  );
}

export type { PipelineViewType };
