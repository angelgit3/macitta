#!/bin/bash
git init
git add .
git commit -m "feat: Implement Core Architecture, Auth, Database Seeding & FSRS Logic"
git branch -M main
# Check if remote exists, if not add it
if ! git remote | grep -q origin; then
  git remote add origin git@github.com:angelgit3/Macitta_god.git
fi
git push -u origin main
