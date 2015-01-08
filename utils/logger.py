#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.python import log
import sys
import logging

# log.startLogging(sys.stdout)


logger = logging.getLogger('service')


def set_logger(level):
    hdl = logging.FileHandler('push.log')
    hdl.setFormatter(logging.Formatter(
        '%(asctime)-15s %(levelname)s %(module)s %(process)d: %(message)s'))
    hdl.setLevel(logging.INFO)
    logger.addHandler(hdl)
    logger.setLevel(level)
    hdl = logging.StreamHandler()
    hdl.setFormatter(logging.Formatter(
        '%(asctime)-15s %(levelname)s %(module)s %(process)d: %(message)s'))
    hdl.setLevel(level)
    logger.addHandler(hdl)