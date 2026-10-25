"""Replace the placeholder domain in every page, the sitemap and robots.txt.
Usage (from inside this folder):  python3 set_domain.py https://www.yourdomain.com"""
import os,sys
new=sys.argv[1].rstrip("/");old="https://www.example.com";n=0
for root,_,files in os.walk(os.path.dirname(os.path.abspath(__file__))):
    for f in files:
        if f.endswith((".html",".xml",".txt")):
            p=os.path.join(root,f);s=open(p,encoding="utf-8").read()
            if old in s: open(p,"w",encoding="utf-8").write(s.replace(old,new));n+=1
print(f"Updated {n} files to {new}")
