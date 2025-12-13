'use client';

import EditableText from '@/components/editable/EditableText';
import { useAuthContext } from '@/providers/AuthProvider';

export default function TestEditablePage() {
  const { isAdmin, isLoading, user } = useAuthContext();

  if (isLoading) {
    return <div className="p-8">Loading authentication...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white text-black"> {/* Added explicit colors */}
      <h1 className="text-2xl font-bold mb-6 text-black">Test Editable Text</h1>
      <p className="mb-4 text-black">
        Admin status: {isAdmin ? 'Yes (can edit)' : 'No (view only)'}
      </p>
      <p className="mb-4 text-black">
        User email: {user?.email || 'Not logged in'}
      </p>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2 text-black">Heading (h1):</h2>
          <EditableText
            componentName="test-component"
            blockKey="heading"
            defaultText="Test Heading"
            className="text-3xl font-bold text-blue-600"
            tag="h1"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2 text-black">Description (textarea):</h2>
          <EditableText
            componentName="test-component"
            blockKey="description"
            defaultText="This is a test description. Hover over this text if you're an admin to see the pencil icon."
            className="text-gray-700"
            tag="p"
            as="textarea"
            rows={4}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Button Text:</h2>
          <EditableText
            componentName="test-component"
            blockKey="button"
            defaultText="Click Me"
            className="px-4 py-2 bg-green-500 text-black rounded"
            tag="span"
          />
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded text-black">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Log in as admin (go to /test-auth)</li>
          <li>Return to this page</li>
          <li>Hover over the text above</li>
          <li>Click the pencil icon ✏️ to edit</li>
          <li>Press Enter or click away to save</li>
        </ul>
      </div>
    </div>
  );
}