# server.py (or app.py - whichever you're using)
import os
from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from main import generate_asset_progression

app = FastAPI()

# CRITICAL: Add CORS middleware BEFORE mounting static files
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create assets directory if it doesn't exist
os.makedirs("assets", exist_ok=True)

# Mount the assets directory
app.mount("/assets", StaticFiles(directory="assets"), name="assets")


@app.get("/")
def root():
    return {"message": "ok"}


@app.get("/generate")
def generate(thing: str = Query(...)):
    result = generate_asset_progression(thing)
    if result["error"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return {
        "thing": thing,
        "image_paths": result["image_paths"],
        "output_dir": result["output_dir"],
        "message": "Generation complete",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
