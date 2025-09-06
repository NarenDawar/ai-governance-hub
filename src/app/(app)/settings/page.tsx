'use client';

// A simple placeholder for a future settings page.
export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

        <div className="bg-white shadow-md rounded-lg">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Integrations</h2>
            <p className="text-sm text-gray-500 mt-1">
              Connect to your cloud providers to enable automated discovery of AI assets.
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Mock AWS Integration Card */}
              <div className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-800">Amazon Web Services</h3>
                  <p className="text-sm text-gray-500">Connect to AWS SageMaker and other services.</p>
                </div>
                <button className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md cursor-not-allowed">
                  Configure (Coming Soon)
                </button>
              </div>

              {/* Mock Azure Integration Card */}
              <div className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-800">Microsoft Azure</h3>
                  <p className="text-sm text-gray-500">Connect to Azure Machine Learning.</p>
                </div>
                <button className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md cursor-not-allowed">
                  Configure (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
