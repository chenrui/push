#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.web import vhost, resource
from twisted.internet import reactor
from web.request import DelaySite
from web.error import ErrNo, ErrorPage
from utils import root, service


class AuthDispatch(resource.Resource):

    def __init__(self, root):
        resource.Resource.__init__(self)
        self.root = root

    def getChild(self, version, request):
        if version == '':
            return self
        else:
            try:
                mo = importlib.import_module('auth.%s.auth' % version)
                return mo.Authent(self.root)
            except Exception:
                return ErrorPage(ErrNo.INVALID_PARAMETER)

    def render(self, request):
        return ErrorPage(ErrNo.LESS_PARAMETER)


def _doChildConnect(name, transport):
    pass


def _doChildLostConnect(childID):
    pass


class AuthServer(object):
    def __init__(self, config=None):
        self.config = config
        self.root = None
        self.webSrv = None

    def masterapp(self):
        self.root = root.PBRoot()
        rootservice = service.Service("rootservice")
        # self.root.addServiceChannel(rootservice)
        # self.root.doChildConnect = _doChildConnect
        # self.root.doChildLostConnect = _doChildLostConnect
        self.webSrv = vhost.NameVirtualHost()
        self.webSrv.addHost('0.0.0.0', AuthDispatch(self.root))

    def start(self):
        reactor.listenTCP(8888, DelaySite(self.webSrv))
        reactor.run()
