import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Filter, Download, Eye, Edit, Trash2, UserPlus } from 'lucide-react';
import { storageService } from '../utils/storage';
import { exportMembersToExcel, exportMembersToPDF } from '../utils/exportUtils';
import { logDataAccess } from '../utils/dataPrivacy';

const MembersList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'dateJoined' | 'ageGroup'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const members = storageService.getMembers();

  // Get unique values for filters
  const ageGroups = [...new Set(members.map(m => m.ageGroup))].sort();
  const ministries = [...new Set(members.flatMap(m => m.ministries))].sort();

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    let filtered = members.filter(member => {
      const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.phone.includes(searchTerm);
      const matchesAgeGroup = !selectedAgeGroup || member.ageGroup === selectedAgeGroup;
      const matchesGender = !selectedGender || member.gender === selectedGender;
      const matchesMinistry = !selectedMinistry || member.ministries.includes(selectedMinistry);

      return matchesSearch && matchesAgeGroup && matchesGender && matchesMinistry;
    });

    // Sort members
    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortBy) {
        case 'name':
          aValue = a.fullName;
          bValue = b.fullName;
          break;
        case 'dateJoined':
          aValue = new Date(a.dateJoinedChurch);
          bValue = new Date(b.dateJoinedChurch);
          break;
        case 'ageGroup':
          aValue = a.ageGroup;
          bValue = b.ageGroup;
          break;
        default:
          aValue = a.fullName;
          bValue = b.fullName;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [members, searchTerm, selectedAgeGroup, selectedGender, selectedMinistry, sortBy, sortOrder]);

  const handleExportExcel = () => {
    try {
      exportMembersToExcel(filteredMembers);
      logDataAccess({
        userId: 'current-user',
        action: 'export',
        memberIds: filteredMembers.map(m => m.id),
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export members to Excel');
    }
  };

  const handleExportPDF = () => {
    try {
      exportMembersToPDF(filteredMembers);
      logDataAccess({
        userId: 'current-user',
        action: 'export',
        memberIds: filteredMembers.map(m => m.id),
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export members to PDF');
    }
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        storageService.deleteMember(id);
        logDataAccess({
          userId: 'current-user',
          action: 'delete',
          memberIds: [id],
        });
        // Force re-render by updating the component
        window.location.reload();
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete member');
      }
    }
  };

  const MemberCard: React.FC<{ member: any }> = ({ member }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.fullName}</h3>
          <p className="text-sm text-gray-600">{member.occupation}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              member.ageGroup === 'Children' ? 'bg-green-100 text-green-800' :
              member.ageGroup === 'Youth' ? 'bg-blue-100 text-blue-800' :
              member.ageGroup === 'Young Adults' ? 'bg-purple-100 text-purple-800' :
              member.ageGroup === 'Adults' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {member.ageGroup}
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{member.gender}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium w-16">Phone:</span>
          <span>{member.phone}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium w-16">Email:</span>
          <span className="truncate">{member.email}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium w-16">Joined:</span>
          <span>{new Date(member.dateJoinedChurch).toLocaleDateString()}</span>
        </div>
      </div>

      {member.ministries.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Ministries:</p>
          <div className="flex flex-wrap gap-1">
            {member.ministries.slice(0, 3).map((ministry: string) => (
              <span key={ministry} className="px-2 py-1 bg-gold-100 text-gold-800 rounded text-xs">
                {ministry}
              </span>
            ))}
            {member.ministries.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{member.ministries.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex space-x-1">
          {member.bornAgain.status && (
            <div className="w-3 h-3 bg-red-500 rounded-full" title="Born Again" />
          )}
          {member.waterBaptized.status && (
            <div className="w-3 h-3 bg-blue-500 rounded-full" title="Water Baptized" />
          )}
          {member.spiritBaptized.status && (
            <div className="w-3 h-3 bg-yellow-500 rounded-full" title="Spirit Baptized" />
          )}
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/members/${member.id}`}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="View Profile"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            to={`/members/${member.id}/edit`}
            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
            title="Edit Member"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDeleteMember(member.id, member.fullName)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete Member"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl lg:rounded-2xl shadow-lg text-white p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Church Members</h1>
            <p className="text-blue-100 text-base lg:text-lg">Manage and view all registered members</p>
          </div>
          <div className="text-right">
            <p className="text-xl lg:text-2xl font-bold">{filteredMembers.length}</p>
            <p className="text-blue-100 text-sm lg:text-base">Total Members</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-full lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 lg:gap-3">
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="px-2 lg:px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Age Groups</option>
              {ageGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>

            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="px-2 lg:px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className="px-2 lg:px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Ministries</option>
              {ministries.map(ministry => (
                <option key={ministry} value={ministry}>{ministry}</option>
              ))}
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="px-2 lg:px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="dateJoined-desc">Recently Joined</option>
              <option value="dateJoined-asc">Oldest Members</option>
              <option value="ageGroup-asc">Age Group</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 lg:gap-3">
            <button
              onClick={handleExportExcel}
              className="px-3 lg:px-4 py-2 bg-green-600 text-white text-sm lg:text-base font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 lg:space-x-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 lg:px-4 py-2 bg-red-600 text-white text-sm lg:text-base font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 lg:space-x-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <Link
              to="/register"
              className="px-3 lg:px-4 py-2 bg-blue-600 text-white text-sm lg:text-base font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 lg:space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
              <span className="sm:hidden">Add Member</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredMembers.map(member => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 lg:py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
            {members.length === 0 ? 'No members registered yet' : 'No members match your filters'}
          </h3>
          <p className="text-sm lg:text-base text-gray-600 mb-4">
            {members.length === 0 
              ? 'Start by registering your first church member'
              : 'Try adjusting your search criteria or filters'
            }
          </p>
          {members.length === 0 && (
            <Link
              to="/register"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm lg:text-base font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Register First Member
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default MembersList;