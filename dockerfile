# Use an official Python runtime as a parent image
FROM python:3.8-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
# RUN apt-get update \
#     && apt-get install -y --no-install-recommends \
#         gcc \
#         libpq-dev \
#     && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code to the container
COPY . /app/

# Expose port 5000 (the default Flask port)
EXPOSE 5000

# Run the Flask application
CMD ["python", "app.py"]
