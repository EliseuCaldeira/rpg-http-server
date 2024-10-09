
import logging
app_log = logging.getLogger('root')


# Imports:
import threading
import time
import signal
from http.server import ThreadingHTTPServer
from datetime import datetime, timedelta
from include.http import *


exit_event = threading.Event()


def signal_handler(signum, frame):
    exit_event.set()


signal.signal(signal.SIGINT, signal_handler)


class Service:

    def __init__(self):
        self.http_port = 8080
        app_log.info("------------------------------= Serviço iniciado =------------------------------")


    def start(self):
        # Inicialização do servidor HTTP:
        # Neste caso é utilizado ThreadingHTTPServer, o que significa que cada ligação gera um novo thread
        servidor_http = ThreadingHTTPServer(('', self.http_port), WebRequestHandler)
        serve_thread = threading.Thread(target=servidor_http.serve_forever)
        serve_thread.daemon = True
        serve_thread.start()
        app_log.info(f"O servidor HTTP está a usar a porta:{self.http_port}")


    def __del__(self):
        app_log.info("_____________________________/!\\ Serviço parado /!\\_____________________________")


