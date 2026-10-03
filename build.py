import re, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
h=open('index.html',encoding='utf-8').read(); css=open('style.css',encoding='utf-8').read()
title='<title>ISA Future Project</title>'
body=re.search(r"<body>(.*?)</body>", h, re.S).group(1)
body=re.sub(r'<script src="js/[^"]+"></script>\s*','',body)
js=''.join(open('js/'+f,encoding='utf-8').read()+'\n' for f in ['engine.js','ai.js','i18n.js','audio.js','ui.js']).replace('</script>','<\/script>')
os.makedirs('dist',exist_ok=True)
open('dist/artifact.html','w',encoding='utf-8').write(title+'\n<style>\n'+css+'\n</style>\n'+body+'\n<script>\n'+js+'\n</script>\n')
open('dist/ISA-Future-Project.html','w',encoding='utf-8').write('<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="theme-color" content="#040a1c">\n'+title+'\n<style>\n'+css+'\n</style>\n</head>\n<body>\n'+body+'\n<script>\n'+js+'\n</script>\n</body>\n</html>\n')
print('built')
