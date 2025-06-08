const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'red' }) => (
  <div className="card-theme rounded-lg p-6">
    <div className="flex items-center">
      <div className={`flex-shrink-0 p-3 rounded-md bg-${color}-100 dark:bg-${color}-900/20`}>
        <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <div className="ml-4 rtl:mr-4 rtl:ml-0">
        <p className="text-sm font-medium text-secondary">{title}</p>
        <p className="text-2xl font-semibold text-primary">{value}</p>
        {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
      </div>
    </div>
  </div>
);

export default StatsCard; 