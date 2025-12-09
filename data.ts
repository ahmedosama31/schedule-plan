import { Course, SectionType, DayOfWeek, Section } from './types';

// Helper to create sections easily
const createSection = (
  courseCode: string,
  type: SectionType,
  group: string,
  day: DayOfWeek,
  startH: number,
  startM: number,
  endH: number,
  endM: number
): Section => {
  const startDec = startH + startM / 60;
  const endDec = endH + endM / 60;
  const startStr = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`;
  const endStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

  return {
    id: `${courseCode}-${type.substring(0, 3)}-${group}-${day}-${startH}`,
    courseCode,
    type,
    group,
    sessions: [
      {
        day,
        startHour: startDec,
        endHour: endDec,
        startString: startStr,
        endString: endStr,
      },
    ],
  };
};

const rawData: Course[] = [
  // --- PDF 1: CS & Engineering ---
  {
    code: 'CCES280',
    name: 'Engineering Seminar',
    isMTHS: false,
    sections: [
      createSection('CCES280', SectionType.Lecture, '1', DayOfWeek.Sunday, 8, 0, 9, 0)
    ]
  },
  {
    code: 'CMPS101',
    name: 'Logic-1',
    isMTHS: false,
    sections: [
      createSection('CMPS101', SectionType.Lecture, '1', DayOfWeek.Monday, 8, 0, 10, 0),
      createSection('CMPS101', SectionType.Tutorial, '1', DayOfWeek.Monday, 13, 0, 16, 0),
      createSection('CMPS101', SectionType.Tutorial, '2', DayOfWeek.Monday, 16, 0, 19, 0),
    ]
  },
  {
    code: 'CMPS102',
    name: 'PT',
    isMTHS: false,
    sections: [
      createSection('CMPS102', SectionType.Lecture, '1', DayOfWeek.Wednesday, 14, 0, 16, 0),
      createSection('CMPS102', SectionType.Lecture, '2', DayOfWeek.Wednesday, 11, 0, 13, 0),
      createSection('CMPS102', SectionType.Lecture, '3', DayOfWeek.Wednesday, 9, 0, 11, 0),
      createSection('CMPS102', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 8, 0, 11, 0),
      createSection('CMPS102', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 8, 0, 11, 0),
      createSection('CMPS102', SectionType.Tutorial, '3', DayOfWeek.Tuesday, 13, 0, 16, 0),
      createSection('CMPS102', SectionType.Tutorial, '4', DayOfWeek.Tuesday, 16, 0, 19, 0),
      createSection('CMPS102', SectionType.Tutorial, '5', DayOfWeek.Tuesday, 16, 0, 19, 0),
    ]
  },
  {
    code: 'CMPS103',
    name: 'DS',
    isMTHS: false,
    sections: [
      createSection('CMPS103', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 11, 0),
      createSection('CMPS103', SectionType.Lecture, '2', DayOfWeek.Monday, 11, 0, 13, 0),
      createSection('CMPS103', SectionType.Lecture, '3', DayOfWeek.Wednesday, 9, 0, 11, 0),
      createSection('CMPS103', SectionType.Lecture, '4', DayOfWeek.Wednesday, 11, 0, 13, 0),
      createSection('CMPS103', SectionType.Tutorial, '1', DayOfWeek.Thursday, 8, 0, 11, 0),
      createSection('CMPS103', SectionType.Tutorial, '2', DayOfWeek.Thursday, 8, 0, 11, 0),
      createSection('CMPS103', SectionType.Tutorial, '3', DayOfWeek.Thursday, 13, 0, 16, 0),
      createSection('CMPS103', SectionType.Tutorial, '4', DayOfWeek.Thursday, 13, 0, 16, 0),
      createSection('CMPS103', SectionType.Tutorial, '5', DayOfWeek.Thursday, 16, 0, 19, 0),
      createSection('CMPS103', SectionType.Tutorial, '6', DayOfWeek.Thursday, 16, 0, 19, 0),
    ]
  },
  {
    code: 'CMPS118',
    name: 'Logic-1 (eee)',
    isMTHS: false,
    sections: [
      createSection('CMPS118', SectionType.Lecture, '1', DayOfWeek.Thursday, 8, 0, 10, 0),
      createSection('CMPS118', SectionType.Lecture, '2', DayOfWeek.Wednesday, 8, 0, 10, 0),
      createSection('CMPS118', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 9, 0, 11, 0),
      createSection('CMPS118', SectionType.Tutorial, '1_alt', DayOfWeek.Wednesday, 14, 0, 16, 0), // Named unique to avoid ID collision if needed, but 'group' is same
      createSection('CMPS118', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 11, 0, 13, 0),
      createSection('CMPS118', SectionType.Tutorial, '3', DayOfWeek.Wednesday, 16, 0, 18, 0),
    ]
  },
  {
    code: 'CMPS201',
    name: 'Micro',
    isMTHS: false,
    sections: [
      createSection('CMPS201', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 13, 0),
      createSection('CMPS201', SectionType.Lecture, '2', DayOfWeek.Wednesday, 11, 0, 13, 0),
      createSection('CMPS201', SectionType.Tutorial, '1', DayOfWeek.Sunday, 16, 0, 19, 0),
      createSection('CMPS201', SectionType.Tutorial, '2', DayOfWeek.Sunday, 13, 0, 16, 0),
    ]
  },
  {
    code: 'CMPS202',
    name: 'DataBase',
    isMTHS: false,
    sections: [
       createSection('CMPS202', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 13, 0),
       createSection('CMPS202', SectionType.Tutorial, '1', DayOfWeek.Sunday, 16, 0, 19, 0),
    ]
  },
  {
    code: 'CMPS203',
    name: 'SW',
    isMTHS: false,
    sections: [
      createSection('CMPS203', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 13, 0),
      createSection('CMPS203', SectionType.Lecture, '2', DayOfWeek.Wednesday, 13, 0, 15, 0),
      createSection('CMPS203', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 8, 0, 11, 0),
      createSection('CMPS203', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 13, 0, 16, 0),
      createSection('CMPS203', SectionType.Tutorial, '3', DayOfWeek.Wednesday, 16, 0, 19, 0),
      createSection('CMPS203', SectionType.Tutorial, '4', DayOfWeek.Sunday, 13, 0, 16, 0),
      createSection('CMPS203', SectionType.Tutorial, '5', DayOfWeek.Sunday, 16, 0, 19, 0),
    ]
  },
  {
    code: 'CMPS211',
    name: 'APT',
    isMTHS: false,
    sections: [
      createSection('CMPS211', SectionType.Lecture, '1', DayOfWeek.Tuesday, 16, 0, 18, 0),
      createSection('CMPS211', SectionType.Lecture, '2', DayOfWeek.Tuesday, 14, 0, 16, 0),
      createSection('CMPS211', SectionType.Lecture, '3', DayOfWeek.Tuesday, 11, 0, 13, 0),
      createSection('CMPS211', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 9, 0, 11, 0),
      createSection('CMPS211', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 16, 0, 18, 0),
      createSection('CMPS211', SectionType.Tutorial, '5', DayOfWeek.Monday, 16, 0, 18, 0),
      createSection('CMPS211', SectionType.Tutorial, '6', DayOfWeek.Monday, 14, 0, 16, 0),
    ]
  },
  {
    code: 'CMPS301',
    name: 'Computer Architecture',
    isMTHS: false,
    sections: [
      createSection('CMPS301', SectionType.Lecture, '1', DayOfWeek.Monday, 14, 0, 16, 0),
      createSection('CMPS301', SectionType.Tutorial, '1', DayOfWeek.Thursday, 16, 0, 18, 0),
    ]
  },
  {
    code: 'CMPS303',
    name: 'OS',
    isMTHS: false,
    sections: [
      createSection('CMPS303', SectionType.Lecture, '1', DayOfWeek.Thursday, 14, 0, 16, 0),
      createSection('CMPS303', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 13, 0, 16, 0),
      createSection('CMPS303', SectionType.Tutorial, '1_late', DayOfWeek.Tuesday, 16, 0, 19, 0), // Noted as same group T1 in PDF
    ]
  },
  {
    code: 'CMPS344',
    name: 'Data Science',
    isMTHS: false,
    sections: [
      createSection('CMPS344', SectionType.Lecture, '1', DayOfWeek.Tuesday, 11, 0, 13, 0),
      createSection('CMPS344', SectionType.Tutorial, '1', DayOfWeek.Sunday, 8, 0, 11, 0),
    ]
  },
  {
    code: 'CMPS345',
    name: 'Advanced Logic',
    isMTHS: false,
    sections: [
      createSection('CMPS345', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 11, 0),
      createSection('CMPS345', SectionType.Tutorial, '1', DayOfWeek.Monday, 16, 0, 19, 0),
    ]
  },
  {
    code: 'CMPS402',
    name: 'MI',
    isMTHS: false,
    sections: [
      createSection('CMPS402', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 11, 0),
      createSection('CMPS402', SectionType.Tutorial, '1', DayOfWeek.Sunday, 8, 0, 11, 0),
      createSection('CMPS402', SectionType.Tutorial, '2', DayOfWeek.Sunday, 11, 0, 14, 0),
    ]
  },
  {
    code: 'CMPS403',
    name: 'Compilers',
    isMTHS: false,
    sections: [
      createSection('CMPS403', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 11, 0),
      createSection('CMPS403', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 16, 0, 18, 0),
    ]
  },
  {
    code: 'CMPS405',
    name: 'Networks',
    isMTHS: false,
    sections: [
      createSection('CMPS405', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 11, 0),
      createSection('CMPS405', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 16, 0, 18, 0),
    ]
  },
  {
    code: 'CMPS425',
    name: 'Consultation',
    isMTHS: false,
    sections: [
      createSection('CMPS425', SectionType.Lecture, '1', DayOfWeek.Thursday, 11, 0, 13, 0),
    ]
  },
  {
    code: 'CMPS426',
    name: 'Security',
    isMTHS: false,
    sections: [
      createSection('CMPS426', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 11, 0),
      createSection('CMPS426', SectionType.Lecture, '2', DayOfWeek.Sunday, 14, 0, 16, 0),
      createSection('CMPS426', SectionType.Tutorial, '1', DayOfWeek.Sunday, 16, 0, 19, 0),
      createSection('CMPS426', SectionType.Tutorial, '2', DayOfWeek.Monday, 16, 0, 19, 0),
    ]
  },
  {
    code: 'CMPS445',
    name: 'Embedded',
    isMTHS: false,
    sections: [
      createSection('CMPS445', SectionType.Lecture, '1', DayOfWeek.Thursday, 9, 0, 11, 0),
      createSection('CMPS445', SectionType.Lecture, '2', DayOfWeek.Thursday, 14, 0, 16, 0),
      createSection('CMPS445', SectionType.Tutorial, '1', DayOfWeek.Thursday, 13, 0, 16, 0),
      createSection('CMPS445', SectionType.Tutorial, '2', DayOfWeek.Thursday, 16, 0, 19, 0),
    ]
  },
  {
    code: 'CMPS450',
    name: 'Pattern',
    isMTHS: false,
    sections: [
      createSection('CMPS450', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 13, 0),
      createSection('CMPS450', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 8, 0, 11, 0),
      createSection('CMPS450', SectionType.Tutorial, '2', DayOfWeek.Monday, 16, 0, 19, 0),
    ]
  },
  {
    code: 'CMPS451',
    name: 'BigData',
    isMTHS: false,
    sections: [
      createSection('CMPS451', SectionType.Lecture, '1', DayOfWeek.Tuesday, 11, 0, 13, 0),
      createSection('CMPS451', SectionType.Lecture, '2', DayOfWeek.Tuesday, 14, 0, 16, 0),
      createSection('CMPS451', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 16, 0, 19, 0),
      createSection('CMPS451', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 16, 0, 19, 0),
    ]
  },
  {
    code: 'CMPS453',
    name: 'Cloud Computing',
    isMTHS: false,
    sections: [
      createSection('CMPS453', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 13, 0),
      createSection('CMPS453', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 8, 0, 11, 0),
      createSection('CMPS453', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 16, 0, 19, 0),
    ]
  },

  // --- PDF 2: Electrical ---
  {
    code: 'EECS100',
    name: 'Laboratory',
    isMTHS: false,
    sections: [
       createSection('EECS100', SectionType.Lecture, '2', DayOfWeek.Sunday, 11, 0, 12, 50),
       createSection('EECS100', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50),
       createSection('EECS100', SectionType.Tutorial, '1', DayOfWeek.Sunday, 8, 0, 10, 50),
       createSection('EECS100', SectionType.Tutorial, '2', DayOfWeek.Sunday, 13, 0, 15, 50),
       createSection('EECS100', SectionType.Tutorial, '3', DayOfWeek.Thursday, 8, 0, 10, 50),
    ]
  },
  {
    code: 'EECS101',
    name: 'Electronics-1',
    isMTHS: false,
    sections: [
      createSection('EECS101', SectionType.Lecture, '1', DayOfWeek.Monday, 14, 0, 15, 50),
      createSection('EECS101', SectionType.Lecture, '2', DayOfWeek.Tuesday, 14, 0, 15, 50),
      createSection('EECS101', SectionType.Lecture, '3', DayOfWeek.Wednesday, 14, 0, 15, 50),
      createSection('EECS101', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 11, 0, 12, 50),
      createSection('EECS101', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 9, 0, 10, 50),
      createSection('EECS101', SectionType.Tutorial, '3', DayOfWeek.Monday, 11, 0, 12, 50),
    ]
  },
  {
    code: 'EECS102',
    name: 'Circuits-1',
    isMTHS: false,
    sections: [
      createSection('EECS102', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50),
      createSection('EECS102', SectionType.Tutorial, '1', DayOfWeek.Sunday, 13, 0, 15, 50),
    ]
  },
  {
    code: 'EECS112',
    name: 'Circuits-2',
    isMTHS: false,
    sections: [
      createSection('EECS112', SectionType.Lecture, '1', DayOfWeek.Sunday, 16, 0, 17, 50),
      createSection('EECS112', SectionType.Lecture, '2', DayOfWeek.Monday, 16, 0, 17, 50),
      createSection('EECS112', SectionType.Lecture, '3', DayOfWeek.Tuesday, 16, 0, 17, 50),
      createSection('EECS112', SectionType.Lecture, '4', DayOfWeek.Sunday, 14, 0, 15, 50),
      createSection('EECS112', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 8, 0, 10, 50),
      createSection('EECS112', SectionType.Tutorial, '2', DayOfWeek.Thursday, 8, 0, 10, 50),
      createSection('EECS112', SectionType.Tutorial, '3', DayOfWeek.Thursday, 13, 0, 15, 50),
      createSection('EECS112', SectionType.Tutorial, '4', DayOfWeek.Thursday, 16, 0, 18, 50),
    ]
  },
  {
    code: 'EECS201',
    name: 'Electronics-2',
    isMTHS: false,
    sections: [
      createSection('EECS201', SectionType.Lecture, '1', DayOfWeek.Tuesday, 14, 0, 15, 50),
      createSection('EECS201', SectionType.Lecture, '2', DayOfWeek.Monday, 14, 0, 15, 50),
      createSection('EECS201', SectionType.Tutorial, '1', DayOfWeek.Monday, 11, 0, 12, 50),
      createSection('EECS201', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 11, 0, 12, 50),
    ]
  },
  {
    code: 'EECS203',
    name: 'Signal Analysis',
    isMTHS: false,
    sections: [
      createSection('EECS203', SectionType.Lecture, '1', DayOfWeek.Monday, 13, 0, 15, 50),
      createSection('EECS203', SectionType.Lecture, '2', DayOfWeek.Monday, 8, 0, 10, 50),
      createSection('EECS203', SectionType.Lecture, '3', DayOfWeek.Sunday, 8, 0, 10, 50),
      createSection('EECS203', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 11, 0, 12, 50),
      createSection('EECS203', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 14, 0, 15, 50),
      createSection('EECS203', SectionType.Tutorial, '3', DayOfWeek.Wednesday, 11, 0, 12, 50),
      createSection('EECS203', SectionType.Tutorial, '4', DayOfWeek.Wednesday, 16, 0, 17, 50),
    ]
  },
  {
    code: 'EECS205',
    name: 'Electromagnetics-1',
    isMTHS: false,
    sections: [
      createSection('EECS205', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50),
      createSection('EECS205', SectionType.Tutorial, '1', DayOfWeek.Sunday, 11, 0, 12, 50),
    ]
  },
  {
    code: 'EECS301',
    name: 'Electronics-3',
    isMTHS: false,
    sections: [
      createSection('EECS301', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50),
      createSection('EECS301', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 9, 0, 10, 50),
    ]
  },
  {
    code: 'EECS304',
    name: 'Control-1',
    isMTHS: false,
    sections: [
      createSection('EECS304', SectionType.Lecture, '2', DayOfWeek.Sunday, 11, 0, 12, 50),
      createSection('EECS304', SectionType.Lecture, '3', DayOfWeek.Monday, 11, 0, 12, 50),
      createSection('EECS304', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 8, 0, 10, 50),
      createSection('EECS304', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 13, 0, 15, 50),
      createSection('EECS304', SectionType.Tutorial, '3', DayOfWeek.Wednesday, 16, 0, 18, 50),
    ]
  },
  {
    code: 'EECS305',
    name: 'Electromagnetics-2',
    isMTHS: false,
    sections: [
      createSection('EECS305', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50),
      createSection('EECS305', SectionType.Tutorial, '1', DayOfWeek.Thursday, 16, 0, 18, 50),
    ]
  },
  {
    code: 'EECS306',
    name: 'Comm-1',
    isMTHS: false,
    sections: [
      createSection('EECS306', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50),
      createSection('EECS306', SectionType.Lecture, '2', DayOfWeek.Monday, 14, 0, 15, 50),
      createSection('EECS306', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 8, 0, 10, 50),
      createSection('EECS306', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 13, 0, 15, 50),
      createSection('EECS306', SectionType.Tutorial, '3', DayOfWeek.Wednesday, 16, 0, 18, 50),
    ]
  },
  {
    code: 'EECS316',
    name: 'Comm-2',
    isMTHS: false,
    sections: [
      createSection('EECS316', SectionType.Lecture, '1', DayOfWeek.Thursday, 9, 0, 10, 50),
      createSection('EECS316', SectionType.Lecture, '2', DayOfWeek.Thursday, 11, 0, 12, 50),
      createSection('EECS316', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 8, 0, 10, 50),
      createSection('EECS316', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 13, 0, 15, 50),
    ]
  },
  {
    code: 'EECS404',
    name: 'Control-2',
    isMTHS: false,
    sections: [
      createSection('EECS404', SectionType.Lecture, '1', DayOfWeek.Monday, 13, 0, 15, 50),
      createSection('EECS404', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 16, 0, 18, 50),
    ]
  },
  {
    code: 'ELCS405',
    name: 'Antennas',
    isMTHS: false,
    sections: [
      createSection('ELCS405', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50),
      createSection('ELCS405', SectionType.Tutorial, '1', DayOfWeek.Thursday, 8, 0, 10, 50),
    ]
  },
  {
    code: 'ELCS406',
    name: 'Comm-3',
    isMTHS: false,
    sections: [
      createSection('ELCS406', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50),
      createSection('ELCS406', SectionType.Tutorial, '1', DayOfWeek.Sunday, 11, 0, 13, 50), // 11:00 to 1:50 is 13:50? No, usually 12:50 or 13:50. PDF says "1:50", assumes 13:50.
    ]
  },
  {
    code: 'EPES125',
    name: 'Electrical Power',
    isMTHS: false,
    sections: [
      createSection('EPES125', SectionType.Lecture, '1', DayOfWeek.Tuesday, 14, 0, 15, 50),
      createSection('EPES125', SectionType.Lecture, '2', DayOfWeek.Tuesday, 16, 0, 17, 50),
      createSection('EPES125', SectionType.Lecture, '3', DayOfWeek.Tuesday, 11, 0, 12, 50),
      createSection('EPES125', SectionType.Tutorial, '1', DayOfWeek.Sunday, 13, 0, 15, 50),
      createSection('EPES125', SectionType.Tutorial, '2', DayOfWeek.Sunday, 16, 0, 18, 50),
      createSection('EPES125', SectionType.Tutorial, '3', DayOfWeek.Sunday, 8, 0, 10, 50),
    ]
  },
  {
    code: 'PHYS102',
    name: 'Modern Physics',
    isMTHS: false,
    sections: [
      createSection('PHYS102', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50),
      createSection('PHYS102', SectionType.Lecture, '2', DayOfWeek.Wednesday, 9, 0, 10, 50),
      createSection('PHYS102', SectionType.Lecture, '3', DayOfWeek.Wednesday, 14, 0, 15, 50),
      createSection('PHYS102', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 11, 0, 13, 50), // 1:50 PM
      createSection('PHYS102', SectionType.Tutorial, '3', DayOfWeek.Tuesday, 8, 0, 10, 50),
      createSection('PHYS102', SectionType.Tutorial, '4', DayOfWeek.Tuesday, 14, 0, 16, 50),
    ]
  },
  {
    code: 'PHYS211',
    name: 'Electromagnetic Fields',
    isMTHS: false,
    sections: [
      createSection('PHYS211', SectionType.Lecture, '1', DayOfWeek.Tuesday, 13, 0, 15, 50),
      createSection('PHYS211', SectionType.Tutorial, '1', DayOfWeek.Monday, 14, 0, 15, 50),
    ]
  },

  // --- PDF 3: MATH (Linked Groups) ---
  {
    code: 'MTHS004',
    name: 'Discrete Math',
    isMTHS: true,
    sections: [
      createSection('MTHS004', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 11, 0),
      createSection('MTHS004', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 11, 0, 13, 0),
      createSection('MTHS004', SectionType.Lecture, '2', DayOfWeek.Tuesday, 14, 0, 16, 0),
      createSection('MTHS004', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 14, 0, 16, 0),
      createSection('MTHS004', SectionType.Lecture, '3', DayOfWeek.Wednesday, 14, 0, 16, 0),
      createSection('MTHS004', SectionType.Tutorial, '3', DayOfWeek.Wednesday, 16, 0, 18, 0),
    ]
  },
  {
    code: 'MTHS005',
    name: 'Intro Prob & Stats',
    isMTHS: true,
    sections: [
      createSection('MTHS005', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 11, 0),
      createSection('MTHS005', SectionType.Tutorial, '1', DayOfWeek.Thursday, 9, 0, 11, 0),
    ]
  },
  {
    code: 'MTHS102',
    name: 'Lin Alg & Multi Integrals',
    isMTHS: true,
    sections: [
      createSection('MTHS102', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 11, 0),
      createSection('MTHS102', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 11, 0, 13, 0),
      createSection('MTHS102', SectionType.Lecture, '2', DayOfWeek.Monday, 9, 0, 11, 0),
      createSection('MTHS102', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 11, 0, 13, 0),
      createSection('MTHS102', SectionType.Lecture, '3', DayOfWeek.Thursday, 9, 0, 11, 0),
      createSection('MTHS102', SectionType.Tutorial, '3', DayOfWeek.Tuesday, 9, 0, 11, 0),
    ]
  },
  {
    code: 'MTHS104',
    name: 'Differential Equations',
    isMTHS: true,
    sections: [
      createSection('MTHS104', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 13, 0),
      createSection('MTHS104', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 9, 0, 11, 0),
      createSection('MTHS104', SectionType.Lecture, '2', DayOfWeek.Thursday, 14, 0, 16, 0),
      createSection('MTHS104', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 11, 0, 13, 0),
      createSection('MTHS104', SectionType.Lecture, '3', DayOfWeek.Sunday, 9, 0, 11, 0),
      createSection('MTHS104', SectionType.Tutorial, '3', DayOfWeek.Tuesday, 11, 0, 13, 0),
      createSection('MTHS104', SectionType.Lecture, '4', DayOfWeek.Sunday, 14, 0, 16, 0),
      createSection('MTHS104', SectionType.Tutorial, '4', DayOfWeek.Tuesday, 9, 0, 11, 0),
    ]
  },
  {
    code: 'MTHS114',
    name: 'Numerical Analysis',
    isMTHS: true,
    sections: [
      createSection('MTHS114', SectionType.Lecture, '1', DayOfWeek.Thursday, 9, 0, 11, 0),
      createSection('MTHS114', SectionType.Tutorial, '1', DayOfWeek.Thursday, 11, 0, 13, 0),
      createSection('MTHS114', SectionType.Lecture, '2', DayOfWeek.Thursday, 11, 0, 13, 0),
      createSection('MTHS114', SectionType.Tutorial, '2', DayOfWeek.Thursday, 9, 0, 11, 0),
      createSection('MTHS114', SectionType.Lecture, '3', DayOfWeek.Sunday, 11, 0, 13, 0),
      createSection('MTHS114', SectionType.Tutorial, '3', DayOfWeek.Sunday, 9, 0, 11, 0),
    ]
  },
  {
    code: 'MTHS204',
    name: 'Adv Prob & Stats',
    isMTHS: true,
    sections: [
      createSection('MTHS204', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 11, 0),
      createSection('MTHS204', SectionType.Tutorial, '1', DayOfWeek.Sunday, 14, 0, 16, 0),
      createSection('MTHS204', SectionType.Lecture, '2', DayOfWeek.Tuesday, 9, 0, 11, 0),
      createSection('MTHS204', SectionType.Tutorial, '2', DayOfWeek.Thursday, 9, 0, 11, 0),
      createSection('MTHS204', SectionType.Lecture, '3', DayOfWeek.Tuesday, 11, 0, 13, 0),
      createSection('MTHS204', SectionType.Tutorial, '3', DayOfWeek.Thursday, 11, 0, 13, 0),
      createSection('MTHS204', SectionType.Lecture, '4', DayOfWeek.Sunday, 11, 0, 13, 0),
      createSection('MTHS204', SectionType.Tutorial, '4', DayOfWeek.Tuesday, 14, 0, 16, 0),
    ]
  },

  // --- PDF 4: GENS (Lectures only usually) ---
  {
    code: 'GENS110',
    name: 'Management & Risk',
    isMTHS: false,
    sections: [
      createSection('GENS110', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 13, 0),
      createSection('GENS110', SectionType.Lecture, '2', DayOfWeek.Tuesday, 9, 0, 11, 0),
      createSection('GENS110', SectionType.Lecture, '3', DayOfWeek.Tuesday, 11, 0, 13, 0),
      createSection('GENS110', SectionType.Lecture, '4', DayOfWeek.Thursday, 9, 0, 11, 0),
      createSection('GENS110', SectionType.Lecture, '5', DayOfWeek.Thursday, 11, 0, 13, 0),
    ]
  },
  {
    code: 'GENS120',
    name: 'Econ & Accounting',
    isMTHS: false,
    sections: [
      createSection('GENS120', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 11, 0),
      createSection('GENS120', SectionType.Lecture, '2', DayOfWeek.Tuesday, 11, 0, 13, 0),
      createSection('GENS120', SectionType.Lecture, '3', DayOfWeek.Thursday, 9, 0, 11, 0),
      createSection('GENS120', SectionType.Lecture, '4', DayOfWeek.Thursday, 11, 0, 13, 0),
    ]
  },
  {
    code: 'GENS202',
    name: 'Adv Critical Thinking',
    isMTHS: false,
    sections: [
      createSection('GENS202', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 11, 0),
    ]
  },
  {
    code: 'GENS203',
    name: 'Entrepreneurship',
    isMTHS: false,
    sections: [
      createSection('GENS203', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 13, 0),
    ]
  },
  {
    code: 'GENS207',
    name: 'Foreign Language',
    isMTHS: false,
    sections: [
      createSection('GENS207', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 11, 0),
      createSection('GENS207', SectionType.Lecture, '2', DayOfWeek.Tuesday, 11, 0, 13, 0),
    ]
  },
  {
    code: 'GENS208',
    name: 'Marketing',
    isMTHS: false,
    sections: [
      createSection('GENS208', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 11, 0),
      createSection('GENS208', SectionType.Lecture, '2', DayOfWeek.Tuesday, 11, 0, 13, 0),
    ]
  },
  {
    code: 'GENS209',
    name: 'Life Long Skills',
    isMTHS: false,
    sections: [
      createSection('GENS209', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 11, 0),
    ]
  },
  {
    code: 'GENS236',
    name: 'Service Management',
    isMTHS: false,
    sections: [
      createSection('GENS236', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 13, 0),
    ]
  }
];

export const COURSES = rawData.sort((a, b) => a.code.localeCompare(b.code));
