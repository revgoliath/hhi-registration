import React, { useState } from 'react';
import { Heart, Baby, Users, Plus, Calendar, User, X, Save } from 'lucide-react';
import { storageService } from '../utils/storage';
import { NewlyWed, MarriagePreparation, BabyDedication } from '../types/Member';
import DateInput from '../components/DateInput';

const SpecialRegistry: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'newlyweds' | 'marriage-prep' | 'baby-dedication'>('newlyweds');
  const [showAddForm, setShowAddForm] = useState(false);

  const newlyWeds = storageService.getNewlyWeds();
  const marriagePrep = storageService.getMarriagePrep();
  const babyDedications = storageService.getBabyDedications();
  const members = storageService.getMembers();

  const tabs = [
    { id: 'newlyweds', label: 'Newly Weds', icon: Heart, count: newlyWeds.length },
    { id: 'marriage-prep', label: 'Marriage Preparation', icon: Users, count: marriagePrep.length },
    { id: 'baby-dedication', label: 'Baby Dedications', icon: Baby, count: babyDedications.length },
  ];

  const StatCard: React.FC<{ title: string; value: number; icon: React.ComponentType<any>; color: string }> = 
    ({ title, value, icon: Icon, color }) => (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`h-6 w-6 ${color.replace('border-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  const NewlyWedCard: React.FC<{ record: NewlyWed }> = ({ record }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Heart className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{record.coupleNames}</h3>
            <p className="text-sm text-gray-600">Wedding: {new Date(record.dateOfWedding).toLocaleDateString()}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          record.counsellingStatus === 'Completed' ? 'bg-green-100 text-green-800' :
          record.counsellingStatus === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {record.counsellingStatus}
        </span>
      </div>
      {record.assignedMentor && (
        <p className="text-sm text-gray-600">
          <span className="font-medium">Mentor:</span> {record.assignedMentor}
        </p>
      )}
    </div>
  );

  const MarriagePrepCard: React.FC<{ record: MarriagePreparation }> = ({ record }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{record.coupleNames}</h3>
            <p className="text-sm text-gray-600">
              Intended Wedding: {new Date(record.intendedWeddingDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Sessions Progress</span>
          <span>{record.sessionsAttended}/{record.totalSessions}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${(record.sessionsAttended / record.totalSessions) * 100}%` }}
          />
        </div>
      </div>
      {record.notes && (
        <p className="text-sm text-gray-700 italic">{record.notes}</p>
      )}
    </div>
  );

  const BabyDedicationCard: React.FC<{ record: BabyDedication }> = ({ record }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Baby className="h-8 w-8 text-gold-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{record.childName}</h3>
            <p className="text-sm text-gray-600">Born: {new Date(record.dateOfBirth).toLocaleDateString()}</p>
          </div>
        </div>
        {record.dateDedicated && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Dedicated
          </span>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <p><span className="font-medium text-gray-700">Parents:</span> {record.parentNames}</p>
        {record.dateDedicated && (
          <p><span className="font-medium text-gray-700">Dedicated:</span> {new Date(record.dateDedicated).toLocaleDateString()}</p>
        )}
        {record.officiatingMinister && (
          <p><span className="font-medium text-gray-700">Minister:</span> {record.officiatingMinister}</p>
        )}
      </div>
    </div>
  );

  // Add Form Components
  const NewlyWedForm: React.FC = () => {
    const [formData, setFormData] = useState({
      coupleNames: '',
      dateOfWedding: '',
      counsellingStatus: 'Not Started' as NewlyWed['counsellingStatus'],
      assignedMentor: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!formData.coupleNames.trim()) newErrors.coupleNames = 'Couple names are required';
      if (!formData.dateOfWedding) newErrors.dateOfWedding = 'Wedding date is required';

      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        const newRecord: NewlyWed = {
          id: crypto.randomUUID(),
          ...formData,
          createdAt: new Date().toISOString(),
        };
        storageService.saveNewlyWed(newRecord);
        setShowAddForm(false);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>Add Newly Wed Couple</span>
          </h3>
          <button
            onClick={() => setShowAddForm(false)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couple Names <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.coupleNames}
              onChange={(e) => setFormData(prev => ({ ...prev, coupleNames: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.coupleNames ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., John Smith & Jane Doe"
            />
            {errors.coupleNames && <p className="text-red-500 text-sm mt-1">{errors.coupleNames}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wedding Date <span className="text-red-500">*</span>
            </label>
            <DateInput
              value={formData.dateOfWedding}
              onChange={(value) => setFormData(prev => ({ ...prev, dateOfWedding: value }))}
              className={errors.dateOfWedding ? 'border-red-500' : 'border-gray-300'}
              placeholder="DD/MM/YYYY"
            />
            {errors.dateOfWedding && <p className="text-red-500 text-sm mt-1">{errors.dateOfWedding}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Counselling Status
            </label>
            <select
              value={formData.counsellingStatus}
              onChange={(e) => setFormData(prev => ({ ...prev, counsellingStatus: e.target.value as NewlyWed['counsellingStatus'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Mentor
            </label>
            <input
              type="text"
              value={formData.assignedMentor}
              onChange={(e) => setFormData(prev => ({ ...prev, assignedMentor: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter mentor name"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Couple</span>
            </button>
          </div>
        </form>
      </div>
    );
  };

  const MarriagePrepForm: React.FC = () => {
    const [formData, setFormData] = useState({
      coupleNames: '',
      intendedWeddingDate: '',
      sessionsAttended: 0,
      totalSessions: 8,
      notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!formData.coupleNames.trim()) newErrors.coupleNames = 'Couple names are required';
      if (!formData.intendedWeddingDate) newErrors.intendedWeddingDate = 'Intended wedding date is required';
      if (formData.sessionsAttended > formData.totalSessions) {
        newErrors.sessionsAttended = 'Sessions attended cannot exceed total sessions';
      }

      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        const newRecord: MarriagePreparation = {
          id: crypto.randomUUID(),
          ...formData,
          createdAt: new Date().toISOString(),
        };
        storageService.saveMarriagePrep(newRecord);
        setShowAddForm(false);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Add Marriage Preparation</span>
          </h3>
          <button
            onClick={() => setShowAddForm(false)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couple Names <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.coupleNames}
              onChange={(e) => setFormData(prev => ({ ...prev, coupleNames: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.coupleNames ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., John Smith & Jane Doe"
            />
            {errors.coupleNames && <p className="text-red-500 text-sm mt-1">{errors.coupleNames}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intended Wedding Date <span className="text-red-500">*</span>
            </label>
            <DateInput
              value={formData.intendedWeddingDate}
              onChange={(value) => setFormData(prev => ({ ...prev, intendedWeddingDate: value }))}
              className={errors.intendedWeddingDate ? 'border-red-500' : 'border-gray-300'}
              placeholder="DD/MM/YYYY"
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.intendedWeddingDate && <p className="text-red-500 text-sm mt-1">{errors.intendedWeddingDate}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sessions Attended
              </label>
              <input
                type="number"
                min="0"
                value={formData.sessionsAttended}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionsAttended: parseInt(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.sessionsAttended ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.sessionsAttended && <p className="text-red-500 text-sm mt-1">{errors.sessionsAttended}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Sessions
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalSessions}
                onChange={(e) => setFormData(prev => ({ ...prev, totalSessions: parseInt(e.target.value) || 8 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes about the couple's preparation"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Preparation</span>
            </button>
          </div>
        </form>
      </div>
    );
  };

  const BabyDedicationForm: React.FC = () => {
    const [formData, setFormData] = useState({
      childName: '',
      dateOfBirth: '',
      parentNames: '',
      parentMemberIds: [] as string[],
      dateDedicated: '',
      officiatingMinister: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!formData.childName.trim()) newErrors.childName = 'Child name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.parentNames.trim()) newErrors.parentNames = 'Parent names are required';

      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        const newRecord: BabyDedication = {
          id: crypto.randomUUID(),
          ...formData,
          dateDedicated: formData.dateDedicated || undefined,
          officiatingMinister: formData.officiatingMinister || undefined,
          createdAt: new Date().toISOString(),
        };
        storageService.saveBabyDedication(newRecord);
        setShowAddForm(false);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Baby className="h-5 w-5 text-gold-500" />
            <span>Add Baby Dedication</span>
          </h3>
          <button
            onClick={() => setShowAddForm(false)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Child's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.childName}
              onChange={(e) => setFormData(prev => ({ ...prev, childName: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent ${
                errors.childName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter child's full name"
            />
            {errors.childName && <p className="text-red-500 text-sm mt-1">{errors.childName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <DateInput
              value={formData.dateOfBirth}
              onChange={(value) => setFormData(prev => ({ ...prev, dateOfBirth: value }))}
              className={errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}
              placeholder="DD/MM/YYYY"
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Names <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.parentNames}
              onChange={(e) => setFormData(prev => ({ ...prev, parentNames: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent ${
                errors.parentNames ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., John & Jane Smith"
            />
            {errors.parentNames && <p className="text-red-500 text-sm mt-1">{errors.parentNames}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dedication Date
            </label>
            <DateInput
              value={formData.dateDedicated}
              onChange={(value) => setFormData(prev => ({ ...prev, dateDedicated: value }))}
              className="border-gray-300"
              placeholder="DD/MM/YYYY (if already dedicated)"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Officiating Minister
            </label>
            <input
              type="text"
              value={formData.officiatingMinister}
              onChange={(e) => setFormData(prev => ({ ...prev, officiatingMinister: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              placeholder="Enter minister's name"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Dedication</span>
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderAddForm = () => {
    switch (activeTab) {
      case 'newlyweds':
        return <NewlyWedForm />;
      case 'marriage-prep':
        return <MarriagePrepForm />;
      case 'baby-dedication':
        return <BabyDedicationForm />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (showAddForm) {
      return renderAddForm();
    }

    switch (activeTab) {
      case 'newlyweds':
        return (
          <div className="space-y-4">
            {newlyWeds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newlyWeds.map(record => (
                  <NewlyWedCard key={record.id} record={record} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No newly wed couples registered</h3>
                <p className="text-gray-600">Start by adding your first couple</p>
              </div>
            )}
          </div>
        );
      
      case 'marriage-prep':
        return (
          <div className="space-y-4">
            {marriagePrep.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marriagePrep.map(record => (
                  <MarriagePrepCard key={record.id} record={record} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No couples in marriage preparation</h3>
                <p className="text-gray-600">Start by adding couples preparing for marriage</p>
              </div>
            )}
          </div>
        );
      
      case 'baby-dedication':
        return (
          <div className="space-y-4">
            {babyDedications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {babyDedications.map(record => (
                  <BabyDedicationCard key={record.id} record={record} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Baby className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No baby dedications scheduled</h3>
                <p className="text-gray-600">Start by adding your first baby dedication</p>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg text-white p-8">
        <h1 className="text-3xl font-bold mb-2">Special Registry</h1>
        <p className="text-blue-100 text-lg">Manage special church events and celebrations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Newly Wed Couples"
          value={newlyWeds.length}
          icon={Heart}
          color="border-red-500"
        />
        <StatCard
          title="Marriage Preparation"
          value={marriagePrep.length}
          icon={Users}
          color="border-blue-500"
        />
        <StatCard
          title="Baby Dedications"
          value={babyDedications.length}
          icon={Baby}
          color="border-gold-500"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setShowAddForm(false);
                }}
                className={`flex-1 px-6 py-4 text-center font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {!showAddForm && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <button 
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add New</span>
              </button>
            </div>
          )}

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SpecialRegistry;