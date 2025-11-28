/**
 * Reusable Card Component
 * Konsisten dengan design system aplikasi
 */
export default function Card({ children, className = "", padding = "p-6", ...props }) {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 
        rounded-xl 
        shadow-lg 
        border border-gray-200 dark:border-gray-700
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

