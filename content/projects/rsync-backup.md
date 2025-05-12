---
title : 'RSync Backup Script'
subtitle: 'A customizable shell script to backup home folder to extrnal drive'
date : '2025-03-31T20:45:51+05:30'
draft : false
tags : ['shell scripting', 'linux']
toc: true
next: true
---

This is a simple, customizable shell script designed to help users back up specific parts of their home directory to an external drive. It leverages the power of the `rsync` command for efficient file synchronization.

### GitHub Repository: [funinkina/rsync-backup-script](https://github.com/funinkina/rsync-backup-script)

Since it is just a script, you can just copy from here

```bash
#!/bin/bash

# List the FOLDER NAMES within your home directory you want to back up.
# Do NOT include the full path, just the name relative to $HOME.
# Example: SOURCE_DIRS=("Documents" "Pictures" "Projects" ".config/some_app")
SOURCE_DIRS=(
    "Academics"
    "assets"
    "Codes"
    "Documents"
    "dotfiles"
    "Pictures"
    "Hackathons"
    "Notes"
    "Projects"
    ".mozilla"
    ".ssh"
    # Add more directories here...
    # ".config"  # Be careful with large hidden dirs, they might contain caches too
    # ".local/share/some_app" # Example of nested path
)

# --- !!! IMPORTANT: External Disk Path !!! ---
# Example: DEST_BASE_DIR="/media/your_username/MyExternalUSB/Backups"
# Ensure this directory exists and you have write permissions.
DEST_BASE_DIR="/mnt" # <<< --- CHANGE THIS ---

# --- !!! IMPORTANT: Destination Subfolder Name !!! ---
# Define the name of the FOLDER *INSIDE* DEST_BASE_DIR where this specific backup will go.
# Leave empty to use the default (current date and time).
# Example 1 (Fixed Name): DEST_SUBFOLDER_NAME="MyHomeBackup"
# Example 2 (Date Based): DEST_SUBFOLDER_NAME="backup_$(date +%Y-%m-%d)"
# Default (Date & Time):
_DEFAULT_SUBFOLDER_NAME="backup_$(date +%Y-%m-%d_%H-%M-%S)"
DEST_SUBFOLDER_NAME="archlinux_backup" # <<< --- SET YOUR DESIRED FOLDER NAME HERE, OR LEAVE EMPTY FOR DEFAULT

# List of directory NAMES to exclude. These will be excluded wherever they appear.
EXCLUDE_DIRS=(
    "node_modules"
    "venv"
    ".venv"
    "env"
    "__pycache__"
    "Cache"
    "cache"
    ".cache"
    "build"
    "dist"
    ".gradle"
    "target"
    ".DS_Store"
    "Thumbs.db"
    ".Trash"
    "*-cache"
    ".npm"
    ".yarn"
)

if [[ -z "$DEST_SUBFOLDER_NAME" ]]; then
  DEST_SUBFOLDER_NAME="$_DEFAULT_SUBFOLDER_NAME"
  echo "INFO: Using default destination subfolder name: $DEST_SUBFOLDER_NAME"
fi

FULL_DEST_PATH="$DEST_BASE_DIR/$DEST_SUBFOLDER_NAME"

if [[ "$DEST_BASE_DIR" == "/path/to/your/external/disk/backup_area" ]] || [[ -z "$DEST_BASE_DIR" ]]; then
  echo "ERROR: Please configure the 'DEST_BASE_DIR' variable in this script."
  exit 1
fi

if [ ! -d "$DEST_BASE_DIR" ]; then
    echo "ERROR: Base destination directory '$DEST_BASE_DIR' not found."
    echo "Please ensure the external disk is mounted and the path is correct."
    exit 1
fi

if [ ! -w "$DEST_BASE_DIR" ]; then
    echo "ERROR: Base destination directory '$DEST_BASE_DIR' is not writable."
    echo "Please check permissions."
    exit 1
fi

RSYNC_EXCLUDES=()
for dir in "${EXCLUDE_DIRS[@]}"; do
  RSYNC_EXCLUDES+=(--exclude="$dir")
done

RSYNC_OPTS=(-av --progress --delete "${RSYNC_EXCLUDES[@]}")
# RSYNC_OPTS=(-av --progress "${RSYNC_EXCLUDES[@]}") # Default: Safer without --delete

echo "Attempting to create destination folder: $FULL_DEST_PATH"
mkdir -p "$FULL_DEST_PATH"
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create destination folder '$FULL_DEST_PATH'."
    echo "Please check permissions and path validity."
    exit 1
fi
echo "Destination folder ready."

echo "==========================================="
echo "Starting Backup"
echo "Source Base: $HOME"
echo "Destination: $FULL_DEST_PATH"
echo "Excluded Directories: ${EXCLUDE_DIRS[*]}"
echo "==========================================="
echo

errors=0
processed_count=0

DEST_PARENT_FOR_RSYNC="$FULL_DEST_PATH/"

for src_dir in "${SOURCE_DIRS[@]}"; do
    SOURCE_PATH="$HOME/$src_dir"

    echo "--- Processing: '$src_dir' ---"

    if [ ! -e "$SOURCE_PATH" ]; then
        echo "WARNING: Source '$SOURCE_PATH' does not exist. Skipping."
        echo "--------------------------------------"
        continue
    fi

    echo "Running: rsync ${RSYNC_OPTS[*]} \"$SOURCE_PATH\" \"$DEST_PARENT_FOR_RSYNC\""
    rsync "${RSYNC_OPTS[@]}" "$SOURCE_PATH" "$DEST_PARENT_FOR_RSYNC"

    rsync_exit_status=$?
    if [ $rsync_exit_status -ne 0 ]; then
        echo "ERROR: rsync failed for '$SOURCE_PATH' with exit code $rsync_exit_status."
        errors=$((errors + 1))
    else
        echo "Successfully processed '$src_dir'."
        processed_count=$((processed_count + 1))
    fi
    echo "--------------------------------------"
    echo

done

echo "==========================================="
echo "Backup Finished"
if [ $errors -gt 0 ]; then
    echo "WARNING: Encountered $errors errors during backup."
    echo "Processed $processed_count directories successfully before errors or completion."
    echo "Backup located at: $FULL_DEST_PATH"
    exit 1 
else
    echo "All specified source directories ($processed_count) processed successfully."
    echo "Backup complete in: $FULL_DEST_PATH"
    exit 0 
fi
echo "==========================================="
```

# How it is built
The project is implemented as a standard **shell script**. It utilizes the command-line utility **`rsync`** as its core engine for performing the backup operations, known for its efficiency in handling file transfers and synchronizations. The script is designed to be **highly customizable** by directly editing its contents, facilitated by being "well commented" to guide users in modifying parameters like source folders, excluded paths, and the backup destination.

# Current features
The current version of the Rsync Backup Script provides the following basic capabilities:
*   Allows defining specific home folders that the user wishes to include in the backup.
*   Provides an easy method to recursively exclude specified directories (like common build or package folders such as `node_modules`).
*   Enables setting the destination directory for the backup on the external drive.

# To do
The provided readme does not list any specific future plans or a "To Do" section for this script.