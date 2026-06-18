import { Student } from './types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-1',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@datascience.edu',
    roleId: 'STU-2026-104',
    phoneNumber: '9876543104',
    batch: 'Advanced AI & Data Science - Batch A',
    avatarStyle: 'from-cyan-500 to-blue-600',
    topics: {
      python: 92,
      pandas: 88,
      numpy: 95,
      machineLearning: 90,
      dl: 86,
      nlp: 82,
      genai: 94,
    },
    weeklyReports: [
      { weekNumber: 1, attendanceRate: 100, quizScore: 85, hoursSpent: 12, submissionRate: 100, status: 'excellent' },
      { weekNumber: 2, attendanceRate: 100, quizScore: 90, hoursSpent: 15, submissionRate: 100, status: 'excellent' },
      { weekNumber: 3, attendanceRate: 90, quizScore: 88, hoursSpent: 11, submissionRate: 100, status: 'good' },
      { weekNumber: 4, attendanceRate: 100, quizScore: 95, hoursSpent: 18, submissionRate: 100, status: 'excellent' },
      { weekNumber: 5, attendanceRate: 95, quizScore: 92, hoursSpent: 14, submissionRate: 90, status: 'excellent' },
      { weekNumber: 6, attendanceRate: 100, quizScore: 94, hoursSpent: 16, submissionRate: 100, status: 'excellent' },
    ],
    monthlyReports: [
      {
        month: 'Month 1 (Fundamentals)',
        avgScore: 89.5,
        completedProjects: 3,
        overallProgress: 95,
        feedback: 'Arjun shows an exceptional command of data manipulation principles. His NumPy optimization was the best in class. Keep pushing!',
      },
      {
        month: 'Month 2 (Modern ML & AI)',
        avgScore: 91.2,
        completedProjects: 4,
        overallProgress: 100,
        feedback: 'Excellent work in the Deep Learning module. His final Generative AI project demonstrated impressive creativity and clean documentation.',
      },
    ],
    enrollmentDate: '2026-03-01',
    status: 'active',
  },
  {
    id: 'student-2',
    name: 'Sarah Connor',
    email: 's.connor@cybernet.net',
    roleId: 'STU-2026-118',
    phoneNumber: '9876543118',
    batch: 'Advanced AI & Data Science - Batch A',
    avatarStyle: 'from-amber-500 to-rose-600',
    topics: {
      python: 85,
      pandas: 82,
      numpy: 80,
      machineLearning: 94,
      dl: 98,
      nlp: 95,
      genai: 91,
    },
    weeklyReports: [
      { weekNumber: 1, attendanceRate: 100, quizScore: 80, hoursSpent: 14, submissionRate: 100, status: 'good' },
      { weekNumber: 2, attendanceRate: 100, quizScore: 82, hoursSpent: 16, submissionRate: 100, status: 'good' },
      { weekNumber: 3, attendanceRate: 95, quizScore: 85, hoursSpent: 15, submissionRate: 100, status: 'good' },
      { weekNumber: 4, attendanceRate: 100, quizScore: 92, hoursSpent: 18, submissionRate: 100, status: 'excellent' },
      { weekNumber: 5, attendanceRate: 100, quizScore: 96, hoursSpent: 21, submissionRate: 100, status: 'excellent' },
      { weekNumber: 6, attendanceRate: 100, quizScore: 98, hoursSpent: 22, submissionRate: 100, status: 'excellent' },
    ],
    monthlyReports: [
      {
        month: 'Month 1 (Fundamentals)',
        avgScore: 82.3,
        completedProjects: 2,
        overallProgress: 88,
        feedback: 'Sarah has a solid coding foundation, though she tended to spend excess time on edge cases during foundational modules.',
      },
      {
        month: 'Month 2 (Modern ML & AI)',
        avgScore: 95.8,
        completedProjects: 5,
        overallProgress: 98,
        feedback: 'Phenomenal success in the Neural Networks topics. Sarah has an intuitive understanding of backpropagation and language tokenizers.',
      },
    ],
    enrollmentDate: '2026-03-01',
    status: 'active',
  },
  {
    id: 'student-3',
    name: 'Kenji Tanaka',
    email: 'kenji.tanaka@tokyodata.org',
    roleId: 'STU-2026-211',
    phoneNumber: '9876543211',
    batch: 'Practical Data Science - Batch B',
    avatarStyle: 'from-emerald-500 to-teal-600',
    topics: {
      python: 95,
      pandas: 90,
      numpy: 88,
      machineLearning: 78,
      dl: 72,
      nlp: 75,
      genai: 80,
    },
    weeklyReports: [
      { weekNumber: 1, attendanceRate: 100, quizScore: 96, hoursSpent: 10, submissionRate: 100, status: 'excellent' },
      { weekNumber: 2, attendanceRate: 100, quizScore: 94, hoursSpent: 11, submissionRate: 100, status: 'excellent' },
      { weekNumber: 3, attendanceRate: 100, quizScore: 90, hoursSpent: 12, submissionRate: 100, status: 'excellent' },
      { weekNumber: 4, attendanceRate: 90, quizScore: 80, hoursSpent: 8, submissionRate: 90, status: 'good' },
      { weekNumber: 5, attendanceRate: 95, quizScore: 75, hoursSpent: 9, submissionRate: 100, status: 'average' },
      { weekNumber: 6, attendanceRate: 90, quizScore: 78, hoursSpent: 10, submissionRate: 100, status: 'average' },
    ],
    monthlyReports: [
      {
        month: 'Month 1 (Fundamentals)',
        avgScore: 92.5,
        completedProjects: 3,
        overallProgress: 96,
        feedback: 'Kenji has pristine core Python syntax. His arrays are highly optimized using native list comprehensions. An absolute star in fundamentals.',
      },
      {
        month: 'Month 2 (Modern ML & AI)',
        avgScore: 77.0,
        completedProjects: 2,
        overallProgress: 75,
        feedback: 'As we moved to predictive ML algorithms, Kenji struggled slightly with the core mathematical formulas. Suggest focusing review sessions on gradient descent.',
      },
    ],
    enrollmentDate: '2026-03-15',
    status: 'active',
  },
  {
    id: 'student-4',
    name: 'Emily Rodriguez',
    email: 'emily.rod@analyticslab.com',
    roleId: 'STU-2026-085',
    phoneNumber: '9876543085',
    batch: 'Advanced AI & Data Science - Batch A',
    avatarStyle: 'from-indigo-500 to-purple-600',
    topics: {
      python: 80,
      pandas: 95,
      numpy: 92,
      machineLearning: 84,
      dl: 70,
      nlp: 78,
      genai: 86,
    },
    weeklyReports: [
      { weekNumber: 1, attendanceRate: 90, quizScore: 82, hoursSpent: 9, submissionRate: 100, status: 'good' },
      { weekNumber: 2, attendanceRate: 100, quizScore: 92, hoursSpent: 13, submissionRate: 100, status: 'excellent' },
      { weekNumber: 3, attendanceRate: 100, quizScore: 95, hoursSpent: 14, submissionRate: 100, status: 'excellent' },
      { weekNumber: 4, attendanceRate: 95, quizScore: 86, hoursSpent: 11, submissionRate: 100, status: 'good' },
      { weekNumber: 5, attendanceRate: 80, quizScore: 74, hoursSpent: 8, submissionRate: 80, status: 'average' },
      { weekNumber: 6, attendanceRate: 90, quizScore: 82, hoursSpent: 12, submissionRate: 100, status: 'good' },
    ],
    monthlyReports: [
      {
        month: 'Month 1 (Fundamentals)',
        avgScore: 89.8,
        completedProjects: 3,
        overallProgress: 94,
        feedback: 'Emily is an absolute data maven. Her Pandas exploration projects displayed excellent visualization insights and feature transformations.',
      },
      {
        month: 'Month 2 (Modern ML & AI)',
        avgScore: 79.2,
        completedProjects: 2,
        overallProgress: 82,
        feedback: 'Strong performance on general Scikit-Learn structures. Her Deep Learning performance decreased due to missing some of the neural network tutorials.',
      },
    ],
    enrollmentDate: '2026-03-01',
    status: 'on-leave',
  },
  {
    id: 'student-5',
    name: 'David Chen',
    email: 'david.chen@stud.ai',
    roleId: 'STU-2026-159',
    phoneNumber: '9876543159',
    batch: 'Practical Data Science - Batch B',
    avatarStyle: 'from-orange-500 to-red-600',
    topics: {
      python: 75,
      pandas: 78,
      numpy: 74,
      machineLearning: 82,
      dl: 85,
      nlp: 88,
      genai: 92,
    },
    weeklyReports: [
      { weekNumber: 1, attendanceRate: 80, quizScore: 68, hoursSpent: 6, submissionRate: 90, status: 'average' },
      { weekNumber: 2, attendanceRate: 90, quizScore: 72, hoursSpent: 8, submissionRate: 100, status: 'average' },
      { weekNumber: 3, attendanceRate: 95, quizScore: 78, hoursSpent: 10, submissionRate: 100, status: 'good' },
      { weekNumber: 4, attendanceRate: 100, quizScore: 84, hoursSpent: 12, submissionRate: 100, status: 'good' },
      { weekNumber: 5, attendanceRate: 100, quizScore: 90, hoursSpent: 15, submissionRate: 100, status: 'excellent' },
      { weekNumber: 6, attendanceRate: 100, quizScore: 92, hoursSpent: 16, submissionRate: 100, status: 'excellent' },
    ],
    monthlyReports: [
      {
        month: 'Month 1 (Fundamentals)',
        avgScore: 72.7,
        completedProjects: 2,
        overallProgress: 78,
        feedback: 'David took some time to get up to speed with development settings and syntax, but is displaying a rapid and steady improvement curve.',
      },
      {
        month: 'Month 2 (Modern ML & AI)',
        avgScore: 86.5,
        completedProjects: 4,
        overallProgress: 94,
        feedback: 'Immerse rate of acceleration. His generative AI Prompt engineering assignment was particularly insightful. A highly dedicated and hard worker.',
      },
    ],
    enrollmentDate: '2026-03-10',
    status: 'active',
  },
  {
    id: 'student-6',
    name: 'Kenji Sato',
    email: 'k.sato@ai-reseacher.jp',
    roleId: 'STU-2026-901',
    phoneNumber: '9876543901',
    batch: 'Advanced AI & Data Science - Batch A',
    avatarStyle: 'from-violet-500 to-fuchsia-600',
    topics: {
      python: 80,
      pandas: 75,
      numpy: 78,
      machineLearning: 65,
      dl: 60,
      nlp: 55,
      genai: 70,
    },
    weeklyReports: [],
    monthlyReports: [],
    enrollmentDate: '2026-06-15',
    status: 'active',
    isApproved: false,
    importedData: {
      gpa: '3.75',
      priorCodingHours: 180,
      primaryDomain: 'Machine Learning Research',
      experienceSummary: 'Enrolled in undergraduate computer science. Completed basic data manipulation courses and introductory statistics. Seeking to master deep neural architectures and join the 30-Day Python practice exams.',
      submittedAt: '2026-06-15T10:30:00Z',
      parsedRecordsCount: 15
    },
    dailyQuizScores: {}
  }
];

export const INITIAL_PRE_APPROVED_RECORDS = [
  {
    id: "pa-1",
    idNumber: "QID/26-27/2127",
    phoneNumber: "9012397261",
    name: "Bhargav Banothu",
    email: "Bhargavbittu33@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-2",
    idNumber: "QID/26-27/2115",
    phoneNumber: "8639733995",
    name: "Gunja Satyanarayana",
    email: "sathi.7969@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-3",
    idNumber: "QID/26-27/2107",
    phoneNumber: "6300387671",
    name: "Thammu Purna Sainadh",
    email: "purnasainadhthammu@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-4",
    idNumber: "QID/26-27/2106",
    phoneNumber: "9032884359",
    name: "Shaik Salma",
    email: "721shaiksalma@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-5",
    idNumber: "QID/26-27/2105",
    phoneNumber: "9502269704",
    name: "Kalluri Guru Mahendra",
    email: "kalluriudaykrishna@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-6",
    idNumber: "QID/26-27/2104",
    phoneNumber: "7013394012",
    name: "Vegolapu Saigeethanjali",
    email: "saigeethanjalivegolapu@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-7",
    idNumber: "QID/26-27/2103",
    phoneNumber: "9515027803",
    name: "Shaik Aziz Ahammad",
    email: "shaikazeez28969@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-8",
    idNumber: "QID/26-27/2102",
    phoneNumber: "8143882544",
    name: "Bhukya Pavan Nayak",
    email: "pavannayakbhukya001@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-9",
    idNumber: "QID/26-27/2095",
    phoneNumber: "9550090964",
    name: "Lalkota Hari Krishna",
    email: "harikrishnagoud567@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-10",
    idNumber: "QID/26-27/2065",
    phoneNumber: "9502114301",
    name: "Panchaparwala Mohitha",
    email: "mohithapanchaparwala@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-11",
    idNumber: "QID/26-27/2048",
    phoneNumber: "9912062170",
    name: "Yatham Lakshmi Narasimha",
    email: "lakshminarasimhayatham@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-12",
    idNumber: "QID/26-27/2037",
    phoneNumber: "6300933658",
    name: "Renati Devi Priyanka",
    email: "renatidevi1@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-13",
    idNumber: "QID/26-27/2026",
    phoneNumber: "8688807528",
    name: "Nalleru Veera Brahmam",
    email: "brahmamnalleru@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-14",
    idNumber: "QID/26-27/2003",
    phoneNumber: "9963073092",
    name: "Rajesh Kumar Kandakatla",
    email: "krk.main@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-15",
    idNumber: "QID/26-27/1999",
    phoneNumber: "7093165631",
    name: "BACHULA YASWANTH BABU",
    email: "batchulayaswanth2004@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-16",
    idNumber: "QID/26-27/1960",
    phoneNumber: "7050553648",
    name: "Naman Kumar",
    email: "namansanjaykumar@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-17",
    idNumber: "QID/26-27/1951",
    phoneNumber: "7671902739",
    name: "Omkar",
    email: "omkarkaleru908@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-18",
    idNumber: "QID/26-27/1947",
    phoneNumber: "7093204371",
    name: "Sanapathi Roopavathi",
    email: "sanapathimounika734@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-19",
    idNumber: "QID/26-27/1946",
    phoneNumber: "7569509701",
    name: "Devara Uma Maheswari",
    email: "devaraumamaheswari999@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-20",
    idNumber: "QID/26-27/1940",
    phoneNumber: "6304969181",
    name: "Seelam Malakonda",
    email: "malakondaseelam11@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-21",
    idNumber: "QID/26-27/1938",
    phoneNumber: "8260756784",
    name: "Arman Patro",
    email: "armanpatro04@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-22",
    idNumber: "QID/26-27/1934",
    phoneNumber: "7995197367",
    name: "Pappusetti Venkata Rajesh",
    email: "mrrajeshrebal@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-23",
    idNumber: "QID/26-27/1925",
    phoneNumber: "9573445080",
    name: "Chitte Mamatha",
    email: "mamathachitte43@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-24",
    idNumber: "QID/26-27/1924",
    phoneNumber: "6301765804",
    name: "LANDA SURYA KIRAN",
    email: "landasuryakiran@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-25",
    idNumber: "QID/26-27/1923",
    phoneNumber: "7601084064",
    name: "Sandyapogu Pavithra",
    email: "pavisandyapogu@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-26",
    idNumber: "QID/26-27/1920",
    phoneNumber: "7981281762",
    name: "Kadapa Tejaswini",
    email: "kadapatejaswini1@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-27",
    idNumber: "QID/26-27/1915",
    phoneNumber: "9951418928",
    name: "Mujahid Kandanuru",
    email: "mohammedmujahid208@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-28",
    idNumber: "QID/26-27/1914",
    phoneNumber: "8179727718",
    name: "Adiyarapu Murali",
    email: "adiyarapumurali@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-29",
    idNumber: "QID/26-27/1904",
    phoneNumber: "9493655595",
    name: "Praveen Kumar rayapudi",
    email: "praveensha3949@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-30",
    idNumber: "QID/26-27/1901",
    phoneNumber: "9866559848",
    name: "Kondapally Sheshkumar",
    email: "kskumar.kmm02@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-31",
    idNumber: "QID/26-27/1900",
    phoneNumber: "7780372988",
    name: "SHAIK MUSHARAF",
    email: "shaik.musharaf2004@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-32",
    idNumber: "QID/26-27/1894",
    phoneNumber: "9014392674",
    name: "Gadhegani Rajasri",
    email: "rajasrigadheganii@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-33",
    idNumber: "QID/26-27/1882",
    phoneNumber: "9666128661",
    name: "Phanindrababu Nallapu",
    email: "babu.nallapu@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-34",
    idNumber: "QID/26-27/1850",
    phoneNumber: "7022960289",
    name: "Neelima Ch",
    email: "neelimach850@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-35",
    idNumber: "QID/26-27/1845",
    phoneNumber: "9100822913",
    name: "Dasari Ramya",
    email: "ramyadasari923@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-36",
    idNumber: "QID/26-27/1844",
    phoneNumber: "7569481195",
    name: "N HARIPRIYA",
    email: "haripriyanatteti808@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-37",
    idNumber: "QID/26-27/1843",
    phoneNumber: "9963647909",
    name: "SHAIK MOHAMMAD SHAREEF",
    email: "shareefshaik01786@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-38",
    idNumber: "QID/26-27/1824",
    phoneNumber: "6363563725",
    name: "Liyakhat Ali",
    email: "ali.liyakhat03@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-39",
    idNumber: "QID/26-27/1823",
    phoneNumber: "9701465580",
    name: "Velluri Vamsi Krishna",
    email: "vellurivamsikrishna2004@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-40",
    idNumber: "QID/26-27/1805",
    phoneNumber: "9346171051",
    name: "Bojjagani Himabindu",
    email: "himab9745@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-41",
    idNumber: "QID/26-27/1799",
    phoneNumber: "4313749224",
    name: "Mujeeb",
    email: "mujeebrah2021@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-42",
    idNumber: "QID/26-27/1496",
    phoneNumber: "8688848946",
    name: "Beerla Aravind",
    email: "beerlaaravind18@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-43",
    idNumber: "QID/24-25/11153",
    phoneNumber: "8885570298",
    name: "Varsha Joshi",
    email: "varshajoshi84@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-44",
    idNumber: "QID/26-27/2130",
    phoneNumber: "9831405913",
    name: "Konala Vandan Kumar",
    email: "k1222004kumar@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-45",
    idNumber: "QID/26-27/2066",
    phoneNumber: "9014322517",
    name: "Batta Venu Gopala Krishna",
    email: "battakrishna4567@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-46",
    idNumber: "QID/26-27/1813",
    phoneNumber: "9573314028",
    name: "Bejawada Vamsi Krishna",
    email: "vamsibezawada89@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-47",
    idNumber: "QID/26-27/1807",
    phoneNumber: "9059515338",
    name: "Golukonda Kavya Sri",
    email: "golukondakavya@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-48",
    idNumber: "QID/26-27/1800",
    phoneNumber: "8367375670",
    name: "Swati",
    email: "swathibhaswani21@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-49",
    idNumber: "QID/26-27/1425",
    phoneNumber: "9000844406",
    name: "Elaboina Arjun",
    email: "arjunelaboina999@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-50",
    idNumber: "QID/24-25/11513",
    phoneNumber: "9494555969",
    name: "Paruchuri Sai Chand",
    email: "saichandmoonmoon@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-51",
    idNumber: "QID/24-25/11512",
    phoneNumber: "9704376583",
    name: "Geddada Sai Vinay",
    email: "gsaivinay1228@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-52",
    idNumber: "QID/26-27/2015",
    phoneNumber: "9381041292",
    name: "Appampally Ramya",
    email: "ramyaappampally@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-53",
    idNumber: "QID/26-27/2111",
    phoneNumber: "6304698584",
    name: "Valamala Navya",
    email: "valamalanavyavalamala@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-54",
    idNumber: "QID/26-27/2039",
    phoneNumber: "9110368969",
    name: "Kothuri Saiprasad",
    email: "kotisss1234@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-55",
    idNumber: "QID/26-27/2016",
    phoneNumber: "9391562836",
    name: "P Sathya Prakash",
    email: "Sathyaprakashtubati@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-56",
    idNumber: "QID/26-27/2007",
    phoneNumber: "9381842856",
    name: "Jerpati Pandu",
    email: "ppandujerpati@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-57",
    idNumber: "QID/26-27/1971",
    phoneNumber: "8767774104",
    name: "Hanuman Shankar Ghuge",
    email: "hanumanghuge37@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-58",
    idNumber: "QID/26-27/1876",
    phoneNumber: "8317513172",
    name: "BHUMANA SRINIVAS YADAV",
    email: "bhumanasrinivas05@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-59",
    idNumber: "QID/26-27/1822",
    phoneNumber: "7673956784",
    name: "Islavath Rajesh",
    email: "rajesh08011@gmail.com",
    notes: "Premium Intake Registrant"
  },
  {
    id: "pa-60",
    idNumber: "QID/24-25/9854",
    phoneNumber: "6305363601",
    name: "Racharla Poojitha",
    email: "racharlapoojitha@gmail.com",
    notes: "Premium Intake Registrant"
  }
];
