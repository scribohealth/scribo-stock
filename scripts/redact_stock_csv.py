#!/usr/bin/env python3
"""
Read a UTF-8 stock CSV from stdin, redact client / cost / price columns, write CSV to stdout.

Headers follow the stock portal CSV (Chinese labels). Duplicate columns may appear as Name_1;
we normalize headers the same way as the TypeScript importer.
"""

from __future__ import annotations

import csv
import re
import sys


def normalize_header(raw: str) -> str:
    s = raw.replace("\ufeff", "").strip()
    s = re.sub(r"_\d+$", "", s)
    return s


# Monetary / price fields (keep store + product identifiers for valid ingest)
REDACT_EXACT = frozenset(
    {
        "庫存成本價",
    }
)

REDACT_SUBSTRING = (
    "成本",
    "價格",
    "售价",
    "售價",
    "单价",
    "單價",
    "price",
    "cost",
    "amount",
    "total",
)


def should_redact(norm: str) -> bool:
    if norm in REDACT_EXACT:
        return True
    low = norm.lower()
    for frag in REDACT_SUBSTRING:
        if frag.lower() in low:
            return True
    return False


def main() -> None:
    reader = csv.reader(sys.stdin)
    writer = csv.writer(sys.stdout, lineterminator="\n")

    try:
        header_row = next(reader)
    except StopIteration:
        return

    fieldnames = [normalize_header(h) for h in header_row]
    writer.writerow(fieldnames)

    redact_idx = {i for i, h in enumerate(fieldnames) if should_redact(h)}

    for row in reader:
        out = []
        for i, cell in enumerate(row):
            if i in redact_idx:
                out.append("")
            else:
                out.append(cell)
        # pad if ragged rows
        while len(out) < len(fieldnames):
            out.append("")
        writer.writerow(out[: len(fieldnames)])


if __name__ == "__main__":
    main()
