import subprocess

result = subprocess.run(
    ["git", "push", "origin", "main"],
    capture_output=True, text=True,
    cwd=r"C:\Users\khush\75her"
)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
print("Return code:", result.returncode)
