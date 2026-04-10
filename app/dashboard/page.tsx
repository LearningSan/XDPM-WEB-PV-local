"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const stats = [
    { label: "Users", value: 120 },
    { label: "Orders", value: 35 },
    { label: "Revenue", value: "$2,450" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Welcome back 👋
          </p>
        </div>

        <button
          onClick={() => {
            // clear cookie / token nếu có
            router.push("/login");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow"
          >
            <p className="text-gray-500 text-sm">{item.label}</p>
            <p className="text-2xl font-bold mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-3">Quick Actions</h2>

        <div className="flex gap-3 flex-wrap">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Order
          </button>

          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Add User
          </button>

          <button className="bg-purple-500 text-white px-4 py-2 rounded">
            View Reports
          </button>
        </div>
      </div>

      {/* ACTIVITY */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="font-semibold mb-3">Recent Activity</h2>

        <ul className="space-y-2 text-sm text-gray-600">
          <li>✔ User John created an account</li>
          <li>✔ Order #1234 was completed</li>
          <li>✔ Revenue updated</li>
        </ul>
      </div>
    </div>
  );
}