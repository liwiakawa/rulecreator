import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Panel,
  ReactFlowInstance,
  ConnectionMode,
  useKeyPress,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode } from './nodes/TriggerNode';
import { ConditionNode } from './nodes/ConditionNode';
import { ActionNode } from './nodes/ActionNode';
import { ConstraintNode } from './nodes/ConstraintNode';
import { AnimatedConnection } from './edges/AnimatedConnection';
import { CustomConnectionLine } from './edges/CustomConnectionLine';
import { NodeInspector } from './NodeInspector';
import { TriggerRule } from '@/app/types';
import { Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const NODE_TYPES = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
  constraint: ConstraintNode,
};

const EDGE_TYPES = {
  animated: AnimatedConnection,
};

interface VisualRuleEditorProps {
  rule: TriggerRule;
  onChange: (rule: TriggerRule) => void;
}

const buildNodeData = (rule: TriggerRule) => ({
  trigger: {
    name: rule.name,
    id: rule.id,
    enabled: rule.enabled,
    priority: rule.priority,
    backgroundEnabled: rule.backgroundEnabled,
  },
  condition: {
    conditions: rule.conditions,
  },
  constraint: {
    cooldown: rule.cooldown,
    schedule: rule.schedule,
  },
  action: {
    actions: rule.actions,
  },
});

export const VisualRuleEditor = ({ rule, onChange }: VisualRuleEditorProps) => {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const initialNodes: Node[] = useMemo(
    () => [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 120, y: 60 },
        data: {},
      },
      {
        id: 'condition',
        type: 'condition',
        position: { x: 120, y: 280 },
        data: {},
      },
      {
        id: 'constraint',
        type: 'constraint',
        position: { x: 480, y: 280 },
        data: {},
      },
      {
        id: 'action',
        type: 'action',
        position: { x: 120, y: 520 },
        data: {},
      },
    ],
    []
  );

  const initialEdges = useMemo(
    () => [
      { id: 'e1', source: 'trigger', target: 'condition', type: 'animated', animated: true },
      { id: 'e2', source: 'trigger', target: 'constraint', type: 'animated', animated: true },
      { id: 'e3', source: 'condition', target: 'action', type: 'animated', animated: true },
      { id: 'e4', source: 'constraint', target: 'action', type: 'animated', animated: true },
    ],
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes = useMemo(() => NODE_TYPES, []);
  const edgeTypes = useMemo(() => EDGE_TYPES, []);

  useEffect(() => {
    const dataMap = buildNodeData(rule);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === 'trigger') return { ...node, data: dataMap.trigger };
        if (node.id === 'condition') return { ...node, data: dataMap.condition };
        if (node.id === 'constraint') return { ...node, data: dataMap.constraint };
        if (node.id === 'action') return { ...node, data: dataMap.action };
        return node;
      })
    );
  }, [rule, setNodes]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || nodes.find((n) => n.selected),
    [nodes, selectedNodeId]
  );

  useEffect(() => {
    const active = nodes.find((n) => n.selected);
    if (active) setSelectedNodeId(active.id);
    else setSelectedNodeId(null);
  }, [nodes]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const deletePressed = useKeyPress(['Delete', 'Backspace']);

  useEffect(() => {
    if (deletePressed && selectedNodeId) {
      toast.info('W trybie wizualnym nie usuwamy bloków.');
    }
  }, [deletePressed, selectedNodeId]);

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0 w-full bg-slate-50 overflow-hidden font-sans">
      <div className="flex-1 relative flex min-h-0 overflow-hidden">
        <div className="flex-1 relative min-h-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={setReactFlowInstance}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            connectionMode={ConnectionMode.Loose}
            connectionLineComponent={CustomConnectionLine}
            className="bg-[#f8fafc]"
            defaultEdgeOptions={{ type: 'animated' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#e2e8f0" />

            <Panel position="top-right" className="flex items-center gap-3">
              <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 shadow-xl flex items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => reactFlowInstance?.fitView()}
                  className="p-2.5 bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                >
                  <Maximize size={18} />
                </motion.button>
              </div>
            </Panel>

            <Controls className="!bg-white !border-slate-200 !shadow-xl !rounded-2xl !overflow-hidden" showInteractive={false} />

            <style>{`
              .react-flow__handle-connecting {
                background: #6366f1 !important;
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
                transform: scale(1.4);
              }
              .react-flow__handle-valid {
                background: #10b981 !important;
                box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
                transform: scale(1.4);
                border-color: white !important;
              }
              .react-flow__connectionline path {
                stroke-width: 3;
                stroke: #6366f1;
              }
            `}</style>
          </ReactFlow>
        </div>

        <AnimatePresence mode="wait">
          {selectedNode && (
            <NodeInspector
              key={selectedNode.id}
              nodeId={selectedNode.id}
              rule={rule}
              onChange={onChange}
              onClose={() => setSelectedNodeId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function VisualRuleEditorWrapper(props: VisualRuleEditorProps) {
  return <VisualRuleEditor {...props} />;
}
