import subprocess, sys

msg = "feat: production deploy"
result = subprocess.run(
    ["git", "commit", "-m", msg],
    capture_output=True, text=True,
    cwd=r"C:\Users\khush\75her"
)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
print("Return code:", result.returncode)
