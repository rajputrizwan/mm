// Importing icons from lucide-react
import {
  LayoutDashboard,
  Calendar,
  WalletCards,
  List,
  Settings,
  Puzzle,
  Code2,
  User,
  BriefcaseBusiness,
  Crown,
} from "lucide-react";

// Sidebar base navigation options
export const SideBaseOptions = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Scheduled Interviews",
    path: "/scheduled-interviews",
    icon: Calendar,
  },
  {
    name: "All Interviews",
    path: "/all-interviews",
    icon: List,
  },
  {
    name: "Billing",
    path: "/billing",
    icon: WalletCards,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

// Interview type options
export const InterviewTypes = [
  {
    title: "Technical",
    icon: Code2,
  },
  {
    title: "Behavioral",
    icon: User,
  },
  {
    title: "Experience",
    icon: BriefcaseBusiness,
  },
  {
    title: "Problem Solving",
    icon: Puzzle,
  },
  {
    title: "Leadership",
    icon: Crown,
  },
];

export const QUESTION_PROMPT = `You are an expert technical interviewer.
Based on the following inputs, generate a well-structured list of high-quality interview questions:

Job Title: {{jobTitle}}
Job Description: {{jobDescription}}
Interview Duration: {{Duration}}
Interview Type: {{type}}

📝 Your task:
Analyze the job description to identify key responsibilities, required skills, and expected experience.
Generate a list of interview questions depends on interview duration
Adjust the number and depth of questions to match the interview duration.
Ensure the questions match the tone and structure of a real-life {{type}} interview.

🍀 Format your response in JSON format with array list of questions.
format: interviewQuestions=[
  {
    question: "",
    type: 'Technical/Behavioral/Experience/Problem Solving/Leasership'
  },
  {
    ...
  }
]

🎯 The goal is to create a structured, relevant, and time-optimized interview plan for a {{jobTitle}} role.
`;

export const FEEDBACK_PROMPT = `{{conversation}}

Based on this interview conversation between the assistant and the user,
provide feedback for the user's interview.

Give a rating out of 10 for:
- Technical Skills
- Communication
- Problem Solving
- Experience

Also:
- Summarize the interview in 3 lines.
- Clearly state whether the candidate is recommended for hire or not, along with a short message.

Return the response in the following JSON format:
{
  "feedback": {
    "rating": {
      "technicalSkills": 5,
      "communication": 6,
      "problemSolving": 4,
      "experience": 7
    },
    "summary": "<3-line summary>",
    "recommendation": "Yes" | "No",
    "recommendationMsg": "<short message>"
  }
}`;
