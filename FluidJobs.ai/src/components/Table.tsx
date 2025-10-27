import React from 'react';

const Table: React.FC<{ columns: string[]; data: any[]; renderRow: (row: any) => React.ReactNode }> = ({ columns, data, renderRow }) => (
  <table className="w-full bg-white rounded shadow">
    <thead>
      <tr>
        {columns.map(col => <th key={col} className="py-2 px-4 text-left">{col}</th>)}
      </tr>
    </thead>
    <tbody>
      {data.map(renderRow)}
    </tbody>
  </table>
);

export default Table;
