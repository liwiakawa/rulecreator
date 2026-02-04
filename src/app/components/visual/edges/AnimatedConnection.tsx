import React from 'react';
import { 
  BaseEdge, 
  EdgeProps, 
  getBezierPath, 
  EdgeLabelRenderer, 
  useReactFlow 
} from '@xyflow/react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export const AnimatedConnection = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  label,
}: EdgeProps) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      {/* Glow Effect / Background Edge */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 6,
          stroke: selected ? '#6366f1' : 'transparent',
          opacity: 0.1,
          transition: 'stroke 0.3s ease',
        }}
      />
      
      {/* Primary Edge */}
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 3,
          stroke: selected ? '#6366f1' : '#cbd5e1',
          transition: 'stroke 0.3s ease',
        }}
      />

      {/* Animated Dash Overlay */}
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 1.5,
          stroke: selected ? '#818cf8' : '#e2e8f0',
          strokeDasharray: '6 4',
          animation: 'dashdraw 0.8s linear infinite',
          opacity: selected ? 1 : 0.5,
        }}
      />

      <EdgeLabelRenderer>
        <AnimatePresence>
            {(selected || true) && ( // We keep it rendered for hover states or just visible button
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <button
                        onClick={onEdgeClick}
                        className={cn(
                            "w-6 h-6 rounded-full bg-white border flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 shadow-sm transition-all duration-200 group/edgebtn",
                            selected ? "opacity-100 scale-110 border-indigo-200 text-indigo-500" : "opacity-0 group-hover:opacity-100"
                        )}
                        title="Usuń połączenie"
                    >
                        <X size={10} className="transition-transform group-hover/edgebtn:rotate-90" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
      </EdgeLabelRenderer>

      <style>{`
        @keyframes dashdraw {
          from {
            stroke-dashoffset: 10;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </>
  );
};
