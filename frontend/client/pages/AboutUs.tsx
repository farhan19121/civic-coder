import Navigation from "@/components/Navigation";

export default function AboutUs() {
  const teamMembers = [
    {
      name: "Avishi Asati",
      role: "EE 4th Year, MITS Gwalior",
    },
    {
      name: "Farhan Khan",
      role: "EE 4th Year, MITS Gwalior",
    },
    {
      name: "Utkarsh Pachouri",
      role: "CSE 4th Year, MITS Gwalior",
    },
    {
      name: "Vaishnavi Bhatele",
      role: "EE 4th Year, MITS Gwalior",
    },
  ];

  return (
    <div className="min-h-screen bg-navy-950">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Meet the Team Behind ChikitsaAI
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-20 h-20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="100" height="100" fill="white" />
                    <path
                      d="M50 20c8.284 0 15 6.716 15 15s-6.716 15-15 15-15-6.716-15-15 6.716-15 15-15z"
                      fill="#8B4513"
                    />
                    <path
                      d="M20 80c0-16.569 13.431-30 30-30s30 13.431 30 30v10H20V80z"
                      fill="white"
                    />
                    <path
                      d="M35 50h30c8.284 0 15 6.716 15 15v25H20V65c0-8.284 6.716-15 15-15z"
                      fill="white"
                    />
                    <path d="M25 70h50v20H25V70z" fill="#40E0D0" />
                    <circle cx="30" cy="75" r="3" fill="#C0C0C0" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {member.name}
              </h3>
              <p className="text-gray-400">{member.role}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
