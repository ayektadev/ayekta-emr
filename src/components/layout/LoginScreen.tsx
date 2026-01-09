import { useState, useRef, ChangeEvent } from 'react';
import { usePatientStore } from '../../store/patientStore';
import { importPatientFromJSON } from '../../utils/storage';

const PROVIDERS = [
  'Kristina Lucente, M.D.',
  'Ziad Sifri, M.D.',
  'Aakash Patel',
  'Konstantin Khariton, DO',
  'Latha Pasupuleti, MD',
  'Ed Lee, MD',
  'Alaine Sharpe, MD',
  'Keenan Gibson',
  'Varoon Phondge',
  'Laura Jao, MD',
];

const APP_VERSION = 'v6react';

function LoginScreen() {
  const [selectedProvider, setSelectedProvider] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const login = usePatientStore((state) => state.login);
  const loadPatient = usePatientStore((state) => state.loadPatient);

  const handleNewPatient = () => {
    if (!selectedProvider) return;
    login(selectedProvider);
  };

  const handleExistingPatient = () => {
    if (!selectedProvider) return;
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const patientData = await importPatientFromJSON(file);
      
      // Update provider if it was in the file
      if (patientData.currentProvider) {
        setSelectedProvider(patientData.currentProvider);
      }
      
      loadPatient(patientData);
    } catch (error) {
      alert('Invalid patient file. Please upload a valid JSON file.');
      console.error('File upload error:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoClick = () => {
    if (confirm('Reset application? This will clear all data.')) {
      window.location.reload();
    }
  };

  return (
    <div id="login-screen" className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#F4F1E8' }}>
      {/* Logo - Significantly larger with fade-in animation */}
      <div className="mb-8 cursor-pointer animate-fade-in-scale" onClick={handleLogoClick}>
        <img
          src={`${import.meta.env.BASE_URL}logo-512.png`}
          alt="Ayekta Logo"
          className="w-64 h-64 mx-auto mb-4"
        />
      </div>

      {/* Title with staggered fade-in */}
      <h1 className="text-3xl font-bold mb-2 text-center animate-fade-in animate-delay-300">Ayekta</h1>
      <p className="subheader text-lg mb-8 text-center text-ayekta-muted animate-fade-in animate-delay-500">
        Custom built for ISHI — {APP_VERSION}
      </p>

      {/* Provider Selection with staggered fade-in */}
      <div className="w-full max-w-md mb-6 animate-fade-in animate-delay-700">
        <label htmlFor="providerSelect" className="block mb-2 font-semibold">
          Select Provider:
        </label>
        <select
          id="providerSelect"
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md text-base"
        >
          <option value="">-- Select Provider --</option>
          {PROVIDERS.map((provider) => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons with staggered fade-in */}
      <div className="flex flex-col gap-4 w-full max-w-md animate-fade-in animate-delay-900">
        <button
          id="loginNewBtn"
          onClick={handleNewPatient}
          disabled={!selectedProvider}
          className="w-full py-3 px-6 text-base font-semibold border border-gray-800 rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          New Patient
        </button>

        <button
          id="loginExistBtn"
          onClick={handleExistingPatient}
          disabled={!selectedProvider}
          className="w-full py-3 px-6 text-base font-semibold border border-gray-800 rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          Existing Patient
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="loadJsonInput"
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Help Text */}
      <p className="mt-8 text-sm text-ayekta-muted text-center max-w-md">
        Select a provider above, then choose to start a new patient record or load an existing patient file.
      </p>
    </div>
  );
}

export default LoginScreen;
