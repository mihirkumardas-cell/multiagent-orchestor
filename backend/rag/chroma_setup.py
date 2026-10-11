"""
Sentrion — Chroma Vector Database Setup
Loads access-policy documents and scheduled exceptions into Chroma,
and provides a query function for the Retrieval Agent.

Usage:
  python chroma_setup.py          # seed / rebuild the DB
  from rag.chroma_setup import query_policy
"""
from __future__ import annotations

import os
from datetime import datetime

CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "chroma_db")

# ─── Policy Documents ─────────────────────────────────────────────────────────

POLICY_DOCUMENTS = [
    {
        "id": "policy_1",
        "text": (
            "Access Policy §1 — General Rules: All personnel must badge in/out during "
            "standard hours. Standard hours are 06:00 to 22:00 IST, Monday through Saturday. "
            "Sunday access requires manager approval at least 24 hours in advance."
        ),
        "metadata": {"type": "policy", "section": "§1"},
    },
    {
        "id": "policy_2",
        "text": (
            "Access Policy §2 — After-Hours Access: Any entry detected after 22:00 IST or "
            "before 06:00 IST is classified as after-hours. After-hours access is permitted "
            "only with a valid override token issued by the security desk, or if a scheduled "
            "maintenance window has been pre-approved and logged in the system."
        ),
        "metadata": {"type": "policy", "section": "§2"},
    },
    {
        "id": "policy_3",
        "text": (
            "Access Policy §3 — Violation Response: Any unrecognised after-hours entry "
            "triggers an immediate alarm at the entry point, a notification to the on-call "
            "security officer, and an incident record in the security log. "
            "The alarm remains active until silenced by an authorised officer."
        ),
        "metadata": {"type": "policy", "section": "§3"},
    },
    {
        "id": "policy_4",
        "text": (
            "Access Policy §4 — Override Tokens: Override tokens are 8-character alphanumeric "
            "codes issued per session. Each token is valid for one entry event on the specified "
            "date. Tokens cannot be reused. If a valid token was provided in the motion event "
            "metadata, the entry should be marked as cleared."
        ),
        "metadata": {"type": "policy", "section": "§4"},
    },
    {
        "id": "exception_2026_08_05",
        "text": (
            "Scheduled Exception — 2026-08-05: Building maintenance night. External HVAC "
            "technicians authorised to access server room and rooftop between 23:00 and 03:00. "
            "No alarm should trigger for entries at the main entrance between 22:30 and 03:30 "
            "on this date."
        ),
        "metadata": {"type": "exception", "date": "2026-08-05"},
    },
    {
        "id": "exception_2026_08_15",
        "text": (
            "Scheduled Exception — 2026-08-15 (Independence Day): Holiday — building closed. "
            "Any entry at any time should be treated as a potential violation and trigger the alarm."
        ),
        "metadata": {"type": "exception", "date": "2026-08-15"},
    },
]


def get_chroma_collection():
    """Return (or create) the Chroma collection."""
    import chromadb
    from chromadb.utils import embedding_functions

    client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)

    # Keep one local embedding configuration for both seeding and querying.
    # Switching to OpenAI merely because an API key exists makes an existing
    # local collection incompatible and breaks offline demos.
    ef = embedding_functions.DefaultEmbeddingFunction()

    collection = client.get_or_create_collection(
        name="access_policies",
        embedding_function=ef,
        metadata={"hnsw:space": "cosine"},
    )
    return collection


def seed_database():
    """Seed Chroma with policy documents. Idempotent — skips existing IDs."""
    collection = get_chroma_collection()

    existing_ids = set(collection.get(include=[])["ids"]) if collection.count() > 0 else set()

    new_docs = [d for d in POLICY_DOCUMENTS if d["id"] not in existing_ids]
    if not new_docs:
        print("[RAG] Database already seeded.")
        return

    collection.add(
        ids=[d["id"] for d in new_docs],
        documents=[d["text"] for d in new_docs],
        metadatas=[d["metadata"] for d in new_docs],
    )
    print(f"[RAG] Seeded {len(new_docs)} documents into Chroma.")


def query_policy(event_time: str, n_results: int = 3) -> str:
    """
    Query the Chroma DB for policies relevant to the given event time.
    Returns a concatenated string of the top-N matching policy chunks.
    """
    # Ensure the DB is seeded before querying
    seed_database()
    collection = get_chroma_collection()

    document_count = collection.count()
    if document_count == 0:
        return "No relevant policy found."

    # Build query string from event context
    event_dt = datetime.fromisoformat(event_time)
    date_str = event_dt.strftime("%Y-%m-%d")
    query = (
        f"after-hours entry at {event_dt.strftime('%H:%M')} on {date_str}. "
        f"Is this a policy violation? Are there any scheduled exceptions for tonight?"
    )

    results = collection.query(
        query_texts=[query],
        n_results=min(n_results, document_count),
        include=["documents", "metadatas"],
    )

    docs = results.get("documents", [[]])[0]
    if not docs:
        return "No relevant policy found."

    return "\n\n---\n\n".join(docs)


# ─── CLI Seed ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    seed_database()
    print("\nTest query: after-hours entry at 23:00")
    print(query_policy("2026-08-02T23:00:00+05:30"))
