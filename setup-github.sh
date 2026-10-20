#!/bin/bash
# AlumniConnect - GitHub Remote Setup Helper

if [ -z "$1" ]; then
  echo "Usage: ./setup-github.sh <YOUR_GITHUB_REPO_URL>"
  echo "Example: ./setup-github.sh https://github.com/your-username/alumniconnect.git"
  exit 1
fi

git remote remove origin 2>/dev/null
git remote add origin "$1"
git branch -M main
echo "Remote 'origin' set to: $1"
echo "Pushing code to GitHub..."
git push -u origin main
