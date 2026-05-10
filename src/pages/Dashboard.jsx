import { useNavigate } from "react-router-dom";

export default function Dashboard() {

  const navigate = useNavigate();

  const salesPersons = [
    {
      name: "Aman",
      sales: "₹8,50,000",
      target: "₹10,00,000",
      percent: "85%"
    },

    {
      name: "Rohit",
      sales: "₹6,20,000",
      target: "₹10,00,000",
      percent: "62%"
    },

    {
      name: "Faizan",
      sales: "₹11,40,000",
      target: "₹10,00,000",
      percent: "114%"
    },

    {
      name: "Deepak",
      sales: "₹5,80,000",
      target: "₹10,00,000",
      percent: "58%"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Sales Team Dashboard
          </h1>

          <p className="text-gray-500">
            Team Performance Overview
          </p>
        </div>

        <button
          onClick={() => navigate("/quotation")}
          className="bg-green-600 text-white px-5 py-3 rounded font-bold"
        >
          ➕ New Quotation
        </button>

      </div>

      {/* SALES PERSON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">

        {salesPersons.map((person, index) => (

          <div
            key={index}
            className="bg-white rounded-xl p-5 shadow"
          >

            {/* TOP */}
            <div className="flex items-center justify-between">

              <h2 className="text-xl font-bold">
                {person.name}
              </h2>

              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold">
                {person.name[0]}
              </div>

            </div>

            {/* SALES */}
            <div className="mt-5">

              <p className="text-gray-500 text-sm">
                Sales
              </p>

              <h3 className="text-2xl font-bold">
                {person.sales}
              </h3>

            </div>

            {/* TARGET */}
            <div className="mt-4">

              <p className="text-gray-500 text-sm">
                Target
              </p>

              <h3 className="text-xl font-semibold">
                {person.target}
              </h3>

            </div>

            {/* PROGRESS */}
            <div className="mt-5">

              <div className="flex justify-between mb-2">

                <span className="text-sm text-gray-500">
                  Completion
                </span>

                <span className="font-bold">
                  {person.percent}
                </span>

              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">

                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{
                    width: person.percent
                  }}
                />

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
