const TabNavigation = ({ tabs, activeTab, setActiveTab }) => (
  <div className="bg-theme shadow-sm border-b border-gray-200 dark:border-gray-800">
    <div className="px-6">
      <nav className="flex space-x-8 rtl:space-x-reverse">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 rtl:space-x-reverse transition-colors ${
              activeTab === key
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-secondary hover:text-primary hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  </div>
);

export default TabNavigation; 