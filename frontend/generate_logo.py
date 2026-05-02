import subprocess
from pathlib import Path


script_path = Path(__file__).with_name("scripts") / "generate-logo.js"
subprocess.run(["node", str(script_path)], check=True)
