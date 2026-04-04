import { Link } from 'react-router-dom';
import { ROUTES } from '@ayekta/shared-types';

const cards: { to: string; title: string; desc: string }[] = [
  {
    to: ROUTES.adminUsers,
    title: 'Users',
    desc: 'Tenant users, roles, and access (API-backed management planned).',
  },
  {
    to: ROUTES.adminFacilities,
    title: 'Facilities',
    desc: 'Sites and facility metadata for multi-site missions.',
  },
  {
    to: ROUTES.adminAudit,
    title: 'Audit',
    desc: 'Review sync and clinical audit trails when server pipelines land.',
  },
  {
    to: ROUTES.adminConfig,
    title: 'Workflow',
    desc: 'Review-before-sign and nursing section sign-off policy (local; API tenant policy later).',
  },
];

export default function AdminHomePage() {
  return (
    <div className="p-8 max-w-4xl font-sans">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">Administration</h1>
      <p className="text-sm text-gray-600 mb-6 max-w-2xl leading-relaxed">
        Blueprint §5 admin IA: shells for tenant operations. Wire to FastAPI admin routes as they ship.
      </p>
      <ul className="grid sm:grid-cols-2 gap-3">
        {cards.map((c) => (
          <li key={c.to}>
            <Link
              to={c.to}
              className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow"
            >
              <span className="font-semibold text-gray-900">{c.title}</span>
              <span className="block text-sm text-gray-600 mt-1 leading-relaxed">{c.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
