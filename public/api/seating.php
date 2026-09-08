<?php
/**
 * Exam Seating Arrangement - PHP Backend API
 * 
 * This PHP file handles server-side seating arrangement logic.
 * It can be used as a REST API endpoint for the React frontend.
 * 
 * API Endpoint: POST /api/seating.php
 * 
 * Request Body (JSON):
 * {
 *   "rooms": 3,
 *   "rowsPerRoom": 5,
 *   "colsPerRoom": 6,
 *   "subjects": [
 *     {"name": "Mathematics", "count": 30},
 *     {"name": "Physics", "count": 25},
 *     {"name": "Chemistry", "count": 20}
 *   ]
 * }
 * 
 * Response (JSON):
 * {
 *   "success": true,
 *   "data": {
 *     "rooms": [...],
 *     "warnings": [...],
 *     "totalStudents": 75,
 *     "totalSeats": 90,
 *     "unassigned": [],
 *     "conflictCount": 0
 *   }
 * }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    exit();
}

// Read and parse JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON input.']);
    exit();
}

// Validate input
$rooms = isset($input['rooms']) ? intval($input['rooms']) : 0;
$rowsPerRoom = isset($input['rowsPerRoom']) ? intval($input['rowsPerRoom']) : 0;
$colsPerRoom = isset($input['colsPerRoom']) ? intval($input['colsPerRoom']) : 0;
$subjects = isset($input['subjects']) ? $input['subjects'] : [];

if ($rooms <= 0 || $rowsPerRoom <= 0 || $colsPerRoom <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid room configuration.']);
    exit();
}

if (empty($subjects)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'At least one subject is required.']);
    exit();
}

/**
 * Generate students for a subject
 */
function generateStudents($subject, $count, $startId) {
    $students = [];
    for ($i = 0; $i < $count; $i++) {
        $id = $startId + $i;
        $prefix = strtoupper(substr($subject, 0, 3));
        $students[] = [
            'id' => $id,
            'subject' => $subject,
            'rollNo' => $prefix . '-' . str_pad($id, 4, '0', STR_PAD_LEFT),
        ];
    }
    return $students;
}

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffleArray($array) {
    $shuffled = $array;
    $n = count($shuffled);
    for ($i = $n - 1; $i > 0; $i--) {
        $j = rand(0, $i);
        $temp = $shuffled[$i];
        $shuffled[$i] = $shuffled[$j];
        $shuffled[$j] = $temp;
    }
    return $shuffled;
}

/**
 * Create interleaved queue from subject groups
 */
function createInterleavedQueue($subjectGroups, $subjectOrder) {
    $queues = [];
    foreach ($subjectOrder as $subject) {
        $queues[$subject] = shuffleArray($subjectGroups[$subject] ?? []);
    }

    $result = [];
    $maxLen = 0;
    foreach ($subjectOrder as $subject) {
        $maxLen = max($maxLen, count($queues[$subject]));
    }

    // Round-robin interleaving
    for ($round = 0; $round < $maxLen; $round++) {
        foreach ($subjectOrder as $subject) {
            if (!empty($queues[$subject])) {
                $result[] = array_shift($queues[$subject]);
            }
        }
    }

    return $result;
}

/**
 * Check if student can be placed at position
 */
function canPlaceStudent(&$grid, $row, $col, $subject, $rows, $cols) {
    $directions = [
        [-1, 0], // up
        [1, 0],  // down
        [0, -1], // left
        [0, 1],  // right
    ];

    foreach ($directions as $dir) {
        $nr = $row + $dir[0];
        $nc = $col + $dir[1];
        if ($nr >= 0 && $nr < $rows && $nc >= 0 && $nc < $cols) {
            if ($grid[$nr][$nc] !== null && $grid[$nr][$nc]['subject'] === $subject) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Main seating arrangement function
 */
function arrangeSeating($config) {
    $rooms = $config['rooms'];
    $rowsPerRoom = $config['rowsPerRoom'];
    $colsPerRoom = $config['colsPerRoom'];
    $subjects = $config['subjects'];
    $warnings = [];
    $totalSeats = $rooms * $rowsPerRoom * $colsPerRoom;

    // Generate all students
    $allStudents = [];
    $subjectGroups = [];
    $idCounter = 1;

    foreach ($subjects as $subject) {
        $name = $subject['name'];
        $count = $subject['count'];
        $subjectGroups[$name] = generateStudents($name, $count, $idCounter);
        $allStudents = array_merge($allStudents, $subjectGroups[$name]);
        $idCounter += $count;
    }

    $totalStudents = count($allStudents);

    if ($totalStudents > $totalSeats) {
        $warnings[] = "⚠️ Not enough seats! {$totalStudents} students need " . ($totalSeats - $totalStudents) . " more seats.";
    }

    // Create interleaved queue
    $subjectOrder = array_map(function($s) { return $s['name']; }, $subjects);
    $queue = createInterleavedQueue($subjectGroups, $subjectOrder);

    // Initialize room grids
    $roomGrids = [];
    for ($r = 0; $r < $rooms; $r++) {
        $grid = [];
        for ($row = 0; $row < $rowsPerRoom; $row++) {
            $grid[] = array_fill(0, $colsPerRoom, null);
        }
        $roomGrids[] = $grid;
    }

    // Assign students
    $queueIndex = 0;
    $unassigned = [];

    for ($roomIdx = 0; $roomIdx < $rooms; $roomIdx++) {
        $grid = &$roomGrids[$roomIdx];

        for ($row = 0; $row < $rowsPerRoom; $row++) {
            $leftToRight = ($row % 2 === 0);

            for ($colIdx = 0; $colIdx < $colsPerRoom; $colIdx++) {
                $col = $leftToRight ? $colIdx : ($colsPerRoom - 1 - $colIdx);

                if ($queueIndex >= count($queue)) break;

                $student = $queue[$queueIndex];

                if (canPlaceStudent($grid, $row, $col, $student['subject'], $rowsPerRoom, $colsPerRoom)) {
                    $grid[$row][$col] = $student;
                    $queueIndex++;
                } else {
                    // Try to find compatible student
                    $found = false;
                    $searchLimit = min($queueIndex + 10, count($queue));
                    for ($searchIdx = $queueIndex + 1; $searchIdx < $searchLimit; $searchIdx++) {
                        $altStudent = $queue[$searchIdx];
                        if ($altStudent['subject'] !== $student['subject'] && 
                            canPlaceStudent($grid, $row, $col, $altStudent['subject'], $rowsPerRoom, $colsPerRoom)) {
                            $grid[$row][$col] = $altStudent;
                            $queue[$searchIdx] = $student;
                            $queueIndex++;
                            $found = true;
                            break;
                        }
                    }

                    if (!$found) {
                        $grid[$row][$col] = $student;
                        $queueIndex++;
                    }
                }
            }
        }
    }

    // Collect unassigned
    while ($queueIndex < count($queue)) {
        $unassigned[] = $queue[$queueIndex];
        $queueIndex++;
    }

    // Verify and count conflicts
    $conflictCount = 0;
    for ($roomIdx = 0; $roomIdx < $rooms; $roomIdx++) {
        $grid = $roomGrids[$roomIdx];
        for ($row = 0; $row < $rowsPerRoom; $row++) {
            for ($col = 0; $col < $colsPerRoom; $col++) {
                $current = $grid[$row][$col];
                if ($current === null) continue;

                if ($col + 1 < $colsPerRoom && $grid[$row][$col + 1] !== null && 
                    $grid[$row][$col + 1]['subject'] === $current['subject']) {
                    $conflictCount++;
                }
                if ($row + 1 < $rowsPerRoom && $grid[$row + 1][$col] !== null && 
                    $grid[$row + 1][$col]['subject'] === $current['subject']) {
                    $conflictCount++;
                }
            }
        }
    }

    if ($conflictCount > 0) {
        $warnings[] = "⚠️ {$conflictCount} adjacent same-subject conflict(s) detected.";
    }

    // Build room data
    $roomData = [];
    for ($idx = 0; $idx < $rooms; $idx++) {
        $grid = $roomGrids[$idx];
        $occupied = 0;
        foreach ($grid as $row) {
            foreach ($row as $seat) {
                if ($seat !== null) $occupied++;
            }
        }
        $roomData[] = [
            'name' => 'Room ' . ($idx + 1),
            'grid' => $grid,
            'rows' => $rowsPerRoom,
            'cols' => $colsPerRoom,
            'occupied' => $occupied,
        ];
    }

    return [
        'rooms' => $roomData,
        'warnings' => $warnings,
        'totalStudents' => $totalStudents,
        'totalSeats' => $totalSeats,
        'unassigned' => $unassigned,
        'conflictCount' => $conflictCount,
    ];
}

// Process the request
try {
    $config = [
        'rooms' => $rooms,
        'rowsPerRoom' => $rowsPerRoom,
        'colsPerRoom' => $colsPerRoom,
        'subjects' => $subjects,
    ];

    $result = arrangeSeating($config);

    echo json_encode([
        'success' => true,
        'data' => $result,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage(),
    ]);
}
?>
