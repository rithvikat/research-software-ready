from flask import Flask, request, send_file
import os
from analyzer import analyze_repo
from report_generator import generate_json, generate_html

app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    return """
    <h2>🛡 RepoReady</h2>
    <form action="/analyze" method="post">
        <input type="text" name="repo" placeholder="Enter local repo path" style="width:300px;padding:10px"/>
        <button type="submit">Analyze</button>
    </form>
    """

@app.route("/analyze", methods=["POST"])
def analyze():
    repo_path = request.form.get("repo")

    if not repo_path or not os.path.exists(repo_path):
        return "❌ Invalid repository path"

    result = analyze_repo(repo_path)
    generate_json(result)
    generate_html(result)

    return send_file("output/report.html")


# Vercel needs this
app = app
