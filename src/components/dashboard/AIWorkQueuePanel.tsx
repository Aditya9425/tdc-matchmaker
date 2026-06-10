import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckSquare, ListTodo, ShieldAlert, Sparkles, Clock, Check } from 'lucide-react';
import type { AITask } from '@/services/ai/taskQueueService';

interface AIWorkQueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: AITask[];
  onAction: (task: AITask) => void;
  onDismiss: (taskId: string) => void;
}

export function AIWorkQueuePanel({ isOpen, onClose, tasks, onAction, onDismiss }: AIWorkQueuePanelProps) {
  const highPriority = tasks.filter(t => t.priority === 'High');
  const mediumPriority = tasks.filter(t => t.priority === 'Medium');
  const lowPriority = tasks.filter(t => t.priority === 'Low');

  const renderTaskGroup = (title: string, groupTasks: AITask[], badgeColor: string) => {
    if (groupTasks.length === 0) return null;
    return (
      <div className="mb-8 last:mb-0">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
          <Badge variant="outline" className={`text-[10px] font-bold uppercase ${badgeColor}`}>
            {groupTasks.length} Tasks
          </Badge>
        </div>
        <div className="space-y-3">
          {groupTasks.map(task => (
            <div key={task.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-primary/30 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{task.customerName}</span>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold text-slate-500 bg-slate-50 border-slate-200">
                    {task.title}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium">{task.reasoning}</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
                <Button size="sm" onClick={() => onAction(task)} className="flex-1 sm:flex-none shadow-sm">
                  {task.actionLabel}
                </Button>
                <Button variant="outline" size="icon" onClick={() => onDismiss(task.id)} className="shrink-0 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 bg-white">
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:!max-w-[60vw] lg:!max-w-[800px] p-0 flex flex-col bg-slate-50 overflow-hidden border-l border-slate-200">
        <div className="bg-white px-6 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-primary" />
              <SheetTitle className="text-xl font-bold text-slate-900">AI Work Queue</SheetTitle>
              <Badge variant="outline" className="ml-2 text-[10px] font-bold uppercase border-primary/20 text-primary bg-primary/5">
                {tasks.length} Active Tasks
              </Badge>
            </div>
            <SheetDescription className="text-sm text-slate-500">
              Prioritized operational tasks requiring your attention today.
            </SheetDescription>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {tasks.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center">
                <CheckSquare className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Queue is Empty</h3>
                <p className="text-sm text-slate-500">You're all caught up for now.</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                {renderTaskGroup('High Priority', highPriority, 'text-rose-600 bg-rose-50 border-rose-200')}
                {renderTaskGroup('Medium Priority', mediumPriority, 'text-amber-600 bg-amber-50 border-amber-200')}
                {renderTaskGroup('Low Priority', lowPriority, 'text-slate-600 bg-slate-100 border-slate-200')}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
