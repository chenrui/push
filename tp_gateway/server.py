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

    def __init__(self, authClnt):
        resource.Resource.__init__(self)
        self.authClnt = authClnt

    def getChild(self, version, request):
        if version == '':
            return self
        else:
            try:
                mo = importlib.import_module('tp_gateway.%s.gateway' % version)
                return mo.TPGateWay(self.authClnt)
            except Exception:
                return ErrorPage(ErrNo.INVALID_PARAMETER)

    def render(self, request):
        return ErrorPage(ErrNo.LESS_PARAMETER)


class TPServer(object):
    '''Third party gateway server'''

    def __init__(self, addr, port):
        self.webSrv = None
        self.addr = addr
        self.port = port

    def config_web_service(self):
        authClnt = AuthClient()
        self.webSrv = vhost.NameVirtualHost()
        self.webSrv.addHost(self.addr, TPDispatch(authClnt))

    def _do_start(self):
        self.config_auth_client()
        self.config_web_service()
        reactor.listenTCP(self.port, DelaySite(self.webSrv))

    def start(self):
        self._do_start()
        reactor.run()

    def stop(self):
        pass
