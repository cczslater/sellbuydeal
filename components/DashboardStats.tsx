
'use client';

export default function DashboardStats() {
  const stats = [
    {
      title: 'Total Sales',
      value: '$0.00',
      change: '+0%',
      changeType: 'neutral',
      icon: 'ri-money-dollar-circle-line'
    },
    {
      title: 'Active Listings',
      value: '0',
      change: '+0',
      changeType: 'neutral',
      icon: 'ri-shopping-bag-line'
    },
    {
      title: 'Total Views',
      value: '0',
      change: '+0%',
      changeType: 'neutral',
      icon: 'ri-eye-line'
    },
    {
      title: 'Messages',
      value: '0',
      change: '+0',
      changeType: 'neutral',
      icon: 'ri-message-2-line'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-sm flex items-center mt-1 ${
                stat.changeType === 'positive' ? 'text-green-600' :
                stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {stat.changeType === 'positive' && <i className="ri-arrow-up-line mr-1"></i>}
                {stat.changeType === 'negative' && <i className="ri-arrow-down-line mr-1"></i>}
                {stat.change} from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <i className={`${stat.icon} text-xl text-[#004080]`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
