#!/usr/bin/env python3
import json
import os

# Create output directory if it doesn't exist
output_dir = "docs/protocol_split"
os.makedirs(output_dir, exist_ok=True)

# Load the protocol.json file
with open("docs/protocol.json", "r") as f:
    protocol = json.load(f)

# Get all unique categories
requests = protocol["requests"]
categories = set(req["category"] for req in requests)

# Create a dictionary for each category
category_files = {
    "enums": {"enums": protocol["enums"]},
    "events": {"events": protocol["events"]}
}

# Initialize each category file with an empty requests array
for category in categories:
    category_files[category] = {"requests": []}

# Sort requests into appropriate category files
for request in requests:
    category = request["category"]
    category_files[category]["requests"].append(request)

# Write each category to its own file
for category, data in category_files.items():
    filename = f"{output_dir}/{category.replace(' ', '_')}.json"
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Created {filename}")

print("Protocol split complete!")