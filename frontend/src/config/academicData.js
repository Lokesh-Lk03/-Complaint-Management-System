// Shared academic data — departments, study levels, and courses
// Used across: ComplaintModal, AdminUserManagement

export const DEPARTMENTS = [
    {
        name: "Computational Engineering",
        UG: [
            "B.Tech Computer Science and Engineering",
            "B.Tech Information Technology",
            "B.Tech Artificial Intelligence and Data Science",
            "B.Tech CSE (Artificial Intelligence and Machine Learning)",
            "B.Tech CSE (Cyber Security)",
            "B.Tech AI and Data Science",
            "B.Tech CSE (Generative AI)"
        ],
        PG: [
            "M.Tech Computer Science and Engineering"
        ]
    },
    {
        name: "Core Engineering",
        UG: [
            "B.Tech Electronics and Communication Engineering",
            "B.Tech ECE (Internet of Things)",
            "B.Tech Electronics Engineering (VLSI Design)",
            "B.Tech Electronics (Autonomous Systems and Robotics)"
        ],
        PG: [
            "M.Tech IoT and Sensor Systems"
        ]
    },
    {
        name: "Management Studies",
        UG: [
            "BBA",
            "BBA (Sports Management)",
            "BBA (FinTech)"
        ],
        PG: [
            "MBA",
            "MBA (Logistics and Supply Chain Management)",
            "MBA (Hospital Management)",
            "MBA (FinTech)"
        ]
    },
    {
        name: "Commerce",
        UG: [
            "B.Com",
            "B.Com (Corporate Secretaryship)",
            "B.Com (Computer Applications)",
            "B.Com (CMA)",
            "B.Com (Accounting and Finance)",
            "B.Com (FinTech with AI)"
        ],
        PG: [
            "M.Com"
        ]
    },
    {
        name: "Computer Science",
        UG: [
            "BCA (Full Stack Development)",
            "B.Sc Computer Science (AI and Data Science)",
            "B.Sc Computer Science (Cyber Security and Digital Forensics)",
            "B.Sc Computer Science (AI and Machine Learning)"
        ],
        PG: [
            "MCA (Data Science)",
            "M.Sc Computer Science (AI and Data Science)"
        ]
    },
    {
        name: "Basic Sciences",
        UG: [
            "B.Sc Mathematics",
            "B.Sc Physics",
            "B.Sc Astrophysics",
            "B.Sc Chemistry",
            "B.Sc Microbiology",
            "B.Sc Biotechnology"
        ],
        PG: [
            "M.Sc Mathematics",
            "M.Sc Physics",
            "M.Sc Chemistry",
            "M.Sc Microbiology",
            "M.Sc Biotechnology",
            "Master of Statistics"
        ]
    },
    {
        name: "Social Sciences",
        UG: [
            "B.A. Economics",
            "B.A. Defence and Strategic Studies",
            "B.A. Indian Philosophy and Tourism",
            "B.A. International Relations and Public Policy",
            "Bachelor of Social Work"
        ],
        PG: [
            "M.A. Economics",
            "M.A. Defence and Strategic Studies",
            "Master of Social Work"
        ]
    },
    {
        name: "Humanities",
        UG: [
            "B.A. Tamil",
            "B.A. English",
            "Bachelor of Fine Arts",
            "Bachelor of Performing Arts",
            "Bachelor of Library and Information Science"
        ],
        PG: [
            "M.A. Tamil",
            "M.A. English",
            "Master of Library and Information Science"
        ]
    },
    {
        name: "Agricultural Sciences",
        UG: [
            "B.Sc. (Hons.) Agriculture"
        ],
        PG: [
            "M.Sc. Agronomy",
            "M.Sc. Soil Science",
            "M.Sc. Agricultural Economics",
            "M.Sc. Plant Pathology",
            "M.Sc. Entomology"
        ]
    },
    {
        name: "Medicine",
        UG: [
            "MBBS"
        ],
        PG: [
            "M.Sc. Medical Biochemistry",
            "M.Sc. Medical Anatomy",
            "M.Sc. Medical Microbiology",
            "M.Sc. Medical Pharmacology",
            "M.Sc. Medical Physiology"
        ]
    },
    {
        name: "Nursing",
        UG: [
            "B.Sc. Nursing"
        ],
        PG: []
    },
    {
        name: "Physiotherapy",
        UG: [
            "Bachelor of Physiotherapy"
        ],
        PG: []
    },
    {
        name: "Pharmacy",
        UG: [
            "Bachelor of Pharmacy"
        ],
        PG: []
    }
];

export const STUDY_LEVELS = ["UG", "PG"];

/**
 * Get all courses for a given department name and study level.
 * @param {string} deptName - e.g. "Computational Engineering"
 * @param {string} level    - "UG" or "PG"
 * @returns {string[]}
 */
export function getCourses(deptName, level) {
    if (!deptName || !level) return [];
    const dept = DEPARTMENTS.find(d => d.name === deptName);
    if (!dept) return [];
    return dept[level] || [];
}
