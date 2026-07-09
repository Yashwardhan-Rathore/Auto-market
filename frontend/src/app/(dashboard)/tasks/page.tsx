'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TasksService } from '@/services/tasks.service';
import { Search, CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { format } from 'date-fns';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${className}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{children}</span>;
}

const priorityColor: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-orange-100 text-orange-700",
  LOW: "bg-blue-100 text-blue-700",
};

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: TasksService.listMyTasks
  });

  const filtered = tasks.filter(t => 
    t.task.title.toLowerCase().includes(search.toLowerCase()) && 
    (filter === "All" || t.status.toLowerCase() === filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div>
          <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>My Tasks</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{tasks.length} assigned tasks</p>
        </div>
      </div>
      
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search tasks..." 
            className="w-full pl-9 pr-4 py-2 border border-border text-sm outline-none focus:border-foreground" 
          />
        </div>
        {["All", "Pending", "In_Progress", "Review", "Completed"].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            {...mono(`px-3 py-2 text-[11px] uppercase tracking-widest border transition-colors ${filter === f ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground"}`)}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>
      
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Task", "Priority", "Status", "Due Date"].map(h => (
                <th key={h} {...mono("text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading tasks...</td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground flex flex-col items-center">
                  <ListTodo size={32} className="mb-3 opacity-20" />
                  <p>No tasks found</p>
                </td>
              </tr>
            )}
            {filtered.map(t => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="font-medium">{t.task.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.task.description}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge className={priorityColor[t.task.priority] || "bg-muted text-muted-foreground"}>{t.task.priority}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div {...mono("flex items-center gap-1.5 text-xs font-medium")}>
                    {t.status === 'COMPLETED' ? <CheckCircle size={13} className="text-green-600" /> : 
                     t.status === 'REVIEW' ? <AlertCircle size={13} className="text-orange-600" /> : 
                     <Clock size={13} className="text-muted-foreground" />}
                    {t.status}
                  </div>
                </td>
                <td {...mono("px-4 py-3 text-xs")}>{t.task.due_date ? format(new Date(t.task.due_date), 'MMM dd, yyyy') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
