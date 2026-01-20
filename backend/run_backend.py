import uvicorn
import os
import sys

# Add the current directory to sys.path to ensure modules can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Starting Backend Server...")
    print("Swagger UI: http://localhost:8000/api/docs")
    # Using 'app.main:app' assumes this script is in the parent of 'app' or run as module.
    # If running from 'backend/' root:
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
