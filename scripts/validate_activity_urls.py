#!/usr/bin/env python3
"""Validate the topic-based CSV links against each activity's declared schema.

Usage: python3 scripts/validate_activity_urls.py [updated.csv] [original.csv]
The optional original CSV enables exact checks that only URL fields changed.
"""
import csv
import json
import math
import re
import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlsplit

ROOT = Path(__file__).resolve().parents[1]
CSV = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'output/explanations-supported.csv'


def read_csv(path):
    with path.open(encoding='utf-8', newline='') as handle:
        return list(csv.reader(handle))


def schema_for(html):
    match = re.search(r'const schema = (.*);', html)
    if not match:
        return None
    # The only non-JSON schema fields are literal regular expressions.
    literal = re.sub(r'("pattern": )(/[^\n]*?/i?)(?=[,}])',
                     lambda item: item[1] + json.dumps(item[2]), match[1])
    return json.loads(literal)


rows = read_csv(CSV)
assert len(rows) > 1 and len(rows[0]) == 5, 'Expected the original five-column CSV'
assert rows[0][-1] == 'Explanation URL'
if len(sys.argv) > 2:
    original = read_csv(Path(sys.argv[2]))
    assert len(rows) == len(original), 'Row count changed'
    assert rows[0] == original[0], 'Headers changed'
    assert all(a[:4] == b[:4] for a, b in zip(rows[1:], original[1:])), 'Non-URL fields changed'

cached = {}
for index, row in enumerate(rows[1:], start=2):
    assert len(row) == 5, f'Row {index}: column count changed'
    url = urlsplit(row[-1])
    assert url.scheme == 'https' and url.netloc == 'edulabs.technikh.com'
    assert url.path.startswith('/activities/') and url.path.endswith('/index.html')
    path = (ROOT / url.path.lstrip('/')).resolve()
    assert path.is_relative_to(ROOT / 'activities') and path.is_file(), f'Row {index}: missing activity'
    if path not in cached:
        cached[path] = schema_for(path.read_text())
    schema = cached[path]
    parameters = dict(parse_qsl(url.query, keep_blank_values=True))
    assert parameters, f'Row {index}: missing parameters'
    assert not any('id' == key or 'question' in key for key in parameters), 'Question identity in URL'
    if schema is None:
        assert path.parent.name == 'cyclic-quadrilateral-arc-proof'
        assert set(parameters) == {'angle_one'} and 0 < float(parameters['angle_one']) < 180
        continue
    for key, value in parameters.items():
        assert key in schema, f'Row {index}: unsupported parameter {key}'
        spec = schema[key]
        if 'options' in spec:
            assert value in spec['options'], f'Row {index}: invalid option {key}={value}'
        elif spec.get('type') == 'text':
            assert len(value) <= 180
            pattern = spec['pattern']
            flags = re.I if pattern.endswith('/i') else 0
            pattern = pattern[1:pattern.rfind('/')]
            assert re.fullmatch(pattern, value, flags), f'Row {index}: invalid text {key}'
        else:
            number = float(value)
            assert math.isfinite(number) and spec['min'] <= number <= spec['max']
            assert not spec.get('integer') or number.is_integer()
print(f'Validated {len(rows)-1} links across {len(cached)} activities; all parameters are topic-based.')
