#!/usr/bin/env python3
"""
Convert all Colors.light.* to Colors.dark.* in onboarding screens
"""
import os
import re
from pathlib import Path

# Files to update
files = [
    "app/(onboarding)/pain-assessment.tsx",
    "app/(onboarding)/work-pattern.tsx",
    "app/(onboarding)/ergonomic-setup.tsx",
    "app/(onboarding)/notification-preference.tsx",
    "app/(onboarding)/energy-pattern.tsx",
    "app/(onboarding)/break-style.tsx",
    "app/(onboarding)/recommendation.tsx",
    "app/(onboarding)/break-demo.tsx",
    "app/(onboarding)/value-display.tsx",
    "app/(onboarding)/impact-education.tsx",
    "app/(onboarding)/timer-config.tsx",
    "app/(onboarding)/notification-permission.tsx",
    "app/(onboarding)/calendar-integration.tsx",
    "app/(onboarding)/first-session.tsx",
    "app/(onboarding)/premium-pitch.tsx",
    "app/(onboarding)/completion.tsx",
]

base_path = Path(__file__).parent.parent

for file_path in files:
    full_path = base_path / file_path
    if not full_path.exists():
        print(f"Skipping {file_path} - not found")
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace Colors.light.* with Colors.dark.*
    original_content = content
    content = re.sub(r'Colors\.light\.', 'Colors.dark.', content)
    
    # Add fontWeight: '700' to headline/title styles if not present
    # This is a simple pattern - might need manual review
    content = re.sub(
        r'(headline|title|question):\s*\{[^}]*?color:\s*Colors\.dark\.text\.primary[^}]*?\n',
        lambda m: m.group(0).rstrip() + '\n    fontWeight: \'700\',\n' if 'fontWeight' not in m.group(0) else m.group(0),
        content,
        flags=re.MULTILINE
    )
    
    if content != original_content:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"No changes needed for {file_path}")

print("Done!")

