# app.py
import os
from fastapi import FastAPI, Query, HTTPException
from main import generate_asset_progression

app = FastAPI()


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
        "image_paths": result["image_paths"],  # local paths
        "output_dir": result["output_dir"],
        "message": "Generation complete",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
