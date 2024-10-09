
import logging
app_log = logging.getLogger('root')


# Imports:
import json
from functools import cached_property
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qsl, urlparse
from datetime import datetime, timedelta

class WebRequestHandler(BaseHTTPRequestHandler):

    valid_file_type = {
        "favicon.ico"           : "image/x-icon",
        "default.css"           : "text/css; charset=utf-8",
        "bootstrap.css"         : "text/css; charset=utf-8",
        "bootstrap.css.map"     : "application/json; charset=utf-8",
        "bootstrap.js"          : "text/javascript; charset=utf-8",
        "bootstrap.js.map"      : "application/json; charset=utf-8",
        "main.js"               : "text/javascript; charset=utf-8",
        "jquery.js"             : "text/javascript; charset=utf-8",
        "index.html"            : "text/html; charset=utf-8"
    }
    """Contém a lista dos url's válidos que este pequeno servidor pode servir.
    O valor atribuído a cada url é o MIME* type correto que o servidor deve enviar nos cabeçalhos de resposta.\n
    Alguns dos url's listados neste dicionário são ficheiros reais que residem na pasta HTTP.\n
    No entanto, o url ajax.html é apenas um url 'dummy' ao qual o servidor responde em json.\n
    *Eis alguns MIME types úteis de saber:\n
    * "texto" : "text/plain; charset=utf-8"
    * "json" : "application/json; charset=utf-8"
    * "html" : "text/html; charset=utf-8"
    * "css" : "text/css; charset=utf-8"
    * "js" : "text/javascript; charset=utf-8"
    * "favicon.ico" : "image/x-icon"
    """


    @cached_property
    def url(self):
        return urlparse(self.path)


    @cached_property
    def query_data(self):
        return dict(parse_qsl(self.url.query))


    @cached_property
    def post_data(self):
        content_length = int(self.headers.get("Content-Length", 0))
        return self.rfile.read(content_length)


    @cached_property
    def form_data(self):
        return dict(parse_qsl(self.post_data.decode("utf-8")))


    @cached_property
    def cookies(self):
        return SimpleCookie(self.headers.get("Cookie"))


    def do_GET(self):
        """Caso receba um pedido GET.
        Isto inclui qualquer pedido, mesmo sem string de query (query_data).
        A única exeção, são pedidos POST.
        """

        content = ""
        
        url = self.url.path.lstrip('/')

        #app_log.debug(f"   url: '{url}'")
        if url not in self.valid_file_type:
            url = "index.html"
        #app_log.debug(f"-> url: '{url}'")

        # Send response status code
        self.send_response(200, 'OK')

        # Open file
        if url == "favicon.ico":
            with open("./HTTP/favicon.ico", "rb") as file:
                content = file.read()
                message = content
        else:
            with open(f"./HTTP/{url}", "r") as file:
                content = file.read()
                message = bytes(content, 'utf8')

        # Send headers
        self.send_header('Content-type', self.valid_file_type[url])
        self.send_header('Content-length', str(len(message)))
        self.end_headers()

        # Write content as utf-8 data
        self.wfile.write(message)
        return


    def do_POST(self):
        """Caso receba um pedido POST."""
        ...


