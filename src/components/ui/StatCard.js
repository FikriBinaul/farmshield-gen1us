/**
 * Statistic Card Component
 * Untuk menampilkan statistik dengan icon
 */
import { LucideIcon } from "lucide-react";

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor = "text-green-600",
  className = "" 
}) {
  return (
    <div className={`
      bg-white dark:bg-gray-800 
      rounded-xl 
      shadow-lg 
      p-6 
      border border-gray-200 dark:border-gray-700
      ${className}
    `}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <Icon className={`${iconColor} w-10 h-10`} />
        )}
      </div>
    </div>
  );
}

