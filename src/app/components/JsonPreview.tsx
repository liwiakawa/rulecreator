import React from 'react';

export const JsonPreview: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="bg-slate-900 text-indigo-200 rounded-2xl p-4 border border-slate-800">
      <pre className="text-xs font-mono whitespace-pre-wrap break-all leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};
