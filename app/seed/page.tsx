'use client';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

const EVENTS_TO_SEED = [
  {
    id: "event-robotics-01",
    title: "Robotics & AI Workshop",
    description: "An intensive 3-day workshop covering the fundamentals of robotics, Arduino programming, and artificial intelligence for high school students.",
    institutionId: "yh-004", // Akfadou Youth House
    wilaya: "Bejaia",
    category: "technology",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    status: "open",
    registrationFields: ["name", "email", "phone", "school", "motivation"],
    availableSeats: 30
  },
  {
    id: "event-entrep-02",
    title: "Eco-Entrepreneurship Training",
    description: "Learn how to build sustainable, eco-friendly startups in this dynamic seminar. Perfect for university students and young graduates.",
    institutionId: "yh-005", // Amizour Youth House
    wilaya: "Bejaia",
    category: "entrepreneurship",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
    status: "open",
    registrationFields: ["name", "email", "university", "project_idea"],
    availableSeats: 50
  },
  {
    id: "event-code-03",
    title: "Bejaia Coding Bootcamp",
    description: "A fast-paced introduction to web development using React and Tailwind CSS. No prior experience required.",
    institutionId: "yh-003", // Akbou Youth House
    wilaya: "Bejaia",
    category: "technology",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    status: "closed",
    registrationFields: ["name", "email", "phone"],
    availableSeats: 0
  },
  {
    id: "event-sci-04",
    title: "Regional Science Exhibition",
    description: "Annual science fair showcasing projects from local schools. Open to the public, registration required for exhibitors only.",
    institutionId: "yh-001", // Boudjellil Youth House
    wilaya: "Bejaia",
    category: "science",
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    status: "open",
    registrationFields: ["name", "email", "phone", "school", "project_title", "project_description"],
    availableSeats: 20
  },
  {
    id: "event-sport-05",
    title: "Summer Youth Football Tournament",
    description: "Annual amateur football tournament bringing together the best young teams in the Wilaya of Bejaia.",
    institutionId: "yh-002", // Ait Rzine Youth House
    wilaya: "Bejaia",
    category: "sports",
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days
    status: "open",
    registrationFields: ["name", "phone", "team_name", "age"],
    availableSeats: 16
  }
];

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const runSeed = async () => {
    setLoading(true);
    setLog(["Starting seed..."]);
    
    for (const ev of EVENTS_TO_SEED) {
      try {
        const { id, ...data } = ev;
        await setDoc(doc(db, "events", id), data);
        setLog(prev => [...prev, `Seeded event: ${ev.title}`]);
      } catch (err: any) {
        setLog(prev => [...prev, `ERROR seeding ${ev.title}: ${err.message}`]);
      }
    }
    
    setLog(prev => [...prev, "Seeding complete!"]);
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firestore Seeder</h1>
      <button 
        onClick={runSeed} 
        disabled={loading}
        className="bg-primary text-black px-4 py-2 rounded font-bold"
      >
        {loading ? "Seeding..." : "Seed Events"}
      </button>
      
      <div className="mt-8 bg-black p-4 rounded text-green-400 font-mono text-sm h-64 overflow-y-auto">
        {log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}
