#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.python import log
import logging


logger = None

def set_logger(level):
    global logger
    log = Logger(level)
    log.start()
    logger = log.get_logger()


class Logger(log.PythonLoggingObserver):
    def __init__(self, level):
        self.logger = logging.getLogger('push-service')
        self.logger.setLevel(level)
        hdl = logging.StreamHandler()
        hdl.setFormatter(logging.Formatter(
            '%(asctime)-15s %(levelname)s %(module)s %(process)d: %(message)s'))
        hdl.setLevel(level)
        self.logger.addHandler(hdl)

    def get_logger(self):
        return self.logger
