import logging
from logging.handlers import RotatingFileHandler

log_formatter = logging.Formatter(
    fmt='%(asctime)s %(levelname)s %(filename)s(%(lineno)d)\n%(message)s\n',
    datefmt='%Y-%m-%d %H:%M:%S UTC/GMT %z'
)
log_file = 'log.log'
my_handler = RotatingFileHandler(
    log_file,
    mode='a',
    maxBytes=10*1024, # 10KB
    backupCount=3,
    encoding='utf-8',
    delay=0
)
my_handler.setFormatter(log_formatter)
my_handler.setLevel(logging.DEBUG)
app_log = logging.getLogger('root')
app_log.setLevel(logging.DEBUG)
app_log.addHandler(my_handler)




"""from datetime import datetime


class Logger:

    def __init__(self, log_file_path, max_preserved_lines=100):
        '''
        Cria um logger. Serve para logar tudo o que o programa precisar logar.
        @param log_file_path: str
            Caminho para o ficheiro onde vai escrever os logs.
            É aconselhado que já exista e que o utilizador que
            executa esta script, tenha permissões de escrita.
        @param max_preserved_lines: int
            Máximo de linhas, das execussões anteriores,
            que o ficheiro deve conservar.
        '''
        self.log_file_path = log_file_path
        self.max_preserved_lines = max_preserved_lines
        self.clear_excess()

    def clear_excess(self, max_lines=100):
        '''
        Limpa o ficheiro de log, para evitar que este fique demasiado longo.
        É invocado no início da execussão.
        '''
        log_file = open(self.log_file_path, 'r+')
        lines = log_file.readlines()
        n_lines = len(lines)

        if n_lines > self.max_preserved_lines:
            n_lines_to_delete = n_lines - self.max_preserved_lines
            log_file.seek(0)
            log_file.truncate()

            for i in range(n_lines_to_delete, n_lines):
                log_file.write(lines[i])
            
        log_file.close()

    def log(self, message):
        '''
        Escreve um log
        @param message: str
            Mensagem a ser logada
        '''
        now = datetime.now()
        current_time = now.strftime('%Y-%m-%d %H:%M:%S')
        log_file = open(self.log_file_path, 'a')
        log_file.write(current_time + '\n' + message + '\n\n')
        log_file.close()
"""
