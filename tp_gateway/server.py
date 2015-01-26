#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.application import internet
from twisted.web import resource
from web.request import DelaySite
from web.error import ErrNo, ErrorPage
from account.client_async import AccountClient
from message.client import MessageClient
from . import config


class TPDispatch(resource.Resource):
    '''Third party gateway dispatcher'''

    def __init__(self, authClnt, msgClnt):
        resource.Resource.__init__(self)
        self.authClnt = authClnt
        self.msgClnt = msgClnt

    def getChild(self, version, request):
        if version == '':
            return self
        else:
            try:
                mo = importlib.import_module('tp_gateway.%s.gateway' % version)
                return mo.TPGateWay(self.authClnt, self.msgClnt)
            except Exception:
                return ErrorPage(ErrNo.INVALID_PARAMETER)

    def render(self, request):
        return ErrorPage(ErrNo.LESS_PARAMETER)


class TPServer(object):
    '''Third party gateway server'''

    def __init__(self, config_obj):
        config.from_object(config_obj)

    def get_service(self):
        addr, port = config['TP_GATEWAY_ADDR']
        authClnt = AccountClient(config['ACCOUNT_ADDR'])
        msgClnt = MessageClient(config['MESSAGE_ADDR'])
        return internet.TCPServer(port, DelaySite(TPDispatch(authClnt, msgClnt)), interface=addr)

    def configure(self):
        pass
