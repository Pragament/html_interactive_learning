# HTML Interactive Learning

Self-contained, browser-based learning activities for school students. The
homepage builds its catalog from metadata embedded directly in each activity's
HTML file.

## Content hierarchy

Every interactive experience is an independent activity. Metadata no longer
lives in a shared `activity.md` file.

A topic-level activity can cover an entire topic and its subtopics:

```text
activities/{class}/{subject}/{topic}/{activity}/index.html
```

A subtopic-level activity focuses on one part of a topic:

```text
activities/{class}/{subject}/{topic}/{subtopic}/{activity}/index.html
```

Example:

```text
activities/
└── 10/
    └── mathematics/
        └── similar-triangles/
            ├── complete-topic-explorer/
            │   └── index.html
            ├── shadows/
            │   ├── shadow-laboratory/
            │   │   └── index.html
            │   └── tower-height-exam-practice/
            │       └── index.html
            └── pond-survey/
                └── pond-case-study/
                    └── index.html
```

Use lowercase kebab-case for every directory. Class directories use numbers
such as `6`, `7`, and `10`; display names such as `VI`, `VII`, and `X` remain in
metadata.

## One self-contained HTML file

An activity directory contains exactly one `index.html`. Its metadata, CSS,
HTML, and JavaScript all live in that file. Do not add separate `.css`, `.js`,
`activity.md`, or manifest files.

Avoid external runtime dependencies. An activity should continue to work when
opened without network access.

## Embedded activity metadata

Place exactly one JSON metadata block inside `<head>`:

```html
<script type="application/json" id="activity-metadata">
{
  "schemaVersion": 1,
  "id": "10-mathematics-similar-triangles-shadows-shadow-laboratory",
  "order": 247,
  "class": "X",
  "subject": "Mathematics",
  "topic": "Similar Triangles",
  "subtopic": "Shadows",
  "title": "Interactive Shadow Laboratory",
  "description": "Explore similar triangles by changing tower height and the Sun angle.",
  "activityType": "exploration",
  "status": "active"
}
</script>
```

For a topic-level activity, set `subtopic` to `null` and omit the subtopic
directory from its path.

### Required fields

| Field | Purpose |
| --- | --- |
| `schemaVersion` | Metadata schema version; currently `1` |
| `id` | Repository-wide stable activity identifier |
| `order` | Repository-wide unique catalog order |
| `class` | Display value such as `VI` or `X` |
| `subject` | Display subject name |
| `topic` | Display topic name |
| `subtopic` | Display subtopic name, or `null` for topic-level activities |
| `title` | Student-facing activity name |
| `description` | What learners do and understand |
| `activityType` | Kind of learning experience |
| `status` | `active` or `planned` |

Recommended activity types are `exploration`, `guided-practice`,
`exam-practice`, `simulation`, `game`, `challenge`, `assessment`, and
`demonstration`.

Every activity receives a `source_path` in `list.json` so contributors can edit
its HTML on GitHub. An `active` activity also receives a launch path. A `planned`
activity remains searchable in the full catalog but is not launchable.

## Topic and subtopic rules

- One activity HTML produces exactly one catalog record.
- Multiple activities may share the same topic and subtopic.
- Topic-level activities may combine every subtopic in that topic.
- The folder hierarchy and metadata taxonomy must agree.
- The activity directory name is its lowercase kebab-case slug.
- Activity IDs and orders must be unique.
- Keep languages, modes, and difficulty controls inside the same activity when
  they belong to one learner experience. Create another activity only when the
  learner experience is genuinely different.

## Building the catalog

`list.json` is generated and ignored by Git. Ruby is the only build
requirement:

```sh
ruby scripts/generate_catalog.rb
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/`.

Validate all metadata, paths, IDs, orders, and single-file requirements without
writing the catalog:

```sh
ruby scripts/generate_catalog.rb --validate
```

Verify that an existing generated catalog is current:

```sh
ruby scripts/generate_catalog.rb --check
```

The generator derives whether an activity is topic-level or subtopic-level from
the directory depth and checks it against the embedded metadata.

## Creating an activity

1. Choose its class, subject, topic, and optional subtopic.
2. Check for an existing open or closed GitHub issue covering the same idea.
3. Create the kebab-case hierarchy and `index.html`.
4. Add the embedded metadata block.
5. Keep all CSS and JavaScript inside the HTML.
6. Design useful interaction: prediction, manipulation, observation, feedback,
   explanation, or practice—not only static notes.
7. Test phone, tablet, and desktop layouts.
8. Run the catalog validator and preview the homepage.

## Pull requests

Before opening a pull request, run:

```sh
ruby scripts/generate_catalog.rb --validate
git diff --check
```

In the pull request, include the class, subject, topic, optional subtopic,
activity type, and a short description of what students interact with.

## Deployment

GitHub Pages must use **GitHub Actions** as its publishing source. The deployment
workflow generates `list.json`, packages the repository, and deploys the result.
The generated catalog is never committed.

## Reference ideas

- https://ncert.nic.in/science-laboratory-manual.php?ln=en
- https://ncert.nic.in/school-kits-and-lab-manual.php?ln=en
- https://cbseacademic.nic.in/web_material/QuestionBank/ClassX/MathsX.pdf
