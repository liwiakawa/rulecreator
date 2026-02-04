import React from 'react';

export const JsonPreview: React.FC<{ data: any }> = ({ data }) => {
  return (
    <pre className="text-xs font-mono text-indigo-300 whitespace-pre-wrap break-all leading-relaxed">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};
