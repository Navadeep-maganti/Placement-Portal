.PHONY: backend frontend dev

# Run Django backend
backend:
	cd backend_django/backend && python manage.py runserver

# Run React frontend
frontend:
	cd frontend_react && npm run dev

# Run both (opens backend in foreground, frontend in background)
dev:
	@echo "Starting Django backend and React frontend..."
	cd backend_django/backend && python manage.py runserver & \
	cd frontend_react && npm run dev
