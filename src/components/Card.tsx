interface CardProps {
  title: string;
  value: string | number;
  icon: string;
}

export default function Card({ title, value, icon }: CardProps) {
  return (
    <div className="bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition transform">
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
  );
}


  
  