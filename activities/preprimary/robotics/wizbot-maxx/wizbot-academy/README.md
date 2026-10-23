# Wizbot Academy

An independent robotics course with 17 lessons, story activities, a printable path sheet, and a browser movement model. Open [index.html](index.html); no build step or external programming library is required.

## Code playground

- **Move buttons** preserves the movement queue, whole-sequence repetition, GO, Undo, CLEAR and Stop. Lesson demonstrations load into this builder. Its practice board has fixed edges.
- **Code & patterns** provides editable robot movement programs using variables, `if / else`, `repeat`, `for` and `while`. Every supplied example makes the robot travel and draw a path. The first example is a curved Fibonacci spiral.

Both styles share the simulated robot. Switching styles interrupts a run; returning to Move buttons resets the displayed path. Loading an example resets the robot and results. If it changes movement mode, the button sequence is cleared. Run code starts at the centre with fresh variables. This page does not connect to a physical robot.

### Try a pattern

1. Open **Code & patterns**, choose an example and press **Load example**.
2. Change **Pattern size / repetitions**, or edit the code.
3. Predict the path and press **Run code**.
4. Watch the robot leave its actual travelled trail. The complete trail remains after the run.
5. Compare the start marker, current-position arrow, length/radius labels and travelled-distance summary. Use **Stop code** to keep a partial path. Open **Inspect decisions, variables & journey notes** for debugging.

Code paths automatically fit the board, so expanding spirals remain visible. The dot spacing adapts to the camera scale. Segment labels can be switched off; overlapping labels are omitted. Arc labels give the radius in step units, not the length of the curved segment. Arc distance is calculated as πr/2 for a quarter circle.

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
arcRight(8);        // Right quarter-circle, radius 8 steps
arcLeft(3);         // Left quarter-circle, radius 3 steps
left45(); right45(); left30(); right30();
wideLeft(); wideRight();
```

`forward`, `reverse`, `arcLeft` and `arcRight` accept at most one positive numeric length/radius up to 1000. Their default is one step unit. Other commands take no arguments. A Grid unit is 50 model coordinates; a Draw unit is 25. Wide arcs have radius two Draw steps. Turns change heading without extending the travelled path.

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

Tests cover all nine robot-travel examples, Fibonacci radii, joined arc geometry, closed shapes, conditional turns, variable scope, bounds, cancellation and syntax feedback. Browser checks cover the visible travelled paths, auto-fit, example loading, Stop, button-builder compatibility and mobile layout.
