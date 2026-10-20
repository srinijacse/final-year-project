import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Rating } from "../models/rating.model.js";
import { Question } from "../models/assessment.model.js";
import { initialQuestions, seedQuestions } from "./seedAssessmentData.js";
import connectDB from "../config/connectDB.js";

dotenv.config();

const sampleUsers = [
  {
    name: "Alex Rivera",
    username: "alexrivera",
    email: "alex@skillswap.com",
    password: "Password123!",
    picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    bio: "Senior Frontend Architect with 6+ years of experience. Loves teaching React, Next.js, and TypeScript. Looking to level up in Python and AWS.",
    location: "San Francisco, CA (PST)",
    experienceLevel: "Expert",
    availability: "Weekdays 6-9 PM PST, Weekends anytime",
    rating: 4.9,
    numRatings: 18,
    completedSessions: 32,
    connectionsCount: 24,
    githubLink: "https://github.com/alexrivera-dev",
    linkedinLink: "https://linkedin.com/in/alexrivera",
    skillsProficientAt: [
      {
        name: "React",
        category: "Web Development",
        status: "Verified + Portfolio",
        assessmentScore: 92,
        verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        githubEvidence: {
          repoUrl: "https://github.com/facebook/react",
          repoName: "alexrivera/ecommerce-react-platform",
          score: 95,
          detectedTech: ["React", "Vite", "React Router", "Redux Toolkit", "Axios", "Tailwind CSS"],
          evidenceItems: [
            "✓ React 18+ framework configured in dependencies",
            "✓ Modern JSX component architecture & custom hooks detected",
            "✓ Global state management & client-side routing verified",
            "✓ Comprehensive documentation & unit test coverage found",
          ],
          analyzedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        },
      },
      {
        name: "JavaScript",
        category: "Programming",
        status: "Verified",
        assessmentScore: 95,
        verifiedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        name: "HTML/CSS",
        category: "Web Development",
        status: "Verified",
        assessmentScore: 88,
        verifiedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      },
      {
        name: "Node.js",
        category: "Web Development",
        status: "Claimed",
      },
    ],
    skillsToLearn: [
      { name: "Python", category: "Programming" },
      { name: "AWS", category: "Cloud" },
      { name: "Machine Learning", category: "Data Science" },
    ],
  },
  {
    name: "Dr. Priya Sharma",
    username: "priyasharma",
    email: "priya@skillswap.com",
    password: "Password123!",
    picture: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    bio: "Data Scientist & AI Researcher. Passionate about machine learning, statistical modeling, and Python. Excited to learn modern React and UI/UX.",
    location: "Austin, TX (CST)",
    experienceLevel: "Expert",
    availability: "Flexible • Tuesday & Thursday Evenings",
    rating: 4.8,
    numRatings: 14,
    completedSessions: 26,
    connectionsCount: 19,
    githubLink: "https://github.com/priyasharma-ai",
    linkedinLink: "https://linkedin.com/in/priyasharma-ai",
    skillsProficientAt: [
      {
        name: "Python",
        category: "Programming",
        status: "Verified + Portfolio",
        assessmentScore: 96,
        verifiedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        githubEvidence: {
          repoUrl: "https://github.com/priyasharma/ml-sentiment-analyzer",
          repoName: "priyasharma/ml-sentiment-analyzer",
          score: 91,
          detectedTech: ["Python 3", "FastAPI", "Pandas", "Scikit-Learn", "PyTorch"],
          evidenceItems: [
            "✓ Python scientific computing & data pipelines detected",
            "✓ Machine learning inference REST API with FastAPI",
            "✓ Jupyter notebooks with extensive statistical evaluations",
          ],
          analyzedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
      },
      {
        name: "SQL",
        category: "Data Science",
        status: "Verified",
        assessmentScore: 90,
        verifiedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      },
      {
        name: "AWS",
        category: "Cloud",
        status: "Verified",
        assessmentScore: 85,
        verifiedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ],
    skillsToLearn: [
      { name: "React", category: "Web Development" },
      { name: "UI/UX", category: "Design" },
      { name: "JavaScript", category: "Programming" },
    ],
  },
  {
    name: "Marcus Chen",
    username: "marcuschen",
    email: "marcus@skillswap.com",
    password: "Password123!",
    picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    bio: "Cloud & DevOps Engineer specialized in AWS, Docker, Kubernetes, and backend scalability. Seeking to learn React and frontend state management.",
    location: "Seattle, WA (PST)",
    experienceLevel: "Advanced",
    availability: "Weekends & Monday/Wednesday Evenings",
    rating: 4.7,
    numRatings: 9,
    completedSessions: 18,
    connectionsCount: 15,
    githubLink: "https://github.com/marcuschen-cloud",
    linkedinLink: "https://linkedin.com/in/marcuschen",
    skillsProficientAt: [
      {
        name: "AWS",
        category: "Cloud",
        status: "Verified + Portfolio",
        assessmentScore: 94,
        verifiedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        githubEvidence: {
          repoUrl: "https://github.com/marcuschen/serverless-cloud-infra",
          repoName: "marcuschen/serverless-cloud-infra",
          score: 89,
          detectedTech: ["AWS", "AWS SDK", "Terraform", "Docker", "Lambda"],
          evidenceItems: [
            "✓ Infrastructure as Code and AWS SDK integration detected",
            "✓ Containerized deployment workflows configured",
            "✓ Production cloud deployment documentation available",
          ],
          analyzedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        },
      },
      {
        name: "Git",
        category: "DevOps",
        status: "Verified",
        assessmentScore: 92,
        verifiedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      },
      {
        name: "Node.js",
        category: "Web Development",
        status: "Verified",
        assessmentScore: 84,
        verifiedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
    ],
    skillsToLearn: [
      { name: "React", category: "Web Development" },
      { name: "HTML/CSS", category: "Web Development" },
    ],
  },
  {
    name: "Elena Rostova",
    username: "elenarostova",
    email: "elena@skillswap.com",
    password: "Password123!",
    picture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250",
    bio: "Full Stack Engineer specializing in Node.js, Express, and MongoDB. Enthusiastic mentor who enjoys building real-world REST and WebSocket apps.",
    location: "New York, NY (EST)",
    experienceLevel: "Advanced",
    availability: "Weekdays 7-10 PM EST",
    rating: 4.9,
    numRatings: 11,
    completedSessions: 22,
    connectionsCount: 16,
    githubLink: "https://github.com/elenarostova",
    linkedinLink: "https://linkedin.com/in/elenarostova",
    skillsProficientAt: [
      {
        name: "Node.js",
        category: "Web Development",
        status: "Verified + Portfolio",
        assessmentScore: 90,
        verifiedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        githubEvidence: {
          repoUrl: "https://github.com/elenarostova/realtime-chat-api",
          repoName: "elenarostova/realtime-chat-api",
          score: 92,
          detectedTech: ["Node.js", "Express.js", "MongoDB", "Socket.io", "JWT"],
          evidenceItems: [
            "✓ Express.js web server and routing framework detected",
            "✓ MongoDB database connection and schemas detected",
            "✓ Real-time WebSockets integration verified",
          ],
          analyzedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      },
      {
        name: "MongoDB",
        category: "Web Development",
        status: "Verified",
        assessmentScore: 88,
        verifiedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      },
      {
        name: "Express.js",
        category: "Web Development",
        status: "Verified",
        assessmentScore: 92,
        verifiedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      },
    ],
    skillsToLearn: [
      { name: "Cybersecurity", category: "Cybersecurity" },
      { name: "AWS", category: "Cloud" },
    ],
  },
];

export const seedDatabase = async () => {
  try {
    await connectDB();
    await seedQuestions();

    console.log("Checking sample users in database...");
    for (const u of sampleUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`Created sample user: ${u.name} (${u.email})`);
      } else {
        console.log(`User ${u.name} already exists.`);
      }
    }

    console.log("Database seeding completed successfully!");
  } catch (err) {
    console.error("Seeding error:", err);
  }
};

// If run directly via node
if (process.argv[1].includes("seedDatabase.js")) {
  seedDatabase().then(() => process.exit(0));
}
