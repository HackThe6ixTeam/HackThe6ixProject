FROM python:3.12

WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ backend/

# Expose the port the app runs on
# Note: This is optional in Cloud Run but kept for documentation
EXPOSE 8080

# Command to run the application
CMD exec uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1