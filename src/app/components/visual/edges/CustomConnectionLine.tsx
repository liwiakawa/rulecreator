import React from 'react';
import { getBezierPath, ConnectionLineComponentProps } from '@xyflow/react';

export const CustomConnectionLine = ({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
  connectionLineStyle,
}: ConnectionLineComponentProps) => {
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  return (
    <g>
      <path
        fill="none"
        stroke="#6366f1"
        strokeWidth={3}
        className="animated"
        d={edgePath}
        style={connectionLineStyle}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={4}
        stroke="#6366f1"
        strokeWidth={2}
      />
      <style>{`
        .animated {
          stroke-dasharray: 8 4;
          animation: dashdraw 0.5s linear infinite;
        }
        @keyframes dashdraw {
          from {
            stroke-dashoffset: 12;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </g>
  );
};
