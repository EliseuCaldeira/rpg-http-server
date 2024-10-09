
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

    def __init__(self, http_port):
        self.http_port = http_port


    def start(self):
        app_log.info("------------------------------= Serviço iniciado =------------------------------")
        
        run_thread = threading.Thread(target=self.run, daemon=False)
        run_thread.start()
        app_log.debug("Iniciou o thread principal")

        # Inicialização do servidor HTTP:
        # Neste caso é utilizado ThreadingHTTPServer, o que significa que cada ligação gera um novo thread
        servidor_http = ThreadingHTTPServer(('', self.http_port), WebRequestHandler)
        serve_thread = threading.Thread(target=servidor_http.serve_forever)
        serve_thread.daemon = True
        serve_thread.start()
        app_log.info(f"O servidor HTTP está a usar a porta:{self.http_port}")

        run_thread.join()
        app_log.debug("Thread principal parou")


    def run(self):
        while True:
            #app_log.debug("Chegou ao fim do ficheiro!")
            if exit_event.is_set(): # Verifica se foi mandado parar
                break
            time.sleep(0.010) # 10 milisegundo para não "afogar" o CPU


    def __del__(self):
        app_log.info("_____________________________/!\\ Serviço parado /!\\_____________________________")


