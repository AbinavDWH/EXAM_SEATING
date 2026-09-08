// TypeScript Seating Algorithm - Client-side logic
// This mirrors the PHP backend logic in seating.php

export interface Student {
  id: number;
  subject: string;
  rollNo: string;
  color?: string;
}

export interface SubjectConfig {
  name: string;
  count: number;
  color?: string;
}

export interface SeatingConfig {
  rooms: number;
  rowsPerRoom: number;
  colsPerRoom: number;
  subjects: SubjectConfig[];
}

export interface RoomData {
  name: string;
  grid: (Student | null)[][];
  rows: number;
  cols: number;
  occupied: number;
}

export interface SeatingResult {
  rooms: RoomData[];
  warnings: string[];
  totalStudents: number;
  totalSeats: number;
  unassigned: Student[];
  conflictCount: number;
}

/**
 * Generate unique roll numbers for students
 */
function generateStudents(subject: string, count: number, startId: number): Student[] {
  const students: Student[] = [];
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    students.push({
      id,
      subject,
      rollNo: `${subject.substring(0, 3).toUpperCase()}-${String(id).padStart(4, '0')}`,
    });
  }
  return students;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create interleaved queue from multiple subject groups
 * Ensures no two students of same subject are consecutive
 */
function createInterleavedQueue(
  subjectGroups: Map<string, Student[]>,
  subjectOrder: string[]
): Student[] {
  const queues = new Map<string, Student[]>();
  for (const subject of subjectOrder) {
    queues.set(subject, shuffleArray(subjectGroups.get(subject) || []));
  }

  const result: Student[] = [];
  const maxLen = Math.max(...subjectOrder.map(s => (queues.get(s) || []).length));

  // Round-robin interleaving
  for (let round = 0; round < maxLen; round++) {
    for (const subject of subjectOrder) {
      const q = queues.get(subject);
      if (q && q.length > 0) {
        result.push(q.shift()!);
      }
    }
  }

  return result;
}

/**
 * Check if a student can be placed at a given position
 * Checks all adjacent seats (up, down, left, right)
 */
function canPlaceStudent(
  grid: (Student | null)[][],
  row: number,
  col: number,
  subject: string
): boolean {
  const directions = [
    [-1, 0], // up
    [1, 0],  // down
    [0, -1], // left
    [0, 1],  // right
  ];

  for (const [dr, dc] of directions) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
      const neighbor = grid[nr][nc];
      if (neighbor && neighbor.subject === subject) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Main seating arrangement algorithm
 */
export function arrangeSeating(config: SeatingConfig): SeatingResult {
  const { rooms, rowsPerRoom, colsPerRoom, subjects } = config;
  const warnings: string[] = [];
  const totalSeats = rooms * rowsPerRoom * colsPerRoom;

  // Generate all students
  const subjectGroups = new Map<string, Student[]>();
  let idCounter = 1;

  for (const subject of subjects) {
    const students = generateStudents(subject.name, subject.count, idCounter);
    subjectGroups.set(subject.name, students);
    idCounter += subject.count;
  }

  const totalStudents = subjects.reduce((sum, s) => sum + s.count, 0);

  if (totalStudents > totalSeats) {
    warnings.push(`⚠️ Not enough seats! ${totalStudents} students need ${totalSeats - totalStudents} more seats.`);
  }

  // Check if any single subject has more students than half the total seats
  for (const subject of subjects) {
    const maxAllowed = Math.ceil(totalSeats / 2);
    if (subject.count > maxAllowed) {
      warnings.push(`⚠️ ${subject.name} has ${subject.count} students (max recommended: ${maxAllowed}). Some conflicts may occur.`);
    }
  }

  // Create interleaved queue
  const subjectOrder = subjects.map(s => s.name);
  const queue = createInterleavedQueue(subjectGroups, subjectOrder);

  // Initialize rooms with empty grids
  const roomGrids: (Student | null)[][][] = [];
  for (let r = 0; r < rooms; r++) {
    const grid: (Student | null)[][] = [];
    for (let row = 0; row < rowsPerRoom; row++) {
      grid.push(new Array(colsPerRoom).fill(null));
    }
    roomGrids.push(grid);
  }

  // Assign students using snake pattern across rooms
  let queueIndex = 0;
  const unassigned: Student[] = [];

  for (let roomIdx = 0; roomIdx < rooms; roomIdx++) {
    const grid = roomGrids[roomIdx];

    for (let row = 0; row < rowsPerRoom; row++) {
      const leftToRight = row % 2 === 0;

      for (let colIdx = 0; colIdx < colsPerRoom; colIdx++) {
        const col = leftToRight ? colIdx : (colsPerRoom - 1 - colIdx);

        if (queueIndex >= queue.length) break;

        const student = queue[queueIndex];

        if (canPlaceStudent(grid, row, col, student.subject)) {
          grid[row][col] = student;
          queueIndex++;
        } else {
          // Try to find a compatible student further in the queue
          let found = false;
          for (let searchIdx = queueIndex + 1; searchIdx < Math.min(queueIndex + 10, queue.length); searchIdx++) {
            const altStudent = queue[searchIdx];
            if (altStudent.subject !== student.subject && canPlaceStudent(grid, row, col, altStudent.subject)) {
              grid[row][col] = altStudent;
              queue[searchIdx] = student; // swap
              queueIndex++;
              found = true;
              break;
            }
          }

          if (!found) {
            // Place anyway if no alternative
            grid[row][col] = student;
            queueIndex++;
          }
        }
      }
    }
  }

  // Collect unassigned
  while (queueIndex < queue.length) {
    unassigned.push(queue[queueIndex]);
    queueIndex++;
  }

  // Verify and collect warnings
  let conflictCount = 0;
  for (let roomIdx = 0; roomIdx < rooms; roomIdx++) {
    const grid = roomGrids[roomIdx];
    for (let row = 0; row < rowsPerRoom; row++) {
      for (let col = 0; col < colsPerRoom; col++) {
        const current = grid[row][col];
        if (!current) continue;

        // Check right neighbor
        if (col + 1 < colsPerRoom && grid[row][col + 1] && grid[row][col + 1]!.subject === current.subject) {
          conflictCount++;
        }
        // Check below neighbor
        if (row + 1 < rowsPerRoom && grid[row + 1][col] && grid[row + 1][col]!.subject === current.subject) {
          conflictCount++;
        }
      }
    }
  }

  if (conflictCount > 0) {
    warnings.push(`⚠️ ${conflictCount} adjacent same-subject conflict(s) detected. Consider adding more rooms or subjects.`);
  }

  // Build room data
  const roomData: RoomData[] = roomGrids.map((grid, idx) => ({
    name: `Room ${idx + 1}`,
    grid,
    rows: rowsPerRoom,
    cols: colsPerRoom,
    occupied: grid.flat().filter(s => s !== null).length,
  }));

  return {
    rooms: roomData,
    warnings,
    totalStudents,
    totalSeats,
    unassigned,
    conflictCount,
  };
}
