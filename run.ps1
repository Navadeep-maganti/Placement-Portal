# Start Django backend
Start-Process powershell -ArgumentList "cd backend_django\backend; python manage.py runserver"

# Start React frontend
Start-Process powershell -ArgumentList "cd frontend_react; npm run dev"
