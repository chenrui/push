#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
from .globals import BaseConfig


class ThirdPartConfig(BaseConfig):
    LOGLEVEL = logging.DEBUG


class AccountConfig(BaseConfig):
    DATABASE = {'ENGINE': 'mysql',
                'HOST': '127.0.0.1',
                'USER': 'root',
                'PASSWORD': 'root',
                'NAME': 'push'
                }
    BINDDB = False
    LOGLEVEL = logging.DEBUG


class DevConfig(BaseConfig):
    NODENAME = 'dev_gateway_1'
    LOGLEVEL = logging.DEBUG


class MessageConfig(BaseConfig):
    DATABASE = {'ENGINE': 'mysql',
                'HOST': '127.0.0.1',
                'USER': 'root',
                'PASSWORD': 'root',
                'NAME': 'push'
                }
    BINDDB = False
    REDIS = {}
    NODENAME = 'message'
    LOGLEVEL = logging.DEBUG


class RouterConfig(BaseConfig):
    DATABASE = {'ENGINE': 'mysql',
                'HOST': '127.0.0.1',
                'USER': 'root',
                'PASSWORD': 'root',
                'NAME': 'push'
                }
    BINDDB = False
    LOGLEVEL = logging.DEBUG
    MSGNODE = MessageConfig.NODENAME
