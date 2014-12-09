#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.web import resource
from twisted.web import vhost
from twisted.internet import reactor
from web.request import DelaySite
from web.error import ErrNo, ErrorPage
from auth.client import AuthClient


class TPDispatch(resource.Resource):
    '''Third party gateway dispatcher'''

    def __init__(self, authClint):
        resource.Resource.__init__(self)
        self.authClint = authClint

    def getChild(self, version, request):
        if version == '':
            return self
        else:
            try:
                mo = importlib.import_module('tp_gateway.%s.gateway' % version)
                return mo.TPGateWay(self.authClint)
            except Exception:
                return ErrorPage(ErrNo.INVALID_PARAMETER)

    def render(self, request):
        return ErrorPage(ErrNo.LESS_PARAMETER)


class TPServer(object):
    '''Third party gateway server'''

    def __init__(self, config=None):
        self.config = config
        self.authClint = None
        self.webSrv = None

    def config_web_service(self):
        self.webSrv = vhost.NameVirtualHost()
        self.webSrv.addHost('0.0.0.0', TPDispatch(self.authClint))

    def config_auth_client(self):
        self.authClint = AuthClient()

    def _do_start(self):
        self.config_auth_client()
        self.config_web_service()
        reactor.listenTCP(7777, DelaySite(self.webSrv))

    def start(self):
        self._do_start()
        reactor.run()

    def stop(self):
        pass
