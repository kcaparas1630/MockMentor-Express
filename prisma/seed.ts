import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed questions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const questions = await prisma.question.createMany({
    data: [
      // Behavioural
      { question: 'Tell me about a time you had a conflict with a team member. How did you handle it?', questionType: 'Behavioural' },
      { question: 'Describe a project where you had to meet a tight deadline. What did you do to stay on track?', questionType: 'Behavioural' },
      { question: 'Have you ever made a mistake in code that went to production? How did you fix it and what did you learn?', questionType: 'Behavioural' },
      { question: 'How do you handle receiving critical feedback on your code or performance?', questionType: 'Behavioural' },
      { question: 'Tell me about a time when you had to learn a new tool or technology quickly. How did you approach it?', questionType: 'Behavioural' },
      // Technical
      { question: 'Explain the difference between == and === in JavaScript.', questionType: 'Technical' },
      { question: 'What are the advantages and disadvantages of using microservices architecture?', questionType: 'Technical' },
      { question: 'How would you optimize a slow SQL query?', questionType: 'Technical' },
      { question: 'Can you explain the concept of closures in JavaScript with an example?', questionType: 'Technical' },
      { question: 'What steps would you take to troubleshoot a 500 Internal Server Error in a production API?', questionType: 'Technical' },
    ]
  })

}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
