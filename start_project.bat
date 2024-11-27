@echo off
echo Starting Backend (Python)...
start cmd /k "cd backend && python get_stock_data.py"

echo Starting Backend (Node.js)...
start cmd /k "cd backend && node server.js"

echo Starting Frontend (React)...
start cmd /k "cd frontend && npm run start"

echo All processes started!
pause