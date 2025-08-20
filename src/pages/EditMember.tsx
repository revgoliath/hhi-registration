import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, User, Calendar, MapPin, Phone, Mail, Heart, Droplets, Zap, Briefcase, Shield, Eye, ArrowLeft } from 'lucide-react';
import { Member } from '../types/Member';
import { storageService } from '../utils/storage';
import { assignAgeGroup } from '../utils/ageGroupAssignment';
import { logDataAccess } from '../utils/dataPrivacy';
import DateInput from '../components/DateInput';

const EditMember: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalMember, setOriginalMember] = useState<Member | null>(null);
  
  // Use refs to maintain input focus
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>>({});
  
  const [formData, setFormData] = useState<Partial<Member>>({
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    maritalStatus: 'Single',
    occupation: '',
    nationalId: '',
    phone: '',
    email: '',
    address: '',
    dateJoinedChurch: '',
    invitedBy: '',
    bornAgain: { status: false, date: '' },
    waterBaptized: { status: false, date: '' },
    spiritBaptized: { status: false, date: '' },
    notes: '',
    ministries: [],
  });

  const ministryOptions = [
    'Ushering', 'Greeters', 'Security & Protocol', 'Compassion Ministry',
    'Counselling', 'Graphics & Displays', 'Social Media', 'Production',
    'Sound Engineering', 'Worship Team', 'Children Ministry', 'Youth Ministry',
    'Prayer Ministry', 'Evangelism', 'Administrative'
  ];

  // Load member data on component mount
  useEffect(() => {
    if (!id) {
      navigate('/members');
      return;
    }

    const members = storageService.getMembers();
    const member = members.find(m => m.id === id);
    
    if (!member) {
      navigate('/members');
      return;
    }

    // Log data access
    logDataAccess({
      userId: 'current-user',
      action: 'edit',
      memberIds: [id],
    });

    setOriginalMember(member);
    setFormData({
      fullName: member.fullName,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      maritalStatus: member.maritalStatus,
      occupation: member.occupation,
      nationalId: member.nationalId || '',
      phone: member.phone,
      email: member.email,
      address: member.address,
      dateJoinedChurch: member.dateJoinedChurch,
      invitedBy: member.invitedBy || '',
      bornAgain: member.bornAgain,
      waterBaptized: member.waterBaptized,
      spiritBaptized: member.spiritBaptized,
      notes: member.notes || '',
      ministries: member.ministries,
    });
  }, [id, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName?.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.occupation?.trim()) newErrors.occupation = 'Occupation is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.dateJoinedChurch) newErrors.dateJoinedChurch = 'Date joined church is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !originalMember) return;

    setIsSubmitting(true);

    try {
      const updatedMember: Member = {
        ...originalMember,
        fullName: formData.fullName!,
        dateOfBirth: formData.dateOfBirth!,
        gender: formData.gender!,
        maritalStatus: formData.maritalStatus!,
        occupation: formData.occupation!,
        nationalId: formData.nationalId,
        phone: formData.phone!,
        email: formData.email!,
        address: formData.address!,
        dateJoinedChurch: formData.dateJoinedChurch!,
        invitedBy: formData.invitedBy,
        bornAgain: formData.bornAgain!,
        waterBaptized: formData.waterBaptized!,
        spiritBaptized: formData.spiritBaptized!,
        notes: formData.notes,
        ministries: formData.ministries!,
        ageGroup: assignAgeGroup(formData),
        updatedAt: new Date().toISOString(),
      };

      // Save updated member
      storageService.saveMember(updatedMember);

      navigate(`/members/${id}`, { state: { message: 'Member updated successfully!' } });
    } catch (error) {
      console.error('Error updating member:', error);
      setErrors({ submit: 'Failed to update member. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stable input change handler that preserves focus
  const handleInputChange = useCallback((field: keyof Member, value: any) => {
    // Store current focus before state update
    const activeElement = document.activeElement as HTMLElement;
    const fieldName = activeElement?.getAttribute('data-field');
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Restore focus after state update
    setTimeout(() => {
      if (fieldName && inputRefs.current[fieldName]) {
        const element = inputRefs.current[fieldName];
        if (element && document.activeElement !== element) {
          element.focus();
          // Restore cursor position for text inputs that support setSelectionRange
          if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            // Check if the input type supports setSelectionRange
            const supportsSelection = element instanceof HTMLTextAreaElement || 
              (element instanceof HTMLInputElement && 
               ['text', 'search', 'url', 'tel', 'password'].includes(element.type));
            
            if (supportsSelection) {
              const cursorPos = element.value.length;
              element.setSelectionRange(cursorPos, cursorPos);
            }
          }
        }
      }
    }, 0);
  }, [errors]);

  const handleSpiritualStatusChange = useCallback((type: 'bornAgain' | 'waterBaptized' | 'spiritBaptized', status: boolean, date?: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: { status, date: date || '' }
    }));
  }, []);

  const toggleMinistry = useCallback((ministry: string) => {
    setFormData(prev => ({
      ...prev,
      ministries: prev.ministries?.includes(ministry)
        ? prev.ministries.filter(m => m !== ministry)
        : [...(prev.ministries || []), ministry]
    }));
  }, []);

  const InputField: React.FC<{
    label: string;
    field: keyof Member;
    type?: string;
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
    icon?: React.ComponentType<any>;
    placeholder?: string;
  }> = ({ label, field, type = 'text', required = false, options, icon: Icon, placeholder }) => (
    <div className="form-field">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-4 w-4 text-gray-500" />}
          <span>{label} {required && <span className="text-red-500">*</span>}</span>
        </div>
      </label>
      {options ? (
        <select
          ref={(el) => { if (el) inputRefs.current[field] = el; }}
          data-field={field}
          value={formData[field] as string || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white ${
            errors[field] ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          ref={(el) => { if (el) inputRefs.current[field] = el; }}
          data-field={field}
          value={formData[field] as string || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          rows={4}
          className={`w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical text-gray-900 bg-white ${
            errors[field] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          spellCheck={true}
        />
      ) : type === 'date' ? (
        <DateInput
          value={formData[field] as string || ''}
          onChange={(value) => handleInputChange(field, value)}
          className={errors[field] ? 'border-red-500' : 'border-gray-300'}
          placeholder="DD/MM/YYYY"
          min="1900-01-01"
          max={new Date().toISOString().split('T')[0]}
          required={required}
        />
      ) : (
        <input
          ref={(el) => { if (el) inputRefs.current[field] = el; }}
          data-field={field}
          type={type}
          value={formData[field] as string || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white ${
            errors[field] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          autoComplete={
            field === 'fullName' ? 'name' :
            field === 'email' ? 'email' :
            field === 'phone' ? 'tel' :
            field === 'address' ? 'address-line1' :
            field === 'occupation' ? 'organization-title' :
            'off'
          }
          spellCheck={field === 'occupation' || field === 'fullName' || field === 'address' || field === 'notes'}
        />
      )}
      {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
    </div>
  );

  const SpiritualStatusSection: React.FC<{
    title: string;
    type: 'bornAgain' | 'waterBaptized' | 'spiritBaptized';
    icon: React.ComponentType<any>;
    color: string;
  }> = ({ title, type, icon: Icon, color }) => (
    <div className={`bg-white border-l-4 ${color} rounded-lg p-4 sm:p-6 shadow-sm`}>
      <div className="flex items-center space-x-3 mb-4">
        <Icon className={`h-5 w-5 ${color.replace('border-', 'text-')}`} />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData[type]?.status || false}
              onChange={(e) => handleSpiritualStatusChange(type, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Yes</span>
          </label>
        </div>
        {formData[type]?.status && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <DateInput
              value={formData[type]?.date || ''}
              onChange={(value) => handleSpiritualStatusChange(type, true, value)}
              className="border-gray-300"
              placeholder="DD/MM/YYYY"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        )}
      </div>
    </div>
  );

  if (!originalMember) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <User className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Loading member...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 sm:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link
              to={`/members/${id}`}
              className="p-2 text-blue-100 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Edit Member</h1>
              <p className="text-blue-100 mt-1">Update {originalMember.fullName}'s information</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Personal Information */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Personal Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="md:col-span-2">
                <InputField 
                  label="Full Name" 
                  field="fullName" 
                  required 
                  icon={User}
                  placeholder="Enter full name (e.g., John Doe Smith)"
                />
              </div>
              <InputField 
                label="Date of Birth" 
                field="dateOfBirth" 
                type="date" 
                required 
                icon={Calendar}
              />
              <InputField 
                label="Gender" 
                field="gender" 
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' }
                ]}
              />
              <InputField 
                label="Marital Status" 
                field="maritalStatus" 
                options={[
                  { value: 'Single', label: 'Single' },
                  { value: 'Married', label: 'Married' },
                  { value: 'Divorced', label: 'Divorced' },
                  { value: 'Widowed', label: 'Widowed' }
                ]}
              />
              <InputField 
                label="Occupation" 
                field="occupation" 
                required 
                icon={Briefcase}
                placeholder="Enter occupation (e.g., Teacher, Engineer, Student)"
              />
              <InputField 
                label="National ID / Passport" 
                field="nationalId"
                placeholder="Enter ID or passport number"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-2">
              <Phone className="h-5 w-5 text-blue-600" />
              <span>Contact Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <InputField 
                label="Phone" 
                field="phone" 
                type="tel" 
                required 
                icon={Phone}
                placeholder="Enter phone number (e.g., +254 700 123 456)"
              />
              <InputField 
                label="Email" 
                field="email" 
                type="email" 
                required 
                icon={Mail}
                placeholder="Enter email address (e.g., john@example.com)"
              />
              <div className="md:col-span-2">
                <InputField 
                  label="Address" 
                  field="address" 
                  type="textarea" 
                  required 
                  icon={MapPin}
                  placeholder="Enter full address including city, county, and postal code"
                />
              </div>
            </div>
          </div>

          {/* Church Information */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Church Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <InputField 
                label="Date Joined Church" 
                field="dateJoinedChurch" 
                type="date" 
                required 
                icon={Calendar}
              />
              <InputField 
                label="Invited By" 
                field="invitedBy"
                placeholder="Enter name of person who invited them"
              />
            </div>
          </div>

          {/* Spiritual Status */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Spiritual Status</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <SpiritualStatusSection
                title="Born Again"
                type="bornAgain"
                icon={Heart}
                color="border-red-500"
              />
              <SpiritualStatusSection
                title="Water Baptized"
                type="waterBaptized"
                icon={Droplets}
                color="border-blue-500"
              />
              <SpiritualStatusSection
                title="Spirit Baptized"
                type="spiritBaptized"
                icon={Zap}
                color="border-yellow-500"
              />
            </div>
          </div>

          {/* Ministry Involvement */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Ministry Involvement</h2>
            <p className="text-gray-600 mb-4">Select all ministries the member is involved in (optional):</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {ministryOptions.map(ministry => (
                <label
                  key={ministry}
                  className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    formData.ministries?.includes(ministry)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.ministries?.includes(ministry) || false}
                    onChange={() => toggleMinistry(ministry)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{ministry}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6 sm:mb-8">
            <InputField 
              label="Additional Notes" 
              field="notes" 
              type="textarea"
              placeholder="Enter any additional information about the member (optional)"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to={`/members/${id}`}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center space-x-2 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save className="h-5 w-5" />
              <span>{isSubmitting ? 'Updating...' : 'Update Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMember;