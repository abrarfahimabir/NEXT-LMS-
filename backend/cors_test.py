import urllib.request
import urllib.error

url = 'http://127.0.0.1:8000/api/auth/register/'
req = urllib.request.Request(url, method='OPTIONS')
req.add_header('Origin', 'http://localhost:3004')
req.add_header('Access-Control-Request-Method', 'POST')
req.add_header('Access-Control-Request-Headers', 'content-type')
try:
    resp = urllib.request.urlopen(req)
    print('STATUS', resp.status)
    print('HEADERS', dict(resp.headers))
except urllib.error.HTTPError as e:
    print('HTTP ERROR', e.code)
    print('HEADERS', dict(e.headers))
except Exception as e:
    print('ERROR', repr(e))
