/**
 * Page Header Component
 * Konsisten untuk semua halaman
 */
export default function PageHeader({ 
  title, 
  description, 
  action, 
  className = "" 
}) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div>{action}</div>
        )}
      </div>
    </div>
  );
}

