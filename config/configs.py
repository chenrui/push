#!/usr/bin/env python
# -*- coding: utf-8 -*-

from .globals import BaseConfig


class ThirdPartConfig(BaseConfig):
    pass


class AccountConfig(BaseConfig):
    DATABASE = {'ENGINE': 'mysql',
                'HOST': '127.0.0.1',
                'USER': 'root',
                'PASSWORD': 'root',
                'NAME': 'push'
                }
    BINDDB = False


class DevConfig(BaseConfig):
    NODENAME = 'dev_gateway_1'


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


class RouterConfig(BaseConfig):
    DATABASE = {'ENGINE': 'mysql',
                'HOST': '127.0.0.1',
                'USER': 'root',
                'PASSWORD': 'root',
                'NAME': 'push'
                }
    BINDDB = False
    MSGNODE = MessageConfig.NODENAME
