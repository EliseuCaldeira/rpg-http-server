
import logging
from logging.handlers import RotatingFileHandler
from include.Service import *

#
log_file_path   = './rpg-http-server.log'

# Preparar o logger da app:
log_formatter = logging.Formatter(
    fmt='%(asctime)s %(levelname)s %(filename)s(%(lineno)d)\n%(message)s\n',
    datefmt='%Y-%m-%d %H:%M:%S UTC/GMT %z'
)
log_file = log_file_path
my_handler = RotatingFileHandler(
    log_file,
    mode='a',
    maxBytes=1024*1024, # 1MB
    backupCount=3,
    encoding='utf-8',
    delay=False
)
my_handler.setFormatter(log_formatter)
my_handler.setLevel(logging.DEBUG)
app_log = logging.getLogger('root')
app_log.setLevel(logging.DEBUG)
app_log.addHandler(my_handler)
# A partir de aqui já se pode utilizar o logger Ex.: app_log.debug("Mensagem")
#app_log.debug("Logger iniciado")

if __name__ == "__main__":
    service = Service(8080)
    service.start()
