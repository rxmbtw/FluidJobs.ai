#!/bin/bash

echo "========================================"
echo "FluidJobs.ai - Replace Candidates Script"
echo "========================================"
echo ""
echo "WARNING: This will replace ALL existing candidates!"
echo "Make sure you have a backup before proceeding."
echo ""
read -p "Are you sure you want to continue? (y/N): " confirm

if [[ $confirm != [yY] ]]; then
    echo "Operation cancelled."
    exit 1
fi

echo ""
echo "Starting candidate replacement process..."
node scripts/replace-candidates-from-gcs.js

echo ""
echo "Process completed. Check the output above for results."