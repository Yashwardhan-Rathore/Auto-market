'use client';

import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  NodeProps,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Play,
  Save,
  Plus,
  Mail,
  Clock,
  Settings,
  HelpCircle,
  Activity,
  CheckCircle2,
  GitBranch,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// ============================================================
// Custom Nodes Definitions
// ============================================================

// 1. Trigger Node Component
function TriggerNode({ data }: NodeProps<{ label: string; event: string }>) {
  return (
    <div className="rounded-xl border border-blue-200 bg-white shadow-sm dark:bg-card dark:border-blue-900 overflow-hidden w-52">
      <div className="bg-blue-500/10 px-3 py-2 border-b border-blue-200 dark:border-blue-900 flex items-center justify-between">
        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">Trigger</span>
        <Play className="h-3 w-3 text-blue-500 fill-blue-500/20 animate-pulse" />
      </div>
      <div className="p-3 text-xs">
        <p className="font-semibold text-foreground">{data.label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{data.event}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-blue-400" />
    </div>
  );
}

// 2. Action Node Component
function ActionNode({ data }: NodeProps<{ label: string; action: string }>) {
  return (
    <div className="rounded-xl border border-green-200 bg-white shadow-sm dark:bg-card dark:border-green-900 overflow-hidden w-52">
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-green-400" />
      <div className="bg-green-500/10 px-3 py-2 border-b border-green-200 dark:border-green-900 flex items-center justify-between">
        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 tracking-wider uppercase">Action</span>
        <Mail className="h-3 w-3 text-green-500" />
      </div>
      <div className="p-3 text-xs">
        <p className="font-semibold text-foreground">{data.label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{data.action}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-green-400" />
    </div>
  );
}

// 3. Delay Node Component
function DelayNode({ data }: NodeProps<{ label: string; duration: string }>) {
  return (
    <div className="rounded-xl border border-amber-200 bg-white shadow-sm dark:bg-card dark:border-amber-900 overflow-hidden w-52">
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-amber-400" />
      <div className="bg-amber-500/10 px-3 py-2 border-b border-amber-200 dark:border-amber-900 flex items-center justify-between">
        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase">Delay</span>
        <Clock className="h-3 w-3 text-amber-500" />
      </div>
      <div className="p-3 text-xs">
        <p className="font-semibold text-foreground">{data.label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{data.duration}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-amber-400" />
    </div>
  );
}

// 4. Condition Node Component
function ConditionNode({ data }: NodeProps<{ label: string; condition: string }>) {
  return (
    <div className="rounded-xl border border-red-200 bg-white shadow-sm dark:bg-card dark:border-red-900 overflow-hidden w-56">
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-red-400" />
      <div className="bg-red-500/10 px-3 py-2 border-b border-red-200 dark:border-red-900 flex items-center justify-between">
        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 tracking-wider uppercase">Condition</span>
        <GitBranch className="h-3 w-3 text-red-500" />
      </div>
      <div className="p-3 text-xs">
        <p className="font-semibold text-foreground">{data.label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{data.condition}</p>
      </div>
      
      {/* Yes & No branch handles */}
      <div className="flex justify-between px-4 pb-1.5 text-[9px] font-bold text-muted-foreground mt-1">
        <span>YES (Left)</span>
        <span>NO (Right)</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="yes" style={{ left: '25%' }} className="w-2 h-2 !bg-green-500" />
      <Handle type="source" position={Position.Bottom} id="no" style={{ left: '75%' }} className="w-2 h-2 !bg-red-500" />
    </div>
  );
}

// Map custom nodes in React Flow
const nodeTypes = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  delayNode: DelayNode,
  conditionNode: ConditionNode,
};

// Initial nodes setup
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'triggerNode',
    data: { label: 'Contact Created', event: 'When subscriber joins newsletter list' },
    position: { x: 250, y: 50 },
  },
  {
    id: '2',
    type: 'delayNode',
    data: { label: 'Wait 1 Hour', duration: 'Pauses thread execution temporarily' },
    position: { x: 250, y: 200 },
  },
  {
    id: '3',
    type: 'actionNode',
    data: { label: 'Send Welcome Email', action: 'Uses template: "Welcome onboard v2"' },
    position: { x: 250, y: 350 },
  },
  {
    id: '4',
    type: 'conditionNode',
    data: { label: 'Opened Email?', condition: 'Checks if user opened previous mail' },
    position: { x: 230, y: 500 },
  },
  {
    id: '5',
    type: 'actionNode',
    data: { label: 'Send Follow-up Promo', action: 'Send 20% discount coupon SMS' },
    position: { x: 100, y: 680 },
  },
  {
    id: '6',
    type: 'actionNode',
    data: { label: 'Send Newsletter Digest', action: 'Email standard updates link' },
    position: { x: 380, y: 680 },
  },
];

// Initial edges setup
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', sourceHandle: 'yes', target: '5', label: 'Yes' },
  { id: 'e4-6', source: '4', sourceHandle: 'no', target: '6', label: 'No' },
];

export function WorkflowBuilderView() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const handleSave = () => {
    toast.success('Workflow saved successfully', {
      description: `Saved ${nodes.length} automation nodes.`,
    });
  };

  // Add node handler
  const addActionNode = () => {
    const id = String(nodes.length + 1);
    const newNode: Node = {
      id,
      type: 'actionNode',
      data: { label: 'Send SMS Alert', action: 'Mobile notification channel' },
      position: { x: 300, y: 300 },
    };
    setNodes((nds) => [...nds, newNode]);
    toast.success('Added action node');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] border bg-background rounded-xl overflow-hidden shadow-sm relative">
      {/* Canvas Top Bar Controls */}
      <header className="flex h-12 items-center justify-between border-b bg-card px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4">
            Live
          </Badge>
          <span className="font-semibold text-xs text-foreground truncate max-w-[200px]">
            Welcome & Lead Nurture Sequence
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={addActionNode} className="h-8 text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Action Node
          </Button>
          <Button size="sm" onClick={handleSave} className="h-8 text-xs gap-1.5 bg-primary">
            <Save className="h-3.5 w-3.5" /> Save Flow
          </Button>
        </div>
      </header>

      {/* Editor Main Canvas splits with Inspector Panel */}
      <div className="flex flex-1 min-h-0 relative">
        <div className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background color="#ccc" gap={16} size={1} />
            <Controls className="!bg-card !border !border-border" />
            <MiniMap style={{ height: 100, width: 140 }} nodeStrokeWidth={3} className="!border !border-border bg-card/60 dark:bg-card" />
          </ReactFlow>
        </div>

        {/* Right Inspector Panel */}
        <aside className="w-80 border-l bg-card flex flex-col p-4 shrink-0 overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <Badge className="text-[9px] uppercase tracking-wider">Node Details</Badge>
                <h3 className="text-sm font-bold text-foreground mt-1 truncate">
                  {selectedNode.data?.label as string}
                </h3>
              </div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Node ID
                  </label>
                  <p className="text-xs font-mono text-foreground mt-0.5">{selectedNode.id}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Node Type
                  </label>
                  <p className="text-xs font-semibold text-foreground mt-0.5 uppercase tracking-wide">
                    {selectedNode.type?.replace('Node', '')}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Configuration Description
                  </label>
                  <p className="text-xs text-muted-foreground mt-1 bg-muted/40 p-2 rounded-lg border leading-relaxed">
                    {selectedNode.data?.event as string || selectedNode.data?.action as string || selectedNode.data?.duration as string || selectedNode.data?.condition as string}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Configure node settings')}
                  className="w-full text-xs gap-1.5"
                >
                  <Settings className="h-3.5 w-3.5" /> Configure Node
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground space-y-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Inspector Panel</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  Select any node on the automation canvas to inspect and edit its settings.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
