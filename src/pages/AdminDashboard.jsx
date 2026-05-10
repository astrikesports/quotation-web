export default function AdminDashboard() {

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-4xl font-bold mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div className="bg-white p-5 rounded shadow">
          <p>Total Sales</p>

          <h2 className="text-3xl font-bold mt-2">
            ₹61,00,000
          </h2>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <p>Total Profit</p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            ₹6,50,000
          </h2>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <p>Orders</p>

          <h2 className="text-3xl font-bold mt-2">
            248
          </h2>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <p>Sales Team</p>

          <h2 className="text-3xl font-bold mt-2">
            15
          </h2>
        </div>

      </div>

    </div>
  );
}
