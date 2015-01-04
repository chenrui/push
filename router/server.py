#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
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
        importlib.import_module('router.command')

    def start(self):
        self.masterapp()
        reactor.listenTCP(self.port, BilateralFactory(root))
        reactor.run()



def _doChildConnect(name, transport):
    pass


def _doChildLostConnect(name, transport):
    pass