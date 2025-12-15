# embed_api.py
import os
import modal

MODEL_ID = "sonoisa/sentence-bert-base-ja-mean-tokens-v2"

app = modal.App("jp-embed-api")

image = (
    modal.Image.debian_slim(python_version="3.11")
    # 日本語BERT系で躓きやすい依存も一緒に
    .apt_install("git")
    .pip_install(
        "fastapi>=0.110",
        "pydantic>=2",
        "sentence-transformers>=3",
        "torch",
        "transformers",
        "fugashi",
        "ipadic",
        "mecab-python3",
        "unidic-lite",
    )
)

# ModalのSecretに EMBED_API_TOKEN を入れておく（後述）
secrets = [modal.Secret.from_name("custom-secret")]

@app.cls(
    image=image,
    gpu="T4",                 # まずはT4で十分
    secrets=secrets,
    scaledown_window=300,  # 5分アイドルで落ちる（コスト抑制）
)
class EmbeddingService:
    @modal.enter()
    def load(self):
        from sentence_transformers import SentenceTransformer
        # GPUに載せて常駐
        self.model = SentenceTransformer(MODEL_ID, device="cuda")

    @modal.asgi_app()
    def fastapi_app(self):
        from fastapi import FastAPI, Header, HTTPException
        from pydantic import BaseModel

        api = FastAPI()

        class Req(BaseModel):
            text: str

        @api.post("/embed")
        def embed(req: Req, authorization: str | None = Header(default=None)):
            token = os.environ.get("EMBED_API_TOKEN")
            if token:
                if authorization != f"Bearer {token}":
                    raise HTTPException(status_code=401, detail="unauthorized")

            # normalize_embeddings=True を推奨（コサイン系が安定）
            emb = self.model.encode(
                [req.text],
                normalize_embeddings=True,
                show_progress_bar=False,
            )[0].tolist()

            return {"dim": len(emb), "embedding": emb}

        return api
