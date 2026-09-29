@echo off
chcp 65001 >nul
echo Dan link repo GitHub (vi du: https://github.com/tenban/the-gioi-be-thong-minh.git)
set /p REPO=Link repo: 
git init
git add .
git commit -m "Dua The Gioi Be Thong Minh len GitHub"
git branch -M main
git remote remove origin 2>nul
git remote add origin %REPO%
git push -u origin main
echo.
echo XONG! Gio vao GitHub - Settings - Pages - chon Branch main - Save.
pause
