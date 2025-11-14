#!/usr/bin/env python3
"""
Convert all colored elements to black-white design
"""
import os
import re
from pathlib import Path

# Color replacements - black/white/gray only
replacements = [
    # Brand colors -> white/gray
    (r'Colors\.dark\.brand\.primary', 'Colors.dark.text.primary'),
    (r'Colors\.dark\.brand\.secondary', 'Colors.dark.text.secondary'),
    (r'Colors\.dark\.brand\.accent', 'Colors.dark.text.primary'),
    (r'Colors\.dark\.brand\.highlight', 'Colors.dark.text.primary'),
    
    # Status colors -> white/gray
    (r'Colors\.dark\.status\.success', 'Colors.dark.text.primary'),
    (r'Colors\.dark\.status\.successLight', 'Colors.dark.background.secondary'),
    (r'Colors\.dark\.status\.warning', 'Colors.dark.text.secondary'),
    (r'Colors\.dark\.status\.warningLight', 'Colors.dark.background.secondary'),
    (r'Colors\.dark\.status\.error', 'Colors.dark.text.primary'),
    (r'Colors\.dark\.status\.errorLight', 'Colors.dark.background.secondary'),
    (r'Colors\.dark\.status\.info', 'Colors.dark.text.secondary'),
    (r'Colors\.dark\.status\.infoLight', 'Colors.dark.background.secondary'),
]

# Files to update
files = [
    "app/(onboarding)/social-proof.tsx",
    "app/(onboarding)/value-promise.tsx",
    "app/(onboarding)/work-role.tsx",
    "app/(onboarding)/screen-time.tsx",
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
    "app/(onboarding)/components/OptionCard.tsx",
]

base_path = Path(__file__).parent.parent

for file_path in files:
    full_path = base_path / file_path
    if not full_path.exists():
        print(f"Skipping {file_path} - not found")
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Apply replacements
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    # Remove emoji indicators (🟢) - replace with simple dot
    content = re.sub(r'🟢\s*', '', content)
    
    if content != original_content:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"No changes needed for {file_path}")

print("Done!")

