#!/bin/bash
# Chay file nay trong thu muc chua index.html (Mac/Linux/Git Bash)
echo "Dan link repo GitHub (vi du: https://github.com/tenban/the-gioi-be-thong-minh.git):"
read REPO
git init
git add .
git commit -m "Dua The Gioi Be Thong Minh len GitHub"
git branch -M main
git remote remove origin 2>/dev/null
git remote add origin "$REPO"
git push -u origin main
echo ""
echo "XONG! Gio vao GitHub > Settings > Pages > chon Branch main > Save."
