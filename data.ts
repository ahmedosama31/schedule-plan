
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
  endM: number,
  location?: string
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
        location
      },
    ],
  };
};

export const COURSES: Course[] = [
  {
    code: 'AETS481',
    name: 'Graduation Project-1',
    isMTHS: false,
    sections: [
      createSection('AETS481', SectionType.Lecture, '1', DayOfWeek.Thursday, 9, 0, 9, 50, '[204072]20407 B -50-الجيزة الرئيسي'),
      createSection('AETS481', SectionType.Tutorial, '1', DayOfWeek.Thursday, 10, 0, 11, 50, '[204072]20407 B -50-الجيزة الرئيسي')
    ]
  },
  {
    code: 'AETS482',
    name: 'Graduation Project-2',
    isMTHS: false,
    sections: [
      createSection('AETS482', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 9, 50, '[204072]20407 B -50-الجيزة الرئيسي'),
      createSection('AETS482', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 10, 0, 13, 50, '[204072]20407 B -50-الجيزة الرئيسي'),
      createSection('AETS482', SectionType.Lecture, '2', DayOfWeek.Wednesday, 2, 0, 2, 50, '[204071]20407 A -60-الجيزة الرئيسي'),
      createSection('AETS482', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 3, 0, 6, 50, '[204071]20407 A -60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS105',
    name: 'Introduction to Building Construction and Environmental Design',
    isMTHS: false,
    sections: [
      createSection('ARCS105', SectionType.Lecture, '1', DayOfWeek.Wednesday, 1, 0, 2, 50, '[203071]20307 A -60-الجيزة الرئيسي'),
      createSection('ARCS105', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 3, 0, 5, 50, '[203071]20307 A -60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS106',
    name: 'Digital Representation for Architects',
    isMTHS: false,
    sections: [
      createSection('ARCS106', SectionType.Lecture, '1', DayOfWeek.Tuesday, 1, 0, 1, 50, '[3207]LAB AET1 (GIZA)-35-الجيزة الرئيسي'),
      createSection('ARCS106', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 2, 0, 4, 50, '[3207]LAB AET1 (GIZA)-35-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS107',
    name: 'Architectural Design-1',
    isMTHS: false,
    sections: [
      createSection('ARCS107', SectionType.Lecture, '1', DayOfWeek.Thursday, 8, 0, 8, 50, '[203071]20307 A -60-الجيزة الرئيسي'),
      createSection('ARCS107', SectionType.Tutorial, '1', DayOfWeek.Thursday, 9, 0, 12, 50, '[203071]20307 A -60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS110',
    name: 'Basic Architectural Design and Building Construction',
    isMTHS: false,
    sections: [
      createSection('ARCS110', SectionType.Lecture, '1', DayOfWeek.Thursday, 9, 0, 9, 50, '[20104]20104-45-الجيزة الرئيسي'),
      createSection('ARCS110', SectionType.Tutorial, '1', DayOfWeek.Thursday, 10, 0, 12, 50, '[20104]20104-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS201',
    name: 'History of Structures',
    isMTHS: false,
    sections: [
      createSection('ARCS201', SectionType.Lecture, '1', DayOfWeek.Tuesday, 1, 0, 1, 50, '[20501]20501-70-الجيزة الرئيسي'),
      createSection('ARCS201', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20501]20501-70-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS202',
    name: 'Building Construction-1',
    isMTHS: false,
    sections: [
      createSection('ARCS202', SectionType.Lecture, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[203071]20307 A -60-الجيزة الرئيسي'),
      createSection('ARCS202', SectionType.Tutorial, '1', DayOfWeek.Sunday, 4, 0, 6, 50, '[203071]20307 A -60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS203',
    name: 'Architecture and Humanities',
    isMTHS: false,
    sections: [
      createSection('ARCS203', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 11, 50, '[203072]20307 B -60-الجيزة الرئيسي'),
      createSection('ARCS203', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 12, 0, 13, 50, '[203072]20307 B -60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS207',
    name: 'Architectural Design-3',
    isMTHS: false,
    sections: [
      createSection('ARCS207', SectionType.Lecture, '1', DayOfWeek.Thursday, 10, 0, 10, 50, '[203072]20307 B -60-الجيزة الرئيسي'),
      createSection('ARCS207', SectionType.Tutorial, '1', DayOfWeek.Thursday, 11, 0, 14, 50, '[203072]20307 B -60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS208',
    name: 'Site Planning and Development',
    isMTHS: false,
    sections: [
      createSection('ARCS208', SectionType.Lecture, '1', DayOfWeek.Monday, 8, 0, 8, 50, '[204071]20407 A -60-الجيزة الرئيسي'),
      createSection('ARCS208', SectionType.Tutorial, '1', DayOfWeek.Monday, 9, 0, 11, 50, '[204071]20407 A -60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS231',
    name: 'History of Islamic Architecture',
    isMTHS: false,
    sections: [
      createSection('ARCS231', SectionType.Lecture, '1', DayOfWeek.Sunday, 12, 0, 12, 50, '[204071]20407 A -60-الجيزة الرئيسي'),
      createSection('ARCS231', SectionType.Tutorial, '1', DayOfWeek.Sunday, 1, 0, 2, 50, '[204071]20407 A -60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS240',
    name: 'Thermal Properties and Energy in Buildings',
    isMTHS: false,
    sections: [
      createSection('ARCS240', SectionType.Lecture, '1', DayOfWeek.Monday, 12, 0, 12, 50, '[3207]LAB AET1 (GIZA)-35-الجيزة الرئيسي'),
      createSection('ARCS240', SectionType.Tutorial, '1', DayOfWeek.Monday, 1, 0, 3, 50, '[3207]LAB AET1 (GIZA)-35-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS305',
    name: 'Building Construction-3',
    isMTHS: false,
    sections: [
      createSection('ARCS305', SectionType.Lecture, '1', DayOfWeek.Wednesday, 8, 0, 9, 50, '[20501]20501-70-الجيزة الرئيسي'),
      createSection('ARCS305', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 10, 0, 13, 50, '[20501]20501-70-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS307',
    name: 'Architectural Design-5',
    isMTHS: false,
    sections: [
      createSection('ARCS307', SectionType.Lecture, '1', DayOfWeek.Thursday, 8, 0, 9, 50, '[204071]20407 A -60-الجيزة الرئيسي'),
      createSection('ARCS307', SectionType.Tutorial, '1', DayOfWeek.Thursday, 10, 0, 13, 50, '[204071]20407 A -60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS308',
    name: 'Architectural Acoustics and Day-lighting',
    isMTHS: false,
    sections: [
      createSection('ARCS308', SectionType.Lecture, '1', DayOfWeek.Monday, 2, 0, 2, 50, '[20508]20508-70-الجيزة الرئيسي'),
      createSection('ARCS308', SectionType.Tutorial, '1', DayOfWeek.Monday, 3, 0, 4, 50, '[20508]20508-70-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS332',
    name: 'Special Problems in Construction',
    isMTHS: false,
    sections: [
      createSection('ARCS332', SectionType.Lecture, '1', DayOfWeek.Sunday, 1, 0, 1, 50, '[20502]20502-70-الجيزة الرئيسي'),
      createSection('ARCS332', SectionType.Tutorial, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[20502]20502-70-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS336',
    name: 'Architecture, Culture and Heritage',
    isMTHS: false,
    sections: [
      createSection('ARCS336', SectionType.Lecture, '1', DayOfWeek.Tuesday, 1, 0, 2, 50, '[203072]20307 B -60-الجيزة الرئيسي'),
      createSection('ARCS336', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 3, 0, 4, 50, '[203072]20307 B -60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS337',
    name: 'Housing Design and Real Estate Development',
    isMTHS: false,
    sections: [
      createSection('ARCS337', SectionType.Lecture, '1', DayOfWeek.Monday, 8, 0, 9, 50, '[203071]20307 A -60-الجيزة الرئيسي'),
      createSection('ARCS337', SectionType.Tutorial, '1', DayOfWeek.Monday, 10, 0, 11, 50, '[203071]20307 A -60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS402',
    name: 'Building Construction-4',
    isMTHS: false,
    sections: [
      createSection('ARCS402', SectionType.Lecture, '1', DayOfWeek.Thursday, 2, 0, 3, 50, '[3207]LAB AET1 (GIZA)-35-الجيزة الرئيسي'),
      createSection('ARCS402', SectionType.Tutorial, '1', DayOfWeek.Thursday, 4, 0, 7, 50, '[3207]LAB AET1 (GIZA)-35-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS403',
    name: 'Integrated Building Systems',
    isMTHS: false,
    sections: [
      createSection('ARCS403', SectionType.Lecture, '1', DayOfWeek.Tuesday, 8, 0, 9, 50, '[203071]20307 A -60-الجيزة الرئيسي'),
      createSection('ARCS403', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 10, 0, 11, 50, '[203071]20307 A -60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS405',
    name: 'Building Construction-5',
    isMTHS: false,
    sections: [
      createSection('ARCS405', SectionType.Lecture, '1', DayOfWeek.Thursday, 8, 0, 9, 50, '[3207]LAB AET1 (GIZA)-35-الجيزة الرئيسي'),
      createSection('ARCS405', SectionType.Tutorial, '1', DayOfWeek.Thursday, 10, 0, 13, 50, '[3207]LAB AET1 (GIZA)-35-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS406',
    name: 'Architectural Design-6',
    isMTHS: false,
    sections: [
      createSection('ARCS406', SectionType.Lecture, '1', DayOfWeek.Sunday, 1, 0, 2, 50, '[203072]20307 B -60-الجيزة الرئيسي'),
      createSection('ARCS406', SectionType.Tutorial, '1', DayOfWeek.Sunday, 3, 0, 6, 50, '[203072]20307 B -60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS430',
    name: 'Interior Design',
    isMTHS: false,
    sections: [
      createSection('ARCS430', SectionType.Lecture, '1', DayOfWeek.Sunday, 8, 0, 9, 50, '[204072]20407 B -50-الجيزة الرئيسي'),
      createSection('ARCS430', SectionType.Tutorial, '1', DayOfWeek.Sunday, 10, 0, 11, 50, '[204072]20407 B -50-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS436',
    name: 'Independent Studies Global Trends in Urban Planning',
    isMTHS: false,
    sections: [
      createSection('ARCS436', SectionType.Lecture, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20508]20508-70-الجيزة الرئيسي'),
      createSection('ARCS436', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 4, 0, 5, 50, '[20508]20508-70-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS470',
    name: 'Thesis Writing for GP',
    isMTHS: false,
    sections: [
      createSection('ARCS470', SectionType.Lecture, '1', DayOfWeek.Thursday, 12, 0, 12, 50, '[204072]20407 B -50-الجيزة الرئيسي'),
      createSection('ARCS470', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 12, 0, 14, 50, '[20502]20502-70-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS481',
    name: 'GP Independent Studies: Architecture Theme',
    isMTHS: false,
    sections: [
      createSection('ARCS481', SectionType.Lecture, '1', DayOfWeek.Monday, 2, 0, 2, 50, '[204072]20407 B -50-الجيزة الرئيسي'),
      createSection('ARCS481', SectionType.Tutorial, '1', DayOfWeek.Monday, 3, 0, 6, 50, '[204072]20407 B -50-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ARCS482',
    name: 'GP Independent Studies: Urban Theme',
    isMTHS: false,
    sections: [
      createSection('ARCS482', SectionType.Lecture, '1', DayOfWeek.Monday, 2, 0, 2, 50, '-----'),
      createSection('ARCS482', SectionType.Tutorial, '1', DayOfWeek.Monday, 3, 0, 6, 50, '-----')
    ]
  },
  {
    code: 'ARCS483',
    name: 'GP Independent Studies: Technology and Environment Theme',
    isMTHS: false,
    sections: [
      createSection('ARCS483', SectionType.Lecture, '1', DayOfWeek.Monday, 2, 0, 2, 50, '[204071]20407 A -60-الجيزة الرئيسي'),
      createSection('ARCS483', SectionType.Tutorial, '1', DayOfWeek.Monday, 3, 0, 6, 50, '[204071]20407 A -60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'BDES482',
    name: 'Graduation Project-2',
    isMTHS: false,
    sections: [
      createSection('BDES482', SectionType.Lecture, '0', DayOfWeek.Thursday, 4, 0, 6, 50, '-----')
    ]
  },
  {
    code: 'CCES280',
    name: 'Engineering Seminar',
    isMTHS: false,
    sections: [
      createSection('CCES280', SectionType.Lecture, '1', DayOfWeek.Sunday, 8, 0, 8, 50, '[1520]Blue Room-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CCES482',
    name: 'Graduation Project-2',
    isMTHS: false,
    sections: [
      createSection('CCES482', SectionType.Lecture, '1', DayOfWeek.Sunday, 8, 0, 8, 50, '-----'),
      createSection('CCES482', SectionType.Lecture, '2', DayOfWeek.Monday, 8, 0, 8, 50, '-----'),
      createSection('CCES482', SectionType.Lecture, '3', DayOfWeek.Tuesday, 8, 0, 8, 50, '-----'),
      createSection('CCES482', SectionType.Lecture, '4', DayOfWeek.Wednesday, 8, 0, 8, 50, '-----'),
      createSection('CCES482', SectionType.Lecture, '5', DayOfWeek.Thursday, 8, 0, 8, 50, '-----')
    ]
  },
  {
    code: 'CEMS280',
    name: 'Engineering Seminar',
    isMTHS: false,
    sections: [
      createSection('CEMS280', SectionType.Lecture, '1', DayOfWeek.Monday, 1, 0, 1, 50, '[20102]20102-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CEMS482',
    name: 'Graduation Project-2',
    isMTHS: false,
    sections: [
      createSection('CEMS482', SectionType.Lecture, '1', DayOfWeek.Thursday, 6, 0, 8, 50, '-----')
    ]
  },
  {
    code: 'CHES001',
    name: 'Chemistry for Engineers',
    isMTHS: false,
    sections: [
      createSection('CHES001', SectionType.Lecture, '10', DayOfWeek.Saturday, 10, 0, 11, 50, '[51116]51116-50-الشيخ زايد'),
      createSection('CHES001', SectionType.Tutorial, '10', DayOfWeek.Saturday, 8, 0, 9, 50, '[51116]51116-50-الشيخ زايد')
    ]
  },
  {
    code: 'CHES102',
    name: 'Chemical Engineering Fundamentals',
    isMTHS: false,
    sections: [
      createSection('CHES102', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[20427]20427-32-الجيزة الرئيسي'),
      createSection('CHES102', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[20427]20427-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CHES203',
    name: 'Physical Chemistry-2',
    isMTHS: false,
    sections: [
      createSection('CHES203', SectionType.Lecture, '1', DayOfWeek.Thursday, 9, 0, 10, 50, '[33310]33310-60-ملحق كيمياء'),
      createSection('CHES203', SectionType.Tutorial, '1', DayOfWeek.Thursday, 11, 0, 13, 50, '[33310]33310-60-ملحق كيمياء')
    ]
  },
  {
    code: 'CHES204',
    name: 'Thermodynamics and Combustion',
    isMTHS: false,
    sections: [
      createSection('CHES204', SectionType.Tutorial, '1', DayOfWeek.Monday, 9, 0, 10, 50, '[33310]33310-60-ملحق كيمياء'),
      createSection('CHES204', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[33310]33310-60-ملحق كيمياء')
    ]
  },
  {
    code: 'CHES205',
    name: 'Computer Applications in Petrochemical Engineering',
    isMTHS: false,
    sections: [
      createSection('CHES205', SectionType.Tutorial, '1', DayOfWeek.Monday, 4, 0, 5, 50, '[33310]33310-60-ملحق كيمياء'),
      createSection('CHES205', SectionType.Lecture, '1', DayOfWeek.Monday, 2, 0, 3, 50, '[33310]33310-60-ملحق كيمياء')
    ]
  },
  {
    code: 'CHES206',
    name: 'Organic Chemistry-2',
    isMTHS: false,
    sections: [
      createSection('CHES206', SectionType.Lecture, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[33310]33310-60-ملحق كيمياء'),
      createSection('CHES206', SectionType.Tutorial, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[33310]33310-60-ملحق كيمياء')
    ]
  },
  {
    code: 'CHES303',
    name: 'Cryogenic Processes',
    isMTHS: false,
    sections: [
      createSection('CHES303', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[20427]20427-32-الجيزة الرئيسي'),
      createSection('CHES303', SectionType.Tutorial, '1', DayOfWeek.Monday, 9, 0, 10, 50, '[20427]20427-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CHES305',
    name: 'Chemical Reactor Design',
    isMTHS: false,
    sections: [
      createSection('CHES305', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[33310]33310-60-ملحق كيمياء'),
      createSection('CHES305', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 8, 0, 9, 50, '[33310]33310-60-ملحق كيمياء')
    ]
  },
  {
    code: 'CHES306',
    name: 'Process Control',
    isMTHS: false,
    sections: [
      createSection('CHES306', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[33310]33310-60-ملحق كيمياء'),
      createSection('CHES306', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 2, 0, 3, 50, '[20427]20427-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CHES307',
    name: 'Application of Machine Learning in Chemical Engineering',
    isMTHS: false,
    sections: [
      createSection('CHES307', SectionType.Lecture, '1', DayOfWeek.Sunday, 4, 0, 5, 50, '[33310]33310-60-ملحق كيمياء'),
      createSection('CHES307', SectionType.Tutorial, '1', DayOfWeek.Sunday, 1, 0, 3, 50, '[33310]33310-60-ملحق كيمياء')
    ]
  },
  {
    code: 'CHES311',
    name: 'Environmental Pollution and Climate Change',
    isMTHS: false,
    sections: [
      createSection('CHES311', SectionType.Lecture, '1', DayOfWeek.Wednesday, 2, 0, 3, 50, '[33310]33310-60-ملحق كيمياء'),
      createSection('CHES311', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 4, 0, 5, 50, '[33310]33310-60-ملحق كيمياء')
    ]
  },
  {
    code: 'CHES405',
    name: 'Mass Transfer',
    isMTHS: false,
    sections: [
      createSection('CHES405', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[33310]33310-60-ملحق كيمياء'),
      createSection('CHES405', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 11, 0, 12, 50, '[33310]33310-60-ملحق كيمياء')
    ]
  },
  {
    code: 'CHES406',
    name: 'Economics of Oil and Gas Production',
    isMTHS: false,
    sections: [
      createSection('CHES406', SectionType.Lecture, '1', DayOfWeek.Thursday, 4, 0, 5, 50, '[33310]33310-60-ملحق كيمياء')
    ]
  },
  {
    code: 'CHES407',
    name: 'Separation Processes',
    isMTHS: false,
    sections: [
      createSection('CHES407', SectionType.Lecture, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20424]20424-32-الجيزة الرئيسي'),
      createSection('CHES407', SectionType.Tutorial, '1', DayOfWeek.Thursday, 9, 0, 10, 50, '[20427]20427-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CHES414',
    name: 'Industrial Measurements and Control Applications',
    isMTHS: false,
    sections: [
      createSection('CHES414', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[20427]20427-32-الجيزة الرئيسي'),
      createSection('CHES414', SectionType.Tutorial, '1', DayOfWeek.Sunday, 2, 0, 2, 50, '[20427]20427-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CHES416',
    name: 'Advanced Statistics for Petrochemical Industries',
    isMTHS: false,
    sections: [
      createSection('CHES416', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20427]20427-32-الجيزة الرئيسي'),
      createSection('CHES416', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20427]20427-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CMPS101',
    name: 'Logic Design',
    isMTHS: false,
    sections: [
      createSection('CMPS101', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 10, 50, '-----'),
      createSection('CMPS101', SectionType.Tutorial, '1', DayOfWeek.Monday, 1, 0, 3, 50, '[3709]3709-45-الجيزة الرئيسي'),
      createSection('CMPS101', SectionType.Tutorial, '2', DayOfWeek.Monday, 4, 0, 6, 50, '[3709]3709-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CMPS102',
    name: 'Programming Techniques',
    isMTHS: false,
    sections: [
      createSection('CMPS102', SectionType.Lecture, '2', DayOfWeek.Wednesday, 11, 0, 12, 50, '-----'),
      createSection('CMPS102', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 8, 0, 10, 50, '-----'),
      createSection('CMPS102', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 8, 0, 10, 50, '-----'),
      createSection('CMPS102', SectionType.Lecture, '1', DayOfWeek.Wednesday, 2, 0, 3, 50, '-----'),
      createSection('CMPS102', SectionType.Lecture, '3', DayOfWeek.Wednesday, 9, 0, 10, 50, '-----'),
      createSection('CMPS102', SectionType.Tutorial, '3', DayOfWeek.Tuesday, 1, 0, 3, 50, '[3706]3706-45-الجيزة الرئيسي'),
      createSection('CMPS102', SectionType.Tutorial, '4', DayOfWeek.Tuesday, 4, 0, 6, 50, '[3706]3706-45-الجيزة الرئيسي'),
      createSection('CMPS102', SectionType.Tutorial, '5', DayOfWeek.Tuesday, 4, 0, 6, 50, '[3707]3707-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CMPS103',
    name: 'Data Structures and Algorithms',
    isMTHS: false,
    sections: [
      createSection('CMPS103', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 10, 50, '[3702]3702-60-الجيزة الرئيسي'),
      createSection('CMPS103', SectionType.Lecture, '2', DayOfWeek.Monday, 11, 0, 12, 50, '[3702]3702-60-الجيزة الرئيسي'),
      createSection('CMPS103', SectionType.Lecture, '3', DayOfWeek.Wednesday, 9, 0, 10, 50, '[3704]3704-60-الجيزة الرئيسي'),
      createSection('CMPS103', SectionType.Lecture, '4', DayOfWeek.Wednesday, 11, 0, 12, 50, '[3701]مدرج أولى حاسبات-60-الجيزة الرئيسي'),
      createSection('CMPS103', SectionType.Tutorial, '1', DayOfWeek.Thursday, 8, 0, 10, 50, '[3706]3706-45-الجيزة الرئيسي'),
      createSection('CMPS103', SectionType.Tutorial, '2', DayOfWeek.Thursday, 8, 0, 10, 50, '[3707]3707-45-الجيزة الرئيسي'),
      createSection('CMPS103', SectionType.Tutorial, '3', DayOfWeek.Thursday, 1, 0, 3, 50, '[3708]3708-45-الجيزة الرئيسي'),
      createSection('CMPS103', SectionType.Tutorial, '4', DayOfWeek.Thursday, 1, 0, 3, 50, '[3707]3707-45-الجيزة الرئيسي'),
      createSection('CMPS103', SectionType.Tutorial, '5', DayOfWeek.Thursday, 4, 0, 6, 50, '[3706]3706-45-الجيزة الرئيسي'),
      createSection('CMPS103', SectionType.Tutorial, '6', DayOfWeek.Thursday, 4, 0, 6, 50, '[3707]3707-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CMPS118',
    name: 'Introduction to Logic Design',
    isMTHS: false,
    sections: [
      createSection('CMPS118', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '-----'),
      createSection('CMPS118', SectionType.Lecture, '2', DayOfWeek.Thursday, 9, 0, 10, 50, '-----'),
      createSection('CMPS118', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[3709]3709-45-الجيزة الرئيسي'),
      createSection('CMPS118', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 11, 0, 12, 50, '[3709]3709-45-الجيزة الرئيسي'),
      createSection('CMPS118', SectionType.Tutorial, '3', DayOfWeek.Wednesday, 4, 0, 5, 50, '[3709]3709-45-الجيزة الرئيسي'),
      createSection('CMPS118', SectionType.Tutorial, '4', DayOfWeek.Wednesday, 2, 0, 3, 50, '[3709]3709-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CMPS201',
    name: 'Microprocessor Systems',
    isMTHS: false,
    sections: [
      createSection('CMPS201', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50, '-----'),
      createSection('CMPS201', SectionType.Lecture, '2', DayOfWeek.Wednesday, 11, 0, 12, 50, '-----'),
      createSection('CMPS201', SectionType.Tutorial, '1', DayOfWeek.Sunday, 4, 0, 6, 50, '[3706]3706-45-الجيزة الرئيسي'),
      createSection('CMPS201', SectionType.Tutorial, '2', DayOfWeek.Sunday, 1, 0, 3, 50, '-----')
    ]
  },
  {
    code: 'CMPS202',
    name: 'Introduction to Database Management Systems',
    isMTHS: false,
    sections: [
      createSection('CMPS202', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '-----'),
      createSection('CMPS202', SectionType.Tutorial, '1', DayOfWeek.Sunday, 4, 0, 6, 50, '-----')
    ]
  },
  {
    code: 'CMPS203',
    name: 'Software Engineering',
    isMTHS: false,
    sections: [
      createSection('CMPS203', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[3704]3704-60-الجيزة الرئيسي'),
      createSection('CMPS203', SectionType.Lecture, '2', DayOfWeek.Wednesday, 1, 0, 2, 50, '[3701]مدرج أولى حاسبات-60-الجيزة الرئيسي'),
      createSection('CMPS203', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 8, 0, 10, 50, '[3706]3706-45-الجيزة الرئيسي'),
      createSection('CMPS203', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 1, 0, 3, 50, '-----'),
      createSection('CMPS203', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 4, 0, 6, 50, '-----'),
      createSection('CMPS203', SectionType.Tutorial, '4', DayOfWeek.Sunday, 1, 0, 3, 50, '-----'),
      createSection('CMPS203', SectionType.Tutorial, '5', DayOfWeek.Sunday, 4, 0, 6, 50, '[3707]3707-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CMPS211',
    name: 'Advanced Programming Techniques',
    isMTHS: false,
    sections: [
      createSection('CMPS211', SectionType.Lecture, '1', DayOfWeek.Sunday, 4, 0, 5, 50, '-----'),
      createSection('CMPS211', SectionType.Lecture, '2', DayOfWeek.Sunday, 2, 0, 3, 50, '-----'),
      createSection('CMPS211', SectionType.Lecture, '3', DayOfWeek.Tuesday, 11, 0, 12, 50, '-----'),
      createSection('CMPS211', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '-----'),
      createSection('CMPS211', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 4, 0, 5, 50, '[3707]3707-45-الجيزة الرئيسي'),
      createSection('CMPS211', SectionType.Tutorial, '3', DayOfWeek.Monday, 4, 0, 5, 50, '[3706]3706-45-الجيزة الرئيسي'),
      createSection('CMPS211', SectionType.Tutorial, '4', DayOfWeek.Monday, 2, 0, 3, 50, '[3706]3706-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CMPS301',
    name: 'Computer Architecture',
    isMTHS: false,
    sections: [
      createSection('CMPS301', SectionType.Lecture, '1', DayOfWeek.Monday, 2, 0, 3, 50, '[3701]مدرج أولى حاسبات-60-الجيزة الرئيسي'),
      createSection('CMPS301', SectionType.Tutorial, '1', DayOfWeek.Thursday, 4, 0, 5, 50, '[3708]3708-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CMPS303',
    name: 'Operating Systems',
    isMTHS: false,
    sections: [
      createSection('CMPS303', SectionType.Lecture, '1', DayOfWeek.Thursday, 2, 0, 3, 50, '[3701]مدرج أولى حاسبات-60-الجيزة الرئيسي'),
      createSection('CMPS303', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 1, 0, 3, 50, '[3708]3708-45-الجيزة الرئيسي'),
      createSection('CMPS303', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 4, 0, 6, 50, '[3708]3708-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CMPS344',
    name: 'Data Science',
    isMTHS: false,
    sections: [
      createSection('CMPS344', SectionType.Lecture, '1', DayOfWeek.Tuesday, 11, 0, 12, 50, '[3702]3702-60-الجيزة الرئيسي'),
      createSection('CMPS344', SectionType.Tutorial, '1', DayOfWeek.Sunday, 8, 0, 10, 50, '-----')
    ]
  },
  {
    code: 'CMPS345',
    name: 'Advanced Digital design, testing and verification',
    isMTHS: false,
    sections: [
      createSection('CMPS345', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[3703]3703-90-الجيزة الرئيسي'),
      createSection('CMPS345', SectionType.Tutorial, '1', DayOfWeek.Monday, 4, 0, 6, 50, '-----')
    ]
  },
  {
    code: 'CMPS402',
    name: 'Machine Intelligence',
    isMTHS: false,
    sections: [
      createSection('CMPS402', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 10, 50, '-----'),
      createSection('CMPS402', SectionType.Tutorial, '1', DayOfWeek.Sunday, 8, 0, 10, 50, '[3708]3708-45-الجيزة الرئيسي'),
      createSection('CMPS402', SectionType.Tutorial, '2', DayOfWeek.Sunday, 11, 0, 13, 50, '[3708]3708-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CMPS403',
    name: 'Compilers and Languages',
    isMTHS: false,
    sections: [
      createSection('CMPS403', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '-----'),
      createSection('CMPS403', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 4, 0, 5, 50, '[3708]3708-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CMPS405',
    name: 'Computer Networks-1',
    isMTHS: false,
    sections: [
      createSection('CMPS405', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[3702]3702-60-الجيزة الرئيسي'),
      createSection('CMPS405', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 4, 0, 5, 50, '-----')
    ]
  },
  {
    code: 'CMPS425',
    name: 'Computer Consultation',
    isMTHS: false,
    sections: [
      createSection('CMPS425', SectionType.Lecture, '1', DayOfWeek.Thursday, 11, 0, 12, 50, '[3704]3704-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CMPS426',
    name: 'Security of Computer Systems and Networks',
    isMTHS: false,
    sections: [
      createSection('CMPS426', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 10, 50, '-----'),
      createSection('CMPS426', SectionType.Lecture, '2', DayOfWeek.Sunday, 2, 0, 3, 50, '[3701]مدرج أولى حاسبات-60-الجيزة الرئيسي'),
      createSection('CMPS426', SectionType.Tutorial, '1', DayOfWeek.Sunday, 4, 0, 6, 50, '[3708]3708-45-الجيزة الرئيسي'),
      createSection('CMPS426', SectionType.Tutorial, '2', DayOfWeek.Monday, 4, 0, 6, 50, '[3708]3708-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CMPS445',
    name: 'Embedded Systems',
    isMTHS: false,
    sections: [
      createSection('CMPS445', SectionType.Lecture, '1', DayOfWeek.Thursday, 9, 0, 10, 50, '[3704]3704-60-الجيزة الرئيسي'),
      createSection('CMPS445', SectionType.Tutorial, '1', DayOfWeek.Thursday, 1, 0, 3, 50, '[3706]3706-45-الجيزة الرئيسي'),
      createSection('CMPS445', SectionType.Lecture, '2', DayOfWeek.Thursday, 2, 0, 3, 50, '[3704]3704-60-الجيزة الرئيسي'),
      createSection('CMPS445', SectionType.Tutorial, '2', DayOfWeek.Thursday, 4, 0, 6, 50, '-----')
    ]
  },
  {
    code: 'CMPS450',
    name: 'Pattern Recognition and Artificial Neural Networks',
    isMTHS: false,
    sections: [
      createSection('CMPS450', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50, '-----'),
      createSection('CMPS450', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 8, 0, 10, 50, '[3707]3707-45-الجيزة الرئيسي'),
      createSection('CMPS450', SectionType.Tutorial, '2', DayOfWeek.Monday, 4, 0, 6, 50, '[3707]3707-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CMPS451',
    name: 'Data Mining, Big Data and Data Analytics',
    isMTHS: false,
    sections: [
      createSection('CMPS451', SectionType.Lecture, '1', DayOfWeek.Tuesday, 11, 0, 12, 50, '-----'),
      createSection('CMPS451', SectionType.Lecture, '2', DayOfWeek.Tuesday, 2, 0, 3, 50, '[3703]3703-90-الجيزة الرئيسي'),
      createSection('CMPS451', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 4, 0, 6, 50, '-----'),
      createSection('CMPS451', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 4, 0, 6, 50, '-----')
    ]
  },
  {
    code: 'CMPS453',
    name: 'Cloud Computing',
    isMTHS: false,
    sections: [
      createSection('CMPS453', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '-----'),
      createSection('CMPS453', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 8, 0, 10, 50, '-----'),
      createSection('CMPS453', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 4, 0, 6, 50, '-----')
    ]
  },
  {
    code: 'CVES125',
    name: 'Civil Engineering',
    isMTHS: false,
    sections: [
      createSection('CVES125', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[18301]18301-45-الجيزة الرئيسي'),
      createSection('CVES125', SectionType.Tutorial, '1', DayOfWeek.Thursday, 9, 0, 10, 50, '[18301]18301-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'CVES402',
    name: 'Surveying and Foundation Design',
    isMTHS: false,
    sections: [
      createSection('CVES402', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 9, 50, '[20502]20502-70-الجيزة الرئيسي'),
      createSection('CVES402', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 10, 0, 12, 50, '[20502]20502-70-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS100',
    name: 'Laboratory',
    isMTHS: false,
    sections: [
      createSection('EECS100', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 10, 50, '[20103]20103-60-الجيزة الرئيسي'),
      createSection('EECS100', SectionType.Lecture, '2', DayOfWeek.Sunday, 11, 0, 12, 50, '-----'),
      createSection('EECS100', SectionType.Tutorial, '1', DayOfWeek.Sunday, 8, 0, 10, 50, '[20104]20104-45-الجيزة الرئيسي'),
      createSection('EECS100', SectionType.Tutorial, '2', DayOfWeek.Sunday, 1, 0, 3, 50, '[20107]20107-45-الجيزة الرئيسي'),
      createSection('EECS100', SectionType.Tutorial, '3', DayOfWeek.Thursday, 8, 0, 10, 50, '[20107]20107-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS101',
    name: 'Electronics-1: Basic Electronic Circuits',
    isMTHS: false,
    sections: [
      createSection('EECS101', SectionType.Lecture, '1', DayOfWeek.Monday, 2, 0, 3, 50, '[20107]20107-45-الجيزة الرئيسي'),
      createSection('EECS101', SectionType.Lecture, '2', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20105]20105-45-الجيزة الرئيسي'),
      createSection('EECS101', SectionType.Lecture, '3', DayOfWeek.Wednesday, 2, 0, 3, 50, '[20105]20105-45-الجيزة الرئيسي'),
      createSection('EECS101', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20107]20107-45-الجيزة الرئيسي'),
      createSection('EECS101', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 9, 0, 10, 50, '[20107]20107-45-الجيزة الرئيسي'),
      createSection('EECS101', SectionType.Tutorial, '3', DayOfWeek.Monday, 11, 0, 12, 50, '[20107]20107-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS102',
    name: 'Circuits-1',
    isMTHS: false,
    sections: [
      createSection('EECS102', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[20109]20109-45-الجيزة الرئيسي'),
      createSection('EECS102', SectionType.Tutorial, '1', DayOfWeek.Sunday, 1, 0, 3, 50, '[20109]20109-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS112',
    name: 'Circuits-2',
    isMTHS: false,
    sections: [
      createSection('EECS112', SectionType.Lecture, '1', DayOfWeek.Sunday, 4, 0, 5, 50, '[20109]20109-45-الجيزة الرئيسي'),
      createSection('EECS112', SectionType.Lecture, '2', DayOfWeek.Monday, 4, 0, 5, 50, '[20109]20109-45-الجيزة الرئيسي'),
      createSection('EECS112', SectionType.Lecture, '3', DayOfWeek.Tuesday, 4, 0, 5, 50, '[20109]20109-45-الجيزة الرئيسي'),
      createSection('EECS112', SectionType.Lecture, '4', DayOfWeek.Sunday, 2, 0, 3, 50, '[20105]20105-45-الجيزة الرئيسي'),
      createSection('EECS112', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 8, 0, 10, 50, '[20105]20105-45-الجيزة الرئيسي'),
      createSection('EECS112', SectionType.Tutorial, '2', DayOfWeek.Thursday, 8, 0, 10, 50, '[20105]20105-45-الجيزة الرئيسي'),
      createSection('EECS112', SectionType.Tutorial, '3', DayOfWeek.Thursday, 1, 0, 3, 50, '[20105]20105-45-الجيزة الرئيسي'),
      createSection('EECS112', SectionType.Tutorial, '4', DayOfWeek.Thursday, 4, 0, 6, 50, '[20105]20105-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS201',
    name: 'Electronics-2: Analog and Digital Electronics',
    isMTHS: false,
    sections: [
      createSection('EECS201', SectionType.Lecture, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20109]20109-45-الجيزة الرئيسي'),
      createSection('EECS201', SectionType.Lecture, '2', DayOfWeek.Monday, 2, 0, 3, 50, '[20104]20104-45-الجيزة الرئيسي'),
      createSection('EECS201', SectionType.Tutorial, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[20104]20104-45-الجيزة الرئيسي'),
      createSection('EECS201', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 11, 0, 12, 50, '[18301]18301-45-الجيزة الرئيسي'),
      createSection('EECS201', SectionType.Lecture, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20427]20427-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS202',
    name: 'Operational Amplifiers circuits and applications',
    isMTHS: false,
    sections: [
      createSection('EECS202', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي'),
      createSection('EECS202', SectionType.Tutorial, '1', DayOfWeek.Monday, 2, 0, 3, 50, '[20506]20506-45-الجيزة الرئيسي'),
      createSection('EECS202', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20506]20506-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS203',
    name: 'Signal Analysis',
    isMTHS: false,
    sections: [
      createSection('EECS203', SectionType.Lecture, '1', DayOfWeek.Monday, 1, 0, 3, 50, '[18301]18301-45-الجيزة الرئيسي'),
      createSection('EECS203', SectionType.Lecture, '2', DayOfWeek.Monday, 8, 0, 10, 50, '[18301]18301-45-الجيزة الرئيسي'),
      createSection('EECS203', SectionType.Lecture, '3', DayOfWeek.Sunday, 8, 0, 10, 50, '[18301]18301-45-الجيزة الرئيسي'),
      createSection('EECS203', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[18301]18301-45-الجيزة الرئيسي'),
      createSection('EECS203', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 2, 0, 3, 50, '[18301]18301-45-الجيزة الرئيسي'),
      createSection('EECS203', SectionType.Tutorial, '3', DayOfWeek.Wednesday, 11, 0, 12, 50, '[18201]18201-45-الجيزة الرئيسي'),
      createSection('EECS203', SectionType.Tutorial, '4', DayOfWeek.Wednesday, 4, 0, 5, 50, '[18201]18201-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS205',
    name: 'Electromagnetics-1',
    isMTHS: false,
    sections: [
      createSection('EECS205', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[18201]18201-45-الجيزة الرئيسي'),
      createSection('EECS205', SectionType.Tutorial, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[18103]18103-30-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS301',
    name: 'Electronics-3',
    isMTHS: false,
    sections: [
      createSection('EECS301', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[20102]20102-45-الجيزة الرئيسي'),
      createSection('EECS301', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20104]20104-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS304',
    name: 'Control-1',
    isMTHS: false,
    sections: [
      createSection('EECS304', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[20503]20503-45-الجيزة الرئيسي'),
      createSection('EECS304', SectionType.Lecture, '2', DayOfWeek.Monday, 11, 0, 12, 50, '[20504]20504-60-الجيزة الرئيسي'),
      createSection('EECS304', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 8, 0, 10, 50, '[20504]20504-60-الجيزة الرئيسي'),
      createSection('EECS304', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 1, 0, 3, 50, '[20504]20504-60-الجيزة الرئيسي'),
      createSection('EECS304', SectionType.Tutorial, '3', DayOfWeek.Wednesday, 4, 0, 6, 50, '[20504]20504-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS305',
    name: 'Electromagnetics-2',
    isMTHS: false,
    sections: [
      createSection('EECS305', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[20506]20506-45-الجيزة الرئيسي'),
      createSection('EECS305', SectionType.Tutorial, '1', DayOfWeek.Thursday, 4, 0, 6, 50, '[20505]20505-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS306',
    name: 'Communications-1: Analogue Communications',
    isMTHS: false,
    sections: [
      createSection('EECS306', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[20506]20506-45-الجيزة الرئيسي'),
      createSection('EECS306', SectionType.Lecture, '2', DayOfWeek.Monday, 2, 0, 3, 50, '[20110]20110-45-الجيزة الرئيسي'),
      createSection('EECS306', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 8, 0, 10, 50, '[20110]20110-45-الجيزة الرئيسي'),
      createSection('EECS306', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 1, 0, 3, 50, '[20110]20110-45-الجيزة الرئيسي'),
      createSection('EECS306', SectionType.Tutorial, '3', DayOfWeek.Wednesday, 4, 0, 6, 50, '[20110]20110-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS316',
    name: 'Communications-2',
    isMTHS: false,
    sections: [
      createSection('EECS316', SectionType.Lecture, '1', DayOfWeek.Thursday, 9, 0, 10, 50, '[20110]20110-45-الجيزة الرئيسي'),
      createSection('EECS316', SectionType.Lecture, '2', DayOfWeek.Thursday, 11, 0, 12, 50, '[20110]20110-45-الجيزة الرئيسي'),
      createSection('EECS316', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 8, 0, 10, 50, '[20104]20104-45-الجيزة الرئيسي'),
      createSection('EECS316', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 1, 0, 3, 50, '[20108]20108-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS404',
    name: 'Control-2',
    isMTHS: false,
    sections: [
      createSection('EECS404', SectionType.Lecture, '1', DayOfWeek.Monday, 1, 0, 3, 50, '[20509]20509-45-الجيزة الرئيسي'),
      createSection('EECS404', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 4, 0, 6, 50, '[20509]20509-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS405',
    name: 'Antennas',
    isMTHS: false,
    sections: [
      createSection('EECS405', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[20509]20509-45-الجيزة الرئيسي'),
      createSection('EECS405', SectionType.Tutorial, '1', DayOfWeek.Thursday, 8, 0, 10, 50, '[20509]20509-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EECS441',
    name: 'Advanced Topics in Electronics-2',
    isMTHS: false,
    sections: [
      createSection('EECS441', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 10, 50, '-----'),
      createSection('EECS441', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 4, 0, 6, 50, '-----')
    ]
  },
  {
    code: 'EEEN380',
    name: 'Seminar-2',
    isMTHS: false,
    sections: [
      createSection('EEEN380', SectionType.Lecture, '1', DayOfWeek.Wednesday, 8, 0, 8, 50, '[20108]20108-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EEES481',
    name: 'Graduation Project-1',
    isMTHS: false,
    sections: [
      createSection('EEES481', SectionType.Lecture, '1', DayOfWeek.Sunday, 7, 0, 7, 50, '-----'),
      createSection('EEES481', SectionType.Tutorial, '1', DayOfWeek.Sunday, 8, 0, 8, 50, '-----')
    ]
  },
  {
    code: 'EEES482',
    name: 'Graduation Project-2',
    isMTHS: false,
    sections: [
      createSection('EEES482', SectionType.Lecture, '1', DayOfWeek.Thursday, 6, 0, 6, 50, '-----'),
      createSection('EEES482', SectionType.Tutorial, '1', DayOfWeek.Thursday, 7, 0, 8, 50, '-----')
    ]
  },
  {
    code: 'ELCS103',
    name: 'Circuit Analysis',
    isMTHS: false,
    sections: [
      createSection('ELCS103', SectionType.Lecture, '0', DayOfWeek.Sunday, 8, 0, 10, 50, '[20110]20110-45-الجيزة الرئيسي'),
      createSection('ELCS103', SectionType.Tutorial, '0', DayOfWeek.Monday, 2, 0, 3, 50, '[20105]20105-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'ELCS123',
    name: 'Basic Electronics and Digital Design',
    isMTHS: false,
    sections: [
      createSection('ELCS123', SectionType.Lecture, '0', DayOfWeek.Thursday, 11, 0, 12, 50, '[20105]20105-45-الجيزة الرئيسي'),
      createSection('ELCS123', SectionType.Tutorial, '0', DayOfWeek.Thursday, 2, 0, 3, 50, '[20102]20102-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EMCS001',
    name: 'Engineering Mechanics- Dynamics',
    isMTHS: false,
    sections: [
      createSection('EMCS001', SectionType.Lecture, '10', DayOfWeek.Tuesday, 8, 0, 9, 50, '[51205]51205-60-الشيخ زايد'),
      createSection('EMCS001', SectionType.Tutorial, '10', DayOfWeek.Tuesday, 10, 0, 12, 50, '[51205]51205-60-الشيخ زايد'),
      createSection('EMCS001', SectionType.Lecture, '11', DayOfWeek.Wednesday, 8, 0, 9, 50, '[51115]51115-50-الشيخ زايد'),
      createSection('EMCS001', SectionType.Tutorial, '11', DayOfWeek.Tuesday, 12, 0, 14, 50, '[51115]51115-50-الشيخ زايد')
    ]
  },
  {
    code: 'EMCS002',
    name: 'Engineering Mechanics - Statics',
    isMTHS: false,
    sections: [
      createSection('EMCS002', SectionType.Lecture, '1', DayOfWeek.Saturday, 8, 0, 9, 50, '[51201]51201-50-الشيخ زايد'),
      createSection('EMCS002', SectionType.Tutorial, '1', DayOfWeek.Monday, 8, 0, 9, 50, '[51201]51201-50-الشيخ زايد'),
      createSection('EMCS002', SectionType.Lecture, '2', DayOfWeek.Sunday, 8, 0, 9, 50, '[51202]51202-60-الشيخ زايد'),
      createSection('EMCS002', SectionType.Tutorial, '2', DayOfWeek.Saturday, 8, 0, 9, 50, '[51202]51202-60-الشيخ زايد'),
      createSection('EMCS002', SectionType.Lecture, '3', DayOfWeek.Sunday, 10, 0, 11, 50, '[51113]51113-50-الشيخ زايد'),
      createSection('EMCS002', SectionType.Tutorial, '3', DayOfWeek.Saturday, 1, 0, 2, 50, '[51113]51113-50-الشيخ زايد'),
      createSection('EMCS002', SectionType.Lecture, '4', DayOfWeek.Monday, 10, 0, 11, 50, '[51114]51114-50-الشيخ زايد'),
      createSection('EMCS002', SectionType.Tutorial, '4', DayOfWeek.Sunday, 1, 0, 2, 50, '[51114]51114-50-الشيخ زايد'),
      createSection('EMCS002', SectionType.Lecture, '5', DayOfWeek.Monday, 8, 0, 9, 50, '[51215]51215-60-الشيخ زايد'),
      createSection('EMCS002', SectionType.Tutorial, '5', DayOfWeek.Sunday, 12, 0, 13, 50, '[51215]51215-60-الشيخ زايد'),
      createSection('EMCS002', SectionType.Lecture, '6', DayOfWeek.Monday, 12, 0, 13, 50, '[51216]51216-الشيخ زايد'),
      createSection('EMCS002', SectionType.Tutorial, '6', DayOfWeek.Sunday, 8, 0, 9, 50, '[51216]51216-الشيخ زايد'),
      createSection('EMCS002', SectionType.Lecture, '7', DayOfWeek.Saturday, 10, 0, 11, 50, '[51117]51117-50-الشيخ زايد'),
      createSection('EMCS002', SectionType.Tutorial, '7', DayOfWeek.Sunday, 10, 0, 11, 50, '[51117]51117-50-الشيخ زايد'),
      createSection('EMCS002', SectionType.Lecture, '8', DayOfWeek.Saturday, 12, 0, 13, 50, '[51118]51118-50-الشيخ زايد'),
      createSection('EMCS002', SectionType.Tutorial, '8', DayOfWeek.Sunday, 8, 0, 9, 50, '[51118]51118-50-الشيخ زايد'),
      createSection('EMCS002', SectionType.Lecture, '9', DayOfWeek.Sunday, 1, 0, 2, 50, '[51119]51119-50-الشيخ زايد'),
      createSection('EMCS002', SectionType.Tutorial, '9', DayOfWeek.Monday, 1, 0, 2, 50, '[51119]51119-50-الشيخ زايد')
    ]
  },
  {
    code: 'EPES125',
    name: 'Electrical Power Engineering',
    isMTHS: false,
    sections: [
      createSection('EPES125', SectionType.Lecture, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20504]20504-60-الجيزة الرئيسي'),
      createSection('EPES125', SectionType.Lecture, '2', DayOfWeek.Tuesday, 4, 0, 5, 50, '[20504]20504-60-الجيزة الرئيسي'),
      createSection('EPES125', SectionType.Lecture, '3', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20506]20506-45-الجيزة الرئيسي'),
      createSection('EPES125', SectionType.Tutorial, '1', DayOfWeek.Sunday, 1, 0, 3, 50, '[20506]20506-45-الجيزة الرئيسي'),
      createSection('EPES125', SectionType.Tutorial, '2', DayOfWeek.Sunday, 4, 0, 6, 50, '[20506]20506-45-الجيزة الرئيسي'),
      createSection('EPES125', SectionType.Tutorial, '3', DayOfWeek.Sunday, 8, 0, 10, 50, '[20503]20503-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES200',
    name: 'Basic Laboratory',
    isMTHS: false,
    sections: [
      createSection('EPES200', SectionType.Lecture, '1', DayOfWeek.Monday, 4, 0, 4, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي'),
      createSection('EPES200', SectionType.Tutorial, '1', DayOfWeek.Monday, 1, 0, 3, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي'),
      createSection('EPES200', SectionType.Lecture, '2', DayOfWeek.Tuesday, 4, 0, 4, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي'),
      createSection('EPES200', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 1, 0, 3, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES201',
    name: 'Electrical Engineering Fundamentals',
    isMTHS: false,
    sections: [
      createSection('EPES201', SectionType.Lecture, '1', DayOfWeek.Monday, 2, 0, 3, 50, '[14501]14501-50-الجيزة الرئيسي'),
      createSection('EPES201', SectionType.Tutorial, '1', DayOfWeek.Thursday, 4, 0, 6, 50, '[14501]14501-50-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES203',
    name: 'Electromagnetic Fields',
    isMTHS: false,
    sections: [
      createSection('EPES203', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[20503]20503-45-الجيزة الرئيسي'),
      createSection('EPES203', SectionType.Tutorial, '1', DayOfWeek.Thursday, 2, 0, 3, 50, '[20503]20503-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES204',
    name: 'Energy Conversion',
    isMTHS: false,
    sections: [
      createSection('EPES204', SectionType.Lecture, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20503]20503-45-الجيزة الرئيسي'),
      createSection('EPES204', SectionType.Tutorial, '1', DayOfWeek.Monday, 4, 0, 6, 50, '[20509]20509-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES301',
    name: 'Electrical Machines-1',
    isMTHS: false,
    sections: [
      createSection('EPES301', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[20503]20503-45-الجيزة الرئيسي'),
      createSection('EPES301', SectionType.Tutorial, '1', DayOfWeek.Thursday, 4, 0, 6, 50, '[20503]20503-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES302',
    name: 'Elements of Power Systems',
    isMTHS: false,
    sections: [
      createSection('EPES302', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[18201]18201-45-الجيزة الرئيسي'),
      createSection('EPES302', SectionType.Tutorial, '1', DayOfWeek.Thursday, 2, 0, 3, 50, '[18201]18201-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES303',
    name: 'Electric Drive Systems',
    isMTHS: false,
    sections: [
      createSection('EPES303', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 10, 50, '[14501]14501-50-الجيزة الرئيسي'),
      createSection('EPES303', SectionType.Lecture, '2', DayOfWeek.Monday, 2, 0, 3, 50, '[14503]14503-50-الجيزة الرئيسي'),
      createSection('EPES303', SectionType.Tutorial, '1', DayOfWeek.Monday, 4, 0, 6, 50, '[14503]14503-50-الجيزة الرئيسي'),
      createSection('EPES303', SectionType.Tutorial, '2', DayOfWeek.Thursday, 4, 0, 6, 50, '[14503]14503-50-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES304',
    name: 'Electrical Machines-2',
    isMTHS: false,
    sections: [
      createSection('EPES304', SectionType.Lecture, '1', DayOfWeek.Monday, 4, 0, 5, 50, '[20512]20512-45-الجيزة الرئيسي'),
      createSection('EPES304', SectionType.Tutorial, '1', DayOfWeek.Thursday, 1, 0, 3, 50, '[20512]20512-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES306',
    name: 'Power Electronics (1)',
    isMTHS: false,
    sections: [
      createSection('EPES306', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20512]20512-45-الجيزة الرئيسي'),
      createSection('EPES306', SectionType.Tutorial, '1', DayOfWeek.Sunday, 4, 0, 5, 50, '[20512]20512-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES307',
    name: 'Electrical Measurements',
    isMTHS: false,
    sections: [
      createSection('EPES307', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي'),
      createSection('EPES307', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 8, 0, 10, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي'),
      createSection('EPES307', SectionType.Lecture, '2', DayOfWeek.Sunday, 2, 0, 3, 50, '[20505]20505-45-الجيزة الرئيسي'),
      createSection('EPES307', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 1, 0, 3, 50, '[20512]20512-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES308',
    name: 'Automatic Control Systems',
    isMTHS: false,
    sections: [
      createSection('EPES308', SectionType.Lecture, '1', DayOfWeek.Thursday, 9, 0, 10, 50, '[20503]20503-45-الجيزة الرئيسي'),
      createSection('EPES308', SectionType.Tutorial, '1', DayOfWeek.Monday, 9, 0, 10, 50, '[20503]20503-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES311',
    name: 'Microprocessors Applications',
    isMTHS: false,
    sections: [
      createSection('EPES311', SectionType.Lecture, '1', DayOfWeek.Monday, 8, 0, 10, 50, '[20505]20505-45-الجيزة الرئيسي'),
      createSection('EPES311', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 1, 0, 3, 50, '[20505]20505-45-الجيزة الرئيسي'),
      createSection('EPES311', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 4, 0, 6, 50, '[20505]20505-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES402',
    name: 'Power System Analysis',
    isMTHS: false,
    sections: [
      createSection('EPES402', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي'),
      createSection('EPES402', SectionType.Tutorial, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES403',
    name: 'Power System Protection',
    isMTHS: false,
    sections: [
      createSection('EPES403', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[20512]20512-45-الجيزة الرئيسي'),
      createSection('EPES403', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[18201]18201-45-الجيزة الرئيسي'),
      createSection('EPES403', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 9, 0, 10, 50, '[20512]20512-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES404',
    name: 'Digital Control Systems',
    isMTHS: false,
    sections: [
      createSection('EPES404', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 10, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي'),
      createSection('EPES404', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 1, 0, 3, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي'),
      createSection('EPES404', SectionType.Lecture, '2', DayOfWeek.Monday, 2, 0, 3, 50, '[20505]20505-45-الجيزة الرئيسي'),
      createSection('EPES404', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 4, 0, 6, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES405',
    name: 'Power Electronics (2)',
    isMTHS: false,
    sections: [
      createSection('EPES405', SectionType.Lecture, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20511]20511-45-الجيزة الرئيسي'),
      createSection('EPES405', SectionType.Tutorial, '1', DayOfWeek.Monday, 2, 0, 3, 50, '[20511]20511-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES406',
    name: 'High Voltage Engineering',
    isMTHS: false,
    sections: [
      createSection('EPES406', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[20505]20505-45-الجيزة الرئيسي'),
      createSection('EPES406', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 2, 0, 3, 50, '[20505]20505-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES412',
    name: 'Electrical Power Distribution',
    isMTHS: false,
    sections: [
      createSection('EPES412', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[20505]20505-45-الجيزة الرئيسي'),
      createSection('EPES412', SectionType.Tutorial, '1', DayOfWeek.Thursday, 2, 0, 3, 50, '[20505]20505-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES416',
    name: 'Power Stations',
    isMTHS: false,
    sections: [
      createSection('EPES416', SectionType.Lecture, '1', DayOfWeek.Thursday, 11, 0, 12, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي'),
      createSection('EPES416', SectionType.Tutorial, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[20503]20503-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES417',
    name: 'Renewable Energy Systems',
    isMTHS: false,
    sections: [
      createSection('EPES417', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[18102]18102-60-الجيزة الرئيسي'),
      createSection('EPES417', SectionType.Tutorial, '1', DayOfWeek.Thursday, 4, 0, 5, 50, '[18102]18102-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES421',
    name: 'Electrical Machines Drives',
    isMTHS: false,
    sections: [
      createSection('EPES421', SectionType.Lecture, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي'),
      createSection('EPES421', SectionType.Tutorial, '1', DayOfWeek.Monday, 4, 0, 5, 50, '[20503]20503-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES426',
    name: 'Computer Control in Energy Systems',
    isMTHS: false,
    sections: [
      createSection('EPES426', SectionType.Lecture, '1', DayOfWeek.Tuesday, 11, 0, 12, 50, '[18202]18202-60-الجيزة الرئيسي'),
      createSection('EPES426', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[18202]18202-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES428',
    name: 'Power System Operation and Control',
    isMTHS: false,
    sections: [
      createSection('EPES428', SectionType.Lecture, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[20509]20509-45-الجيزة الرئيسي'),
      createSection('EPES428', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20509]20509-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES430',
    name: 'Operations Research',
    isMTHS: false,
    sections: [
      createSection('EPES430', SectionType.Lecture, '1', DayOfWeek.Thursday, 9, 0, 10, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي'),
      createSection('EPES430', SectionType.Tutorial, '1', DayOfWeek.Sunday, 4, 0, 5, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي'),
      createSection('EPES430', SectionType.Tutorial, '2', DayOfWeek.Thursday, 2, 0, 3, 50, '[9301] ELC. Bulding -45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'EPES450',
    name: 'Programmable Logic Controllers',
    isMTHS: false,
    sections: [
      createSection('EPES450', SectionType.Lecture, '1', DayOfWeek.Wednesday, 2, 0, 3, 50, '[14502]14502-30-الجيزة الرئيسي'),
      createSection('EPES450', SectionType.Lecture, '2', DayOfWeek.Wednesday, 4, 0, 5, 50, '[14502]14502-30-الجيزة الرئيسي'),
      createSection('EPES450', SectionType.Tutorial, '1', DayOfWeek.Thursday, 1, 0, 3, 50, '[14502]14502-30-الجيزة الرئيسي'),
      createSection('EPES450', SectionType.Tutorial, '2', DayOfWeek.Thursday, 4, 0, 6, 50, '[14502]14502-30-الجيزة الرئيسي')
    ]
  },
  {
    code: 'GENS002',
    name: 'Societal Issues',
    isMTHS: false,
    sections: [
      createSection('GENS002', SectionType.Lecture, '1', DayOfWeek.Saturday, 12, 0, 13, 50, '[51201]51201-50-الشيخ زايد'),
      createSection('GENS002', SectionType.Lecture, '2', DayOfWeek.Sunday, 12, 0, 13, 50, '[51202]51202-60-الشيخ زايد'),
      createSection('GENS002', SectionType.Lecture, '3', DayOfWeek.Monday, 10, 0, 11, 50, '[51113]51113-50-الشيخ زايد'),
      createSection('GENS002', SectionType.Lecture, '4', DayOfWeek.Monday, 12, 0, 13, 50, '[51114]51114-50-الشيخ زايد'),
      createSection('GENS002', SectionType.Lecture, '5', DayOfWeek.Sunday, 8, 0, 9, 50, '[51215]51215-60-الشيخ زايد'),
      createSection('GENS002', SectionType.Lecture, '6', DayOfWeek.Monday, 8, 0, 9, 50, '[51216]51216-الشيخ زايد'),
      createSection('GENS002', SectionType.Lecture, '7', DayOfWeek.Saturday, 8, 0, 9, 50, '[51117]51117-50-الشيخ زايد'),
      createSection('GENS002', SectionType.Lecture, '8', DayOfWeek.Saturday, 10, 0, 11, 50, '[51118]51118-50-الشيخ زايد')
    ]
  },
  {
    code: 'GENS005',
    name: 'Writing and Presentation Skills',
    isMTHS: false,
    sections: [
      createSection('GENS005', SectionType.Lecture, '1', DayOfWeek.Saturday, 10, 0, 11, 50, '[51201]51201-50-الشيخ زايد'),
      createSection('GENS005', SectionType.Lecture, '2', DayOfWeek.Monday, 1, 0, 2, 50, '[51202]51202-60-الشيخ زايد'),
      createSection('GENS005', SectionType.Lecture, '3', DayOfWeek.Sunday, 8, 0, 9, 50, '[51113]51113-50-الشيخ زايد'),
      createSection('GENS005', SectionType.Lecture, '4', DayOfWeek.Sunday, 11, 0, 12, 50, '[51114]51114-50-الشيخ زايد'),
      createSection('GENS005', SectionType.Lecture, '5', DayOfWeek.Saturday, 8, 0, 9, 50, '[51215]51215-60-الشيخ زايد'),
      createSection('GENS005', SectionType.Lecture, '6', DayOfWeek.Saturday, 1, 0, 2, 50, '[51216]51216-الشيخ زايد'),
      createSection('GENS005', SectionType.Lecture, '7', DayOfWeek.Monday, 11, 0, 12, 50, '[51117]51117-50-الشيخ زايد'),
      createSection('GENS005', SectionType.Lecture, '8', DayOfWeek.Sunday, 1, 0, 2, 50, '[51118]51118-50-الشيخ زايد')
    ]
  },
  {
    code: 'GENS110',
    name: 'Fundamentals of Management, Risk and Environment',
    isMTHS: false,
    sections: [
      createSection('GENS110', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[20103]20103-60-الجيزة الرئيسي'),
      createSection('GENS110', SectionType.Lecture, '2', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20103]20103-60-الجيزة الرئيسي'),
      createSection('GENS110', SectionType.Lecture, '3', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20103]20103-60-الجيزة الرئيسي'),
      createSection('GENS110', SectionType.Lecture, '4', DayOfWeek.Thursday, 9, 0, 10, 50, '[20103]20103-60-الجيزة الرئيسي'),
      createSection('GENS110', SectionType.Lecture, '5', DayOfWeek.Thursday, 11, 0, 12, 50, '[20103]20103-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'GENS120',
    name: 'Fundamentals of Economics and Accounting',
    isMTHS: false,
    sections: [
      createSection('GENS120', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20109]20109-45-الجيزة الرئيسي'),
      createSection('GENS120', SectionType.Lecture, '2', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20109]20109-45-الجيزة الرئيسي'),
      createSection('GENS120', SectionType.Lecture, '3', DayOfWeek.Thursday, 9, 0, 10, 50, '[20109]20109-45-الجيزة الرئيسي'),
      createSection('GENS120', SectionType.Lecture, '4', DayOfWeek.Thursday, 11, 0, 12, 50, '[20109]20109-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'GENS202',
    name: 'Advanced Critical Thinking',
    isMTHS: false,
    sections: [
      createSection('GENS202', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[20102]20102-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'GENS203',
    name: 'Entrepreneurship',
    isMTHS: false,
    sections: [
      createSection('GENS203', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[20102]20102-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'GENS207',
    name: 'Foreign Language',
    isMTHS: false,
    sections: [
      createSection('GENS207', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20102]20102-45-الجيزة الرئيسي'),
      createSection('GENS207', SectionType.Lecture, '2', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20102]20102-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'GENS208',
    name: 'Marketing',
    isMTHS: false,
    sections: [
      createSection('GENS208', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20105]20105-45-الجيزة الرئيسي'),
      createSection('GENS208', SectionType.Lecture, '2', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20105]20105-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'GENS209',
    name: 'Selections of Life Long Skills',
    isMTHS: false,
    sections: [
      createSection('GENS209', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[20103]20103-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'GENS236',
    name: 'Service Management',
    isMTHS: false,
    sections: [
      createSection('GENS236', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[20107]20107-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'IEMS482',
    name: 'Graduation Project-2',
    isMTHS: false,
    sections: [
      createSection('IEMS482', SectionType.Lecture, '1', DayOfWeek.Monday, 4, 0, 4, 50, '-----'),
      createSection('IEMS482', SectionType.Tutorial, '1', DayOfWeek.Monday, 5, 0, 6, 50, '-----')
    ]
  },
  {
    code: 'IHDN304',
    name: 'International Law of Water and Environment',
    isMTHS: false,
    sections: [
      createSection('IHDN304', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[20107]20107-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'IHDS201',
    name: 'Fluid Mechanics',
    isMTHS: false,
    sections: [
      createSection('IHDS201', SectionType.Lecture, '1', DayOfWeek.Monday, 2, 0, 3, 50, '[20102]20102-45-الجيزة الرئيسي'),
      createSection('IHDS201', SectionType.Tutorial, '1', DayOfWeek.Monday, 4, 0, 5, 50, '[20102]20102-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'IHDS401',
    name: 'Coastal and Harbor Engineering',
    isMTHS: false,
    sections: [
      createSection('IHDS401', SectionType.Lecture, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[20110]20110-45-الجيزة الرئيسي'),
      createSection('IHDS401', SectionType.Tutorial, '1', DayOfWeek.Sunday, 4, 0, 6, 50, '[20110]20110-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'IHDS408',
    name: 'International Law of Water and Environment',
    isMTHS: false,
    sections: [
      createSection('IHDS408', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 9, 50, '[20109]20109-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'IHDS409',
    name: 'River Engineering',
    isMTHS: false,
    sections: [
      createSection('IHDS409', SectionType.Lecture, '1', DayOfWeek.Wednesday, 1, 0, 3, 50, '[20503]20503-45-الجيزة الرئيسي'),
      createSection('IHDS409', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 4, 0, 5, 50, '[20503]20503-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'INTS001',
    name: 'Engineering Graphics',
    isMTHS: false,
    sections: [
      createSection('INTS001', SectionType.Lecture, '2', DayOfWeek.Monday, 8, 0, 9, 50, '[51220]51220-صالة رسم-الشيخ زايد'),
      createSection('INTS001', SectionType.Tutorial, '2', DayOfWeek.Monday, 10, 0, 12, 50, '[51220]51220-صالة رسم-الشيخ زايد'),
      createSection('INTS001', SectionType.Lecture, '4', DayOfWeek.Saturday, 8, 0, 9, 50, '[51219]51219-صالة رسم-الشيخ زايد'),
      createSection('INTS001', SectionType.Tutorial, '4', DayOfWeek.Saturday, 10, 0, 12, 50, '[51219]51219-صالة رسم-الشيخ زايد'),
      createSection('INTS001', SectionType.Lecture, '6', DayOfWeek.Saturday, 8, 0, 9, 50, '[51220]51220-صالة رسم-الشيخ زايد'),
      createSection('INTS001', SectionType.Tutorial, '6', DayOfWeek.Saturday, 10, 0, 12, 50, '[51220]51220-صالة رسم-الشيخ زايد'),
      createSection('INTS001', SectionType.Lecture, '8', DayOfWeek.Monday, 8, 0, 9, 50, '[51219]51219-صالة رسم-الشيخ زايد'),
      createSection('INTS001', SectionType.Tutorial, '8', DayOfWeek.Monday, 10, 0, 12, 50, '[51219]51219-صالة رسم-الشيخ زايد')
    ]
  },
  {
    code: 'INTS005',
    name: 'Information Technology',
    isMTHS: false,
    sections: [
      createSection('INTS005', SectionType.Lecture, '10', DayOfWeek.Monday, 11, 0, 11, 50, '[51213]LAB 1 (Zayed)-30-الشيخ زايد'),
      createSection('INTS005', SectionType.Tutorial, '10', DayOfWeek.Monday, 12, 0, 14, 50, '[51213]LAB 1 (Zayed)-30-الشيخ زايد')
    ]
  },
  {
    code: 'INTS125',
    name: 'Introduction to Mechanical Engineering',
    isMTHS: false,
    sections: [
      createSection('INTS125', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[18302]18302-60-الجيزة الرئيسي'),
      createSection('INTS125', SectionType.Lecture, '2', DayOfWeek.Tuesday, 11, 0, 12, 50, '[18302]18302-60-الجيزة الرئيسي'),
      createSection('INTS125', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 1, 0, 3, 50, '[18302]18302-60-الجيزة الرئيسي'),
      createSection('INTS125', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 4, 0, 6, 50, '[20512]20512-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'INTS203',
    name: 'Electromechanical Systems for Civil Engineers',
    isMTHS: false,
    sections: [
      createSection('INTS203', SectionType.Lecture, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[20102]20102-45-الجيزة الرئيسي'),
      createSection('INTS203', SectionType.Tutorial, '1', DayOfWeek.Sunday, 4, 0, 5, 50, '[20102]20102-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MCNS101',
    name: 'Thermodynamics',
    isMTHS: false,
    sections: [
      createSection('MCNS101', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[14501]14501-50-الجيزة الرئيسي'),
      createSection('MCNS101', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 4, 0, 5, 50, '[14501]14501-50-الجيزة الرئيسي'),
      createSection('MCNS101', SectionType.Lecture, '2', DayOfWeek.Tuesday, 9, 0, 10, 50, '[14501]14501-50-الجيزة الرئيسي'),
      createSection('MCNS101', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20510]20510-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MCNS202',
    name: 'Fluid Mechanics',
    isMTHS: false,
    sections: [
      createSection('MCNS202', SectionType.Lecture, '1', DayOfWeek.Thursday, 2, 0, 3, 50, '[14501]14501-50-الجيزة الرئيسي'),
      createSection('MCNS202', SectionType.Tutorial, '1', DayOfWeek.Thursday, 11, 0, 12, 50, '[14501]14501-50-الجيزة الرئيسي'),
      createSection('MCNS202', SectionType.Lecture, '2', DayOfWeek.Tuesday, 11, 0, 12, 50, '[14503]14503-50-الجيزة الرئيسي'),
      createSection('MCNS202', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 4, 0, 5, 50, '[14503]14503-50-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MCNS326',
    name: 'Heat Transfer',
    isMTHS: false,
    sections: [
      createSection('MCNS326', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[14501]14501-50-الجيزة الرئيسي'),
      createSection('MCNS326', SectionType.Lecture, '2', DayOfWeek.Monday, 2, 0, 3, 50, '[14502]14502-30-الجيزة الرئيسي'),
      createSection('MCNS326', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[14502]14502-30-الجيزة الرئيسي'),
      createSection('MCNS326', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 9, 0, 10, 50, '[14502]14502-30-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDES280',
    name: 'Engineering Seminar',
    isMTHS: false,
    sections: [
      createSection('MDES280', SectionType.Lecture, '1', DayOfWeek.Sunday, 4, 0, 4, 50, '[20510]20510-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDES481',
    name: 'Graduation Project-1',
    isMTHS: false,
    sections: [
      createSection('MDES481', SectionType.Lecture, '1', DayOfWeek.Monday, 4, 0, 4, 50, '-----'),
      createSection('MDES481', SectionType.Tutorial, '1', DayOfWeek.Monday, 5, 0, 5, 50, '-----')
    ]
  },
  {
    code: 'MDES482',
    name: 'Graduation Project-2',
    isMTHS: false,
    sections: [
      createSection('MDES482', SectionType.Lecture, '1', DayOfWeek.Monday, 4, 0, 4, 50, '-----'),
      createSection('MDES482', SectionType.Tutorial, '1', DayOfWeek.Monday, 5, 0, 6, 50, '-----')
    ]
  },
  {
    code: 'MDPS001',
    name: 'Fundamentals of Manufacturing Engineering',
    isMTHS: false,
    sections: [
      createSection('MDPS001', SectionType.Lecture, '11', DayOfWeek.Wednesday, 11, 0, 11, 50, '[51206]51206-60-الشيخ زايد'),
      createSection('MDPS001', SectionType.Tutorial, '11', DayOfWeek.Wednesday, 12, 0, 14, 50, '[51206]51206-60-الشيخ زايد')
    ]
  },
  {
    code: 'MDPS133',
    name: 'Materials for Mechatronics',
    isMTHS: false,
    sections: [
      createSection('MDPS133', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[14502]14502-30-الجيزة الرئيسي'),
      createSection('MDPS133', SectionType.Lecture, '2', DayOfWeek.Wednesday, 2, 0, 3, 50, '[14501]14501-50-الجيزة الرئيسي'),
      createSection('MDPS133', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 4, 0, 6, 50, '[14501]14501-50-الجيزة الرئيسي'),
      createSection('MDPS133', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 4, 0, 6, 50, '[14503]14503-50-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS232',
    name: 'Engineering Materials',
    isMTHS: false,
    sections: [
      createSection('MDPS232', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[14501]14501-50-الجيزة الرئيسي'),
      createSection('MDPS232', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[14501]14501-50-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS241',
    name: 'Manufacturing Processes I',
    isMTHS: false,
    sections: [
      createSection('MDPS241', SectionType.Lecture, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[14501]14501-50-الجيزة الرئيسي'),
      createSection('MDPS241', SectionType.Tutorial, '1', DayOfWeek.Monday, 8, 0, 10, 50, '[14503]14503-50-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS242',
    name: 'Manufacturing Processes II',
    isMTHS: false,
    sections: [
      createSection('MDPS242', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[14503]14503-50-الجيزة الرئيسي'),
      createSection('MDPS242', SectionType.Lecture, '2', DayOfWeek.Thursday, 9, 0, 10, 50, '[14503]14503-50-الجيزة الرئيسي'),
      createSection('MDPS242', SectionType.Tutorial, '1', DayOfWeek.Sunday, 8, 0, 10, 50, '[14501]14501-50-الجيزة الرئيسي'),
      createSection('MDPS242', SectionType.Tutorial, '2', DayOfWeek.Thursday, 8, 0, 10, 50, '[14501]14501-50-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS251',
    name: 'Kinematics of Machine Components',
    isMTHS: false,
    sections: [
      createSection('MDPS251', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[14503]14503-50-الجيزة الرئيسي'),
      createSection('MDPS251', SectionType.Lecture, '2', DayOfWeek.Wednesday, 11, 0, 12, 50, '[14503]14503-50-الجيزة الرئيسي'),
      createSection('MDPS251', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 1, 0, 3, 50, '[14503]14503-50-الجيزة الرئيسي'),
      createSection('MDPS251', SectionType.Tutorial, '2', DayOfWeek.Thursday, 1, 0, 3, 50, '[14503]14503-50-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS261',
    name: 'Stress Analysis',
    isMTHS: false,
    sections: [
      createSection('MDPS261', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[14501]14501-50-الجيزة الرئيسي'),
      createSection('MDPS261', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[14503]14503-50-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS352',
    name: 'Machine Design',
    isMTHS: false,
    sections: [
      createSection('MDPS352', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 10, 50, '[14300]14300-60-الجيزة الرئيسي'),
      createSection('MDPS352', SectionType.Lecture, '2', DayOfWeek.Monday, 11, 0, 12, 50, '[14300]14300-60-الجيزة الرئيسي'),
      createSection('MDPS352', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 1, 0, 3, 50, '[14300]14300-60-الجيزة الرئيسي'),
      createSection('MDPS352', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 4, 0, 6, 50, '[14300]14300-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS354',
    name: 'Machine and System Design',
    isMTHS: false,
    sections: [
      createSection('MDPS354', SectionType.Lecture, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[14503]14503-50-الجيزة الرئيسي'),
      createSection('MDPS354', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 2, 0, 5, 50, '[14300]14300-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS355',
    name: 'Dynamics of Machine Components',
    isMTHS: false,
    sections: [
      createSection('MDPS355', SectionType.Lecture, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20506]20506-45-الجيزة الرئيسي'),
      createSection('MDPS355', SectionType.Tutorial, '1', DayOfWeek.Thursday, 4, 0, 6, 50, '[20506]20506-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS371',
    name: 'Mechanical Vibrations',
    isMTHS: false,
    sections: [
      createSection('MDPS371', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[14502]14502-30-الجيزة الرئيسي'),
      createSection('MDPS371', SectionType.Tutorial, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[14502]14502-30-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS372',
    name: 'Control System Dynamics',
    isMTHS: false,
    sections: [
      createSection('MDPS372', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[14300]14300-60-الجيزة الرئيسي'),
      createSection('MDPS372', SectionType.Lecture, '2', DayOfWeek.Sunday, 11, 0, 12, 50, '[14300]14300-60-الجيزة الرئيسي'),
      createSection('MDPS372', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 4, 0, 6, 50, '[20509]20509-45-الجيزة الرئيسي'),
      createSection('MDPS372', SectionType.Tutorial, '2', DayOfWeek.Thursday, 4, 0, 6, 50, '[20509]20509-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS374',
    name: 'Design of Mechatronics Systems',
    isMTHS: false,
    sections: [
      createSection('MDPS374', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 11, 50, '[18302]18302-60-الجيزة الرئيسي'),
      createSection('MDPS374', SectionType.Lecture, '2', DayOfWeek.Sunday, 11, 0, 13, 50, '[18301]18301-45-الجيزة الرئيسي'),
      createSection('MDPS374', SectionType.Tutorial, '1', DayOfWeek.Thursday, 10, 0, 12, 50, '[18302]18302-60-الجيزة الرئيسي'),
      createSection('MDPS374', SectionType.Tutorial, '2', DayOfWeek.Thursday, 1, 0, 3, 50, '[18302]18302-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS381',
    name: 'Fundamentals of Industrial Engineering',
    isMTHS: false,
    sections: [
      createSection('MDPS381', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[20321]20321-32-الجيزة الرئيسي'),
      createSection('MDPS381', SectionType.Tutorial, '1', DayOfWeek.Sunday, 1, 0, 3, 50, '[20321]20321-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS397',
    name: 'Safety Engineering',
    isMTHS: false,
    sections: [
      createSection('MDPS397', SectionType.Lecture, '1', DayOfWeek.Thursday, 9, 0, 10, 50, '[20321]20321-32-الجيزة الرئيسي'),
      createSection('MDPS397', SectionType.Tutorial, '1', DayOfWeek.Thursday, 11, 0, 12, 50, '[20321]20321-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS399',
    name: 'Product Development and Innovation',
    isMTHS: false,
    sections: [
      createSection('MDPS399', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[20322]20322-32-الجيزة الرئيسي'),
      createSection('MDPS399', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 2, 0, 3, 50, '[20322]20322-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS457',
    name: 'Fluid Power Systems',
    isMTHS: false,
    sections: [
      createSection('MDPS457', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[20511]20511-45-الجيزة الرئيسي'),
      createSection('MDPS457', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 2, 0, 3, 50, '[20511]20511-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS464',
    name: 'Failure Analysis',
    isMTHS: false,
    sections: [
      createSection('MDPS464', SectionType.Lecture, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[20511]20511-45-الجيزة الرئيسي'),
      createSection('MDPS464', SectionType.Tutorial, '1', DayOfWeek.Sunday, 4, 0, 5, 50, '[20511]20511-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS473',
    name: 'Automatic Control I',
    isMTHS: false,
    sections: [
      createSection('MDPS473', SectionType.Lecture, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20107]20107-45-الجيزة الرئيسي'),
      createSection('MDPS473', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[20107]20107-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS482',
    name: 'Quality Management',
    isMTHS: false,
    sections: [
      createSection('MDPS482', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20322]20322-32-الجيزة الرئيسي'),
      createSection('MDPS482', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20322]20322-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS483',
    name: 'System Modeling and Simulation',
    isMTHS: false,
    sections: [
      createSection('MDPS483', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[20322]20322-32-الجيزة الرئيسي'),
      createSection('MDPS483', SectionType.Tutorial, '1', DayOfWeek.Monday, 1, 0, 3, 50, '[20322]20322-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS493',
    name: 'Industrial Management',
    isMTHS: false,
    sections: [
      createSection('MDPS493', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 10, 50, '[20321]20321-32-الجيزة الرئيسي'),
      createSection('MDPS493', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 4, 0, 5, 50, '[20321]20321-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MDPS497',
    name: 'Lean Manufacturing and Six Sigma',
    isMTHS: false,
    sections: [
      createSection('MDPS497', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[20321]20321-32-الجيزة الرئيسي'),
      createSection('MDPS497', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[20321]20321-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MEES280',
    name: 'Engineering Seminar',
    isMTHS: false,
    sections: [
      createSection('MEES280', SectionType.Lecture, '1', DayOfWeek.Sunday, 4, 0, 4, 50, '[20108]20108-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MEES481',
    name: 'Graduation Project-1',
    isMTHS: false,
    sections: [
      createSection('MEES481', SectionType.Lecture, '1', DayOfWeek.Monday, 4, 0, 4, 50, '-----'),
      createSection('MEES481', SectionType.Tutorial, '1', DayOfWeek.Monday, 5, 0, 5, 50, '-----')
    ]
  },
  {
    code: 'MEES482',
    name: 'Graduation Project-2',
    isMTHS: false,
    sections: [
      createSection('MEES482', SectionType.Lecture, '1', DayOfWeek.Monday, 4, 0, 4, 50, '-----'),
      createSection('MEES482', SectionType.Tutorial, '1', DayOfWeek.Monday, 5, 0, 6, 50, '-----')
    ]
  },
  {
    code: 'MEPS209',
    name: 'Engineering Thermodynamics',
    isMTHS: false,
    sections: [
      createSection('MEPS209', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[0]17101-0-الجيزة الرئيسي'),
      createSection('MEPS209', SectionType.Tutorial, '1', DayOfWeek.Monday, 11, 0, 13, 50, '[0]17101-0-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MEPS219',
    name: 'Mechanical Power Engineering',
    isMTHS: false,
    sections: [
      createSection('MEPS219', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[20503]20503-45-الجيزة الرئيسي'),
      createSection('MEPS219', SectionType.Tutorial, '1', DayOfWeek.Thursday, 9, 0, 10, 50, '[20505]20505-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MEPS224',
    name: 'Intermediate Fluid Mechanics',
    isMTHS: false,
    sections: [
      createSection('MEPS224', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 10, 50, '[0]17101-0-الجيزة الرئيسي'),
      createSection('MEPS224', SectionType.Tutorial, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[20104]20104-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MEPS231',
    name: 'Laboratory of Mechanical Engineering',
    isMTHS: false,
    sections: [
      createSection('MEPS231', SectionType.Lecture, '1', DayOfWeek.Tuesday, 4, 0, 5, 50, '[0]17101-0-الجيزة الرئيسي'),
      createSection('MEPS231', SectionType.Tutorial, '1', DayOfWeek.Thursday, 1, 0, 3, 50, '[0]17101-0-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MEPS309',
    name: 'Thermal Design of Energy Facilities',
    isMTHS: false,
    sections: [
      createSection('MEPS309', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[20102]20102-45-الجيزة الرئيسي'),
      createSection('MEPS309', SectionType.Tutorial, '1', DayOfWeek.Monday, 1, 0, 3, 50, '[20103]20103-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MEPS316',
    name: 'Air and Water Pollution and Quality Monitoring',
    isMTHS: false,
    sections: [
      createSection('MEPS316', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[0]17101-0-الجيزة الرئيسي'),
      createSection('MEPS316', SectionType.Tutorial, '1', DayOfWeek.Monday, 4, 0, 5, 50, '[0]17101-0-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MEPS320',
    name: 'Fundamentals and Applications of Solar Energy',
    isMTHS: false,
    sections: [
      createSection('MEPS320', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[0]17101-0-الجيزة الرئيسي'),
      createSection('MEPS320', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 4, 0, 6, 50, '[20102]20102-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MEPS332',
    name: 'Laboratory of Energy Systems',
    isMTHS: false,
    sections: [
      createSection('MEPS332', SectionType.Lecture, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20102]20102-45-الجيزة الرئيسي'),
      createSection('MEPS332', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20104]20104-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MEPS413',
    name: 'Industrial Process Heating and Cooling',
    isMTHS: false,
    sections: [
      createSection('MEPS413', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[0]17101-0-الجيزة الرئيسي'),
      createSection('MEPS413', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[20102]20102-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MEPS421',
    name: 'Fundamentals of Refrigeration and Air Conditioning Design',
    isMTHS: false,
    sections: [
      createSection('MEPS421', SectionType.Lecture, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[20103]20103-60-الجيزة الرئيسي'),
      createSection('MEPS421', SectionType.Tutorial, '1', DayOfWeek.Sunday, 4, 0, 5, 50, '[20103]20103-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MEPS430',
    name: 'Wind Energy Systems Design',
    isMTHS: false,
    sections: [
      createSection('MEPS430', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[20104]20104-45-الجيزة الرئيسي'),
      createSection('MEPS430', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 2, 0, 3, 50, '[20104]20104-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MEPS436',
    name: 'Fundamentals of Turbomachinery',
    isMTHS: false,
    sections: [
      createSection('MEPS436', SectionType.Lecture, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[0]17101-0-الجيزة الرئيسي'),
      createSection('MEPS436', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 4, 0, 5, 50, '[0]17101-0-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MEPS438',
    name: 'Hydrogen technologies for a sustainable energy system',
    isMTHS: false,
    sections: [
      createSection('MEPS438', SectionType.Lecture, '1', DayOfWeek.Thursday, 11, 0, 12, 50, '[20512]20512-45-الجيزة الرئيسي'),
      createSection('MEPS438', SectionType.Tutorial, '1', DayOfWeek.Thursday, 2, 0, 3, 50, '[20511]20511-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'METS401',
    name: 'Electrochemistry and Corrosion',
    isMTHS: false,
    sections: [
      createSection('METS401', SectionType.Lecture, '1', DayOfWeek.Thursday, 11, 0, 12, 50, '[20427]20427-32-الجيزة الرئيسي'),
      createSection('METS401', SectionType.Tutorial, '1', DayOfWeek.Thursday, 1, 0, 3, 50, '[20427]20427-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MTHS002',
    name: 'Calculus I',
    isMTHS: true,
    sections: [
      createSection('MTHS002', SectionType.Lecture, '10', DayOfWeek.Tuesday, 1, 0, 2, 50, '[51205]51205-60-الشيخ زايد'),
      createSection('MTHS002', SectionType.Tutorial, '10', DayOfWeek.Wednesday, 10, 0, 12, 50, '[51205]51205-60-الشيخ زايد'),
      createSection('MTHS002', SectionType.Lecture, '11', DayOfWeek.Tuesday, 10, 0, 11, 50, '[51115]51115-50-الشيخ زايد'),
      createSection('MTHS002', SectionType.Tutorial, '11', DayOfWeek.Saturday, 12, 0, 14, 50, '[51115]51115-50-الشيخ زايد')
    ]
  },
  {
    code: 'MTHS003',
    name: 'Calculus 2',
    isMTHS: true,
    sections: [
      createSection('MTHS003', SectionType.Lecture, '1', DayOfWeek.Sunday, 8, 0, 9, 50, '[51201]51201-50-الشيخ زايد'),
      createSection('MTHS003', SectionType.Tutorial, '1', DayOfWeek.Monday, 12, 0, 14, 50, '[51201]51201-50-الشيخ زايد'),
      createSection('MTHS003', SectionType.Lecture, '2', DayOfWeek.Sunday, 10, 0, 11, 50, '[51202]51202-60-الشيخ زايد'),
      createSection('MTHS003', SectionType.Tutorial, '2', DayOfWeek.Saturday, 10, 0, 12, 50, '[51202]51202-60-الشيخ زايد'),
      createSection('MTHS003', SectionType.Lecture, '3', DayOfWeek.Monday, 8, 0, 9, 50, '[51113]51113-50-الشيخ زايد'),
      createSection('MTHS003', SectionType.Tutorial, '3', DayOfWeek.Saturday, 10, 0, 12, 50, '[51113]51113-50-الشيخ زايد'),
      createSection('MTHS003', SectionType.Lecture, '4', DayOfWeek.Monday, 8, 0, 9, 50, '[51114]51114-50-الشيخ زايد'),
      createSection('MTHS003', SectionType.Tutorial, '4', DayOfWeek.Sunday, 8, 0, 10, 50, '[51114]51114-50-الشيخ زايد'),
      createSection('MTHS003', SectionType.Lecture, '5', DayOfWeek.Saturday, 10, 0, 11, 50, '[51215]51215-60-الشيخ زايد'),
      createSection('MTHS003', SectionType.Tutorial, '5', DayOfWeek.Monday, 10, 0, 12, 50, '[51215]51215-60-الشيخ زايد'),
      createSection('MTHS003', SectionType.Lecture, '6', DayOfWeek.Monday, 10, 0, 11, 50, '[51216]51216-الشيخ زايد'),
      createSection('MTHS003', SectionType.Tutorial, '6', DayOfWeek.Sunday, 10, 0, 12, 50, '[51216]51216-الشيخ زايد'),
      createSection('MTHS003', SectionType.Lecture, '7', DayOfWeek.Saturday, 12, 0, 13, 50, '[51117]51117-50-الشيخ زايد'),
      createSection('MTHS003', SectionType.Tutorial, '7', DayOfWeek.Sunday, 12, 0, 14, 50, '[51117]51117-50-الشيخ زايد'),
      createSection('MTHS003', SectionType.Lecture, '8', DayOfWeek.Saturday, 8, 0, 9, 50, '[51118]51118-50-الشيخ زايد'),
      createSection('MTHS003', SectionType.Tutorial, '8', DayOfWeek.Sunday, 10, 0, 12, 50, '[51118]51118-50-الشيخ زايد'),
      createSection('MTHS003', SectionType.Lecture, '9', DayOfWeek.Monday, 11, 0, 12, 50, '[51119]51119-50-الشيخ زايد'),
      createSection('MTHS003', SectionType.Tutorial, '9', DayOfWeek.Sunday, 10, 0, 12, 50, '[51119]51119-50-الشيخ زايد')
    ]
  },
  {
    code: 'MTHS004',
    name: 'Discrete Mathematics',
    isMTHS: true,
    sections: [
      createSection('MTHS004', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20509]20509-45-الجيزة الرئيسي'),
      createSection('MTHS004', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20509]20509-45-الجيزة الرئيسي'),
      createSection('MTHS004', SectionType.Lecture, '2', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20103]20103-60-الجيزة الرئيسي'),
      createSection('MTHS004', SectionType.Tutorial, '2', DayOfWeek.Wednesday, 2, 0, 3, 50, '[20103]20103-60-الجيزة الرئيسي'),
      createSection('MTHS004', SectionType.Lecture, '3', DayOfWeek.Wednesday, 2, 0, 3, 50, '[20510]20510-60-الجيزة الرئيسي'),
      createSection('MTHS004', SectionType.Tutorial, '3', DayOfWeek.Wednesday, 4, 0, 5, 50, '[20510]20510-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MTHS005',
    name: 'Introduction to Probability and Statistics',
    isMTHS: true,
    sections: [
      createSection('MTHS005', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20108]20108-60-الجيزة الرئيسي'),
      createSection('MTHS005', SectionType.Tutorial, '1', DayOfWeek.Thursday, 9, 0, 10, 50, '[20108]20108-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MTHS102',
    name: 'Linear Algebra and Multivariable Integrals',
    isMTHS: true,
    sections: [
      createSection('MTHS102', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[20510]20510-60-الجيزة الرئيسي'),
      createSection('MTHS102', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20510]20510-60-الجيزة الرئيسي'),
      createSection('MTHS102', SectionType.Lecture, '2', DayOfWeek.Monday, 9, 0, 10, 50, '[20510]20510-60-الجيزة الرئيسي'),
      createSection('MTHS102', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20504]20504-60-الجيزة الرئيسي'),
      createSection('MTHS102', SectionType.Lecture, '3', DayOfWeek.Thursday, 9, 0, 10, 50, '[20512]20512-45-الجيزة الرئيسي'),
      createSection('MTHS102', SectionType.Tutorial, '3', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20510]20510-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MTHS104',
    name: 'Differential Equations',
    isMTHS: true,
    sections: [
      createSection('MTHS104', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[20510]20510-60-الجيزة الرئيسي'),
      createSection('MTHS104', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20503]20503-45-الجيزة الرئيسي'),
      createSection('MTHS104', SectionType.Lecture, '2', DayOfWeek.Thursday, 2, 0, 3, 50, '[20504]20504-60-الجيزة الرئيسي'),
      createSection('MTHS104', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20505]20505-45-الجيزة الرئيسي'),
      createSection('MTHS104', SectionType.Lecture, '3', DayOfWeek.Sunday, 9, 0, 10, 50, '[20506]20506-45-الجيزة الرئيسي'),
      createSection('MTHS104', SectionType.Tutorial, '3', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20503]20503-45-الجيزة الرئيسي'),
      createSection('MTHS104', SectionType.Lecture, '4', DayOfWeek.Sunday, 2, 0, 3, 50, '[20510]20510-60-الجيزة الرئيسي'),
      createSection('MTHS104', SectionType.Tutorial, '4', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20504]20504-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MTHS114',
    name: 'Numerical Analysis',
    isMTHS: true,
    sections: [
      createSection('MTHS114', SectionType.Lecture, '1', DayOfWeek.Thursday, 9, 0, 10, 50, '[20504]20504-60-الجيزة الرئيسي'),
      createSection('MTHS114', SectionType.Tutorial, '1', DayOfWeek.Thursday, 11, 0, 12, 50, '[20504]20504-60-الجيزة الرئيسي'),
      createSection('MTHS114', SectionType.Lecture, '2', DayOfWeek.Thursday, 11, 0, 12, 50, '[20510]20510-60-الجيزة الرئيسي'),
      createSection('MTHS114', SectionType.Tutorial, '2', DayOfWeek.Thursday, 9, 0, 10, 50, '[20510]20510-60-الجيزة الرئيسي'),
      createSection('MTHS114', SectionType.Lecture, '3', DayOfWeek.Sunday, 11, 0, 12, 50, '[20504]20504-60-الجيزة الرئيسي'),
      createSection('MTHS114', SectionType.Tutorial, '3', DayOfWeek.Sunday, 9, 0, 10, 50, '[20504]20504-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'MTHS204',
    name: 'Advanced Probability and Statistics',
    isMTHS: true,
    sections: [
      createSection('MTHS204', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[20108]20108-60-الجيزة الرئيسي'),
      createSection('MTHS204', SectionType.Tutorial, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[20108]20108-60-الجيزة الرئيسي'),
      createSection('MTHS204', SectionType.Lecture, '2', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20511]20511-45-الجيزة الرئيسي'),
      createSection('MTHS204', SectionType.Tutorial, '2', DayOfWeek.Thursday, 9, 0, 10, 50, '[20511]20511-45-الجيزة الرئيسي'),
      createSection('MTHS204', SectionType.Lecture, '3', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20511]20511-45-الجيزة الرئيسي'),
      createSection('MTHS204', SectionType.Tutorial, '3', DayOfWeek.Thursday, 11, 0, 12, 50, '[20511]20511-45-الجيزة الرئيسي'),
      createSection('MTHS204', SectionType.Lecture, '4', DayOfWeek.Sunday, 11, 0, 12, 50, '[20108]20108-60-الجيزة الرئيسي'),
      createSection('MTHS204', SectionType.Tutorial, '4', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20108]20108-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'PBWS202',
    name: 'Surveying for Engineers',
    isMTHS: false,
    sections: [
      createSection('PBWS202', SectionType.Lecture, '1', DayOfWeek.Wednesday, 1, 0, 2, 50, '[20107]20107-45-الجيزة الرئيسي'),
      createSection('PBWS202', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 3, 0, 5, 50, '[20107]20107-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'PBWS301',
    name: 'Highway Engineering',
    isMTHS: false,
    sections: [
      createSection('PBWS301', SectionType.Lecture, '1', DayOfWeek.Thursday, 9, 0, 10, 50, '[20426]20426-32-الجيزة الرئيسي'),
      createSection('PBWS301', SectionType.Tutorial, '1', DayOfWeek.Thursday, 11, 0, 12, 50, '[20426]20426-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'PBWS302',
    name: 'Soil Mechanics',
    isMTHS: false,
    sections: [
      createSection('PBWS302', SectionType.Lecture, '1', DayOfWeek.Monday, 2, 0, 3, 50, '[20323]20323-32-الجيزة الرئيسي'),
      createSection('PBWS302', SectionType.Tutorial, '1', DayOfWeek.Monday, 4, 0, 5, 50, '[20323]20323-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'PBWS446',
    name: 'Deep Excavation and Side Support',
    isMTHS: false,
    sections: [
      createSection('PBWS446', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[20426]20426-32-الجيزة الرئيسي'),
      createSection('PBWS446', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[20426]20426-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'PES301',
    name: 'Reservoir Engineering',
    isMTHS: false,
    sections: [
      createSection('PES301', SectionType.Lecture, '1', DayOfWeek.Monday, 2, 0, 3, 50, '[20427]20427-32-الجيزة الرئيسي'),
      createSection('PES301', SectionType.Tutorial, '1', DayOfWeek.Monday, 4, 0, 5, 50, '[20427]20427-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'PHYS001',
    name: 'Mechanical Properties of Matter and Thermodynamics',
    isMTHS: false,
    sections: [
      createSection('PHYS001', SectionType.Lecture, '10', DayOfWeek.Wednesday, 8, 0, 9, 50, '[51205]51205-60-الشيخ زايد'),
      createSection('PHYS001', SectionType.Tutorial, '10', DayOfWeek.Saturday, 12, 0, 14, 50, '[51205]51205-60-الشيخ زايد'),
      createSection('PHYS001', SectionType.Lecture, '11', DayOfWeek.Tuesday, 8, 0, 9, 50, '[51115]51115-50-الشيخ زايد'),
      createSection('PHYS001', SectionType.Tutorial, '11', DayOfWeek.Wednesday, 11, 0, 13, 50, '[51115]51115-50-الشيخ زايد')
    ]
  },
  {
    code: 'PHYS002',
    name: 'Electricity and Magnetism',
    isMTHS: false,
    sections: [
      createSection('PHYS002', SectionType.Lecture, '1', DayOfWeek.Monday, 10, 0, 11, 50, '[51201]51201-50-الشيخ زايد'),
      createSection('PHYS002', SectionType.Tutorial, '1', DayOfWeek.Sunday, 10, 0, 12, 50, '[51201]51201-50-الشيخ زايد'),
      createSection('PHYS002', SectionType.Lecture, '3', DayOfWeek.Saturday, 8, 0, 9, 50, '[51113]51113-50-الشيخ زايد'),
      createSection('PHYS002', SectionType.Tutorial, '3', DayOfWeek.Sunday, 12, 0, 14, 50, '[51113]51113-50-الشيخ زايد'),
      createSection('PHYS002', SectionType.Lecture, '5', DayOfWeek.Sunday, 10, 0, 11, 50, '[51215]51215-60-الشيخ زايد'),
      createSection('PHYS002', SectionType.Tutorial, '5', DayOfWeek.Saturday, 12, 0, 14, 50, '[51215]51215-60-الشيخ زايد'),
      createSection('PHYS002', SectionType.Lecture, '7', DayOfWeek.Sunday, 8, 0, 9, 50, '[51117]51117-50-الشيخ زايد'),
      createSection('PHYS002', SectionType.Tutorial, '7', DayOfWeek.Monday, 8, 0, 10, 50, '[51117]51117-50-الشيخ زايد'),
      createSection('PHYS002', SectionType.Lecture, '9', DayOfWeek.Sunday, 8, 0, 9, 50, '[51119]51119-50-الشيخ زايد'),
      createSection('PHYS002', SectionType.Tutorial, '9', DayOfWeek.Monday, 8, 0, 10, 50, '[51119]51119-50-الشيخ زايد')
    ]
  },
  {
    code: 'PHYS102',
    name: 'Modern Physics',
    isMTHS: false,
    sections: [
      createSection('PHYS102', SectionType.Lecture, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[20108]20108-60-الجيزة الرئيسي'),
      createSection('PHYS102', SectionType.Lecture, '2', DayOfWeek.Wednesday, 9, 0, 10, 50, '[20108]20108-60-الجيزة الرئيسي'),
      createSection('PHYS102', SectionType.Lecture, '3', DayOfWeek.Wednesday, 2, 0, 3, 50, '[20109]20109-45-الجيزة الرئيسي'),
      createSection('PHYS102', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20108]20108-60-الجيزة الرئيسي'),
      createSection('PHYS102', SectionType.Tutorial, '2', DayOfWeek.Tuesday, 8, 0, 10, 50, '[20505]20505-45-الجيزة الرئيسي'),
      createSection('PHYS102', SectionType.Tutorial, '3', DayOfWeek.Tuesday, 2, 0, 4, 50, '[20104]20104-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'PHYS211',
    name: 'Electromagnetic Fields',
    isMTHS: false,
    sections: [
      createSection('PHYS211', SectionType.Lecture, '1', DayOfWeek.Tuesday, 1, 0, 3, 50, '[20425]20425-32-الجيزة الرئيسي'),
      createSection('PHYS211', SectionType.Tutorial, '1', DayOfWeek.Monday, 2, 0, 3, 50, '[20425]20425-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'PPSS482',
    name: 'Graduation Project-2',
    isMTHS: false,
    sections: [
      createSection('PPSS482', SectionType.Lecture, '1', DayOfWeek.Tuesday, 4, 0, 6, 50, '-----')
    ]
  },
  {
    code: 'SBES120',
    name: 'Introduction to Biomedical Engineering',
    isMTHS: false,
    sections: [
      createSection('SBES120', SectionType.Lecture, '0', DayOfWeek.Wednesday, 11, 0, 12, 50, '[18101]18101-45-الجيزة الرئيسي'),
      createSection('SBES120', SectionType.Tutorial, '0', DayOfWeek.Wednesday, 9, 0, 10, 50, '[18101]18101-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES121',
    name: 'Medical Physics',
    isMTHS: false,
    sections: [
      createSection('SBES121', SectionType.Lecture, '0', DayOfWeek.Monday, 11, 0, 12, 50, '[20105]20105-45-الجيزة الرئيسي'),
      createSection('SBES121', SectionType.Tutorial, '0', DayOfWeek.Monday, 4, 0, 5, 50, '[20105]20105-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES122',
    name: 'Anatomy and Physiology for Engineers',
    isMTHS: false,
    sections: [
      createSection('SBES122', SectionType.Lecture, '0', DayOfWeek.Monday, 2, 0, 3, 50, '[20109]20109-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES131',
    name: 'Clinical Engineering',
    isMTHS: false,
    sections: [
      createSection('SBES131', SectionType.Lecture, '0', DayOfWeek.Wednesday, 4, 0, 5, 50, '[18101]18101-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES140',
    name: 'Computer Graphics and Visualization',
    isMTHS: false,
    sections: [
      createSection('SBES140', SectionType.Lecture, '0', DayOfWeek.Wednesday, 11, 0, 12, 50, '[18202]18202-60-الجيزة الرئيسي'),
      createSection('SBES140', SectionType.Tutorial, '0', DayOfWeek.Wednesday, 2, 0, 3, 50, '[18202]18202-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES141',
    name: 'Analytical and Lab Instruments',
    isMTHS: false,
    sections: [
      createSection('SBES141', SectionType.Lecture, '0', DayOfWeek.Tuesday, 2, 0, 2, 50, '[20110]20110-45-الجيزة الرئيسي'),
      createSection('SBES141', SectionType.Tutorial, '0', DayOfWeek.Tuesday, 4, 0, 5, 50, '[20110]20110-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES160',
    name: 'Medical Image Processing and Computer Vision',
    isMTHS: false,
    sections: [
      createSection('SBES160', SectionType.Lecture, '0', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20110]20110-45-الجيزة الرئيسي'),
      createSection('SBES160', SectionType.Tutorial, '0', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20110]20110-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES161',
    name: 'Medical Monitors and Life Support Equipment',
    isMTHS: false,
    sections: [
      createSection('SBES161', SectionType.Lecture, '0', DayOfWeek.Monday, 11, 0, 12, 50, '[20110]20110-45-الجيزة الرئيسي'),
      createSection('SBES161', SectionType.Tutorial, '0', DayOfWeek.Monday, 2, 0, 3, 50, '[20503]20503-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES162',
    name: 'Embedded Systems in Medical Equipment',
    isMTHS: false,
    sections: [
      createSection('SBES162', SectionType.Lecture, '0', DayOfWeek.Sunday, 11, 0, 12, 50, '[20512]20512-45-الجيزة الرئيسي'),
      createSection('SBES162', SectionType.Tutorial, '0', DayOfWeek.Monday, 9, 0, 10, 50, '[20512]20512-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES171',
    name: 'HealthCare Information Systems (HCIS)',
    isMTHS: false,
    sections: [
      createSection('SBES171', SectionType.Lecture, '0', DayOfWeek.Sunday, 11, 0, 12, 50, '[20505]20505-45-الجيزة الرئيسي'),
      createSection('SBES171', SectionType.Tutorial, '0', DayOfWeek.Sunday, 2, 0, 3, 50, '[20504]20504-60-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES180',
    name: 'Medical Imaging Modalities 2',
    isMTHS: false,
    sections: [
      createSection('SBES180', SectionType.Lecture, '0', DayOfWeek.Sunday, 9, 0, 10, 50, '[20512]20512-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES240',
    name: 'Requirements Engineering for Digital Health',
    isMTHS: false,
    sections: [
      createSection('SBES240', SectionType.Lecture, '0', DayOfWeek.Monday, 11, 0, 11, 50, '[20511]20511-45-الجيزة الرئيسي'),
      createSection('SBES240', SectionType.Tutorial, '0', DayOfWeek.Monday, 4, 0, 5, 50, '[20511]20511-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES260',
    name: 'Medical Distributed Application Development',
    isMTHS: false,
    sections: [
      createSection('SBES260', SectionType.Lecture, '0', DayOfWeek.Sunday, 4, 0, 5, 50, '[20105]20105-45-الجيزة الرئيسي'),
      createSection('SBES260', SectionType.Tutorial, '0', DayOfWeek.Sunday, 2, 0, 3, 50, '[20512]20512-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES313',
    name: 'Human Factors Engineering',
    isMTHS: false,
    sections: [
      createSection('SBES313', SectionType.Lecture, '0', DayOfWeek.Tuesday, 9, 0, 10, 50, '[18101]18101-45-الجيزة الرئيسي'),
      createSection('SBES313', SectionType.Tutorial, '0', DayOfWeek.Tuesday, 11, 0, 12, 50, '[18101]18101-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES345',
    name: 'Assistive Technologies',
    isMTHS: false,
    sections: [
      createSection('SBES345', SectionType.Lecture, '0', DayOfWeek.Monday, 11, 0, 12, 50, '[20512]20512-45-الجيزة الرئيسي'),
      createSection('SBES345', SectionType.Tutorial, '0', DayOfWeek.Monday, 2, 0, 3, 50, '[20512]20512-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES346',
    name: 'Surgery for Engineers',
    isMTHS: false,
    sections: [
      createSection('SBES346', SectionType.Lecture, '0', DayOfWeek.Thursday, 9, 0, 10, 50, '[20102]20102-45-الجيزة الرئيسي'),
      createSection('SBES346', SectionType.Tutorial, '0', DayOfWeek.Thursday, 11, 0, 12, 50, '[20102]20102-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES348',
    name: 'Introduction to Nano-Biosensors',
    isMTHS: false,
    sections: [
      createSection('SBES348', SectionType.Lecture, '0', DayOfWeek.Monday, 9, 0, 10, 50, '[20102]20102-45-الجيزة الرئيسي'),
      createSection('SBES348', SectionType.Tutorial, '0', DayOfWeek.Monday, 4, 0, 5, 50, '[20104]20104-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES413',
    name: 'Virtual Reality in Medical Applications',
    isMTHS: false,
    sections: [
      createSection('SBES413', SectionType.Lecture, '0', DayOfWeek.Sunday, 11, 0, 12, 50, '[20105]20105-45-الجيزة الرئيسي'),
      createSection('SBES413', SectionType.Tutorial, '0', DayOfWeek.Sunday, 2, 0, 3, 50, '[20501]20501-70-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES461',
    name: 'Deep Learning in Medicine',
    isMTHS: false,
    sections: [
      createSection('SBES461', SectionType.Lecture, '0', DayOfWeek.Tuesday, 2, 0, 3, 50, '[18101]18101-45-الجيزة الرئيسي'),
      createSection('SBES461', SectionType.Tutorial, '0', DayOfWeek.Tuesday, 4, 0, 5, 50, '[18101]18101-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES466',
    name: 'Biomedical Data Analytics',
    isMTHS: false,
    sections: [
      createSection('SBES466', SectionType.Lecture, '0', DayOfWeek.Wednesday, 11, 0, 12, 50, '[20105]20105-45-الجيزة الرئيسي'),
      createSection('SBES466', SectionType.Tutorial, '0', DayOfWeek.Wednesday, 4, 0, 5, 50, '[20105]20105-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SBES475',
    name: 'Bioinformatics II',
    isMTHS: false,
    sections: [
      createSection('SBES475', SectionType.Lecture, '0', DayOfWeek.Wednesday, 9, 0, 10, 50, '[18202]18202-60-الجيزة ��لرئيسي'),
      createSection('SBES475', SectionType.Tutorial, '0', DayOfWeek.Wednesday, 2, 0, 3, 50, '[18101]18101-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'SEES482',
    name: 'Graduation Project-2',
    isMTHS: false,
    sections: [
      createSection('SEES482', SectionType.Lecture, '1', DayOfWeek.Monday, 6, 0, 6, 50, '-----'),
      createSection('SEES482', SectionType.Tutorial, '1', DayOfWeek.Monday, 7, 0, 8, 50, '-----')
    ]
  },
  {
    code: 'STES280',
    name: 'Engineering Seminar',
    isMTHS: false,
    sections: [
      createSection('STES280', SectionType.Lecture, '1', DayOfWeek.Sunday, 1, 0, 1, 50, '[20102]20102-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STES482',
    name: 'Graduation Project-2',
    isMTHS: false,
    sections: [
      createSection('STES482', SectionType.Lecture, '1', DayOfWeek.Thursday, 6, 0, 8, 50, '-----')
    ]
  },
  {
    code: 'STRS101',
    name: 'Structural Analysis-1',
    isMTHS: false,
    sections: [
      createSection('STRS101', SectionType.Lecture, '1', DayOfWeek.Thursday, 2, 0, 3, 50, '[20109]20109-45-الجيزة الرئيسي'),
      createSection('STRS101', SectionType.Tutorial, '1', DayOfWeek.Thursday, 4, 0, 5, 50, '[20109]20109-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS204',
    name: 'Mechanics of Materials',
    isMTHS: false,
    sections: [
      createSection('STRS204', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 10, 50, '[20109]20109-45-الجيزة الرئيسي'),
      createSection('STRS204', SectionType.Tutorial, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[20109]20109-45-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS213',
    name: 'Engineering Materials for Architects',
    isMTHS: false,
    sections: [
      createSection('STRS213', SectionType.Lecture, '1', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20501]20501-70-الجيزة الرئيسي'),
      createSection('STRS213', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[20508]20508-70-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS302',
    name: 'Steel Structures Design I',
    isMTHS: false,
    sections: [
      createSection('STRS302', SectionType.Lecture, '1', DayOfWeek.Wednesday, 9, 0, 10, 50, '[20323]20323-32-الجيزة الرئيسي'),
      createSection('STRS302', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 11, 0, 12, 50, '[20323]20323-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS303',
    name: 'Reinforced Concrete Design II',
    isMTHS: false,
    sections: [
      createSection('STRS303', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 10, 50, '[20323]20323-32-الجيزة الرئيسي'),
      createSection('STRS303', SectionType.Tutorial, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[20323]20323-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS312',
    name: 'Steel Structures',
    isMTHS: false,
    sections: [
      createSection('STRS312', SectionType.Lecture, '1', DayOfWeek.Monday, 8, 0, 9, 50, '[20501]20501-70-الجيزة الرئيسي'),
      createSection('STRS312', SectionType.Tutorial, '1', DayOfWeek.Monday, 10, 0, 11, 50, '[20501]20501-70-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS322',
    name: 'Construction Planning and Scheduling',
    isMTHS: false,
    sections: [
      createSection('STRS322', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[20425]20425-32-الجيزة الرئيسي'),
      createSection('STRS322', SectionType.Tutorial, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[20425]20425-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS327',
    name: 'Law and Construction Industry',
    isMTHS: false,
    sections: [
      createSection('STRS327', SectionType.Lecture, '1', DayOfWeek.Wednesday, 2, 0, 3, 50, '[20323]20323-32-الجيزة الرئيسي'),
      createSection('STRS327', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 4, 0, 5, 50, '[20323]20323-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS407',
    name: 'Masonry Structures',
    isMTHS: false,
    sections: [
      createSection('STRS407', SectionType.Lecture, '1', DayOfWeek.Monday, 9, 0, 10, 50, '[20426]20426-32-الجيزة الرئيسي'),
      createSection('STRS407', SectionType.Tutorial, '1', DayOfWeek.Monday, 11, 0, 12, 50, '[20426]20426-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS409',
    name: 'Steel Multistory Buildings',
    isMTHS: false,
    sections: [
      createSection('STRS409', SectionType.Lecture, '1', DayOfWeek.Tuesday, 9, 0, 10, 50, '[20426]20426-32-الجيزة الرئيسي'),
      createSection('STRS409', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 11, 0, 12, 50, '[20426]20426-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS419',
    name: 'Quantity Surveying and Cost Engineering',
    isMTHS: false,
    sections: [
      createSection('STRS419', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[20323]20323-32-الجيزة الرئيسي'),
      createSection('STRS419', SectionType.Tutorial, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[20323]20323-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS421',
    name: 'Risk Management in Construction Industry',
    isMTHS: false,
    sections: [
      createSection('STRS421', SectionType.Lecture, '1', DayOfWeek.Sunday, 9, 0, 10, 50, '[20424]20424-32-الجيزة الرئيسي'),
      createSection('STRS421', SectionType.Tutorial, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[20424]20424-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS429',
    name: 'Heavy Construction Methods',
    isMTHS: false,
    sections: [
      createSection('STRS429', SectionType.Lecture, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[20425]20425-32-الجيزة الرئيسي'),
      createSection('STRS429', SectionType.Tutorial, '1', DayOfWeek.Sunday, 4, 0, 5, 50, '[20425]20425-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS431',
    name: 'Concrete Durability',
    isMTHS: false,
    sections: [
      createSection('STRS431', SectionType.Lecture, '1', DayOfWeek.Sunday, 2, 0, 3, 50, '[20323]20323-32-الجيزة الرئيسي'),
      createSection('STRS431', SectionType.Tutorial, '1', DayOfWeek.Sunday, 4, 0, 5, 50, '[20323]20323-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS433',
    name: 'Structural Mechanics and Stability',
    isMTHS: false,
    sections: [
      createSection('STRS433', SectionType.Lecture, '1', DayOfWeek.Tuesday, 2, 0, 3, 50, '[20426]20426-32-الجيزة الرئيسي'),
      createSection('STRS433', SectionType.Tutorial, '1', DayOfWeek.Tuesday, 4, 0, 5, 50, '[20426]20426-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS437',
    name: 'Seismic Design of Structures',
    isMTHS: false,
    sections: [
      createSection('STRS437', SectionType.Lecture, '1', DayOfWeek.Wednesday, 2, 0, 3, 50, '[20426]20426-32-الجيزة الرئيسي'),
      createSection('STRS437', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 4, 0, 5, 50, '[20426]20426-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS456',
    name: 'Claims In Construction Industry',
    isMTHS: false,
    sections: [
      createSection('STRS456', SectionType.Lecture, '1', DayOfWeek.Monday, 2, 0, 3, 50, '[20426]20426-32-الجيزة الرئيسي'),
      createSection('STRS456', SectionType.Tutorial, '1', DayOfWeek.Monday, 4, 0, 5, 50, '[20426]20426-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'STRS463',
    name: 'Building Information Modeling',
    isMTHS: false,
    sections: [
      createSection('STRS463', SectionType.Lecture, '1', DayOfWeek.Wednesday, 2, 0, 3, 50, '[20424]20424-32-الجيزة الرئيسي'),
      createSection('STRS463', SectionType.Tutorial, '1', DayOfWeek.Wednesday, 4, 0, 5, 50, '[20424]20424-32-الجيزة الرئيسي')
    ]
  },
  {
    code: 'WEES482',
    name: 'Graduation Project-2',
    isMTHS: false,
    sections: [
      createSection('WEES482', SectionType.Lecture, '1', DayOfWeek.Sunday, 11, 0, 12, 50, '[20511]20511-45-الجيزة الرئيسي'),
      createSection('WEES482', SectionType.Tutorial, '1', DayOfWeek.Sunday, 1, 0, 1, 50, '[20511]20511-45-الجيزة الرئيسي')
    ]
  },
];
