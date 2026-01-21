# Instagram API Backend

A FastAPI microservice that provides Instagram profile and post data using Instaloader.

## Setup

```bash
# Navigate to this directory
cd backend/instagram-api

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

## Endpoints

- `GET /profile/{username}` - Get profile stats
- `GET /posts/{username}?limit=12` - Get recent posts with engagement metrics
- `GET /health` - Health check

## Notes

- Server runs on `http://localhost:8001`
- Instagram may rate-limit requests; login session recommended for reliability
