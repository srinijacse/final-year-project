export const CATEGORIES = [
  { id: "all", name: "All Categories", icon: "🌐" },
  { id: "programming", name: "Programming", icon: "💻" },
  { id: "web-dev", name: "Web Development", icon: "🚀" },
  { id: "data-science", name: "Data Science", icon: "📊" },
  { id: "cloud", name: "Cloud", icon: "☁️" },
  { id: "devops", name: "DevOps", icon: "⚙️" },
  { id: "cybersecurity", name: "Cybersecurity", icon: "🛡️" },
  { id: "design", name: "Design", icon: "🎨" },
  { id: "business", name: "Business", icon: "💼" },
  { id: "communication", name: "Communication", icon: "🗣️" },
  { id: "other", name: "Other", icon: "✨" },
];

export const SKILL_CATEGORY_MAP = {
  // Web Dev
  "React": "Web Development",
  "Node.js": "Web Development",
  "Express.js": "Web Development",
  "Express": "Web Development",
  "MongoDB": "Web Development",
  "HTML/CSS": "Web Development",
  "HTML": "Web Development",
  "CSS": "Web Development",
  "Next.js": "Web Development",
  "Vue.js": "Web Development",
  "Angular": "Web Development",
  "Tailwind CSS": "Web Development",
  
  // Programming
  "JavaScript": "Programming",
  "TypeScript": "Programming",
  "Python": "Programming",
  "Java": "Programming",
  "C++": "Programming",
  "C#": "Programming",
  "Go": "Programming",
  "Rust": "Programming",
  "SQL": "Programming",
  
  // Data Science
  "Machine Learning": "Data Science",
  "Data Science": "Data Science",
  "Deep Learning": "Data Science",
  "Natural Language Processing": "Data Science",
  "PyTorch": "Data Science",
  "TensorFlow": "Data Science",
  "Data Engineering": "Data Science",
  "Pandas & NumPy": "Data Science",
  
  // Cloud & DevOps
  "AWS": "Cloud",
  "Google Cloud": "Cloud",
  "Azure": "Cloud",
  "Docker": "DevOps",
  "Kubernetes": "DevOps",
  "Git": "DevOps",
  "CI/CD": "DevOps",
  "Linux": "DevOps",
  
  // Cybersecurity
  "Cybersecurity": "Cybersecurity",
  "Ethical Hacking": "Cybersecurity",
  "Network Security": "Cybersecurity",
  "Cryptography": "Cybersecurity",
  
  // Design
  "UI/UX": "Design",
  "Figma": "Design",
  "Graphic Design": "Design",
  "Product Design": "Design",
  
  // Business & Communication
  "Product Management": "Business",
  "Agile / Scrum": "Business",
  "Marketing": "Business",
  "Communication": "Communication",
  "Public Speaking": "Communication",
  "English": "Communication",
};

export const getSkillCategory = (skillName) => {
  return SKILL_CATEGORY_MAP[skillName] || "Other";
};
