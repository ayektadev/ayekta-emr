import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import LazyModuleLoader from '../components/shared/LazyModuleLoader';
import PatientSummaryPanel from '../components/patient/PatientSummaryPanel';
import PatientEncountersPanel from '../components/patient/PatientEncountersPanel';
import ClinicalDocumentsPlaceholder from '../components/patient/ClinicalDocumentsPlaceholder';
import ReviewSignPanel from '../components/patient/ReviewSignPanel';
import SectionNursingSignOffBar from '../components/patient/SectionNursingSignOffBar';
import { CHART_SECTION_DEFINITIONS } from '../constants/patientChartSections';
import { getWorkflowPolicy } from '../services/workflowPolicy';
import type { PatientWorkspaceSection } from '../constants/patientChartSections';
import { useModuleManagement } from '../store/moduleManagementStore';
import { useAuthStore } from '../store/authStore';
import { usePatientStore } from '../store/patientStore';
import { resolvePatientChartData } from '../services/patientChartResolution';
import type { TabName } from '../types/patient.types';

function ModuleFallback() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-md border border-ayekta-border p-8 flex justify-center">
        <div className="motion-safe:animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-ayekta-orange" />
      </div>
    </div>
  );
}

export default function PatientWorkspacePage() {
  const { id: patientId = '' } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useAuthStore((s) => s.user?.role);

  const loadPatient = usePatientStore((s) => s.loadPatient);
  const storeId = usePatientStore((s) => s.ishiId);
  const setCurrentTab = usePatientStore((s) => s.setCurrentTab);

  const { enabledModules, canAccessModule } = useModuleManagement();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [workflowInReview, setWorkflowInReview] = useState(false);
  const [nursingSignoffKeys, setNursingSignoffKeys] = useState<string[]>([]);

  const section = (searchParams.get('s') || '') as PatientWorkspaceSection;

  const visibleSections = useMemo(() => {
    return CHART_SECTION_DEFINITIONS.filter((def) => {
      if (def.kind === 'panel') return true;
      const mid = def.moduleId;
      if (!mid) return false;
      return enabledModules[mid] === true && canAccessModule(mid);
    });
  }, [enabledModules, canAccessModule]);

  const applyDefaultSection = useCallback(() => {
    const has = searchParams.get('s');
    if (has) return;
    const nurseFirst =
      visibleSections.find((d) => d.key === 'triage') ??
      visibleSections.find((d) => d.intake) ??
      visibleSections.find((d) => d.key === 'summary');
    const surgeonFirst = visibleSections.find((d) => d.key === 'summary') ?? visibleSections[0];
    const def = (role === 'nurse' ? nurseFirst : surgeonFirst)?.key ?? 'summary';
    setSearchParams({ s: def }, { replace: true });
  }, [role, searchParams, setSearchParams, visibleSections]);

  useEffect(() => {
    applyDefaultSection();
  }, [applyDefaultSection]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const p = await getWorkflowPolicy();
      if (cancelled) return;
      setWorkflowInReview(p.enableInReview);
      setNursingSignoffKeys(p.nursingSignOffSectionKeys);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const s = searchParams.get('s');
    if (!s || visibleSections.length === 0) return;
    const ok = visibleSections.some((d) => d.key === s);
    if (!ok && visibleSections[0]) {
      setSearchParams({ s: visibleSections[0].key }, { replace: true });
    }
  }, [searchParams, visibleSections, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    if (!patientId) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    void (async () => {
      setLoading(true);
      setNotFound(false);

      if (storeId === patientId) {
        if (!cancelled) setLoading(false);
        return;
      }

      const data = await resolvePatientChartData(patientId);
      if (cancelled) return;

      if (data) {
        loadPatient(data);
        setNotFound(false);
      } else {
        setNotFound(true);
        usePatientStore.getState().reset();
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [patientId, storeId, loadPatient]);

  const activeDef = useMemo(() => {
    const match = visibleSections.find((d) => d.key === section);
    if (match) return match;
    return visibleSections[0];
  }, [visibleSections, section]);

  useEffect(() => {
    if (activeDef?.kind === 'module' && activeDef.moduleId) {
      setCurrentTab(activeDef.moduleId as TabName);
    }
  }, [activeDef, setCurrentTab]);

  const sectionHeadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionHeadingRef.current;
    if (!el) return;
    el.focus();
  }, [section, activeDef?.key]);

  const setSection = (key: PatientWorkspaceSection) => {
    setSearchParams({ s: key });
  };

  if (!patientId) {
    return <Navigate to="/patients" replace />;
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[40vh] text-sm text-gray-500 font-sans">
        Loading chart…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-8 max-w-lg font-sans">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Record not found on this device</h1>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          No chart for <span className="font-mono">{patientId}</span> was found on this device. From the
          dashboard you can import a chart file, start a new patient, or open someone already on the patient
          list.
        </p>
        <Link to="/patients" className="text-sm font-medium text-gray-900 underline-offset-4 hover:underline">
          Back to patients
        </Link>
      </div>
    );
  }

  return (
    <div className="app chart-workspace min-h-screen bg-[var(--ayekta-surface)] flex-1 flex flex-col font-sans">
      <Header />

      <div className="border-b border-gray-200 bg-[var(--ayekta-surface-elevated)] sticky top-0 z-[998] shadow-sm">
        <div className="max-w-7xl mx-auto px-2 py-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link to="/patients" className="hover:text-gray-900 transition-colors">
              Patients
            </Link>
            <span aria-hidden>/</span>
            <span className="font-mono text-gray-800">{patientId}</span>
          </div>
          <nav
            className="flex flex-wrap gap-1 overflow-x-auto pb-1"
            aria-label="Chart sections"
          >
            {visibleSections.map((def) => {
              const active = section === def.key || (!section && def.key === activeDef?.key);
              return (
                <button
                  key={def.key}
                  type="button"
                  onClick={() => setSection(def.key)}
                  aria-current={active ? 'page' : undefined}
                  className={`whitespace-nowrap px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                    active
                      ? 'border-gray-900 text-gray-900 bg-gray-100'
                      : 'border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {def.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div
        ref={sectionHeadingRef}
        tabIndex={-1}
        className="max-w-7xl mx-auto px-3 sm:px-4 pt-2 pb-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ayekta-surface)] rounded-sm"
      >
        <span className="text-gray-500 font-normal mr-2">Section</span>
        <span className="font-semibold text-gray-900">{activeDef?.label ?? 'Chart'}</span>
        <span className="sr-only"> — active chart section</span>
      </div>

      <div className="flex-1 pb-8 chart-prose" aria-label="Patient chart content">
        {activeDef?.key === 'summary' && <PatientSummaryPanel />}
        {activeDef?.key === 'encounters' && <PatientEncountersPanel patientId={patientId} />}
        {activeDef?.key === 'review-sign' && <ReviewSignPanel patientId={patientId} />}
        {activeDef?.key === 'documents' && <ClinicalDocumentsPlaceholder />}
        {activeDef?.kind === 'module' && activeDef.moduleId && (
          <div className="pt-2">
            {workflowInReview && nursingSignoffKeys.includes(activeDef.moduleId) ? (
              <SectionNursingSignOffBar moduleId={activeDef.moduleId} sectionLabel={activeDef.label} />
            ) : null}
            <LazyModuleLoader moduleId={activeDef.moduleId} fallback={<ModuleFallback />} />
          </div>
        )}
      </div>
    </div>
  );
}
