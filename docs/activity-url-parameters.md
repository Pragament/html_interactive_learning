# Reusable activity URL parameters

Activity links describe a topic setup using numeric values and named concepts. They do not look up a question ID or load a question bank. Changing the same values in the exploration panel creates a shareable link for another setup. Additional settings are available under **More exploration settings**.

The updated question links are in [`output/explanations-supported.csv`](../output/explanations-supported.csv). All 235 rows and the original five columns are retained; only `Explanation URL` changes. Similarity-criteria questions now open the triangle-similarity activity instead of the shadow case studies.

Append these examples to the corresponding `index.html` path:

| Activity | Example parameters | Supported setup |
| --- | --- | --- |
| `10/mathematics/polynomials/polynomials` | `a=2&b=-5&c=3&known_zero=1` | Coefficients, zeros, sum/product and expressions involving roots |
| Same polynomial activity | `a=2&c=6&given=known-zero&known_zero=2&unknown=b` | Infer an unknown coefficient from a given zero |
| Same polynomial activity | `a=1&given=zeros&known_zero=5&second_zero=-3` | Build a polynomial from its zeros |
| Same polynomial activity | `a=1&given=sum-product&sum_zeros=4&product_zeros=-5` | Build a polynomial from a sum and product |
| `10/mathematics/quadratic-equations/quadratic-equations-explorer` | `a=1&b=-10&given=repeated-root&focus=discriminant` | Discriminant and coincident roots; same polynomial parameters |
| `10/mathematics/trigonometry/special-angle-trigonometry` | `angle=60&ratio=sec` | Ratios at 0°, 30°, 45°, 60° and 90° |
| Same trigonometry activity | `expression=2%2Asin%2845%29%5E2%2Bcos%2830%29%5E2` | Arithmetic expressions such as `2*sin(45)^2+cos(30)^2` |
| `10/mathematics/geometry/similar-triangles` | `scale=1.5&side=6&other_side=8&focus=side` | Correspondence, sides, area, altitude, median and perimeter |
| Same similarity activity | `scale=2&criterion=SAS` | AA/AAA, SAS and SSS criteria |
| `9/mathematics/geometry/quadrilaterals` | `shape=parallelogram&angle=120&focus=angles` | Shape properties, diagonals and angles; optional `compare=rectangle` |
| Same quadrilateral activity | `shape=quadrilateral&angle_a=80&angle_b=90&angle_c=100` | Infer the fourth interior angle |
| `9/mathematics/geometry/properties-of-triangle` | `angle_a=50&angle_b=60&focus=exterior` | Interior angle sum, exterior angles, isosceles and equilateral triangles |
| `10/mathematics/real-numbers/act1` | `number=91&focus=prime-factorization` | Factors, composite/prime classification; optional `compare_number=9` |
| `10/mathematics/real-numbers/real-numbers-explorer-hcf-lcm-and-decimal-expansions/interactive` | `numbers=8%2C12%2C15&focus=lcm` | HCF/LCM of two to six positive integers; `focus=euclid` for the first pair |
| Same HCF/LCM activity | `focus=irrational&number=sqrt2` | Nonterminating, nonrepeating irrational decimals (`sqrt2`, `sqrt3`, `pi`) |
| `9/mathematics/geometry-circles/perpendicular-from-centre-to-chord` | `chord=16&distance=6` | Derive radius from chord length and perpendicular distance |
| Same chord activity | `radius=13&distance=5` | Derive chord length from radius and perpendicular distance |
| `10/mathematics/geometry-circles/tangents-to-circle` | `radius=5&tangent_length=12` | Equal tangent lengths; alternatively supply `radius=5&distance=13` (OP) |
| `10/mathematics/geometry/pythagoras-theorem/2d-challenge` | `leg_a=15&hypotenuse=17&focus=missing-leg` | Derive the other leg; `focus=proof` shows the similarity proof |
| Same Pythagoras activity | `leg_a=7&leg_b=8&hypotenuse=10&focus=check` | Test whether three lengths satisfy the theorem |
| `7/science/acids-bases-and-salts/virtual-ph-indicator-lab` | `chemical=soap&indicator=turmeric` | Indicators; `focus=neutralization`, `soil`, `antacid`, `ant-bite` or `lichens` |
| `6/science/materials/electric-conductivity` | `material=aluminium&focus=conductivity` | Conductivity and ductility, including copper and aluminium |
| `9/mathematics/geometry-circles/angle-in-semi-circle` | `vertex_angle=90` | Move the vertex around the semicircle while preserving the right angle |
| `9/mathematics/geometry-circles/angle-subtended-by-chords-at-centre` | `angle_a=30&angle_b=90` | Chord/radius relationship and the 60° equilateral case |
| `9/mathematics/geometry-circles/cyclic-quadrilateral-arc-proof` | `angle_one=75` | Existing opposite-angle and inscribed-angle exploration |

All paths are relative to `/activities/`. Encode parameters with `URLSearchParams` (particularly expressions containing `+`, parentheses or commas). Trigonometric expressions accept the six named ratios, special angles, numeric constants, parentheses, `+`, `-`, `*` and squares (`^2`); they are parsed without evaluating JavaScript.

Missing values use the activity defaults. Invalid numeric/enum values show a notice and use defaults. Impossible geometric combinations show an explanation instead of invalid arithmetic. A positive `chord` takes precedence over `radius` when deriving a circle; a positive `tangent_length` takes precedence over `distance` when deriving OP. A missing-leg setup derives `leg_b` from `leg_a` and `hypotenuse`.

Metadata includes `activity_url_parameters` examples for the existing catalog generator. JavaScript and CSS remain embedded in each activity, as required by that generator; the build script is unchanged.
