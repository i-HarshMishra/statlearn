import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding StatLearnAI database...\n');

  // ── 1. COMPETENCIES ──────────────────────────────────────────────────
  const competencyData = [
    // Statistical Competencies
    { name: 'Survey Design', domain: 'Statistical Competencies', description: 'Designing and implementing statistical surveys' },
    { name: 'Sampling', domain: 'Statistical Competencies', description: 'Sampling methods and techniques for data collection' },
    { name: 'National Accounts', domain: 'Statistical Competencies', description: 'System of National Accounts and GDP estimation' },
    { name: 'Price Statistics', domain: 'Statistical Competencies', description: 'Consumer and wholesale price index compilation' },
    { name: 'Labour Statistics', domain: 'Statistical Competencies', description: 'Employment, unemployment, and labour force surveys' },
    { name: 'Agricultural Statistics', domain: 'Statistical Competencies', description: 'Crop estimation, land use, and agricultural census data' },
    { name: 'Industrial Statistics', domain: 'Statistical Competencies', description: 'Index of Industrial Production and factory statistics' },
    { name: 'SDG Indicators', domain: 'Statistical Competencies', description: 'Sustainable Development Goals monitoring indicators' },
    { name: 'Metadata Standards', domain: 'Statistical Competencies', description: 'SDMX, DDI and statistical metadata frameworks' },
    { name: 'Data Quality Frameworks', domain: 'Statistical Competencies', description: 'Quality assessment and assurance in official statistics' },
    // Technical Competencies
    { name: 'Python', domain: 'Technical Competencies', description: 'Python programming for data analysis and automation' },
    { name: 'R', domain: 'Technical Competencies', description: 'R programming for statistical computing' },
    { name: 'SQL', domain: 'Technical Competencies', description: 'Database querying and management with SQL' },
    { name: 'Stata', domain: 'Technical Competencies', description: 'Stata for econometric and statistical analysis' },
    { name: 'SPSS', domain: 'Technical Competencies', description: 'SPSS for survey data analysis' },
    { name: 'SAS', domain: 'Technical Competencies', description: 'SAS for large-scale statistical processing' },
    { name: 'GIS', domain: 'Technical Competencies', description: 'Geographic Information Systems and spatial data' },
    { name: 'Data Visualization', domain: 'Technical Competencies', description: 'Creating charts, dashboards, and visual analytics' },
    { name: 'AI/ML', domain: 'Technical Competencies', description: 'Artificial Intelligence and Machine Learning concepts' },
    { name: 'Cloud Computing', domain: 'Technical Competencies', description: 'Cloud platforms and infrastructure for data processing' },
    { name: 'APIs', domain: 'Technical Competencies', description: 'API design, consumption, and data exchange' },
    { name: 'Open Data', domain: 'Technical Competencies', description: 'Open data portals and data publishing standards' },
    // Digital Governance
    { name: 'Cybersecurity', domain: 'Digital Governance', description: 'Information security practices and threat mitigation' },
    { name: 'Data Privacy', domain: 'Digital Governance', description: 'Data protection regulations and privacy frameworks' },
    { name: 'Digital Signatures', domain: 'Digital Governance', description: 'Digital signing and authentication mechanisms' },
    { name: 'Government Cloud', domain: 'Digital Governance', description: 'MeghRaj and government cloud infrastructure' },
    { name: 'Digital Public Infrastructure', domain: 'Digital Governance', description: 'India Stack, UPI, DigiLocker, and DPI frameworks' },
    // Behavioural and Managerial
    { name: 'Leadership', domain: 'Behavioural and Managerial', description: 'Team leadership and organizational vision' },
    { name: 'Communication', domain: 'Behavioural and Managerial', description: 'Professional communication and presentation skills' },
    { name: 'Project Management', domain: 'Behavioural and Managerial', description: 'Project planning, execution and monitoring' },
    { name: 'Ethics', domain: 'Behavioural and Managerial', description: 'Professional ethics and integrity in public service' },
    { name: 'Decision Making', domain: 'Behavioural and Managerial', description: 'Data-driven decision making and critical thinking' },
    { name: 'Change Management', domain: 'Behavioural and Managerial', description: 'Managing organizational change and transformation' },
  ];

  const competencies: Record<string, string> = {};
  for (const c of competencyData) {
    const comp = await prisma.competency.upsert({
      where: { name: c.name },
      update: c,
      create: c,
    });
    competencies[c.name] = comp.id;
  }
  console.log(`✅ ${Object.keys(competencies).length} competencies seeded`);

  // ── 2. ROLE BENCHMARKS ────────────────────────────────────────────────
  const benchmarks: { designation: string; skills: Record<string, number> }[] = [
    {
      designation: 'Statistical Officer',
      skills: {
        'Survey Design': 2, 'Sampling': 2, 'Python': 2, 'SQL': 2,
        'Data Visualization': 2, 'Data Quality Frameworks': 2,
        'Communication': 2, 'R': 1, 'Metadata Standards': 1,
      },
    },
    {
      designation: 'Senior Statistical Officer',
      skills: {
        'Survey Design': 3, 'Sampling': 3, 'Python': 2, 'SQL': 2,
        'R': 2, 'Data Visualization': 2, 'Data Quality Frameworks': 3,
        'National Accounts': 2, 'AI/ML': 1, 'Communication': 2,
        'Project Management': 2,
      },
    },
    {
      designation: 'Data Processing Assistant',
      skills: {
        'SQL': 2, 'Python': 1, 'Data Visualization': 2,
        'SPSS': 2, 'Data Quality Frameworks': 1, 'Communication': 1,
        'Cybersecurity': 1,
      },
    },
    {
      designation: 'Field Investigator',
      skills: {
        'Survey Design': 2, 'Sampling': 2, 'Communication': 2,
        'Data Quality Frameworks': 1, 'GIS': 1, 'Ethics': 2,
      },
    },
    {
      designation: 'Deputy Director',
      skills: {
        'Leadership': 3, 'Project Management': 3, 'Decision Making': 3,
        'Data Quality Frameworks': 3, 'National Accounts': 2,
        'Data Privacy': 2, 'Communication': 3, 'Survey Design': 2,
        'Python': 1, 'AI/ML': 1, 'Change Management': 2,
      },
    },
    {
      designation: 'Director',
      skills: {
        'Leadership': 3, 'Project Management': 3, 'Decision Making': 3,
        'Change Management': 3, 'Data Quality Frameworks': 3,
        'Data Privacy': 3, 'Communication': 3, 'Ethics': 3,
        'National Accounts': 2, 'SDG Indicators': 2,
      },
    },
  ];

  for (const b of benchmarks) {
    for (const [skillName, level] of Object.entries(b.skills)) {
      if (competencies[skillName]) {
        await prisma.roleBenchmark.upsert({
          where: {
            designation_competencyId: {
              designation: b.designation,
              competencyId: competencies[skillName],
            },
          },
          update: { requiredLevel: level },
          create: {
            designation: b.designation,
            competencyId: competencies[skillName],
            requiredLevel: level,
          },
        });
      }
    }
  }
  console.log(`✅ ${benchmarks.length} designation benchmarks seeded`);

  // ── 3. COURSES ────────────────────────────────────────────────────────
  const courses = [
    { title: 'Python for Data Analysis', provider: 'iGOT Karmayogi', description: 'Learn Python basics for statistical data analysis, including pandas, NumPy and data wrangling.', level: 'Beginner', durationHours: 8, language: 'English', url: 'https://igot.gov.in/course/python-data-analysis', competencyTags: 'Python,Data Visualization' },
    { title: 'Advanced Python & Machine Learning', provider: 'iGOT Karmayogi', description: 'Advanced Python with scikit-learn, model building, and ML pipelines for statistical applications.', level: 'Advanced', durationHours: 20, language: 'English', url: 'https://igot.gov.in/course/adv-python-ml', competencyTags: 'Python,AI/ML' },
    { title: 'SQL for Government Databases', provider: 'iGOT Karmayogi', description: 'SQL querying and database management for government statistical databases.', level: 'Beginner', durationHours: 6, language: 'English', url: 'https://igot.gov.in/course/sql-govt', competencyTags: 'SQL' },
    { title: 'Advanced SQL & Data Warehousing', provider: 'NSSTA TPAC', description: 'Complex queries, optimization, and data warehouse design for large-scale official statistics.', level: 'Advanced', durationHours: 12, language: 'English', url: 'https://nssta.gov.in/tpac/adv-sql', competencyTags: 'SQL,Cloud Computing' },
    { title: 'Survey Design Fundamentals', provider: 'NSSTA TPAC', description: 'Designing surveys for official statistics: questionnaire design, sampling frames, and pilot testing.', level: 'Intermediate', durationHours: 12, language: 'English', url: 'https://nssta.gov.in/tpac/survey-design', competencyTags: 'Survey Design,Sampling' },
    { title: 'Sampling Methods in Official Statistics', provider: 'NSSTA TPAC', description: 'Probability and non-probability sampling methods for national surveys.', level: 'Intermediate', durationHours: 10, language: 'English', url: 'https://nssta.gov.in/tpac/sampling', competencyTags: 'Sampling,Data Quality Frameworks' },
    { title: 'Data Visualization with Tableau & Power BI', provider: 'iGOT Karmayogi', description: 'Creating impactful dashboards and visualizations for statistical publications.', level: 'Beginner', durationHours: 8, language: 'English', url: 'https://igot.gov.in/course/data-viz', competencyTags: 'Data Visualization' },
    { title: 'R Programming for Statisticians', provider: 'NSSTA TPAC', description: 'R programming including tidyverse, ggplot2, and statistical modeling.', level: 'Intermediate', durationHours: 15, language: 'English', url: 'https://nssta.gov.in/tpac/r-programming', competencyTags: 'R,Data Visualization' },
    { title: 'National Accounts: SNA Framework', provider: 'NSSTA TPAC', description: 'System of National Accounts: GDP estimation, input-output tables, and satellite accounts.', level: 'Advanced', durationHours: 20, language: 'English', url: 'https://nssta.gov.in/tpac/national-accounts', competencyTags: 'National Accounts' },
    { title: 'Price Index Compilation Methods', provider: 'NSSTA TPAC', description: 'CPI/WPI compilation methodology, index number theory, and quality adjustment.', level: 'Intermediate', durationHours: 10, language: 'English', url: 'https://nssta.gov.in/tpac/price-statistics', competencyTags: 'Price Statistics,Data Quality Frameworks' },
    { title: 'GIS for Official Statistics', provider: 'iGOT Karmayogi', description: 'Geographic Information Systems for spatial analysis and statistical mapping.', level: 'Intermediate', durationHours: 12, language: 'English', url: 'https://igot.gov.in/course/gis', competencyTags: 'GIS,Data Visualization' },
    { title: 'Cybersecurity Awareness for Government', provider: 'iGOT Karmayogi', description: 'Information security practices, threat awareness, and safe data handling for officials.', level: 'Beginner', durationHours: 4, language: 'English', url: 'https://igot.gov.in/course/cybersecurity', competencyTags: 'Cybersecurity,Data Privacy' },
    { title: 'Data Privacy & Protection in India', provider: 'iGOT Karmayogi', description: 'Digital Personal Data Protection Act 2023, privacy by design, and data governance.', level: 'Intermediate', durationHours: 6, language: 'English', url: 'https://igot.gov.in/course/data-privacy', competencyTags: 'Data Privacy,Ethics' },
    { title: 'Leadership in Public Service', provider: 'iGOT Karmayogi', description: 'Leadership principles, team management, and vision setting for government officials.', level: 'Intermediate', durationHours: 8, language: 'English', url: 'https://igot.gov.in/course/leadership', competencyTags: 'Leadership,Decision Making' },
    { title: 'Project Management for Government', provider: 'iGOT Karmayogi', description: 'Project planning, agile methodology, and stakeholder management in government context.', level: 'Intermediate', durationHours: 10, language: 'English', url: 'https://igot.gov.in/course/project-mgmt', competencyTags: 'Project Management,Communication' },
    { title: 'AI/ML in Official Statistics', provider: 'NSSTA TPAC', description: 'Applications of AI and Machine Learning in statistical production and data processing.', level: 'Intermediate', durationHours: 15, language: 'English', url: 'https://nssta.gov.in/tpac/ai-ml', competencyTags: 'AI/ML,Python' },
    { title: 'Cloud Computing for Data Processing', provider: 'iGOT Karmayogi', description: 'Introduction to cloud platforms and their application in large-scale statistical computing.', level: 'Beginner', durationHours: 6, language: 'English', url: 'https://igot.gov.in/course/cloud', competencyTags: 'Cloud Computing,Government Cloud' },
    { title: 'SDG Monitoring & Indicators', provider: 'NSSTA TPAC', description: 'SDG indicator framework, monitoring methodology, and reporting mechanisms.', level: 'Intermediate', durationHours: 8, language: 'English', url: 'https://nssta.gov.in/tpac/sdg', competencyTags: 'SDG Indicators,Data Quality Frameworks' },
    { title: 'Communication Skills for Statisticians', provider: 'iGOT Karmayogi', description: 'Report writing, data storytelling, and presentation skills for statistical professionals.', level: 'Beginner', durationHours: 4, language: 'English', url: 'https://igot.gov.in/course/communication', competencyTags: 'Communication' },
    { title: 'Change Management in Digital Transformation', provider: 'iGOT Karmayogi', description: 'Managing organizational change during digital transformation initiatives in government.', level: 'Advanced', durationHours: 10, language: 'English', url: 'https://igot.gov.in/course/change-mgmt', competencyTags: 'Change Management,Leadership' },
  ];

  for (const course of courses) {
    const existing = await prisma.course.findFirst({ where: { title: course.title } });
    if (existing) {
      await prisma.course.update({ where: { id: existing.id }, data: course });
    } else {
      await prisma.course.create({ data: course });
    }
  }
  console.log(`✅ ${courses.length} courses seeded`);

  // ── 4. USERS ──────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('password123', 12);

  const users = [
    { email: 'learner@test.com', role: Role.LEARNER },
    { email: 'admin@test.com', role: Role.ADMIN },
    { email: 'superadmin@test.com', role: Role.ADMIN },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, passwordHash: hash, role: u.role },
    });
  }
  console.log(`✅ ${users.length} test users seeded`);

  // ── 5. DEMO EMPLOYEE PROFILES ─────────────────────────────────────────
  const explicitEmployees = [
    {
      email: 'priya.sharma@stats.gov.in',
      name: 'Priya Sharma',
      designation: 'Statistical Officer',
      department: 'Price Statistics Division',
      location: 'Delhi',
      education: 'M.Sc. Statistics',
      experienceYears: 4,
      totalLearningHours: 24,
      scores: {
        'Survey Design': 75,
        'Sampling': 82,
        'Python': 40,
        'SQL': 65,
        'Data Visualization': 55,
        'Data Quality Frameworks': 80,
        'Communication': 70,
        'R': 30,
        'Metadata Standards': 45,
      } as Record<string, number>
    },
    {
      email: 'rajesh.kumar@stats.gov.in',
      name: 'Rajesh Kumar',
      designation: 'Senior Statistical Officer',
      department: 'National Accounts Division',
      location: 'Mumbai',
      education: 'M.A. Economics',
      experienceYears: 12,
      totalLearningHours: 120,
      scores: {
        'Survey Design': 85,
        'Sampling': 90,
        'Python': 60,
        'SQL': 75,
        'R': 65,
        'Data Visualization': 70,
        'Data Quality Frameworks': 88,
        'National Accounts': 95,
        'AI/ML': 20,
        'Communication': 85,
        'Project Management': 75,
      } as Record<string, number>
    },
    {
      email: 'anita.desai@stats.gov.in',
      name: 'Anita Desai',
      designation: 'Data Processing Assistant',
      department: 'Data Processing Division',
      location: 'Bengaluru',
      education: 'B.Tech Computer Science',
      experienceYears: 2,
      totalLearningHours: 15,
      scores: {
        'SQL': 85,
        'Python': 70,
        'Data Visualization': 60,
        'SPSS': 40,
        'Data Quality Frameworks': 55,
        'Communication': 65,
        'Cybersecurity': 50,
      } as Record<string, number>
    },
    {
      email: 'vikram.singh@stats.gov.in',
      name: 'Vikram Singh',
      designation: 'Field Investigator',
      department: 'Agricultural Statistics Division',
      location: 'Lucknow',
      education: 'B.A. Economics',
      experienceYears: 6,
      totalLearningHours: 35,
      scores: {
        'Survey Design': 65,
        'Sampling': 70,
        'Communication': 80,
        'Data Quality Frameworks': 50,
        'GIS': 30,
        'Ethics': 85,
      } as Record<string, number>
    },
    {
      email: 'sneha.patel@stats.gov.in',
      name: 'Sneha Patel',
      designation: 'Deputy Director',
      department: 'National Statistical Office',
      location: 'Delhi',
      education: 'Ph.D. Economics',
      experienceYears: 18,
      totalLearningHours: 200,
      scores: {
        'Leadership': 95,
        'Project Management': 90,
        'Decision Making': 92,
        'Data Quality Frameworks': 85,
        'National Accounts': 80,
        'Data Privacy': 75,
        'Communication': 90,
        'Survey Design': 80,
        'Python': 45,
        'AI/ML': 35,
        'Change Management': 85,
      } as Record<string, number>
    }
  ];

  for (let i = 0; i < explicitEmployees.length; i++) {
    const emp = explicitEmployees[i];
    
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: { email: emp.email, passwordHash: hash, role: Role.LEARNER },
    });

    const profile = await prisma.employeeProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: emp.name,
        employeeCode: `EMP${String(1000 + i).padStart(5, '0')}`,
        designation: emp.designation,
        department: emp.department,
        currentAssignment: `${emp.department} - ${emp.designation}`,
        education: emp.education,
        experienceYears: emp.experienceYears,
        location: emp.location,
        preferredLanguage: 'English',
        previousTrainings: 'iGOT Karmayogi certifications',
        onboardingComplete: true,
        overallReadiness: 0,
        totalLearningHours: emp.totalLearningHours,
      },
    });

    const benchmarkForDesignation = benchmarks.find(b => b.designation === emp.designation);
    if (benchmarkForDesignation) {
      let readinessSum = 0;
      let readinessCount = 0;

      for (const [skillName, requiredLevel] of Object.entries(benchmarkForDesignation.skills)) {
        if (!competencies[skillName]) continue;

        const score = emp.scores[skillName] || 50;
        const currentLevel = score <= 40 ? 1 : score <= 70 ? 2 : 3;
        const gap = requiredLevel - currentLevel;
        const severity = gap >= 2 ? 'Critical' : gap === 1 ? 'Moderate' : 'No Gap';

        await prisma.competencyScore.upsert({
          where: {
            profileId_competencyId: {
              profileId: profile.id,
              competencyId: competencies[skillName],
            },
          },
          update: { score, currentLevel },
          create: {
            profileId: profile.id,
            competencyId: competencies[skillName],
            score: Math.round(score * 100) / 100,
            currentLevel,
            diagnosticScore: Math.round((score * 0.5 + Math.random() * 20) * 100) / 100,
            selfScore: Math.round((score * 0.8 + Math.random() * 15) * 100) / 100,
            trainingScore: i % 3 === 0 ? 100 : 0,
            experienceScore: emp.experienceYears <= 1 ? 20 : emp.experienceYears <= 4 ? 50 : emp.experienceYears <= 9 ? 75 : 100,
          },
        });

        await prisma.skillGap.upsert({
          where: {
            profileId_competencyId: {
              profileId: profile.id,
              competencyId: competencies[skillName],
            },
          },
          update: { gap, severity, currentLevel, requiredLevel },
          create: {
            profileId: profile.id,
            competencyId: competencies[skillName],
            requiredLevel,
            currentLevel,
            gap: Math.max(gap, 0),
            severity,
          },
        });

        const readinessForSkill = Math.min(currentLevel / requiredLevel, 1) * 100;
        readinessSum += readinessForSkill;
        readinessCount++;
      }

      const overallReadiness = readinessCount > 0 ? Math.round((readinessSum / readinessCount) * 100) / 100 : 0;
      await prisma.employeeProfile.update({
        where: { id: profile.id },
        data: { overallReadiness },
      });
    }
  }

  // ── 5B. ADDITIONAL 45 RANDOM DEMO EMPLOYEES ─────────────────────────────
  const departments = [
    'National Statistical Office',
    'Price Statistics Division',
    'Labour Statistics Division',
    'National Accounts Division',
    'Agricultural Statistics Division',
    'Data Processing Division',
  ];
  const locations = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bengaluru', 'Lucknow', 'Patna', 'Jaipur'];
  const designations = ['Statistical Officer', 'Senior Statistical Officer', 'Data Processing Assistant', 'Field Investigator', 'Deputy Director', 'Director'];
  const educations = ['M.Sc. Statistics', 'M.A. Economics', 'B.Tech Computer Science', 'MBA', 'M.Phil Statistics', 'Ph.D. Economics'];
  const extraDemoNames = [
    'Amit Gupta', 'Kavitha Nair', 'Sanjay Reddy', 'Meera Iyer', 
    'Rahul Verma', 'Deepa Krishnan', 'Arun Joshi', 'Nisha Agarwal', 
    'Suresh Babu', 'Pooja Mehta', 'Karthik Raman', 'Sunita Das', 
    'Manish Tiwari', 'Lakshmi Menon', 'Rohit Saxena', 'Rakesh Singh',
    'Neha Sharma', 'Vikram Patel', 'Aarti Desai', 'Sameer Kapoor',
    'Ramesh Choudhury', 'Anjali Bhatia', 'Siddharth Rao', 'Kiran Bedi', 'Deepak Chauhan',
    'Manoj Kumar', 'Priyanka Pandey', 'Tarun Jain', 'Shalini Mukherjee', 'Sandeep Yadav',
    'Harish Shetty', 'Geeta Chawla', 'Varun Ahuja', 'Swati Mishra', 'Nitin Kadam',
    'Pradeep Sengupta', 'Smriti Thakur', 'Vivek Gokhale', 'Ashok Bansal', 'Ritu Srivastava',
    'Gaurav Pathak', 'Reena Nambiar', 'Ajay Varma', 'Jyoti Pillai', 'Mukul Khanna'
  ];

  for (let i = 0; i < 45; i++) {
    const email = `employee${i + 1}@stats.gov.in`;
    const designation = designations[i % designations.length];
    const department = departments[i % departments.length];
    const expYears = 1 + Math.floor(Math.random() * 18);

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash: hash, role: Role.LEARNER },
    });

    const profile = await prisma.employeeProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: extraDemoNames[i] || `Test User ${i}`,
        employeeCode: `EMP${String(2000 + i).padStart(5, '0')}`,
        designation,
        department,
        currentAssignment: `${department} - ${designation}`,
        education: educations[i % educations.length],
        experienceYears: expYears,
        location: locations[i % locations.length],
        preferredLanguage: 'English',
        previousTrainings: i % 3 === 0 ? 'NSSTA Basic Statistics' : '',
        onboardingComplete: true,
        overallReadiness: 0,
        totalLearningHours: Math.floor(Math.random() * 80),
      },
    });

    const benchmarkForDesignation = benchmarks.find(b => b.designation === designation);
    if (benchmarkForDesignation) {
      let readinessSum = 0;
      let readinessCount = 0;

      for (const [skillName, requiredLevel] of Object.entries(benchmarkForDesignation.skills)) {
        if (!competencies[skillName]) continue;

        // Force a high ratio of Beginners (<=40) and Intermediates (<=70)
        // For the first 30 random employees, cap their scores tightly to heavily bias towards Beginner/Intermediate
        const maxScore = i < 30 ? 65 : 95;
        const scoreRange = maxScore - 10;
        const score = 10 + Math.floor(Math.random() * scoreRange);
        
        const currentLevel = score <= 40 ? 1 : score <= 70 ? 2 : 3;
        const gap = requiredLevel - currentLevel;
        const severity = gap >= 2 ? 'Critical' : gap === 1 ? 'Moderate' : 'No Gap';

        await prisma.competencyScore.upsert({
          where: {
            profileId_competencyId: {
              profileId: profile.id,
              competencyId: competencies[skillName],
            },
          },
          update: { score, currentLevel },
          create: {
            profileId: profile.id,
            competencyId: competencies[skillName],
            score: score,
            currentLevel,
            diagnosticScore: Math.round((score * 0.5 + Math.random() * 10) * 100) / 100,
            selfScore: Math.round((score * 0.8 + Math.random() * 10) * 100) / 100,
            trainingScore: i % 3 === 0 ? Math.floor(Math.random() * 50) + 50 : 0,
            experienceScore: expYears <= 1 ? 20 : expYears <= 4 ? 50 : expYears <= 9 ? 75 : 100,
          },
        });

        await prisma.skillGap.upsert({
          where: {
            profileId_competencyId: {
              profileId: profile.id,
              competencyId: competencies[skillName],
            },
          },
          update: { gap, severity, currentLevel, requiredLevel },
          create: {
            profileId: profile.id,
            competencyId: competencies[skillName],
            requiredLevel,
            currentLevel,
            gap: Math.max(gap, 0),
            severity,
          },
        });

        const readinessForSkill = Math.min(currentLevel / requiredLevel, 1) * 100;
        readinessSum += readinessForSkill;
        readinessCount++;
      }

      const overallReadiness = readinessCount > 0 ? Math.round((readinessSum / readinessCount) * 100) / 100 : 0;
      await prisma.employeeProfile.update({
        where: { id: profile.id },
        data: { overallReadiness },
      });
    }
  }
  console.log(`✅ 50 demo employee profiles with scores & gaps seeded (5 explicit + 45 random)`);

  // ── 6. DIAGNOSTIC QUESTIONS ───────────────────────────────────────────
  const diagnosticQuestions = [
    { questionText: 'What is the primary purpose of stratified sampling?', options: JSON.stringify(['To divide population into homogeneous groups for better representation', 'To randomly select any unit from the population', 'To interview only experts in the field', 'To reduce the survey cost by half']), correctAnswer: 'To divide population into homogeneous groups for better representation', explanation: 'Stratified sampling divides the population into homogeneous subgroups (strata) to ensure each subgroup is adequately represented.', competency: 'Sampling', difficulty: 'Medium' },
    { questionText: 'Which Python library is most commonly used for data manipulation?', options: JSON.stringify(['pandas', 'matplotlib', 'flask', 'django']), correctAnswer: 'pandas', explanation: 'pandas is the primary Python library for data manipulation and analysis, providing DataFrames for structured data operations.', competency: 'Python', difficulty: 'Easy' },
    { questionText: 'What does SQL JOIN operation do?', options: JSON.stringify(['Combines rows from two or more tables based on related columns', 'Deletes duplicate rows from a table', 'Creates a new database', 'Exports data to CSV format']), correctAnswer: 'Combines rows from two or more tables based on related columns', explanation: 'SQL JOIN combines rows from two or more tables based on a related column between them.', competency: 'SQL', difficulty: 'Easy' },
    { questionText: 'What is the Consumer Price Index (CPI) used for?', options: JSON.stringify(['Measuring changes in the price level of consumer goods and services', 'Counting the total population of a country', 'Calculating Gross Domestic Product directly', 'Measuring industrial output growth']), correctAnswer: 'Measuring changes in the price level of consumer goods and services', explanation: 'CPI measures the average change over time in the prices paid by consumers for a basket of goods and services.', competency: 'Price Statistics', difficulty: 'Medium' },
    { questionText: 'Which data visualization is best for showing distribution of a continuous variable?', options: JSON.stringify(['Histogram', 'Pie chart', 'Bar chart', 'Line chart']), correctAnswer: 'Histogram', explanation: 'Histograms show the frequency distribution of continuous data by dividing data into bins.', competency: 'Data Visualization', difficulty: 'Easy' },
    { questionText: 'What is a Type I error in hypothesis testing?', options: JSON.stringify(['Rejecting a true null hypothesis', 'Accepting a false null hypothesis', 'Collecting insufficient data', 'Using the wrong test statistic']), correctAnswer: 'Rejecting a true null hypothesis', explanation: 'A Type I error occurs when we reject the null hypothesis even though it is actually true (false positive).', competency: 'Data Quality Frameworks', difficulty: 'Medium' },
    { questionText: 'What is the key principle of data privacy by design?', options: JSON.stringify(['Embedding privacy into system design from the start', 'Adding encryption after deployment', 'Restricting all data access to administrators only', 'Deleting all data after one year']), correctAnswer: 'Embedding privacy into system design from the start', explanation: 'Privacy by design means integrating data protection into the development lifecycle from the earliest design stage.', competency: 'Data Privacy', difficulty: 'Medium' },
    { questionText: 'What does GDP measure?', options: JSON.stringify(['The total monetary value of all finished goods and services produced within a country', 'The total population of a country', 'The total trade volume of a country', 'The total government expenditure only']), correctAnswer: 'The total monetary value of all finished goods and services produced within a country', explanation: 'GDP is the total monetary value of all finished goods and services produced within a country\'s borders in a specific period.', competency: 'National Accounts', difficulty: 'Easy' },
    { questionText: 'Which machine learning algorithm is used for classification tasks?', options: JSON.stringify(['Random Forest', 'K-Means Clustering', 'Principal Component Analysis', 'Linear Regression']), correctAnswer: 'Random Forest', explanation: 'Random Forest is an ensemble learning method commonly used for classification (and regression) tasks.', competency: 'AI/ML', difficulty: 'Medium' },
    { questionText: 'What is the Data Quality Framework based on?', options: JSON.stringify(['Relevance, accuracy, timeliness, accessibility, coherence, and interpretability', 'Only data accuracy and completeness', 'Budget and resource availability', 'Number of data collection points']), correctAnswer: 'Relevance, accuracy, timeliness, accessibility, coherence, and interpretability', explanation: 'The Data Quality Framework assesses data across multiple dimensions including relevance, accuracy, timeliness, accessibility, coherence, and interpretability.', competency: 'Data Quality Frameworks', difficulty: 'Medium' },
    { questionText: 'What is the Labour Force Participation Rate (LFPR)?', options: JSON.stringify(['Percentage of working-age population that is either employed or seeking employment', 'Total number of employed persons in a country', 'Ratio of unemployed to total population', 'Number of jobs created in a year']), correctAnswer: 'Percentage of working-age population that is either employed or seeking employment', explanation: 'LFPR measures the proportion of working-age population that is part of the labour force.', competency: 'Labour Statistics', difficulty: 'Medium' },
    { questionText: 'Which command in R creates a scatter plot?', options: JSON.stringify(['plot(x, y)', 'table(x, y)', 'summary(x, y)', 'merge(x, y)']), correctAnswer: 'plot(x, y)', explanation: 'The plot() function in R is used to create scatter plots and other basic visualizations.', competency: 'R', difficulty: 'Easy' },
    { questionText: 'What is multistage sampling?', options: JSON.stringify(['Sampling done in multiple stages with units selected at each stage', 'Sampling only the first 100 units', 'Using multiple questionnaires in one survey', 'Repeating the same survey multiple times']), correctAnswer: 'Sampling done in multiple stages with units selected at each stage', explanation: 'Multistage sampling involves selecting samples in multiple stages, narrowing down from larger to smaller units.', competency: 'Sampling', difficulty: 'Hard' },
    { questionText: 'What is the purpose of a foreign key in a database?', options: JSON.stringify(['To link two tables by referencing the primary key of another table', 'To encrypt data in a table', 'To create an index for faster queries', 'To delete duplicate entries']), correctAnswer: 'To link two tables by referencing the primary key of another table', explanation: 'A foreign key establishes a link between data in two tables by referencing the primary key of the related table.', competency: 'SQL', difficulty: 'Medium' },
    { questionText: 'What does the pandas method .groupby() do?', options: JSON.stringify(['Groups data by specified columns and applies aggregate functions', 'Sorts data in ascending order', 'Removes null values from the dataset', 'Exports data to a file']), correctAnswer: 'Groups data by specified columns and applies aggregate functions', explanation: 'groupby() splits data into groups based on column values, allowing aggregate operations like sum, mean, count.', competency: 'Python', difficulty: 'Medium' },
    { questionText: 'Which SDG goal focuses on reducing inequalities?', options: JSON.stringify(['SDG 10', 'SDG 1', 'SDG 5', 'SDG 8']), correctAnswer: 'SDG 10', explanation: 'SDG 10 aims to reduce inequality within and among countries.', competency: 'SDG Indicators', difficulty: 'Easy' },
    { questionText: 'What is phishing in cybersecurity?', options: JSON.stringify(['A fraudulent attempt to obtain sensitive information by disguising as a trustworthy entity', 'A method to encrypt data securely', 'A firewall configuration technique', 'A way to backup databases']), correctAnswer: 'A fraudulent attempt to obtain sensitive information by disguising as a trustworthy entity', explanation: 'Phishing is a social engineering attack where attackers impersonate trusted entities to steal credentials or data.', competency: 'Cybersecurity', difficulty: 'Easy' },
    { questionText: 'What is the Index of Industrial Production (IIP)?', options: JSON.stringify(['An indicator that measures changes in the volume of industrial production', 'A stock market index for industrial companies', 'A measure of agricultural output', 'A ranking of industrial countries']), correctAnswer: 'An indicator that measures changes in the volume of industrial production', explanation: 'IIP is a composite indicator measuring changes in the volume of production of a basket of industrial products.', competency: 'Industrial Statistics', difficulty: 'Medium' },
    // Leadership
    { questionText: 'What is a key characteristic of transformational leadership?', options: JSON.stringify(['Inspiring and motivating employees to innovate and create change', 'Micromanaging daily tasks', 'Focusing solely on rewards and punishments', 'Avoiding decision making']), correctAnswer: 'Inspiring and motivating employees to innovate and create change', explanation: 'Transformational leaders inspire and motivate their workforce without micromanaging — they trust trained employees to take authority over decisions in their assigned jobs.', competency: 'Leadership', difficulty: 'Medium' },
    { questionText: 'Which leadership style involves team members in the decision-making process?', options: JSON.stringify(['Democratic/Participative', 'Autocratic', 'Laissez-faire', 'Transactional']), correctAnswer: 'Democratic/Participative', explanation: 'Democratic leadership, also known as participative leadership, involves team members in the decision-making process, fostering collaboration.', competency: 'Leadership', difficulty: 'Easy' },
    { questionText: 'How does effective leadership impact organizational culture?', options: JSON.stringify(['It sets the tone and values that guide employee behavior', 'It has no impact on culture', 'It only affects upper management', 'It creates a culture of fear']), correctAnswer: 'It sets the tone and values that guide employee behavior', explanation: 'Leaders shape organizational culture through their actions, values, and the behaviors they reward or discourage.', competency: 'Leadership', difficulty: 'Medium' },
    // Communication
    { questionText: 'What is active listening in professional communication?', options: JSON.stringify(['Fully concentrating, understanding, responding, and remembering what is being said', 'Interrupting to share your opinion', 'Listening only to the words without noticing non-verbal cues', 'Preparing your response while the other person is speaking']), correctAnswer: 'Fully concentrating, understanding, responding, and remembering what is being said', explanation: 'Active listening is a communication technique that requires the listener to fully concentrate, understand, respond, and then remember what is being said.', competency: 'Communication', difficulty: 'Medium' },
    { questionText: 'Which of the following is considered a barrier to effective communication?', options: JSON.stringify(['Use of jargon and complex terminology', 'Clear and concise language', 'Open body language', 'Two-way feedback']), correctAnswer: 'Use of jargon and complex terminology', explanation: 'Using jargon or overly complex terminology can confuse the receiver and create a barrier to understanding.', competency: 'Communication', difficulty: 'Easy' },
    { questionText: 'In written official communication, what is the most important principle?', options: JSON.stringify(['Clarity and conciseness', 'Using as many complex words as possible', 'Writing lengthy paragraphs', 'Avoiding a clear subject line']), correctAnswer: 'Clarity and conciseness', explanation: 'Official communication should be clear, concise, and easy to understand to avoid misinterpretation and save time.', competency: 'Communication', difficulty: 'Easy' },
    // Ethics
    { questionText: 'In official statistics, what does the principle of confidentiality mean?', options: JSON.stringify(['Individual data collected must be strictly confidential and used exclusively for statistical purposes', 'Data should be shared with anyone who requests it', 'Data is confidential only if the respondent asks for it', 'Personal data can be sold to third parties']), correctAnswer: 'Individual data collected must be strictly confidential and used exclusively for statistical purposes', explanation: 'Statistical confidentiality ensures that individual data is protected and used solely for statistical aggregation.', competency: 'Ethics', difficulty: 'Medium' },
    { questionText: 'What is a conflict of interest in public service?', options: JSON.stringify(['When an individual\'s personal interests could compromise their professional judgment', 'Working on multiple projects simultaneously', 'Disagreeing with a colleague\'s opinion', 'Asking for a promotion']), correctAnswer: 'When an individual\'s personal interests could compromise their professional judgment', explanation: 'A conflict of interest occurs when personal interests could improperly influence the performance of official duties.', competency: 'Ethics', difficulty: 'Medium' },
    { questionText: 'Why is integrity crucial for a statistical officer?', options: JSON.stringify(['It ensures public trust in official statistics', 'It makes the job easier', 'It reduces the need for data collection', 'It allows for faster data publication']), correctAnswer: 'It ensures public trust in official statistics', explanation: 'Integrity ensures that data is collected and reported honestly, which is essential for maintaining public trust in official statistics.', competency: 'Ethics', difficulty: 'Medium' },
    // Project Management
    { questionText: 'In project management, what is the \'critical path\'?', options: JSON.stringify(['The sequence of stages determining the minimum time needed for an operation', 'The most expensive part of a project', 'The path that has the most risks', 'The final phase of the project']), correctAnswer: 'The sequence of stages determining the minimum time needed for an operation', explanation: 'The critical path is the longest sequence of tasks that must be completed on time for the project to finish on schedule.', competency: 'Project Management', difficulty: 'Hard' },
    { questionText: 'What is the primary purpose of a Gantt chart?', options: JSON.stringify(['To illustrate a project schedule and show dependencies between tasks', 'To calculate the project budget', 'To list all team members', 'To write the final project report']), correctAnswer: 'To illustrate a project schedule and show dependencies between tasks', explanation: 'A Gantt chart is a visual view of tasks scheduled over time, commonly used to track project schedules.', competency: 'Project Management', difficulty: 'Easy' },
    { questionText: 'What does scope creep refer to in project management?', options: JSON.stringify(['Continuous or uncontrolled growth in a project\'s scope after the project begins', 'A team member leaving the project', 'A project finishing ahead of schedule', 'Under-utilizing the project budget']), correctAnswer: 'Continuous or uncontrolled growth in a project\'s scope after the project begins', explanation: 'Scope creep happens when new features or requirements are added without adjusting time, budget, or resources.', competency: 'Project Management', difficulty: 'Medium' },
    // Decision Making
    { questionText: 'What is data-driven decision making?', options: JSON.stringify(['Basing decisions on empirical data and analysis rather than intuition alone', 'Guessing the best outcome', 'Making decisions based on what others are doing', 'Flipping a coin']), correctAnswer: 'Basing decisions on empirical data and analysis rather than intuition alone', explanation: 'Data-driven decision making involves collecting data based on measurable goals, analyzing it, and using the insights to make decisions.', competency: 'Decision Making', difficulty: 'Easy' },
    { questionText: 'In decision making, what is \'confirmation bias\'?', options: JSON.stringify(['The tendency to search for and interpret information in a way that confirms one\'s preexisting beliefs', 'Making a decision quickly', 'Relying entirely on a single piece of data', 'The ability to see all sides of an issue']), correctAnswer: 'The tendency to search for and interpret information in a way that confirms one\'s preexisting beliefs', explanation: 'Confirmation bias is a cognitive bias that favors information that confirms your previously existing beliefs or biases.', competency: 'Decision Making', difficulty: 'Medium' },
    { questionText: 'What is the first step in a rational decision-making process?', options: JSON.stringify(['Define the problem', 'Evaluate alternatives', 'Make the decision', 'Implement the solution']), correctAnswer: 'Define the problem', explanation: 'The first and most crucial step in rational decision-making is accurately defining the problem that needs to be solved.', competency: 'Decision Making', difficulty: 'Easy' },
    // Change Management
    { questionText: 'What is the primary goal of change management?', options: JSON.stringify(['To support employees through organizational transitions to achieve desired outcomes', 'To fire employees who resist change', 'To implement new technology without training', 'To keep everything exactly the same']), correctAnswer: 'To support employees through organizational transitions to achieve desired outcomes', explanation: 'Change management focuses on the people side of change, ensuring employees are supported during transitions.', competency: 'Change Management', difficulty: 'Medium' },
    { questionText: 'According to Kotter\'s 8-Step Change Model, what is the first step?', options: JSON.stringify(['Create a sense of urgency', 'Generate short-term wins', 'Anchor the changes in corporate culture', 'Form a guiding coalition']), correctAnswer: 'Create a sense of urgency', explanation: 'Kotter\'s model starts with creating a sense of urgency to motivate people to embrace the need for change.', competency: 'Change Management', difficulty: 'Hard' },
    { questionText: 'How should resistance to change be handled in an organization?', options: JSON.stringify(['By communicating openly, understanding concerns, and involving employees', 'By ignoring it', 'By punishing those who resist', 'By stopping the change initiative entirely']), correctAnswer: 'By communicating openly, understanding concerns, and involving employees', explanation: 'Resistance is natural; it should be managed through open communication, empathy, and employee involvement.', competency: 'Change Management', difficulty: 'Medium' },
    // GIS
    { questionText: 'What does GIS stand for?', options: JSON.stringify(['Geographic Information System', 'Global Internet Security', 'Graphical Interface Standards', 'Geospatial Intelligence Software']), correctAnswer: 'Geographic Information System', explanation: 'GIS stands for Geographic Information System, a framework for gathering, managing, and analyzing spatial data.', competency: 'GIS', difficulty: 'Easy' },
    { questionText: 'Which type of data represents geographic features as points, lines, and polygons?', options: JSON.stringify(['Vector data', 'Raster data', 'Tabular data', 'Metadata']), correctAnswer: 'Vector data', explanation: 'Vector data uses discrete geometries (points, lines, polygons) to represent real-world features.', competency: 'GIS', difficulty: 'Medium' },
    { questionText: 'How is GIS useful in official statistics?', options: JSON.stringify(['For spatial analysis, mapping demographic data, and identifying geographic patterns', 'Only for making pretty maps', 'It is not useful for statistics', 'For writing statistical reports']), correctAnswer: 'For spatial analysis, mapping demographic data, and identifying geographic patterns', explanation: 'GIS allows statisticians to visualize and analyze data spatially, revealing patterns that might not be visible in tabular data.', competency: 'GIS', difficulty: 'Medium' },
    // Cybersecurity
    { questionText: 'What is the principle of least privilege?', options: JSON.stringify(['Users should only have the minimum access rights necessary to perform their job functions', 'Everyone should have admin access', 'Passwords should be short', 'Security is not important']), correctAnswer: 'Users should only have the minimum access rights necessary to perform their job functions', explanation: 'The principle of least privilege limits access rights for users to the bare minimum permissions they need to perform their work.', competency: 'Cybersecurity', difficulty: 'Medium' },
    { questionText: 'What is the purpose of multi-factor authentication (MFA)?', options: JSON.stringify(['To add an extra layer of security by requiring two or more verification methods', 'To make logging in faster', 'To replace passwords entirely', 'To share passwords securely']), correctAnswer: 'To add an extra layer of security by requiring two or more verification methods', explanation: 'MFA enhances security by requiring users to provide two or more verification factors to gain access to a resource.', competency: 'Cybersecurity', difficulty: 'Easy' },
    { questionText: 'What is a DDoS attack?', options: JSON.stringify(['An attempt to disrupt normal traffic of a targeted server by overwhelming it with a flood of Internet traffic', 'A type of phishing email', 'A physical attack on a server room', 'Stealing a user\'s password']), correctAnswer: 'An attempt to disrupt normal traffic of a targeted server by overwhelming it with a flood of Internet traffic', explanation: 'A Distributed Denial of Service (DDoS) attack overwhelms a target system with a flood of traffic from multiple sources.', competency: 'Cybersecurity', difficulty: 'Medium' },
    // Labour Statistics
    { questionText: 'What defines an \'unemployed\' person according to ILO standards?', options: JSON.stringify(['Without work, currently available for work, and seeking work', 'Anyone who does not have a job', 'A person who is retired', 'A student attending school full-time']), correctAnswer: 'Without work, currently available for work, and seeking work', explanation: 'The ILO defines unemployment based on three criteria: being without work, being available for work, and actively seeking work.', competency: 'Labour Statistics', difficulty: 'Medium' },
    { questionText: 'What is the Working Age Population typically defined as in international contexts?', options: JSON.stringify(['Persons aged 15 years and above', 'Persons aged 18 to 60', 'Everyone alive in the country', 'Persons who have graduated from college']), correctAnswer: 'Persons aged 15 years and above', explanation: 'Internationally, the working-age population is generally defined as those aged 15 years and older.', competency: 'Labour Statistics', difficulty: 'Medium' },
    { questionText: 'What is the Worker Population Ratio (WPR)?', options: JSON.stringify(['The percentage of employed persons in the total population', 'The ratio of managers to workers', 'The percentage of unemployed persons', 'The ratio of male to female workers']), correctAnswer: 'The percentage of employed persons in the total population', explanation: 'WPR is defined as the number of employed persons per 1000 persons (or as a percentage) in the population.', competency: 'Labour Statistics', difficulty: 'Medium' },
    // Agricultural Statistics
    { questionText: 'In India, what is the primary method used for crop yield estimation?', options: JSON.stringify(['Crop Cutting Experiments (CCE)', 'Satellite imagery only', 'Farmer interviews exclusively', 'Wholesale market arrivals']), correctAnswer: 'Crop Cutting Experiments (CCE)', explanation: 'Crop Cutting Experiments (CCE) are the standard objective method used to estimate the yield of major crops in India.', competency: 'Agricultural Statistics', difficulty: 'Medium' },
    { questionText: 'Which agricultural census collects data on operational holdings in India?', options: JSON.stringify(['The Agriculture Census', 'The Population Census', 'The Economic Census', 'The Livestock Census']), correctAnswer: 'The Agriculture Census', explanation: 'The Agriculture Census in India collects comprehensive data on the structure of agricultural operational holdings.', competency: 'Agricultural Statistics', difficulty: 'Easy' },
    { questionText: 'What does \'Gross Cropped Area\' mean?', options: JSON.stringify(['The total area sown once and/or more than once in a particular year', 'The physical extent of land on which crops are sown', 'Only the area under irrigation', 'The area used for non-agricultural purposes']), correctAnswer: 'The total area sown once and/or more than once in a particular year', explanation: 'Gross Cropped Area includes the total area sown across all seasons in a year, counting double-cropped areas multiple times.', competency: 'Agricultural Statistics', difficulty: 'Medium' },
  ];

  await prisma.diagnosticQuestion.deleteMany();
  for (const q of diagnosticQuestions) {
    await prisma.diagnosticQuestion.create({ data: q });
  }
  console.log(`✅ ${diagnosticQuestions.length} diagnostic questions seeded`);

  // ── 7. SAMPLE QUIZZES ─────────────────────────────────────────────────
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });

  if (adminUser) {
    const material1 = await prisma.material.create({
      data: {
        uploadedById: adminUser.id,
        title: 'Introduction to Sampling Methods',
        fileName: 'sampling_methods.pdf',
        contentType: 'pdf',
        content: 'Sampling is the process of selecting a subset of individuals from a statistical population. Types include simple random sampling, stratified sampling, cluster sampling, and systematic sampling. Stratified sampling divides the population into homogeneous subgroups called strata. Cluster sampling divides the population into clusters and randomly selects entire clusters. Multistage sampling combines multiple sampling methods across stages.',
      },
    });

    const quiz1 = await prisma.quiz.create({
      data: {
        materialId: material1.id,
        createdById: adminUser.id,
        title: 'Sampling Methods Quiz',
        competency: 'Sampling',
        difficulty: 'Medium',
        published: true,
        questions: {
          create: [
            {
              questionText: 'Which sampling method divides the population into homogeneous subgroups?',
              options: JSON.stringify(['Stratified sampling', 'Cluster sampling', 'Simple random sampling', 'Convenience sampling']),
              correctAnswer: 'Stratified sampling',
              explanation: 'Stratified sampling divides the population into homogeneous strata and samples from each.',
              difficulty: 'Medium',
              competency: 'Sampling',
              bloomsLevel: 'Remember',
            },
            {
              questionText: 'In cluster sampling, what is selected?',
              options: JSON.stringify(['Entire clusters of units', 'Individual units only', 'The first N units', 'Units based on judgment']),
              correctAnswer: 'Entire clusters of units',
              explanation: 'Cluster sampling selects entire clusters (groups) rather than individual units.',
              difficulty: 'Medium',
              competency: 'Sampling',
              bloomsLevel: 'Understand',
            },
          ],
        },
      },
    });

    const material2 = await prisma.material.create({
      data: {
        uploadedById: adminUser.id,
        title: 'Python for Data Science Basics',
        fileName: 'python_basics.pdf',
        contentType: 'pdf',
        content: 'Python is a high-level programming language widely used in data science. Key libraries include pandas for data manipulation, NumPy for numerical computing, matplotlib for visualization, and scikit-learn for machine learning. DataFrames are the primary data structure in pandas for handling tabular data.',
      },
    });

    await prisma.quiz.create({
      data: {
        materialId: material2.id,
        createdById: adminUser.id,
        title: 'Python Data Science Basics Quiz',
        competency: 'Python',
        difficulty: 'Easy',
        published: true,
        questions: {
          create: [
            {
              questionText: 'Which library is used for data manipulation in Python?',
              options: JSON.stringify(['pandas', 'flask', 'django', 'requests']),
              correctAnswer: 'pandas',
              explanation: 'pandas is the standard library for data manipulation and analysis in Python.',
              difficulty: 'Easy',
              competency: 'Python',
              bloomsLevel: 'Remember',
            },
            {
              questionText: 'What is the primary data structure in pandas for tabular data?',
              options: JSON.stringify(['DataFrame', 'Array', 'List', 'Dictionary']),
              correctAnswer: 'DataFrame',
              explanation: 'DataFrame is a 2-dimensional labeled data structure with columns that can hold different types.',
              difficulty: 'Easy',
              competency: 'Python',
              bloomsLevel: 'Remember',
            },
          ],
        },
      },
    });

    console.log('✅ 2 sample materials and quizzes seeded');
  }

  console.log('\n🎉 Database seeding complete!');
  console.log('\n📋 Test Accounts:');
  console.log('  learner@test.com / password123');
  console.log('  admin@test.com / password123');
  console.log('  superadmin@test.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
