# Wizbot Academy

An independent robotics course with 17 lessons, story activities, a printable path sheet, and a browser movement model. Open [index.html](index.html); no build step or external programming library is required.

## Code playground

- **Move buttons** preserves the movement queue, whole-sequence repetition, GO, Undo, CLEAR and Stop. Lesson demonstrations load into this builder. Its practice board has fixed edges.
- **Code & patterns** provides editable robot movement programs using variables, `if / else`, `repeat`, `for` and `while`. All 50 supplied examples make the robot travel and draw a path. The first example is a curved Fibonacci spiral; class and subject filters organize the wider CBSE/NCERT-inspired library.

Both styles share the simulated robot. Switching styles interrupts a run; returning to Move buttons resets the displayed path. Loading an example resets the robot and results. If it changes movement mode, the button sequence is cleared. Run code starts at the centre with fresh variables. This page does not connect to a physical robot.

### Try a pattern

1. Open **Code & patterns**. Filter by suggested Class 1–10 and Mathematics or Physics/movement foundations, or search a topic; choose an example and press **Load example**. Filtering does not replace the loaded program until you press Load example.
2. Change **Pattern size / repetitions**, or edit the code.
3. Predict the path and press **Run code**.
4. Watch the robot leave its actual travelled trail. The complete trail remains after the run.
5. Compare the start marker, current-position arrow, length/radius labels and travelled-distance summary. Use **Stop code** to keep a partial path. Open **Inspect decisions, variables & journey notes** for debugging.

Code paths automatically fit the board, zooming into small drawings and out for expanding spirals. The dot spacing adapts to the camera scale. Segment labels can be switched off; overlapping labels are omitted. Arc labels give the radius in step units, not the length of the curved segment. Arc distance is calculated as πr/2 for a quarter circle.

| Example | Movement pattern | Input |
| --- | --- | --- |
| Fibonacci spiral, curved | Right quarter-circles with radii 1, 1, 2, 3, 5… | 1–12 arcs; default 8 |
| Fibonacci spiral, straight | Forward lengths 1, 1, 2, 3, 5…, each followed by a right turn | 1–12 sides; default 8 |
| Growing square spiral | Forward lengths 1, 2, 3, 4…, each followed by a right turn | Suggested 4–20 sides; default 10 |
| Square route | Four equal forward lengths and right turns | Side length; default 3 |
| Rectangle route | Alternating long sides and one-step short sides | Long-side length; default 4 |
| Even/odd zigzag | One step, then right for odd segment numbers or left for even ones | Number of segments; default 8 |
| Prime/composite turns | One step per number from 2 onward; primes turn right 45°, composites left 45° | Last number 2–30; default 12 |
| Shrinking staircase | Forward lengths decrease by one, with one-step rightward links | Initial length; default 5 |
| Growing squares | An outer loop increases the side length; an inner repeat draws each square | Number of squares; default 4 |

The curved Fibonacci example is a joined-quarter-circle approximation, not an exact logarithmic golden spiral. All example defaults produce a visible movement pattern; invalid guarded inputs may instead show a message in Journey notes.

## Class-wise concept paths

The nine original favourites remain, with 41 additional paths. Every class has at least four new activities, including mathematics and physics-related movement or diagram ideas. Each loaded example has its own input label/range, concept explanation, observation/change prompt, and model note where needed.

| Suggested class | New mathematics paths | Physics / movement paths |
| --- | --- | --- |
| 1 | Counted steps, addition of two lengths, L-shaped directions | Forward/reverse movement |
| 2 | Skip-count staircase, subtraction, repeating square motifs | Straight versus curved paths |
| 3 | Multiplication-array scan, rectangle perimeter, diamond symmetry | Equal spatial intervals |
| 4 | Half-circle fractions, area versus boundary, quarter-turn pinwheel | Circular movement |
| 5 | Four-circle rotational flower, scaled rectangles, compass map | Straight-ray light foundation |
| 6 | Hexagon exterior turns, 1:2 ratio staircase | Curved-path measurement, 45° mirror reflection |
| 7 | Equilateral triangle angles, positive/negative directed steps | Uniform-motion distance–time graph, variable-angle reflection |
| 8 | Regular polygons, odd-number length sums | Two-mirror periscope, pressure/contact-area comparison |
| 9 | Coordinate rectangle, linear-equation graph | Uniform-acceleration distance–time graph, distance versus displacement |
| 10 | Arithmetic-progression spiral, 3:4:5 trigonometry triangle | Glass-slab refraction, circular magnetic-field diagrams, a closed circuit |

These are independent teaching adaptations, not complete or officially prescribed class syllabuses. Classes 1–5 physics-related entries are movement/EVS foundations. Suggested placements draw on the [CBSE learning frameworks](https://cbseacademic.nic.in/cbe/learning-framework.html), its [Classes 6–10 assessment framework](https://cbseacademic.nic.in/cbe/documents/Assessment-Framework-March-2021.pdf), and the [NCERT foundational framework](https://www.ncert.nic.in/pdf/NCF_for_Foundational_Stage_20_October_2022.pdf); the linked documents have their own publication dates, and textbook editions may differ.

### What a physics path represents

- The **solid teal line** is always robot travel. Gray/dashed axes, mirrors, normals, slab boundaries and displacement guides are reference diagrams, not extra robot movement.
- Motion graphs have labelled Time/Distance axes. The robot traces sampled graph points; its drawing-path length and animation speed are not the physical distance or speed being graphed. Acceleration uses `s = ½at²` with zero initial speed and position.
- The slab example fixes refractive index 1.5 and incidence 45°. Its internal angle is about 28.13°, and its emerging ray is parallel to the incoming ray.
- Circular magnetic-field parts are clockwise for current **into** the page, shown by a × at the wire. Straight radial robot links are explicitly repositioning moves, not magnetic field lines.
- The circuit path is a closed-loop diagram with cell/resistor reference symbols, not a circuit solver or measured electron trajectory.
- Pressure examples outline contact areas under the same assumed force. The robot’s heading is not a force vector.

### Fibonacci spiral code

```text
let a = 1;
let b = 1;
for (let arc = 0; arc < input; arc++) {
  arcRight(a);
  let next = a + b;
  a = b;
  b = next;
}
```

The supplied example also checks that input is between 1 and 12. Each call traces a real quarter-circle in the browser movement model with the next Fibonacci radius.

## Language and commands

Programs are tokenized, parsed and interpreted without `eval` or `Function`. This is a small teaching language, not a general JavaScript environment.

- `let name = value;`, assignment, and numeric updates `+=`, `-=`, `++`, `--`.
- Numbers, quoted text, `true`, `false`, parentheses and `//` comments.
- Arithmetic `+ - * / %`, comparisons `== != === !== < <= > >=`, and short-circuit conditions `&& || !`. Equality compares type and value, including for `==`.
- `if (...) { ... } else if (...) { ... } else { ... }`.
- `repeat (count) { ... }`, `for (...) { ... }`, `while (...) { ... }`.
- `print(value, ...)` for optional journey notes. Examples use movement rather than number-only output.
- Read-only `input`: the chosen pattern size, a whole number from 0 to 1000.

Names are case-sensitive. End declarations, assignments, updates and calls with semicolons. Block declarations and for-loop counters are local; use distinct names in nested loops. Variables cannot shadow an existing variable. Arrays, user-defined functions, browser APIs, property access, `break` and `continue` are not supported.

### Movement

```text
forward();          // One step
forward(5);         // Five steps in one segment
reverse(2);         // Two steps backwards
left(); right();    // 90-degree turns on the spot
action();           // A simulated light effect
```

Draw mode also supports:

```text
turn(60);           // Clockwise turn; negative angles turn left
moveTo(3, 4);       // Travel to x=3, y=4 relative to Start, never teleport
arcRight(8);        // Right quarter-circle, radius 8 steps
arcLeft(3);         // Left quarter-circle, radius 3 steps
left45(); right45(); left30(); right30();
wideLeft(); wideRight();
```

`forward`, `reverse`, `arcLeft` and `arcRight` accept at most one positive numeric length/radius up to 1000. Their default is one step unit. `turn(angle)` requires one finite angle from −360° to 360°; `moveTo(x, y)` requires two coordinates from −1000 to 1000 step units. The x-axis points right and the y-axis points up. Other commands take no arguments. A Grid unit is 50 model coordinates; a Draw unit is 25. Wide arcs have radius two Draw steps. Turns change heading without extending the travelled path.

## Limits and feedback

Each run allows 10,000 execution steps, 200 print calls and 200 movement/turn commands. Repeat counts must be whole numbers 0–1000. Source is limited to 12,000 characters, 4,000 tokens and 64 nesting levels. Numbers must be finite with magnitude at most 1,000,000,000,000; text values are limited to 500 characters.

Loops yield so Stop code remains responsive, including for `while (true) {}`. The actual path and journey notes remain after an error, limit or interruption. Code paths auto-fit; button-built routes still stop at the board edge. The trace shows the latest 80 variable changes, decisions, loop checks and movement arguments. Final variables exclude block-local values after their blocks finish.

## Validation

From the repository root:

```sh
node scripts/test_wizbot_code_playground.js
ruby -E UTF-8:UTF-8 scripts/generate_catalog.rb
ruby -E UTF-8:UTF-8 scripts/generate_catalog.rb --check
```

Tests cover all 50 default paths, class/subject coverage, Fibonacci radii, joined arc geometry, closed shapes, graph coordinates, refraction, distance/displacement, conditional turns, scope, bounds, cancellation and syntax feedback. Browser checks cover filters, representative paths from all ten classes, reference diagrams, auto-fit, Stop, button-builder compatibility and narrow-screen layout.

## Number Series MCQ paths

Choose **Number Series MCQ** in the playground for 25 questions across Classes 6–10 (five per class). Previous/Next visits all questions, and the class selector jumps to its first question. Questions include arithmetic and geometric progressions, squares, cubes, alternating differences, affine recurrences and sums of previous terms.

- **Draw known terms** traces only the prefix before the blank; neither the missing value nor later terms are drawn.
- Select an option to **Draw my choice**. A trial route does not establish correctness; **Check answer** tests the intended rule. Incorrect attempts can be retried.
- **Hint** suggests a pattern to investigate without revealing the missing number.
- **Show explanation** reveals the answer and rule, then **Draw solved path** traces the completed series.
- In **Turning path**, each leg length represents a term at a common scale. Quarter turns only separate terms. In **Series graph**, the robot travels between term heights with equally spaced term positions. Labels show actual series values, not drawing-step distances.
- **Stop path** keeps the partial travelled route. Changing questions clears the trial and explanation. Switching tabs preserves the code editor draft.

This practice mode uses the shared animated robot and auto-fit camera. It does not connect to hardware or store assessment results. Question levels follow the supplied practice grouping.

```sh
node scripts/test_wizbot_number_series.js
```

The series tests independently reconstruct all given and missing terms, check all four candidate routes per question, and verify that unanswered previews stop at the blank.

## Custom worksheets and real-bot practice

In **Print, practise & compete**, choose black dots, black grid lines or no background, grid spacing of 5–40 mm on paper, path weight, and whether to include the target path. Settings also change the playground background. The worksheet uses the **loaded example's reference program and current input**, rather than an edited draft; series worksheets use the completed intended series. Button routes use the current queue and repeat count. An active competition's worksheet uses its locked target.

**Download worksheet PDF** creates a vector PDF locally, with no external PDF service or library. **Preview A4 PDF** displays an in-page SVG preview of the same one-page layout, including on browsers without embedded PDF support. The PDF contains only black/white drawing operators, no gray shading or opacity: a route, START/FINISH, starting heading, concept and challenge, and ruled spaces for a coding plan and predictions/measurements. Physics/graph reference guides are dashed and labelled separately from actual travel. No solution code is printed.

**Fit route** preserves proportions and states the resulting mm per drawing step. **Calibrated step size** uses the entered 1–200 mm drawing step and rejects routes that will not fit A4. Print at **100% / Actual size**, measure the result and calibrate the real bot. One graph unit or simulator step does not automatically equal a hardware movement. Long routes may require a smaller scale or a simpler example for an A4 real-bot exercise. The existing `a4sheet.html` remains the general quick-start sheet.

## Competition simulator

Load an example, series or button route, then open **Competition simulator** and **Start new round & coding timer**. This snapshots the reference route, input, speed (0.1–10 drawing steps/second) and turning speed (15–360 degrees/second), clears only the competition editor, and begins a monotonic coding timer. Use the dedicated editor and **Run & score attempt**; its `input` is shown in the locked target budget. Stop preserves partial travel and awards no score. Failed/stopped attempts and earlier runs remain part of elapsed coding time. End the round or start a new round to reset it. Results are local to the current page, with no account or shared leaderboard.

A successful attempt follows the ordered target route, stays within 0.08 drawing step at 160 sampled positions, has total distance within the larger of 0.08 step or 1.5%, and finishes within 5° of the target heading. This allows equivalent segmentation, including loops, while rejecting endpoint-only shortcuts, empty programs and extra detours. Arc geometry is sampled at 64 points per command. Competition paths auto-fit; this does not alter the fixed bounds of the button practice board.

Up to **1,000 points**, rounded per component:

- **Code (400):** `min(400, 400 × reference statements / submitted statements)`. Parsed statements count calls, declarations, assignments and control statements, including for-loop initialization/update; formatting and comments cannot reduce this count.
- **Bot time (400):** `min(400, 400 × reference seconds / submitted seconds)`. The model adds straight/arc distance divided by speed, explicit turns divided by turning speed, one second per action, and heading alignment for `moveTo`. Animation frame rate does not affect this estimate.
- **Coding time (200):** `200 / (1 + elapsed seconds / 120)`, measured from round start to the attempt's Run click.

A mismatch or runtime error receives no points. Speed settings stay locked until the round ends. These are practice simulator estimates, not measured hardware times or tamper-proof competition results.

```sh
node scripts/test_wizbot_workshop.js
```

Tests generate PDFs for all 50 code examples and both views of all 25 series; check single-page A4 structure, cross-reference offsets, black/white operators and calibration overflow; and verify equivalent routes, shortcut/detour/final-heading rejection, statement counts, timing and scores. Browser checks cover download, grid changes, competition success/retry/Stop and mobile layout. Rendered Fibonacci, motion-graph and refraction PDFs are inspected for print layout.

### Worksheet orientation and optional sections

Choose **Portrait** or **Landscape** before previewing/downloading. The same orientation is used for the SVG preview and the single A4 PDF page. Under **Include sections on paper**, independently toggle the heading/name/scale, CONCEPT, TRY, CODE / BUTTON PLAN, PREDICT - MEASURE - EXPLAIN, test results, printing/calibration instructions, illustrative model note, and reference-guide explanation. Defaults include all sections.

Excluded sections reserve no space: the grid and route expand into the released area. A single remaining writing section spans the available width. With all sections off, the grid fills the A4 page within 28-point printer-safe margins, retaining START, FINISH and the heading arrow. Fit mode scales to the new area; calibrated mode preserves mm per step and continues to reject oversized routes. Tests exercise all 1,024 section/orientation combinations.

Code-efficiency example: `repeat (4) { forward(input); reverse(input); right(); }` is **4 logical statements**, whether written on one line or formatted across multiple lines. The equivalent unrolled program has 12 movement statements. Tests verify identical scores for compact, multiline and commented versions of the same algorithm.
