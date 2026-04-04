import { Link } from 'react-router-dom';
import { ROUTES } from '@ayekta/shared-types';

export default function AdminSectionPlaceholder({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="p-8 max-w-3xl font-clinical">
      <Link
        to={ROUTES.admin}
        className="text-sm font-medium text-ayekta-orange hover:underline mb-4 inline-block"
      >
        ← Administration
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
    </div>
  );
}
