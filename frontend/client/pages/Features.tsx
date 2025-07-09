import Navigation from "@/components/Navigation";
import FeatureCard from "@/components/FeatureCard";
import {
  Languages,
  Brain,
  MessageSquare,
  Stethoscope,
  Clock,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Languages className="w-16 h-16 text-white" />,
      title: "Multilingual NLP",
      description:
        "Understands user symptoms in English, Hindi, Tamil, and more, ensuring effective communication.",
    },
    {
      icon: <Brain className="w-16 h-16 text-white" />,
      title: "AI Triage",
      description:
        "Classifies symptoms as urgent or non-urgent, guiding users to appropriate care pathways.",
    },
    {
      icon: <MessageSquare className="w-16 h-16 text-white" />,
      title: "SMS Access",
      description:
        "Enables access to healthcare services via SMS, eliminating the need for smartphones or internet.",
    },
    {
      icon: <Stethoscope className="w-16 h-16 text-white" />,
      title: "Symptom Checker",
      description:
        "Provides an AI-powered symptom checker for preliminary health assessments and guidance.",
    },
    {
      icon: <Clock className="w-16 h-16 text-white" />,
      title: "Medication Reminders",
      description:
        "Sends timely reminders for medication adherence, improving treatment outcomes.",
    },
  ];

  return (
    <div className="min-h-screen bg-navy-950">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Features
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explore the capabilities of ChikitsaAI, designed to bridge
            healthcare gaps in rural India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        <div className="flex justify-center space-x-4">
          <button className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Get Started
          </button>
          <button className="bg-navy-800 hover:bg-navy-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Learn More
          </button>
        </div>
      </main>
    </div>
  );
}
