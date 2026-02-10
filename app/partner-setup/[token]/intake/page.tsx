'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import {
  Loader2,
  AlertCircle,
  Building2,
  School,
  Users,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Plus,
  Trash2,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Partnership {
  id: string;
  partnership_type: 'district' | 'school';
  contact_name: string;
  contact_email: string;
  contract_phase: string;
  building_count: number;
  status: string;
}

interface Building {
  id?: string;
  name: string;
  building_type: string;
  lead_name: string;
  lead_email: string;
  estimated_staff_count: number;
}

interface StaffMember {
  first_name: string;
  last_name: string;
  email: string;
  role_title: string;
  building_name?: string;
}

interface OrgData {
  name: string;
  org_type: 'district' | 'school';
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  website: string;
  superintendent_name: string;
  superintendent_email: string;
  principal_name: string;
  principal_email: string;
  school_type: string;
}

type Step = 1 | 2 | 3;

function IntakeWizardContent() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [orgData, setOrgData] = useState<OrgData>({
    name: '',
    org_type: 'district',
    address_street: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    website: '',
    superintendent_name: '',
    superintendent_email: '',
    principal_name: '',
    principal_email: '',
    school_type: '',
  });

  const [buildings, setBuildings] = useState<Building[]>([
    { name: '', building_type: 'elementary', lead_name: '', lead_email: '', estimated_staff_count: 0 },
  ]);

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [csvFileName, setCsvFileName] = useState('');

  // Load partnership and check authorization
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push(`/partner-setup/${token}`);
          return;
        }

        // Fetch partnership
        const response = await fetch(`/api/partner-setup/${token}/intake`, {
          headers: {
            'x-user-id': session.user.id,
          },
        });

        const data = await response.json();

        if (data.success) {
          setPartnership(data.partnership);
          setOrgData(prev => ({
            ...prev,
            org_type: data.partnership.partnership_type,
          }));
          setIsAuthorized(true);

          // Pre-fill buildings based on building_count
          if (data.partnership.partnership_type === 'district' && data.partnership.building_count > 1) {
            const initialBuildings = Array(data.partnership.building_count).fill(null).map(() => ({
              name: '',
              building_type: 'elementary',
              lead_name: '',
              lead_email: '',
              estimated_staff_count: 0,
            }));
            setBuildings(initialBuildings);
          }
        } else {
          setErrorMessage(data.error || 'Unauthorized');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setErrorMessage('Failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      checkAuth();
    }
  }, [token, router]);

  const handleOrgChange = (field: keyof OrgData, value: string) => {
    setOrgData(prev => ({ ...prev, [field]: value }));
  };

  const handleBuildingChange = (index: number, field: keyof Building, value: string | number) => {
    setBuildings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addBuilding = () => {
    setBuildings(prev => [
      ...prev,
      { name: '', building_type: 'elementary', lead_name: '', lead_email: '', estimated_staff_count: 0 },
    ]);
  };

  const removeBuilding = (index: number) => {
    if (buildings.length > 1) {
      setBuildings(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

      const firstNameIdx = headers.findIndex(h => h.includes('first') && h.includes('name'));
      const lastNameIdx = headers.findIndex(h => h.includes('last') && h.includes('name'));
      const emailIdx = headers.findIndex(h => h.includes('email'));
      const roleIdx = headers.findIndex(h => h.includes('role') || h.includes('title') || h.includes('position'));
      const buildingIdx = headers.findIndex(h => h.includes('building') || h.includes('school'));

      const staff: StaffMember[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));

        if (values.length >= 3) {
          staff.push({
            first_name: firstNameIdx >= 0 ? values[firstNameIdx] : values[0] || '',
            last_name: lastNameIdx >= 0 ? values[lastNameIdx] : values[1] || '',
            email: emailIdx >= 0 ? values[emailIdx] : values[2] || '',
            role_title: roleIdx >= 0 ? values[roleIdx] : '',
            building_name: buildingIdx >= 0 ? values[buildingIdx] : '',
          });
        }
      }

      setStaffList(staff);
    };

    reader.readAsText(file);
  };

  const clearCSV = () => {
    setStaffList([]);
    setCsvFileName('');
  };

  const handleSaveStep = async (step: Step) => {
    setIsSaving(true);
    setErrorMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push(`/partner-setup/${token}`);
        return;
      }

      const response = await fetch(`/api/partner-setup/${token}/intake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session.user.id,
        },
        body: JSON.stringify({
          step,
          orgData: step === 1 ? orgData : undefined,
          buildings: step === 2 ? buildings : undefined,
          staff: step === 3 ? staffList : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (step === 3) {
          // Completed - redirect to dashboard
          router.push(`/${partnership?.id}-dashboard`);
        } else {
          setCurrentStep((step + 1) as Step);
        }
      } else {
        setErrorMessage(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving:', error);
      setErrorMessage('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isStep1Valid = orgData.name.trim() !== '';
  const isStep2Valid = partnership?.partnership_type === 'school' || buildings.every(b => b.name.trim() !== '');
  const isStep3Valid = staffList.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (!isAuthorized || !partnership) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e2749] mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{errorMessage || 'Please complete the signup process first.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container-wide py-4 flex items-center justify-between">
          <Image
            src="/images/logo.webp"
            alt="Teachers Deserve It"
            width={140}
            height={42}
            className="h-10 w-auto"
          />
          <span className="text-sm text-gray-600">Partner Setup</span>
        </div>
      </header>

      <main className="container-wide py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  currentStep > step
                    ? 'bg-green-500 text-white'
                    : currentStep === step
                    ? 'bg-[#1e2749] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 rounded ${
                    currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between mb-8 px-4">
            <span className={`text-sm ${currentStep >= 1 ? 'text-[#1e2749] font-medium' : 'text-gray-500'}`}>
              Organization
            </span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-[#1e2749] font-medium' : 'text-gray-500'}`}>
              {partnership.partnership_type === 'district' ? 'Buildings' : 'Details'}
            </span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-[#1e2749] font-medium' : 'text-gray-500'}`}>
              Staff Roster
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {/* Step 1: Organization */}
            {currentStep === 1 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  {partnership.partnership_type === 'district' ? (
                    <Building2 className="w-6 h-6 text-purple-600" />
                  ) : (
                    <School className="w-6 h-6 text-blue-600" />
                  )}
                  <h2 className="text-xl font-semibold text-[#1e2749]">
                    {partnership.partnership_type === 'district' ? 'District' : 'School'} Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {partnership.partnership_type === 'district' ? 'District Name' : 'School Name'} *
                    </label>
                    <input
                      type="text"
                      value={orgData.name}
                      onChange={(e) => handleOrgChange('name', e.target.value)}
                      placeholder={partnership.partnership_type === 'district' ? 'e.g., Springfield Public Schools' : 'e.g., Lincoln Elementary School'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    />
                  </div>

                  {partnership.partnership_type === 'school' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">School Type</label>
                      <select
                        value={orgData.school_type}
                        onChange={(e) => handleOrgChange('school_type', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                      >
                        <option value="">Select type...</option>
                        <option value="elementary">Elementary</option>
                        <option value="middle">Middle School</option>
                        <option value="high">High School</option>
                        <option value="k8">K-8</option>
                        <option value="k12">K-12</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={orgData.address_street}
                      onChange={(e) => handleOrgChange('address_street', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={orgData.address_city}
                        onChange={(e) => handleOrgChange('address_city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={orgData.address_state}
                        onChange={(e) => handleOrgChange('address_state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                      <input
                        type="text"
                        value={orgData.address_zip}
                        onChange={(e) => handleOrgChange('address_zip', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={orgData.website}
                      onChange={(e) => handleOrgChange('website', e.target.value)}
                      placeholder="https://"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    />
                  </div>

                  {partnership.partnership_type === 'district' && (
                    <>
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-medium text-[#1e2749] mb-3">Superintendent</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              value={orgData.superintendent_name}
                              onChange={(e) => handleOrgChange('superintendent_name', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              value={orgData.superintendent_email}
                              onChange={(e) => handleOrgChange('superintendent_email', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {partnership.partnership_type === 'school' && (
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="font-medium text-[#1e2749] mb-3">Principal</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={orgData.principal_name}
                            onChange={(e) => handleOrgChange('principal_name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={orgData.principal_email}
                            onChange={(e) => handleOrgChange('principal_email', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Buildings */}
            {currentStep === 2 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-[#1e2749]">
                    {partnership.partnership_type === 'district' ? 'Buildings' : 'Building Details'}
                  </h2>
                </div>

                {partnership.partnership_type === 'district' ? (
                  <div className="space-y-4">
                    {buildings.map((building, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                        {buildings.length > 1 && (
                          <button
                            onClick={() => removeBuilding(index)}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Building Name *
                            </label>
                            <input
                              type="text"
                              value={building.name}
                              onChange={(e) => handleBuildingChange(index, 'name', e.target.value)}
                              placeholder="e.g., Lincoln Elementary"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                              value={building.building_type}
                              onChange={(e) => handleBuildingChange(index, 'building_type', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                            >
                              <option value="elementary">Elementary</option>
                              <option value="middle">Middle School</option>
                              <option value="high">High School</option>
                              <option value="k8">K-8</option>
                              <option value="admin">Admin Building</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Est. Staff</label>
                            <input
                              type="number"
                              min="0"
                              value={building.estimated_staff_count || ''}
                              onChange={(e) => handleBuildingChange(index, 'estimated_staff_count', parseInt(e.target.value) || 0)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Building Lead</label>
                            <input
                              type="text"
                              value={building.lead_name}
                              onChange={(e) => handleBuildingChange(index, 'lead_name', e.target.value)}
                              placeholder="Principal name"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Email</label>
                            <input
                              type="email"
                              value={building.lead_email}
                              onChange={(e) => handleBuildingChange(index, 'lead_email', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addBuilding}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#80a4ed] hover:text-[#80a4ed] transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Building
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <School className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>School partnerships don&apos;t require additional buildings.</p>
                    <p className="text-sm">Click Continue to proceed to staff upload.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Staff Roster */}
            {currentStep === 3 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-[#1e2749]">Staff Roster</h2>
                </div>

                {staffList.length === 0 ? (
                  <div className="text-center py-8">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-medium text-[#1e2749] mb-2">Upload Staff CSV</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Upload a CSV file with columns: First Name, Last Name, Email, Role/Title
                      {partnership.partnership_type === 'district' && ', Building'}
                    </p>

                    <label className="inline-flex items-center gap-2 bg-[#1e2749] text-white px-6 py-3 rounded-lg hover:bg-[#2a3459] transition-colors cursor-pointer">
                      <Upload className="w-5 h-5" />
                      Choose CSV File
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                      />
                    </label>

                    <p className="text-xs text-gray-500 mt-4">
                      Need a template?{' '}
                      <a href="#" className="text-[#80a4ed] hover:underline">
                        Download sample CSV
                      </a>
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-[#1e2749]">{staffList.length} staff members</span>
                        <span className="text-sm text-gray-500">from {csvFileName}</span>
                      </div>
                      <button
                        onClick={clearCSV}
                        className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Clear
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
                              <th className="text-left px-3 py-2 font-medium text-gray-600">Email</th>
                              <th className="text-left px-3 py-2 font-medium text-gray-600">Role</th>
                              {partnership.partnership_type === 'district' && (
                                <th className="text-left px-3 py-2 font-medium text-gray-600">Building</th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {staffList.slice(0, 10).map((staff, idx) => (
                              <tr key={idx}>
                                <td className="px-3 py-2">
                                  {staff.first_name} {staff.last_name}
                                </td>
                                <td className="px-3 py-2 text-gray-600">{staff.email}</td>
                                <td className="px-3 py-2 text-gray-600">{staff.role_title || '-'}</td>
                                {partnership.partnership_type === 'district' && (
                                  <td className="px-3 py-2 text-gray-600">{staff.building_name || '-'}</td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {staffList.length > 10 && (
                        <div className="px-3 py-2 bg-gray-50 text-sm text-gray-500 text-center">
                          + {staffList.length - 10} more staff members
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 ? (
                <button
                  onClick={() => setCurrentStep((currentStep - 1) as Step)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#1e2749] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => handleSaveStep(currentStep)}
                disabled={
                  isSaving ||
                  (currentStep === 1 && !isStep1Valid) ||
                  (currentStep === 2 && !isStep2Valid) ||
                  (currentStep === 3 && !isStep3Valid)
                }
                className="flex items-center gap-2 bg-[#1e2749] text-white px-6 py-3 rounded-lg hover:bg-[#2a3459] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : currentStep === 3 ? (
                  <>
                    Complete Setup
                    <Check className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function IntakeWizardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <IntakeWizardContent />
    </Suspense>
  );
}
