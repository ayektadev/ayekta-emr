import { Navigate } from 'react-router-dom';
import { usePatientStore } from '../store/patientStore';

/** Legacy `/chart` URL → patient workspace when a chart id exists. */
export default function ChartRedirectPage() {
  const ishiId = usePatientStore((s) => s.ishiId);
  if (ishiId) {
    return <Navigate to={`/patients/${ishiId}`} replace />;
  }
  return <Navigate to="/dashboard" replace />;
}
