import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed questions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const questions = await prisma.question.createMany({
    data: [
      //ENTRY LEVEL
      {
        jobRole: 'Software Engineer',
        jobLevel: 'entry',
        question:
          'Describe a time when you had to learn a new programming language or tool quickly for a project. How did you go about learning it?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'entry',
        question:
          'Can you describe a time you faced a tight deadline? How did you ensure you delivered your part of the project on time?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'entry',
        question:
          "Tell me about a time you had to explain a technical concept to someone who didn't have a technical background. How did you simplify it?",
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'entry',
        question:
          'What motivates you as a software engineer? Describe a project or task that you found particularly engaging and why.',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'entry',
        question:
          'Describe a time you had to ask for help on a coding problem. How did you approach it?',
        questionType: 'behavioral',
      },
      //MID LEVEL
      {
        jobRole: 'Software Engineer',
        jobLevel: 'mid',
        question:
          "Tell me about a significant technical challenge you've overcome in a previous role. What was the problem, your exact contribution, and the impact of your solution?",
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'mid',
        question:
          'Describe a time when you had to influence a team member or stakeholder on a technical approach they initially disagreed with. How did you handle the discussion?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'mid',
        question:
          'Can you share an experience where you shipped code with a significant bug? What was your process for diagnosing, fixing, and preventing recurrence?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'mid',
        question:
          'Tell me about a time you had to balance technical debt reduction with new feature development. How did you make decisions and communicate them?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'mid',
        question:
          'Describe a situation where you had to onboard a new team member or mentor a junior engineer. What was your approach?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'mid',
        question:
          'How do you ensure the quality and maintainability of your code, especially when working on a large codebase or with multiple contributors?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'mid',
        question:
          'Tell me about a time you had to adapt quickly to a significant change in project requirements or team direction. How did you manage it?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'mid',
        question:
          'Describe a project where you had to collaborate closely with non-technical stakeholders (e.g., product managers, designers). How did you ensure effective communication?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'mid',
        question:
          "What's your approach to continuous learning in a rapidly evolving tech landscape? Give an example of a recent skill you acquired.",
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'mid',
        question:
          'Tell me about a time you disagreed with your manager or a senior colleague on a technical decision. How did you handle the situation?',
        questionType: 'behavioral',
      },
      //SENIOR LEVEL
      {
        jobRole: 'Software Engineer',
        jobLevel: 'senior',
        question:
          'Tell me about a time you significantly influenced the technical direction of a project or system. What was your proposal, how did you get buy-in, and what was the outcome?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'senior',
        question:
          'Describe a complex cross-functional project you led or played a key role in. How did you coordinate with other teams, manage dependencies, and ensure successful delivery?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'senior',
        question:
          'Can you describe a situation where you had to make a high-stakes technical trade-off (e.g., performance vs. development speed)? What was your rationale and the ultimate impact?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'senior',
        question:
          'Tell me about a time you identified a significant technical debt or architectural flaw in a system. How did you advocate for addressing it, and what steps did you take?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'senior',
        question:
          'How do you approach mentoring junior and mid-level engineers to help them grow technically and professionally?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'senior',
        question:
          'Describe a time you successfully introduced a new technology or best practice to your team or organization. What challenges did you face, and how did you overcome them?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'senior',
        question:
          'Tell me about a time you had to deliver difficult technical news or manage expectations with senior leadership. How did you prepare and communicate?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'senior',
        question:
          'Can you give an example of how you balance hands-on coding with responsibilities like design, planning, or mentorship?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'senior',
        question:
          'Describe a time you were responsible for the quality and reliability of a critical system. What processes did you put in place, and what was the outcome?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'senior',
        question:
          'How do you foster a culture of continuous improvement and learning within your team?',
        questionType: 'behavioral',
      },
      //STAFF LEVEL
      {
        jobRole: 'Software Engineer',
        jobLevel: 'staff',
        question:
          'Tell me about a time you defined and championed a significant technical vision or strategy that impacted multiple teams or the entire organization. How did you get buy-in and drive its implementation?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'staff',
        question:
          'Describe a time you identified a non-obvious, high-leverage technical problem within the organization and led the effort to solve it. What was the impact?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'staff',
        question:
          'Can you give an example of when you had to step in to unblock a critical, complex engineering initiative that was struggling? What was your approach and the outcome?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'staff',
        question:
          'How do you balance advocating for ideal technical solutions with pragmatic business realities, especially when they conflict?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'staff',
        question:
          'Tell me about a time you built consensus across multiple senior stakeholders (e.g., engineering leads, product managers, even VPs) on a contentious technical decision.',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'staff',
        question:
          'Describe a scenario where you championed a new architectural pattern or fundamental shift in engineering practice across the organization. What was the process and outcome?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'staff',
        question:
          'How do you proactively identify and mitigate systemic risks or emerging technical challenges across different teams or products?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'staff',
        question:
          'Tell me about a time you mentored or coached other senior engineers or tech leads to elevate their technical leadership skills.',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'staff',
        question:
          'Describe a project where you were responsible for defining the technical roadmap and long-term strategy. What was your process?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'staff',
        question:
          'How do you effectively communicate highly complex technical concepts and their business implications to non-technical executive leadership?',
        questionType: 'behavioral',
      },
      //PRINCIPAL LEVEL
      {
        jobRole: 'Software Engineer',
        jobLevel: 'principal',
        question:
          "Tell me about a time you initiated and led a significant, multi-year technical initiative that fundamentally changed the company's technical landscape or product offering. What was your personal contribution and the long-term impact?",
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'principal',
        question:
          'Describe a technical paradigm shift or major innovation you championed that yielded significant competitive advantage or cost savings for the organization. How did you identify the opportunity and drive its adoption?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'principal',
        question:
          'Can you give an example of when you had to resolve a highly contentious technical debate or architectural stalemate among highly skilled and opinionated senior engineers/teams? What was your approach to finding a resolution?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'principal',
        question:
          'How do you assess emerging technologies and decide which ones are strategically important for the organization to invest in or adopt?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'principal',
        question:
          "Tell me about a time you represented your company's technical expertise externally, perhaps at a conference or in an industry working group. What was the objective and outcome?",
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'principal',
        question:
          'Describe your philosophy on technical leadership and how you empower other senior engineers to grow into more impactful roles.',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'principal',
        question:
          'How do you identify and mitigate long-term, systemic technical risks or anti-patterns that might not be immediately apparent to others?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'principal',
        question:
          'Tell me about a time you had to define a technical hiring strategy or contribute significantly to scaling an engineering organization through talent acquisition and retention.',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'principal',
        question:
          'Can you describe how you influence product strategy or business decisions through your technical expertise and insights?',
        questionType: 'behavioral',
      },
      {
        jobRole: 'Software Engineer',
        jobLevel: 'principal',
        question:
          "What's your approach to fostering a culture of innovation and pushing the boundaries of what's technically possible within a large organization?",
        questionType: 'behavioral',
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
