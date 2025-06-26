export default function AnalyticsPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600">View system analytics and reports</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-2">User Activity</h3>
                    <p className="text-gray-600">Track user engagement and activity metrics</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-2">Document Processing</h3>
                    <p className="text-gray-600">Monitor document processing statistics</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-2">System Performance</h3>
                    <p className="text-gray-600">View system performance and usage metrics</p>
                </div>
            </div>
        </div>
    );
} 