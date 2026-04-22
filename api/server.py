from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/consultation")
async def consultation():
    # your logic here
    ...

# In production, serve the Next.js static export
app.mount("/", StaticFiles(directory="static", html=True), name="static")