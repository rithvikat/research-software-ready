import sys
import os
from analyzer import analyze_repo
from report_generator import generate_json, generate_html

def main():
    if len(sys.argv) < 2:
        print("Usage: python client.py <repo_path>")
        return

    repo_path = sys.argv[1]

    if not os.path.exists(repo_path):
        print("❌ Invalid path")
        return

    print("🔍 Analyzing repository...")

    result = analyze_repo(repo_path)

    generate_json(result)
    generate_html(result)

if __name__ == "__main__":
    main()
