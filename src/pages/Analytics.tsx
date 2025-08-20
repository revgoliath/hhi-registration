import React from 'react';
import { BarChart3, Users, Heart, Droplets, Zap, TrendingUp, Calendar, PieChart } from 'lucide-react';
import { storageService } from '../utils/storage';

const Analytics: React.FC = () => {
  const members = storageService.getMembers();
  const newlyWeds = storageService.getNewlyWeds();
  const marriagePrep = storageService.getMarriagePrep();
  const babyDedications = storageService.getBabyDedications();

  // Calculate analytics
  const totalMembers = members.length;
  const bornAgainCount = members.filter(m => m.bornAgain.status).length;
  const waterBaptizedCount = members.filter(m => m.waterBaptized.status).length;
  const spiritBaptizedCount = members.filter(m => m.spiritBaptized.status).length;

  // Age group distribution
  const ageGroupStats = members.reduce((acc, member) => {
    acc[member.ageGroup] = (acc[member.ageGroup] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Gender distribution
  const genderStats = members.reduce((acc, member) => {
    acc[member.gender] = (acc[member.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Ministry involvement
  const ministryStats = members.reduce((acc, member) => {
    member.ministries.forEach(ministry => {
      acc[ministry] = (acc[ministry] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Monthly growth (last 12 months)
  const monthlyGrowth = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const count = members.filter(member => {
      const joinDate = new Date(member.dateJoinedChurch);
      const joinMonthYear = `${joinDate.getFullYear()}-${String(joinDate.getMonth() + 1).padStart(2, '0')}`;
      return joinMonthYear === monthYear;
    }).length;

    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count
    };
  }).reverse();

  const StatCard: React.FC<{
    title: string;
    value: number;
    total?: number;
    icon: React.ComponentType<any>;
    color: string;
    description?: string;
  }> = ({ title, value, total, icon: Icon, color, description }) => (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}
            {total && <span className="text-lg text-gray-500">/{total}</span>}
          </p>
          {total && (
            <p className="text-sm text-gray-500 mt-1">
              {total > 0 ? Math.round((value / total) * 100) : 0}% of members
            </p>
          )}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`h-6 w-6 ${color.replace('border-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  const ChartCard: React.FC<{
    title: string;
    data: Record<string, number>;
    icon: React.ComponentType<any>;
  }> = ({ title, data, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Icon className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">
        {Object.entries(data)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([key, value]) => {
            const maxValue = Math.max(...Object.values(data));
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            
            return (
              <div key={key} className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{key}</span>
                    <span className="text-sm text-gray-500">{value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg text-white p-8">
        <h1 className="text-3xl font-bold mb-2">Church Analytics</h1>
        <p className="text-blue-100 text-lg">Insights and statistics about your church members</p>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={totalMembers}
          icon={Users}
          color="border-blue-500"
          description="Active church members"
        />
        <StatCard
          title="Born Again"
          value={bornAgainCount}
          total={totalMembers}
          icon={Heart}
          color="border-red-500"
        />
        <StatCard
          title="Water Baptized"
          value={waterBaptizedCount}
          total={totalMembers}
          icon={Droplets}
          color="border-blue-500"
        />
        <StatCard
          title="Spirit Baptized"
          value={spiritBaptizedCount}
          total={totalMembers}
          icon={Zap}
          color="border-yellow-500"
        />
      </div>

      {/* Special Events */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Newly Weds"
          value={newlyWeds.length}
          icon={Heart}
          color="border-pink-500"
          description="Recent marriages"
        />
        <StatCard
          title="Marriage Preparation"
          value={marriagePrep.length}
          icon={Users}
          color="border-purple-500"
          description="Couples preparing"
        />
        <StatCard
          title="Baby Dedications"
          value={babyDedications.length}
          icon={Calendar}
          color="border-green-500"
          description="Child dedications"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Age Group Distribution"
          data={ageGroupStats}
          icon={PieChart}
        />
        <ChartCard
          title="Gender Distribution"
          data={genderStats}
          icon={Users}
        />
      </div>

      {/* Ministry Involvement */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard
          title="Ministry Involvement"
          data={ministryStats}
          icon={BarChart3}
        />
      </div>

      {/* Monthly Growth */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Monthly Growth (Last 12 Months)</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {monthlyGrowth.map((month, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-blue-600">{month.count}</div>
              <div className="text-sm text-gray-500">{month.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Insights */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-sm text-gray-700">
                <strong>{totalMembers > 0 ? Math.round((bornAgainCount / totalMembers) * 100) : 0}%</strong> of members are born again
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-700">
                <strong>{totalMembers > 0 ? Math.round((waterBaptizedCount / totalMembers) * 100) : 0}%</strong> have been water baptized
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-sm text-gray-700">
                <strong>{totalMembers > 0 ? Math.round((spiritBaptizedCount / totalMembers) * 100) : 0}%</strong> have received spirit baptism
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-sm text-gray-700">
                <strong>{Object.keys(ministryStats).length}</strong> active ministries
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full" />
              <span className="text-sm text-gray-700">
                <strong>{members.filter(m => m.ministries.length > 0).length}</strong> members involved in ministry
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full" />
              <span className="text-sm text-gray-700">
                Average <strong>{members.length > 0 ? (members.reduce((sum, m) => sum + m.ministries.length, 0) / members.length).toFixed(1) : 0}</strong> ministries per member
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;