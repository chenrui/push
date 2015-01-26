#!/usr/bin/env python
# -*- coding: utf-8 -*-


class BaseConfig(object):
    TP_GATEWAY_ADDR = ('127.0.0.1', 8888)
    DEV_GATEWAY_ADDR = ('127.0.0.1', 7777)

    ACCOUNT_ADDR = ('127.0.0.1', 9999)
    ROUTER_ADDR = ('127.0.0.1', 9998)
    MESSAGE_ADDR = ('127.0.0.1', 9997)

    DATABASE = {'ENGINE': 'mysql',
                'HOST': '127.0.0.1',
                'USER': 'root',
                'PASSWORD': 'root',
                'NAME': 'push'
                }
