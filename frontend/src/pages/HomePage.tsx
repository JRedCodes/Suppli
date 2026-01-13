import { useBusiness } from '../hooks/useBusiness';

export default function HomePage() {
  const { selectedBusinessId } = useBusiness();

  return (
    <div className="space-y-3">
      <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
      <p className="text-gray-600">Selected business: {selectedBusinessId}</p>
      <p className="text-gray-600">
        Protected content: you are signed in and can access the app shell.
      </p>
    </div>
  );
}
