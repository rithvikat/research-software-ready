import json
import os
import shutil
from jinja2 import Template

OUTPUT_DIR = "output"

def generate_json(data):
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(f"{OUTPUT_DIR}/report.json", "w") as f:
        json.dump(data, f, indent=4)


def generate_html(data):
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Load template
    with open("templates/report_template.html") as f:
        template = Template(f.read())

    html = template.render(data=data)

    # Save HTML
    with open(f"{OUTPUT_DIR}/report.html", "w") as f:
        f.write(html)

    # Copy CSS
    shutil.copy("static/styles.css", f"{OUTPUT_DIR}/styles.css")
