'use client';

import { useState, useCallback, use, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AutomationService } from '@/services/automation.service';
import { ArrowLeft, Save, Loader2, Play } from 'lucide-react';
import Link from 'next/link';
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, NodeChange, EdgeChange, Connection, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

export default function AutomationBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  const { data: automation } = useQuery({
    queryKey: ['automation', id],
    queryFn: () => AutomationService.get(id)
  });

  const { data: initialNodes = [], isSuccess: isNodesSuccess } = useQuery({
    queryKey: ['automation_nodes', id],
    queryFn: () => AutomationService.getNodes(id)
  });

  const { data: initialEdges = [], isSuccess: isEdgesSuccess } = useQuery({
    queryKey: ['automation_edges', id],
    queryFn: () => AutomationService.getEdges(id)
  });

  useEffect(() => {
    if (isNodesSuccess) {
      setNodes(initialNodes.map((n: any) => ({
        id: n.id,
        type: 'default',
        position: n.ui_config?.position || { x: 100, y: 100 },
        data: { label: n.label },
        // Store backend data
        backendData: n
      })));
    }
  }, [initialNodes, isNodesSuccess]);

  useEffect(() => {
    if (isEdgesSuccess) {
      setEdges(initialEdges.map((e: any) => ({
        id: e.id,
        source: e.source_node,
        target: e.target_node,
        label: e.edge_type
      })));
    }
  }, [initialEdges, isEdgesSuccess]);

  const onNodesChange = useCallback(
    (changes: NodeChange<any>[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<any>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const addNodeMutation = useMutation({
    mutationFn: (type: string) => {
      const payload = {
        node_type: type,
        action_name: `do_${type.toLowerCase()}`,
        label: `New ${type}`,
        ui_config: { position: { x: Math.random() * 200, y: Math.random() * 200 } }
      };
      return AutomationService.createNode(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation_nodes', id] });
    }
  });

  const publishMutation = useMutation({
    mutationFn: () => AutomationService.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation', id] });
    }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/automation" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-lg font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
              {automation?.name || 'Loading...'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${automation?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {automation?.status || 'DRAFT'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-muted p-1 rounded">
            <button onClick={() => addNodeMutation.mutate('TRIGGER')} className="px-3 py-1 text-xs font-semibold hover:bg-background rounded">Add Trigger</button>
            <button onClick={() => addNodeMutation.mutate('ACTION')} className="px-3 py-1 text-xs font-semibold hover:bg-background rounded">Add Action</button>
            <button onClick={() => addNodeMutation.mutate('CONDITION')} className="px-3 py-1 text-xs font-semibold hover:bg-background rounded">Add Condition</button>
          </div>
          
          <button 
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
            {...mono("bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50")}
          >
            {publishMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} 
            Publish
          </button>
        </div>
      </div>

      <div className="flex-1 w-full bg-muted/20 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
