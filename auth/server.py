#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.web import vhost, resource
from twisted.internet import reactor
from web.request import DelaySite
from web.error import ErrNo, ErrorPage
from web.utils import service
from .globals import root


class AuthDispatch(resource.Resource):

    def getChild(self, version, request):
        if version == '':
            return self
        else:
            try:
                mo = importlib.import_module('auth.%s.master' % version)
                return mo.authProxy()
            except Exception:
                return ErrorPage(ErrNo.INVALID_PARAMETER)

    def render(self, request):
        return ErrorPage(ErrNo.LESS_PARAMETER)


class AuthServer(object):
    def __init__(self, config=None):
        self.config = config
        self.webSrv = None

    def masterapp(self):
        rootservice = service.Service("rootservice")
        root.addServiceChannel(rootservice)
        root.doNodeConnect = _doChildConnect
        root.doNodeLostConnect = _doChildLostConnect
        self.webSrv = vhost.NameVirtualHost()
        self.webSrv.addHost('0.0.0.0', AuthDispatch())

    def start(self):
        reactor.listenTCP(8888, DelaySite(self.webSrv))
        reactor.run()


def _doChildConnect(name, transport):
    pass


def _doChildLostConnect(childID):
    pass
