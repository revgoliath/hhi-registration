import React from 'react';
import { Users, UserPlus, Heart, BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { storageService } from '../utils/storage';

const Dashboard: React.FC = () => {
  const members = storageService.getMembers();
  const newlyWeds = storageService.getNewlyWeds();
  const marriagePrep = storageService.getMarriagePrep();
  const babyDedications = storageService.getBabyDedications();

  // Calculate statistics
  const totalMembers = members.length;
  const newThisMonth = members.filter(member => {
    const joinDate = new Date(member.dateJoinedChurch);
    const now = new Date();
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length;

  const bornAgainCount = members.filter(member => member.bornAgain.status).length;
  const waterBaptizedCount = members.filter(member => member.waterBaptized.status).length;
  const spiritBaptizedCount = members.filter(member => member.spiritBaptized.status).length;

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ComponentType<any>;
    color: string;
    description?: string;
  }> = ({ title, value, icon: Icon, color, description }) => (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-6 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`h-6 w-6 ${color.replace('border-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  const QuickActionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    href: string;
    color: string;
  }> = ({ title, description, icon: Icon, href, color }) => (
    <a
      href={href}
      className={`block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-${color.split('-')[1]}-200`}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </a>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl lg:rounded-2xl shadow-lg text-white p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome to Harvest House International</h1>
        <p className="text-blue-100 text-base lg:text-lg">Member Management Dashboard</p>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Members"
          value={totalMembers}
          icon={Users}
          color="border-blue-500"
          description="Active church members"
        />
        <StatCard
          title="New This Month"
          value={newThisMonth}
          icon={UserPlus}
          color="border-green-500"
          description="Recently joined"
        />
        <StatCard
          title="Born Again"
          value={bornAgainCount}
          icon={Heart}
          color="border-red-500"
          description="Salvation testimonies"
        />
        <StatCard
          title="Water Baptized"
          value={waterBaptizedCount}
          icon={TrendingUp}
          color="border-blue-500"
          description="Baptism records"
        />
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <StatCard
          title="Spirit Baptized"
          value={spiritBaptizedCount}
          icon={BarChart3}
          color="border-yellow-500"
          description="Holy Spirit baptism"
        />
        <StatCard
          title="Newly Weds"
          value={newlyWeds.length}
          icon={Heart}
          color="border-pink-500"
          description="Recent marriages"
        />
        <StatCard
          title="Baby Dedications"
          value={babyDedications.length}
          icon={Calendar}
          color="border-purple-500"
          description="Child dedications"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <QuickActionCard
            title="Register New Member"
            description="Add a new member to the church database"
            icon={UserPlus}
            href="/register"
            color="text-blue-600"
          />
          <QuickActionCard
            title="View All Members"
            description="Browse and manage existing members"
            icon={Users}
            href="/members"
            color="text-green-600"
          />
          <QuickActionCard
            title="Special Registry"
            description="Manage weddings and baby dedications"
            icon={Heart}
            href="/special-registry"
            color="text-red-600"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Recent Activity</h2>
        {members.length > 0 ? (
          <div className="space-y-4">
            {members.slice(-5).reverse().map((member) => (
              <div key={member.id} className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm lg:text-base">{member.fullName}</p>
                  <p className="text-xs lg:text-sm text-gray-600">
                    Joined on {new Date(member.dateJoinedChurch).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs lg:text-sm text-gray-500 hidden sm:inline">{member.ageGroup}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 lg:py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No members yet</h3>
            <p className="text-sm lg:text-base text-gray-600 mb-4">Start by registering your first church member</p>
            <a
              href="/register"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm lg:text-base font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Register First Member
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;