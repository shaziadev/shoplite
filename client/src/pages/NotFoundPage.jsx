import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <Link to="/" className="btn-primary mt-6">Back to the shop</Link>
    </div>
  );
}
