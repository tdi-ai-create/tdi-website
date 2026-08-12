'use client';

import { useState, useEffect, Suspense } from 'react';
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
  Download,
  Mail,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SetupLanguageProvider, useSetupLanguage } from '@/lib/partner-setup/useSetupLanguage';
import SetupLanguageToggle from '@/components/partner-setup/SetupLanguageToggle';

// US States for dropdown
const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'Washington, D.C.' },
];

// Role options for staff
const ROLE_OPTIONS = [
  'Teacher',
  'Paraprofessional',
  'Instructional Coach',
  'Curriculum Director',
  'Assistant Principal',
  'Principal',
  'Counselor',
  'Specialist',
  'Other',
];

// Spanish role labels for display
const ROLE_LABELS_ES: Record<string, string> = {
  'Teacher': 'Maestro/a',
  'Paraprofessional': 'Paraprofesional',
  'Instructional Coach': 'Entrenador/a instruccional',
  'Curriculum Director': 'Director/a de curr\u00edculo',
  'Assistant Principal': 'Subdirector/a',
  'Principal': 'Director/a',
  'Counselor': 'Consejero/a',
  'Specialist': 'Especialista',
  'Other': 'Otro',
};

interface Partnership {
  id: string;
  partnership_type: 'district' | 'school';
  contact_name: string;
  contact_email: string;
  status: string;
  slug?: string;
}

interface StaffMember {
  first_name: string;
  last_name: string;
  email: string;
  role_title: string;
}

interface OrgData {
  name: string;
  org_type: 'district' | 'school';
  address_city: string;
  address_state: string;
}

type Step = 1 | 2;
type ViewState = 'wizard' | 'confirmation';

function IntakeWizardContent() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { language, t } = useSetupLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [viewState, setViewState] = useState<ViewState>('wizard');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dashboardSlug, setDashboardSlug] = useState('');

  // Form state - simplified to just name, city, state
  const [orgData, setOrgData] = useState<OrgData>({
    name: '',
    org_type: 'district',
    address_city: '',
    address_state: '',
  });

  // Staff state
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualStaff, setManualStaff] = useState<StaffMember>({
    first_name: '',
    last_name: '',
    email: '',
    role_title: '',
  });

  // Helper for org type label
  const orgTypeLabel = (type: 'district' | 'school') =>
    type === 'district' ? t('District', 'Distrito') : t('School', 'Escuela');

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
        } else {
          setErrorMessage(data.error || t('Unauthorized', 'No autorizado'));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setErrorMessage(t('Failed to load', 'Error al cargar'));
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

  // CSV upload handler
  const [csvParseMessage, setCsvParseMessage] = useState<string | null>(null);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size check (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCsvParseMessage(t(
        'File is too large. Please use a CSV under 5MB.',
        'El archivo es demasiado grande. Use un CSV de menos de 5MB.'
      ));
      return;
    }

    setCsvFileName(file.name);
    setCsvParseMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        setCsvParseMessage(t(
          'CSV appears empty. Make sure it has a header row and at least one staff member.',
          'El CSV parece vac\u00edo. Aseg\u00farese de que tenga una fila de encabezado y al menos un miembro del personal.'
        ));
        return;
      }

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/[^a-z0-9\s]/g, ''));

      // Flexible header matching
      const firstNameIdx = headers.findIndex(h =>
        (h.includes('first') && h.includes('name')) || h === 'firstname' || h === 'first' ||
        h === 'nombre'
      );
      const lastNameIdx = headers.findIndex(h =>
        (h.includes('last') && h.includes('name')) || h === 'lastname' || h === 'last' || h === 'surname' ||
        h === 'apellido'
      );
      const fullNameIdx = firstNameIdx < 0 ? headers.findIndex(h => h === 'name' || h === 'full name' || h === 'fullname' || h === 'nombre completo') : -1;
      const emailIdx = headers.findIndex(h => h.includes('email') || h === 'e-mail' || h === 'correo' || h.includes('correo'));
      const roleIdx = headers.findIndex(h =>
        h.includes('role') || h.includes('title') || h.includes('position') || h.includes('job') ||
        h.includes('puesto') || h.includes('cargo') || h.includes('rol')
      );

      if (emailIdx < 0 && firstNameIdx < 0 && fullNameIdx < 0) {
        setCsvParseMessage(t(
          'Could not find name or email columns. Make sure your CSV has headers like "First Name", "Last Name", "Email".',
          'No se encontraron columnas de nombre o correo electr\u00f3nico. Aseg\u00farese de que su CSV tenga encabezados como "Nombre", "Apellido", "Correo electr\u00f3nico".'
        ));
        return;
      }

      const staff: StaffMember[] = [];
      const seenEmails = new Set<string>();

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));

        if (values.length < 2) continue;

        let firstName = '';
        let lastName = '';

        if (fullNameIdx >= 0 && firstNameIdx < 0) {
          const parts = (values[fullNameIdx] || '').split(/\s+/);
          firstName = parts[0] || '';
          lastName = parts.slice(1).join(' ') || '';
        } else {
          firstName = firstNameIdx >= 0 ? values[firstNameIdx] : values[0] || '';
          lastName = lastNameIdx >= 0 ? values[lastNameIdx] : values[1] || '';
        }

        const email = emailIdx >= 0 ? values[emailIdx] : values[2] || '';

        if (!firstName && !lastName && !email) continue;

        const emailLower = email.toLowerCase();
        if (emailLower && seenEmails.has(emailLower)) continue;
        if (emailLower) seenEmails.add(emailLower);

        staff.push({
          first_name: firstName,
          last_name: lastName,
          email: email,
          role_title: roleIdx >= 0 ? values[roleIdx] : '',
        });
      }

      if (staff.length === 0) {
        setCsvParseMessage(t(
          'No staff members found in the file. Check that your data starts on row 2.',
          'No se encontraron miembros del personal en el archivo. Verifique que sus datos comiencen en la fila 2.'
        ));
        return;
      }

      const messages: string[] = [];
      if (roleIdx < 0) messages.push(t(
        'No role column detected \u2014 you can add roles manually.',
        'No se detect\u00f3 columna de puesto. Puede agregar los puestos manualmente.'
      ));
      if (seenEmails.size < staff.length + (lines.length - 1 - staff.length)) messages.push(t(
        'Duplicate emails were removed.',
        'Se eliminaron correos electr\u00f3nicos duplicados.'
      ));
      setCsvParseMessage(messages.length > 0 ? messages.join(' ') : null);

      setStaffList(staff);
      setShowManualEntry(false);
    };

    reader.readAsText(file);
  };

  const clearCSV = () => {
    setStaffList([]);
    setCsvFileName('');
  };

  // Manual staff entry
  const handleManualStaffChange = (field: keyof StaffMember, value: string) => {
    setManualStaff(prev => ({ ...prev, [field]: value }));
  };

  const addManualStaff = () => {
    if (manualStaff.first_name && manualStaff.last_name && manualStaff.email) {
      setStaffList(prev => [...prev, { ...manualStaff }]);
      setManualStaff({ first_name: '', last_name: '', email: '', role_title: '' });
    }
  };

  const removeStaff = (index: number) => {
    setStaffList(prev => prev.filter((_, i) => i !== index));
  };

  // Download CSV template
  const downloadTemplate = () => {
    const csvContent = language === 'es'
      ? 'Nombre,Apellido,Correo electr\u00f3nico,Puesto\nJuan,Garc\u00eda,juan.garcia@escuela.edu,Maestro\nMar\u00eda,L\u00f3pez,maria.lopez@escuela.edu,Entrenadora instruccional'
      : 'First Name,Last Name,Email,Role Title\nJohn,Smith,john.smith@school.edu,Teacher\nJane,Doe,jane.doe@school.edu,Instructional Coach';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = t('staff-roster-template.csv', 'plantilla-lista-de-personal.csv');
    a.click();
    URL.revokeObjectURL(url);
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
          staff: step === 2 ? staffList : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (step === 2) {
          setDashboardSlug(data.slug);
          setViewState('confirmation');
        } else {
          setCurrentStep(2);
        }
      } else {
        setErrorMessage(data.error || t('Failed to save', 'Error al guardar'));
      }
    } catch (error) {
      console.error('Error saving:', error);
      setErrorMessage(t('Failed to save. Please try again.', 'Error al guardar. Por favor, int\u00e9ntelo de nuevo.'));
    } finally {
      setIsSaving(false);
    }
  };

  const goToDashboard = () => {
    router.push(`/partners/${dashboardSlug}-dashboard`);
  };

  const isStep1Valid = orgData.name.trim() !== '' && orgData.address_city.trim() !== '' && orgData.address_state !== '';
  const isStep2Valid = staffList.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
          <p className="text-gray-600">{t('Loading...', 'Cargando...')}</p>
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
          <h1 className="text-2xl font-bold text-[#1e2749] mb-2">
            {t('Access Denied', 'Acceso denegado')}
          </h1>
          <p className="text-gray-600 mb-6">
            {errorMessage || t('Please complete the signup process first.', 'Por favor, complete el proceso de registro primero.')}
          </p>
        </div>
      </div>
    );
  }

  // Confirmation screen
  if (viewState === 'confirmation') {
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
            <SetupLanguageToggle />
          </div>
        </header>

        <main className="container-wide py-12 px-4">
          <div className="max-w-md mx-auto text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-[#1e2749] mb-4">
              {t("You're all set!", "\u00a1Todo listo!")}
            </h1>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {orgTypeLabel(partnership.partnership_type)}
                  </span>
                  <span className="font-medium text-[#1e2749]">{orgData.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('Location', 'Ubicaci\u00f3n')}</span>
                  <span className="font-medium text-[#1e2749]">
                    {orgData.address_city}, {orgData.address_state}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-gray-600">{t('Staff count', 'Personal')}</span>
                  <span className="font-medium text-[#1e2749]">
                    {staffList.length} {staffList.length !== 1
                      ? t('educators added', 'educadores agregados')
                      : t('educator added', 'educador agregado')
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-[#F9FAFB] rounded-xl p-5 mb-6 text-left">
              <p className="text-sm font-semibold text-[#1e2749] mb-3">
                {t('What happens next:', '\u00bfQu\u00e9 sigue?')}
              </p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#4ecdc4]/20 flex items-center justify-center text-[10px] font-bold text-[#2A9D8F] flex-shrink-0 mt-0.5">1</span>
                  <p className="text-sm text-gray-600">
                    {t(
                      `Your ${staffList.length} educators will receive Hub access within 24 hours.`,
                      `Sus ${staffList.length} educadores recibir\u00e1n acceso al Hub en un plazo de 24 horas.`
                    )}
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#4ecdc4]/20 flex items-center justify-center text-[10px] font-bold text-[#2A9D8F] flex-shrink-0 mt-0.5">2</span>
                  <p className="text-sm text-gray-600">
                    {t(
                      'Your dashboard will update in real time as your team starts exploring.',
                      'Su panel se actualizar\u00e1 en tiempo real a medida que su equipo comience a explorar.'
                    )}
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#4ecdc4]/20 flex items-center justify-center text-[10px] font-bold text-[#2A9D8F] flex-shrink-0 mt-0.5">3</span>
                  <p className="text-sm text-gray-600">
                    {t(
                      "We'll reach out to schedule your first check-in call.",
                      'Nos comunicaremos con usted para programar su primera llamada de seguimiento.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={goToDashboard}
              className="w-full bg-[#1e2749] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#2a3459] transition-colors flex items-center justify-center gap-2"
            >
              {t('Go to My Dashboard', 'Ir a mi panel')}
              <ChevronRight className="w-5 h-5" />
            </button>

            <p className="text-xs text-gray-400 mt-4">
              {t('Questions? Email ', '\u00bfPreguntas? Env\u00ede un correo a ')}
              <a href="mailto:rae@teachersdeserveit.com" className="text-[#80a4ed] hover:underline">rae@teachersdeserveit.com</a>
              {t(' anytime.', ' en cualquier momento.')}
            </p>
          </div>
        </main>
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
          <div className="flex items-center gap-4">
            <SetupLanguageToggle />
            <span className="text-sm text-gray-500">
              {t(`Step ${currentStep} of 2`, `Paso ${currentStep} de 2`)}
            </span>
          </div>
        </div>
      </header>

      <main className="container-wide py-8 px-4">
        <div className="max-w-xl mx-auto">
          {/* Simple Progress Indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-[#1e2749]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep > 1 ? 'bg-green-500 text-white' : currentStep === 1 ? 'bg-[#1e2749] text-white' : 'bg-gray-200'
              }`}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {t(
                  `Your ${partnership.partnership_type === 'district' ? 'District' : 'School'}`,
                  `Su ${orgTypeLabel(partnership.partnership_type)}`
                )}
              </span>
            </div>

            <div className={`w-8 sm:w-12 h-0.5 ${currentStep > 1 ? 'bg-green-500' : 'bg-gray-200'}`} />

            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-[#1e2749]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 2 ? 'bg-[#1e2749] text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {t('Staff Roster', 'Lista de personal')}
              </span>
            </div>
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
                <div className="flex items-center gap-3 mb-2">
                  {partnership.partnership_type === 'district' ? (
                    <Building2 className="w-6 h-6 text-purple-600" />
                  ) : (
                    <School className="w-6 h-6 text-blue-600" />
                  )}
                  <h2 className="text-xl font-semibold text-[#1e2749]">
                    {t(
                      `Your ${partnership.partnership_type === 'district' ? 'District' : 'School'}`,
                      `Su ${orgTypeLabel(partnership.partnership_type)}`
                    )}
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  {t(
                    'Just a few quick details to get your dashboard set up.',
                    'Solo unos datos r\u00e1pidos para configurar su panel.'
                  )}
                </p>

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {partnership.partnership_type === 'district'
                        ? t('District Name', 'Nombre del distrito')
                        : t('School Name', 'Nombre de la escuela')
                      } *
                    </label>
                    <input
                      type="text"
                      value={orgData.name}
                      onChange={(e) => handleOrgChange('name', e.target.value)}
                      placeholder={partnership.partnership_type === 'district'
                        ? t('e.g., Springfield Public Schools', 'ej., Escuelas P\u00fablicas de Springfield')
                        : t('e.g., Lincoln Elementary School', 'ej., Escuela Primaria Lincoln')
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none text-lg"
                      autoFocus
                    />
                  </div>

                  {/* City & State side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('City', 'Ciudad')} *
                      </label>
                      <input
                        type="text"
                        value={orgData.address_city}
                        onChange={(e) => handleOrgChange('address_city', e.target.value)}
                        placeholder={t('e.g., Springfield', 'ej., Springfield')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('State', 'Estado')} *
                      </label>
                      <select
                        value={orgData.address_state}
                        onChange={(e) => handleOrgChange('address_state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none bg-white"
                      >
                        <option value="">{t('Select state...', 'Seleccione estado...')}</option>
                        {US_STATES.map(state => (
                          <option key={state.value} value={state.value}>
                            {state.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Staff Roster */}
            {currentStep === 2 && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-[#1e2749]">
                    {t('Staff Roster', 'Lista de personal')}
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  {t(
                    'Upload your staff list so we can set up Hub access for everyone.',
                    'Suba su lista de personal para que podamos configurar el acceso al Hub para todos.'
                  )}
                </p>

                {staffList.length === 0 && !showManualEntry ? (
                  <div className="space-y-6">
                    {/* CSV Upload */}
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                      <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <h3 className="font-medium text-[#1e2749] mb-1">
                        {t('Upload Staff CSV', 'Subir CSV de personal')}
                      </h3>
                      <p className="text-sm text-gray-500 mb-1">
                        {t(
                          'Columns: First Name, Last Name, Email, Role Title',
                          'Columnas: Nombre, Apellido, Correo electr\u00f3nico, Puesto'
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        {t(
                          'Most formats work \u2014 we\'ll match columns automatically. You can also use a single "Name" column.',
                          'La mayor\u00eda de los formatos funcionan. Haremos coincidir las columnas autom\u00e1ticamente. Tambi\u00e9n puede usar una sola columna de "Nombre".'
                        )}
                      </p>

                      <label className="inline-flex items-center gap-2 bg-[#1e2749] text-white px-5 py-2.5 rounded-lg hover:bg-[#2a3459] transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        {t('Choose File', 'Elegir archivo')}
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleCSVUpload}
                          className="hidden"
                        />
                      </label>

                      {csvParseMessage && (
                        <p className={`text-sm mt-3 ${csvParseMessage.includes('Could not') || csvParseMessage.includes('empty') || csvParseMessage.includes('too large') || csvParseMessage.includes('No se encontraron') || csvParseMessage.includes('vac\u00edo') || csvParseMessage.includes('demasiado grande') ? 'text-red-500' : 'text-amber-600'}`}>
                          {csvParseMessage}
                        </p>
                      )}

                      <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-1.5 text-sm text-[#80a4ed] hover:underline mx-auto mt-3"
                      >
                        <Download className="w-4 h-4" />
                        {t('Download template', 'Descargar plantilla')}
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-sm text-gray-400">{t('or', 'o')}</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Manual Entry Option */}
                    <button
                      onClick={() => setShowManualEntry(true)}
                      className="w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t('Enter staff manually', 'Ingresar personal manualmente')}
                    </button>

                    {/* Email Fallback */}
                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-500">
                        {t("Don't have your roster ready? ", "\u00bfNo tiene su lista lista? ")}
                        <a
                          href="mailto:hello@teachersdeserveit.com?subject=Staff%20Roster%20for%20Partner%20Setup"
                          className="text-[#80a4ed] hover:underline"
                        >
                          {t('Email it to us', 'Env\u00edenosla por correo')}
                        </a>
                      </p>
                    </div>
                  </div>
                ) : showManualEntry && staffList.length === 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-[#1e2749]">
                        {t('Add Staff Member', 'Agregar miembro del personal')}
                      </h3>
                      <button
                        onClick={() => setShowManualEntry(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        {t('Back to upload', 'Volver a subir archivo')}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          {t('First Name', 'Nombre')} *
                        </label>
                        <input
                          type="text"
                          value={manualStaff.first_name}
                          onChange={(e) => handleManualStaffChange('first_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          {t('Last Name', 'Apellido')} *
                        </label>
                        <input
                          type="text"
                          value={manualStaff.last_name}
                          onChange={(e) => handleManualStaffChange('last_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        {t('Email', 'Correo electr\u00f3nico')} *
                      </label>
                      <input
                        type="email"
                        value={manualStaff.email}
                        onChange={(e) => handleManualStaffChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        {t('Role Title', 'Puesto')}
                      </label>
                      <select
                        value={manualStaff.role_title}
                        onChange={(e) => handleManualStaffChange('role_title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none bg-white"
                      >
                        <option value="">{t('Select role...', 'Seleccione puesto...')}</option>
                        {ROLE_OPTIONS.map(role => (
                          <option key={role} value={role}>
                            {language === 'es' ? ROLE_LABELS_ES[role] || role : role}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={addManualStaff}
                      disabled={!manualStaff.first_name || !manualStaff.last_name || !manualStaff.email}
                      className="w-full py-2.5 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3459] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t('Add Staff Member', 'Agregar miembro del personal')}
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Staff List Preview */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-[#1e2749]">
                          {staffList.length} {staffList.length !== 1
                            ? t('staff members', 'miembros del personal')
                            : t('staff member', 'miembro del personal')
                          }
                        </span>
                        {csvFileName && (
                          <span className="text-sm text-gray-500">
                            {t('from', 'de')} {csvFileName}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={clearCSV}
                        className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        {t('Clear', 'Limpiar')}
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="text-left px-3 py-2 font-medium text-gray-600">
                                {t('Name', 'Nombre')}
                              </th>
                              <th className="text-left px-3 py-2 font-medium text-gray-600">
                                {t('Email', 'Correo')}
                              </th>
                              <th className="text-left px-3 py-2 font-medium text-gray-600">
                                {t('Role', 'Puesto')}
                              </th>
                              <th className="w-8"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {staffList.slice(0, 10).map((staff, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2">
                                  {staff.first_name} {staff.last_name}
                                </td>
                                <td className="px-3 py-2 text-gray-600">{staff.email}</td>
                                <td className="px-3 py-2 text-gray-600">{staff.role_title || '-'}</td>
                                <td className="px-2 py-2">
                                  <button
                                    onClick={() => removeStaff(idx)}
                                    className="p-1 text-gray-400 hover:text-red-500"
                                    aria-label={t('Remove', 'Eliminar')}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {staffList.length > 10 && (
                        <div className="px-3 py-2 bg-gray-50 text-sm text-gray-500 text-center">
                          + {staffList.length - 10} {t('more staff members', 'm\u00e1s miembros del personal')}
                        </div>
                      )}
                    </div>

                    {/* Add more manually */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        {t('Add another', 'Agregar otro')}
                      </h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={t('First Name', 'Nombre')}
                          value={manualStaff.first_name}
                          onChange={(e) => handleManualStaffChange('first_name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                        />
                        <input
                          type="text"
                          placeholder={t('Last Name', 'Apellido')}
                          value={manualStaff.last_name}
                          onChange={(e) => handleManualStaffChange('last_name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                        />
                        <input
                          type="email"
                          placeholder={t('Email', 'Correo')}
                          value={manualStaff.email}
                          onChange={(e) => handleManualStaffChange('email', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                        />
                        <button
                          onClick={addManualStaff}
                          disabled={!manualStaff.first_name || !manualStaff.last_name || !manualStaff.email}
                          className="px-3 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3459] transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 ? (
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#1e2749] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  {t('Back', 'Atr\u00e1s')}
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => handleSaveStep(currentStep)}
                disabled={
                  isSaving ||
                  (currentStep === 1 && !isStep1Valid) ||
                  (currentStep === 2 && !isStep2Valid)
                }
                className="flex items-center gap-2 bg-[#1e2749] text-white px-6 py-3 rounded-lg hover:bg-[#2a3459] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('Saving...', 'Guardando...')}
                  </>
                ) : currentStep === 2 ? (
                  <>
                    {t('Complete Setup', 'Completar configuraci\u00f3n')}
                    <Check className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    {t('Continue', 'Siguiente')}
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
      <SetupLanguageProvider>
        <IntakeWizardContent />
      </SetupLanguageProvider>
    </Suspense>
  );
}
