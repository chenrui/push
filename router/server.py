#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.internet import reactor
from utils import service
from distributed.root import BilateralFactory
from .globals import root


class RouterServer(object):
    def __init__(self, port):
        self.port = port

    def masterapp(self):
        routerservice = service.Service("routerservice")
        root.addServiceChannel(routerservice)
        root.doNodeConnect = _doChildConnect
        root.doNodeLostConnect = _doChildLostConnect

    def start(self):
        reactor.listenTCP(self.root_port, BilateralFactory(root))
        reactor.run()



def _doChildConnect():
    pass


def _doChildLostConnect():
    pass