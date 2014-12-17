#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.web import vhost, resource
from twisted.internet import reactor
from web.request import DelaySite
from web.error import ErrNo, ErrorPage
from utils import service
# from utils.logger import log
from distributed.root import BilateralFactory
from .globals import root
from .account_app import AccountApp
from .account_dev import AccountDev


class AccountDispatch(resource.Resource):

    def getChild(self, path, request):
        if path == 'account-app':
            self.putChild('checkmsg', AccountApp('checkmsg'))
            self.putChild('new', AccountApp('new'))
            self.putChild('delete', AccountApp('delete'))
            return resource.getChildForRequest(self, request)
        elif path == 'account-dev':
            self.putChild('register', AccountDev('register'))
            return resource.getChildForRequest(self, request)
        else:
            return ErrorPage(ErrNo.NO_RESOURCE)


class AccountServer(object):
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
        self.webSrv.addHost(self.addr, AccountDispatch())

    def start(self):
        reactor.listenTCP(self.root_port, BilateralFactory(root))
        reactor.listenTCP(self.port, DelaySite(self.webSrv))
        reactor.run()


def _doChildConnect(name, transport):
    pass


def _doChildLostConnect(childID):
    pass
