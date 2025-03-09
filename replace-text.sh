#!/bin/bash

# Check if the correct number of arguments are provided
if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <directory> <old_text> <new_text>"
  exit 1
fi

directory="$1"
old_text="$2"
new_text="$3"

# Check if the directory exists
if [ ! -d "$directory" ]; then
  echo "Error: Directory '$directory' does not exist."
  exit 1
fi

# Use find and sed to recursively replace text in files
find "$directory" -type f -print0 | while IFS= read -r -d $'\0' file; do
  if grep -q "$old_text" "$file"; then # Check if the old text exists to avoid unnecessary sed calls
    sed -i "s#$old_text#$new_text#g" "$file"
    if [ $? -ne 0 ]; then
        echo "Error replacing text in file: $file"
    fi
  fi
done

echo "Text replacement complete."