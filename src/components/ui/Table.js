/**
 * Reusable Table Component
 */
export default function Table({ children, className = "" }) {
  return (
    <div className="overflow-x-auto">
      <table className={`
        w-full 
        text-sm
        ${className}
      `}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <thead>
      <tr className={`
        border-b border-gray-200 dark:border-gray-700
        ${className}
      `}>
        {children}
      </tr>
    </thead>
  );
}

export function TableHeaderCell({ children, className = "" }) {
  return (
    <th className={`
      text-left p-3 
      text-gray-700 dark:text-gray-300 
      font-semibold
      ${className}
    `}>
      {children}
    </th>
  );
}

export function TableBody({ children, className = "" }) {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, onClick, selected = false, className = "" }) {
  return (
    <tr
      onClick={onClick}
      className={`
        border-b border-gray-100 dark:border-gray-700 
        hover:bg-gray-50 dark:hover:bg-gray-700/50
        ${selected ? "bg-green-50 dark:bg-green-900/20" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={`p-3 text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </td>
  );
}

