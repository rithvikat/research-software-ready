import os

def analyze_repo(path):
    result = {
        "score": 0,
        "checks": []
    }

    score = 0

    # README
    readme = os.path.exists(os.path.join(path, "README.md"))
    if readme:
        score += 25

    result["checks"].append({
        "name": "README Quality",
        "score": 25 if readme else 0,
        "max": 30,
        "status": "good" if readme else "bad",
        "message": "README file exists" if readme else "Missing README file"
    })

    # LICENSE
    license_exists = os.path.exists(os.path.join(path, "LICENSE"))
    if license_exists:
        score += 15

    result["checks"].append({
        "name": "License",
        "score": 15 if license_exists else 0,
        "max": 15,
        "status": "good" if license_exists else "bad",
        "message": "License file check"
    })

    # TESTS
    tests = os.path.exists(os.path.join(path, "tests"))
    if tests:
        score += 20

    result["checks"].append({
        "name": "Tests",
        "score": 20 if tests else 0,
        "max": 20,
        "status": "good" if tests else "bad",
        "message": "Tests folder check"
    })

    # DOCS
    docs = os.path.exists(os.path.join(path, "docs"))
    if docs:
        score += 10

    result["checks"].append({
        "name": "Documentation",
        "score": 10 if docs else 0,
        "max": 10,
        "status": "good" if docs else "bad",
        "message": "Documentation folder check"
    })

    result["score"] = score
    return result
