"""Makes the .js copy of each 360° photo so tours also work when index.html
is opened by double-clicking (no server). Run from the website folder:

    python tools/make-tour-js.py

It looks in assets/tour/*/ for .jpg photos (not the -thumb ones) and writes
a .js file with the same name next to each. Run it again after adding photos."""
import base64, glob, os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
made = 0
for jpg in sorted(glob.glob(os.path.join(root, "assets", "tour", "*", "*.jpg"))):
    if jpg.endswith("-thumb.jpg"):
        continue
    key = os.path.relpath(jpg, root).replace(os.sep, "/")
    out = jpg[:-4] + ".js"
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(jpg):
        continue
    data = base64.b64encode(open(jpg, "rb").read()).decode("ascii")
    with open(out, "w", encoding="ascii", newline="\n") as f:
        f.write('(window.LOBOC_PANO=window.LOBOC_PANO||{})["%s"]="data:image/jpeg;base64,%s";\n' % (key, data))
    made += 1
    print("made", os.path.relpath(out, root))
print(made, "file(s) made")
