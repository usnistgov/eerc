#!/usr/bin/env python3

import csv
import sys
import json
import re

ziptostate = dict()

reader = csv.reader(sys.stdin)

for row in reader:
    if re.match(r"^\d+$", row[0]):
        ziptostate[row[0]] = row[1]

print(json.dumps(ziptostate))
