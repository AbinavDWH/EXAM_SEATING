export interface Subject {
  name: string;
  studentCount: number;
  color: string;
}

export interface Student {
  id: number;
  subject: string;
  rollNo: string;
  color: string;
}

export interface Seat {
  row: number;
  col: number;
  student: Student | null;
}

export interface Room {
  name: string;
  seats: Seat[][];
  rows: number;
  cols: number;
}

export interface SeatingConfig {
  rooms: number;
  rowsPerRoom: number;
  colsPerRoom: number;
  subjects: Subject[];
}

export interface SeatingResult {
  rooms: Room[];
  warnings: string[];
  totalStudents: number;
  totalSeats: number;
  unassigned: Student[];
}

const SUBJECT_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#E11D48', // rose
];

export function getSubjectColor(index: number): string {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

export function generateStudents(subjects: Subject[]): Student[] {
  const students: Student[] = [];
  let id = 1;

  for (const subject of subjects) {
    for (let i = 0; i < subject.studentCount; i++) {
      students.push({
        id: id,
        subject: subject.name,
        rollNo: `${subject.name.substring(0, 3).toUpperCase()}-${String(id).padStart(4, '0')}`,
        color: subject.color,
      });
      id++;
    }
  }

  return students;
}

export function arrangeSeating(config: SeatingConfig): SeatingResult {
  const warnings: string[] = [];
  const totalSeats = config.rooms * config.rowsPerRoom * config.colsPerRoom;
  const students = generateStudents(config.subjects);
  const totalStudents = students.length;

  if (totalStudents > totalSeats) {
    warnings.push(`Not enough seats! ${totalStudents} students but only ${totalSeats} seats available.`);
  }

  // Create rooms
  const rooms: Room[] = [];
  for (let r = 0; r < config.rooms; r++) {
    const seats: Seat[][] = [];
    for (let row = 0; row < config.rowsPerRoom; row++) {
      const seatRow: Seat[] = [];
      for (let col = 0; col < config.colsPerRoom; col++) {
        seatRow.push({ row, col, student: null });
      }
      seats.push(seatRow);
    }
    rooms.push({
      name: `Room ${r + 1}`,
      seats,
      rows: config.rowsPerRoom,
      cols: config.colsPerRoom,
    });
  }

  // Sort students by subject to group them
  const studentsBySubject: Map<string, Student[]> = new Map();
  for (const subject of config.subjects) {
    studentsBySubject.set(subject.name, []);
  }
  for (const student of students) {
    const arr = studentsBySubject.get(student.subject);
    if (arr) arr.push(student);
  }

  // Create a shuffled queue that alternates subjects
  const queue: Student[] = [];
  const subjectQueues: Map<string, Student[]> = new Map();
  for (const [subject, subjectStudents] of studentsBySubject) {
    subjectQueues.set(subject, [...subjectStudents]);
  }

  // Use round-robin to create an alternating queue
  const subjectNames = config.subjects.map(s => s.name);
  let subjectIndex = 0;
  let attempts = 0;
  const maxAttempts = subjectNames.length * totalStudents;

  while (queue.length < totalStudents && attempts < maxAttempts) {
    const subjectName = subjectNames[subjectIndex % subjectNames.length];
    const subjectQueue = subjectQueues.get(subjectName);

    if (subjectQueue && subjectQueue.length > 0) {
      queue.push(subjectQueue.shift()!);
    }
    subjectIndex++;
    attempts++;

    // If we've gone through all subjects without adding anyone, break
    if (attempts > maxAttempts / 2 && queue.length === 0) break;
  }

  // Add any remaining students
  for (const [, subjectQueue] of subjectQueues) {
    while (subjectQueue.length > 0) {
      queue.push(subjectQueue.shift()!);
    }
  }

  // Assign students to seats using a snake pattern for better distribution
  const unassigned: Student[] = [];
  let queueIndex = 0;

  for (let roomIdx = 0; roomIdx < rooms.length; roomIdx++) {
    const room = rooms[roomIdx];

    for (let row = 0; row < room.rows; row++) {
      // Alternate direction for snake pattern
      const leftToRight = row % 2 === 0;

      for (let colIdx = 0; colIdx < room.cols; colIdx++) {
        const col = leftToRight ? colIdx : (room.cols - 1 - colIdx);

        if (queueIndex < queue.length) {
          // Check if placing this student here would violate the rule
          const student = queue[queueIndex];
          let canPlace = true;

          // Check adjacent seats (up, left, right)
          if (row > 0 && room.seats[row - 1][col].student?.subject === student.subject) {
            canPlace = false;
          }
          if (col > 0 && room.seats[row][col - 1].student?.subject === student.subject) {
            canPlace = false;
          }

          if (canPlace) {
            room.seats[row][col].student = student;
            queueIndex++;
          } else {
            // Try to find a valid student from remaining queue
            let found = false;
            for (let searchIdx = queueIndex + 1; searchIdx < queue.length; searchIdx++) {
              const altStudent = queue[searchIdx];
              if (altStudent.subject !== student.subject) {
                // Check if this alternative student can be placed
                let altCanPlace = true;
                if (row > 0 && room.seats[row - 1][col].student?.subject === altStudent.subject) {
                  altCanPlace = false;
                }
                if (col > 0 && room.seats[row][col - 1].student?.subject === altStudent.subject) {
                  altCanPlace = false;
                }

                if (altCanPlace) {
                  // Swap
                  room.seats[row][col].student = altStudent;
                  queue[searchIdx] = student;
                  queueIndex++;
                  found = true;
                  break;
                }
              }
            }

            if (!found) {
              // Place anyway if no alternative found (better than leaving empty)
              room.seats[row][col].student = student;
              queueIndex++;
            }
          }
        }
      }
    }
  }

  // Handle remaining unassigned students
  while (queueIndex < queue.length) {
    unassigned.push(queue[queueIndex]);
    queueIndex++;
  }

  // Verify no adjacent same-subject students
  for (const room of rooms) {
    for (let row = 0; row < room.rows; row++) {
      for (let col = 0; col < room.cols; col++) {
        const current = room.seats[row][col].student;
        if (!current) continue;

        // Check right
        if (col + 1 < room.cols) {
          const right = room.seats[row][col + 1].student;
          if (right && right.subject === current.subject) {
            warnings.push(`${room.name}: ${current.rollNo} (${current.subject}) sits next to ${right.rollNo} (${right.subject}) at Row ${row + 1}`);
          }
        }
        // Check below
        if (row + 1 < room.rows) {
          const below = room.seats[row + 1][col].student;
          if (below && below.subject === current.subject) {
            warnings.push(`${room.name}: ${current.rollNo} (${current.subject}) sits next to ${below.rollNo} (${below.subject}) at Row ${row + 1}`);
          }
        }
      }
    }
  }

  return {
    rooms,
    warnings,
    totalStudents,
    totalSeats,
    unassigned,
  };
}
