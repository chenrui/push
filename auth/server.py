#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.web import vhost, resource
from twisted.internet import reactor
from web.request import DelaySite
from web.error import ErrNo, ErrorPage, SuccessPage
from utils import service
from utils.logger import log
from distributed.root import BilateralFactory
from .globals import root

SUCCESS = 1

class AuthMaster(resource.Resource):

    def __init__(self, method=None):
        self.method = method
        resource.Resource.__init__(self)

    def getChild(self, path, request):
        if path == 'auth':
            self.putChild('checkheader', AuthMaster('checkheader'))
            return resource.getChildForRequest(self, request)
        else:
            return ErrorPage(ErrNo.NO_RESOURCE)

    def render_POST(self, request):
        data = request.content.getvalue()
        return self.handler(json.loads(data))

    def handler(self, data):
        if self.method == 'checkheader':
            defer = root.callNode('authorizeHeader', data['Authorization'])
            defer.addCallback(lambda ret: SuccessPage() if ret == SUCCESS else ErrorPage(ErrNo.UNAUTHORIZED))
            return defer


class AuthServer(object):
    def __init__(self, addr, port, root_port):
        self.webSrv = None
        self.addr = addr
        self.port = port
        self.root_port = root_port

    def masterapp(self):
        rootservice = service.Service("rootservice")
        root.addServiceChannel(rootservice)
        root.doNodeConnect = _doChildConnect
        root.doNodeLostConnect = _doChildLostConnect
        self.webSrv = vhost.NameVirtualHost()
        self.webSrv.addHost(self.addr, AuthMaster())

    def start(self):
        reactor.listenTCP(self.root_port, BilateralFactory(root))
        reactor.listenTCP(self.port, DelaySite(self.webSrv))
        reactor.run()


def _doChildConnect(name, transport):
    pass


def _doChildLostConnect(childID):
    pass
