import requests

try:
    resp = requests.post(
        "http://localhost:8000/api/chat",
        json={"project_id": "FashionR2R", "char_id": "yevna", "message": "test"}
    )
    print("STATUS:", resp.status_code)
    print("BODY:", resp.text)
except Exception as e:
    print("ERROR:", str(e))
