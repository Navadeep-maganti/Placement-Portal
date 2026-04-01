export const mentorPage = {
  slug: "mentors",
  heroClassName: "mentors",
  hero: {
    eyebrow: "Career Mentors",
    title: "Mentor Connect for placements and internships",
    description:
      "Explore alumni and industry mentors who can help with resumes, mock interviews, roadmap planning, and role-specific preparation.",
    actions: [
      { label: "Update Profile", to: "/student/profile", variant: "primary" },
      { label: "Browse Mentors", href: "#featured", variant: "ghost" },
    ],
  },
  spotlight: {
    label: "This Week",
    title: "Resume Rescue Office Hours",
    description:
      "A fast-moving mentor panel focused on resumes, outreach strategy, and making your project work read stronger in interviews.",
    pills: ["April 4", "Online", "30 seats"],
  },
  stats: [
    { value: "12", label: "Active mentors" },
    { value: "28", label: "Slots this month" },
    { value: "4.8/5", label: "Avg session rating" },
  ],
  featured: {
    title: "Featured mentors",
    subtitle: "Dummy profiles with hardcoded availability and focus areas.",
    items: [
      {
        eyebrow: "SDE Track",
        title: "Ananya Reddy",
        meta: "SDE II at Atlassian | CSE 2020",
        description:
          "Best for DSA plans, intern-to-PPO conversion advice, and resume sharpening for product companies.",
        tags: ["Remote", "English/Hindi", "8 open slots"],
      },
      {
        eyebrow: "Data Track",
        title: "Rahul Varma",
        meta: "Data Analyst at Deloitte | ECE 2019",
        description:
          "Helps students position analytics projects, prepare SQL rounds, and talk through dashboards clearly.",
        tags: ["Analytics", "Case prep", "Weekend only"],
      },
      {
        eyebrow: "Core Track",
        title: "Sneha Kulkarni",
        meta: "Design Engineer at Texas Instruments | EEE 2018",
        description:
          "Strong fit for core electronics interview prep, project storytelling, and roadmap planning for chip roles.",
        tags: ["Core interviews", "Offline meetups", "6 open slots"],
      },
    ],
  },
  timeline: {
    title: "Upcoming circles",
    subtitle: "Short, practical sessions students can join without registration flow for now.",
    items: [
      {
        badge: "Open",
        title: "Backend Interview Circle",
        meta: "April 5 | 7:00 PM | Google Meet",
        description:
          "API design prompts, Java and Spring discussion points, and a quick system design warmup.",
      },
      {
        badge: "Filling fast",
        title: "Resume Roast, Kindly",
        meta: "April 7 | 6:30 PM | Placement Seminar Hall",
        description:
          "Five mentors review resume bullets live and show how to turn vague project lines into measurable impact.",
      },
      {
        badge: "New",
        title: "Breaking into Product Roles",
        meta: "April 9 | 8:00 PM | Online",
        description:
          "A candid session on PM internships, what to showcase outside coding contests, and how to frame campus leadership.",
      },
    ],
  },
  tips: {
    title: "How to use mentoring well",
    items: [
      "Arrive with two or three specific questions instead of asking for general guidance.",
      "Keep your resume and one project summary ready before every conversation.",
      "Write down action items right after the session and update your profile the same day.",
    ],
  },
};

export const workshopPage = {
  slug: "workshops",
  heroClassName: "workshops",
  hero: {
    eyebrow: "Workshops",
    title: "Hands-on workshops with campus-ready hardcoded schedules",
    description:
      "Browse practical workshops on interviews, communication, aptitude, and project presentation, all shown here with dummy data for now.",
    actions: [
      { label: "See Calendar", href: "#featured", variant: "primary" },
      { label: "View Mentors", to: "/student/mentors", variant: "ghost" },
    ],
  },
  spotlight: {
    label: "Spotlight Session",
    title: "Interview Week Sprint",
    description:
      "A five-day workshop series covering aptitude drills, role-based interview questions, and confidence-building mock rounds.",
    pills: ["5 sessions", "Hybrid", "Certificate sample"],
  },
  stats: [
    { value: "6", label: "Upcoming workshops" },
    { value: "220+", label: "Seats planned" },
    { value: "3", label: "Practice tracks" },
  ],
  featured: {
    title: "Workshop lineup",
    subtitle: "Each card is static dummy content, ready to be swapped with API data later.",
    items: [
      {
        eyebrow: "Communication",
        title: "Pitch Yourself in 90 Seconds",
        meta: "April 6 | 4:00 PM | Seminar Hall A",
        description:
          "Learn a simple structure for self-introductions, HR responses, and internship elevator pitches.",
        tags: ["60 mins", "Beginner friendly", "120 seats"],
      },
      {
        eyebrow: "Technical",
        title: "Aptitude and Coding Warmup Lab",
        meta: "April 8 | 5:00 PM | CSE Lab 2",
        description:
          "Timed reasoning sets, pattern recognition drills, and short coding checkpoints with discussion after each round.",
        tags: ["Lab format", "Practice sheets", "Bring laptop"],
      },
      {
        eyebrow: "Projects",
        title: "Present Projects Like a Finalist",
        meta: "April 11 | 6:30 PM | Online",
        description:
          "Turn project details into a crisp narrative about decisions, constraints, ownership, and measurable outcomes.",
        tags: ["Portfolio polish", "Mock Q&A", "Recording shared"],
      },
    ],
  },
  timeline: {
    title: "Series calendar",
    subtitle: "Dummy sessions grouped like a real student resource calendar.",
    items: [
      {
        badge: "Monday",
        title: "Aptitude Accelerator",
        meta: "April 14 | 5:30 PM",
        description:
          "Mental math, visual reasoning, and elimination strategies for campus tests.",
      },
      {
        badge: "Wednesday",
        title: "Group Discussion Bootcamp",
        meta: "April 16 | 4:30 PM",
        description:
          "Practice framing points, entering discussions cleanly, and disagreeing without losing structure.",
      },
      {
        badge: "Friday",
        title: "Mock Interview Desk",
        meta: "April 18 | 3:00 PM",
        description:
          "Short technical and HR interviews with immediate feedback and improvement notes.",
      },
    ],
  },
  tips: {
    title: "Best way to prepare",
    items: [
      "Pick one workshop track at a time so the practice actually compounds.",
      "Treat workshop notes like action items and schedule follow-up practice within 24 hours.",
      "Use mentor sessions after workshops to review what still feels weak.",
    ],
  },
};

export const hackathonPage = {
  slug: "hackathons",
  heroClassName: "hackathons",
  hero: {
    eyebrow: "Hackathons",
    title: "Hackathon board with sample events, deadlines, and team calls",
    description:
      "Find dummy hackathons, idea themes, and team-building opportunities that make the student side of the portal feel more complete.",
    actions: [
      { label: "Explore Events", href: "#featured", variant: "primary" },
      { label: "See Workshops", to: "/student/workshops", variant: "ghost" },
    ],
  },
  spotlight: {
    label: "Top Pick",
    title: "Build for Bharat Hack Sprint",
    description:
      "A social-impact themed weekend sprint with product, backend, frontend, and pitch categories for student teams.",
    pills: ["48 hours", "Team of 4", "INR 1L sample prize"],
  },
  stats: [
    { value: "9", label: "Open hackathons" },
    { value: "14", label: "Students seeking teams" },
    { value: "4", label: "Theme tracks" },
  ],
  featured: {
    title: "Open events",
    subtitle: "Dummy opportunities with hardcoded deadlines, prizes, and formats.",
    items: [
      {
        eyebrow: "Product + Tech",
        title: "Campus LaunchPad 2026",
        meta: "Registration closes April 10",
        description:
          "A rapid prototype challenge for student founders and builders working on campus, career, or community tools.",
        tags: ["Hybrid", "Pitch deck round", "Team size 3-5"],
      },
      {
        eyebrow: "AI Theme",
        title: "Code for Climate AI Jam",
        meta: "Registration closes April 13",
        description:
          "Build lightweight AI-assisted tools for climate reporting, agriculture insights, or energy awareness.",
        tags: ["Online", "Mentor checkpoints", "Prize pool sample"],
      },
      {
        eyebrow: "Open Innovation",
        title: "Midnight Makers Hackathon",
        meta: "Registration closes April 19",
        description:
          "A classic overnight build with judging on originality, execution quality, and demo clarity.",
        tags: ["On campus", "Food + swag", "Beginner friendly"],
      },
    ],
  },
  timeline: {
    title: "Team board",
    subtitle: "Sample team requests to make the page feel active before backend integration.",
    items: [
      {
        badge: "Need frontend",
        title: "Team PixelPulse",
        meta: "Looking for React or UI teammate",
        description:
          "Already has one ML student and one backend developer. Building a sustainability dashboard for hostels.",
      },
      {
        badge: "Need pitch lead",
        title: "Team StackSprint",
        meta: "Looking for product and presentation support",
        description:
          "Working on a student placement companion and wants someone strong in demos, flow, and storytelling.",
      },
      {
        badge: "Need designer",
        title: "Team CoreLoop",
        meta: "Looking for UX and branding help",
        description:
          "Building a civic reporting app and wants a teammate to tighten usability before final judging.",
      },
    ],
  },
  tips: {
    title: "Hackathon playbook",
    items: [
      "Choose a problem statement you can demo clearly in under three minutes.",
      "Lock the scope early and keep one teammate focused only on the final presentation.",
      "Use workshops and mentors to sharpen your pitch before the event weekend.",
    ],
  },
};
