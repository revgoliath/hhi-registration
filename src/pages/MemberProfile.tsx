import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Phone, Mail, MapPin, Users, Heart, Droplets, Zap, Edit, Briefcase, Printer } from 'lucide-react';
import { storageService } from '../utils/storage';
import { calculateAge } from '../utils/ageGroupAssignment';
import { printMemberProfile } from '../utils/exportUtils';

const MemberProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const members = storageService.getMembers();
  const member = members.find(m => m.id === id);
  const message = location.state?.message;

  if (!member) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <Users className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Member not found</h3>
          <Link to="/members" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Back to Members
          </Link>
        </div>
      </div>
    );
  }

  const age = calculateAge(member.dateOfBirth);

  const handlePrintProfile = () => {
    printMemberProfile(member);
  };

  const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon?: React.ComponentType<any> }> = ({ title, children, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        {Icon && <Icon className="h-5 w-5 text-blue-600" />}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const StatusBadge: React.FC<{ status: boolean; label: string; date?: string; color: string }> = ({ status, label, date, color }) => (
    <div className={`p-4 rounded-lg border-l-4 ${status ? `bg-${color}-50 border-${color}-500` : 'bg-gray-50 border-gray-300'}`}>
      <div className="flex items-center space-x-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${status ? `bg-${color}-500` : 'bg-gray-300'}`} />
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      {status && date && (
        <p className="text-sm text-gray-600">Date: {new Date(date).toLocaleDateString()}</p>
      )}
      {!status && (
        <p className="text-sm text-gray-500">Not yet</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">{message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/members"
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{member.fullName}</h1>
          <p className="text-gray-600">{member.ageGroup} • {age} years old • {member.occupation}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handlePrintProfile}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Print Profile</span>
          </button>
          <Link
            to={`/members/${member.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <InfoCard title="Personal Information" icon={Users}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900 font-medium">{member.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Gender</label>
                <p className="text-gray-900">{member.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="text-gray-900">{new Date(member.dateOfBirth).toLocaleDateString()} ({age} years)</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Marital Status</label>
                <p className="text-gray-900">{member.maritalStatus}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Occupation</label>
                <p className="text-gray-900">{member.occupation}</p>
              </div>
              {member.nationalId && (
                <div>
                  <label className="text-sm font-medium text-gray-600">National ID</label>
                  <p className="text-gray-900">{member.nationalId}</p>
                </div>
              )}
            </div>
          </InfoCard>

          <InfoCard title="Contact Information" icon={Phone}>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{member.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{member.email}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-gray-900">{member.address}</p>
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Church Information" icon={Calendar}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Date Joined Church</label>
                <p className="text-gray-900">{new Date(member.dateJoinedChurch).toLocaleDateString()}</p>
              </div>
              {member.invitedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Invited By</label>
                  <p className="text-gray-900">{member.invitedBy}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Age Group</label>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {member.ageGroup}
                </span>
              </div>
            </div>
          </InfoCard>

          {member.ministries.length > 0 && (
            <InfoCard title="Ministry Involvement">
              <div className="flex flex-wrap gap-2">
                {member.ministries.map(ministry => (
                  <span
                    key={ministry}
                    className="px-3 py-1 bg-gold-100 text-gold-800 rounded-full text-sm font-medium"
                  >
                    {ministry}
                  </span>
                ))}
              </div>
            </InfoCard>
          )}

          {member.notes && (
            <InfoCard title="Notes">
              <p className="text-gray-700 leading-relaxed">{member.notes}</p>
            </InfoCard>
          )}
        </div>

        {/* Spiritual Status */}
        <div className="space-y-6">
          <InfoCard title="Spiritual Status">
            <div className="space-y-4">
              <StatusBadge
                status={member.bornAgain.status}
                label="Born Again"
                date={member.bornAgain.date}
                color="red"
              />
              <StatusBadge
                status={member.waterBaptized.status}
                label="Water Baptized"
                date={member.waterBaptized.date}
                color="blue"
              />
              <StatusBadge
                status={member.spiritBaptized.status}
                label="Spirit Baptized"
                date={member.spiritBaptized.date}
                color="yellow"
              />
            </div>
          </InfoCard>

          <InfoCard title="Quick Stats">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium text-gray-900">
                  {Math.floor((new Date().getTime() - new Date(member.dateJoinedChurch).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age</span>
                <span className="font-medium text-gray-900">{age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ministries</span>
                <span className="font-medium text-gray-900">{member.ministries.length}</span>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;