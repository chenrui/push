#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.internet import reactor
from utils import service
from utils.db import db
from distributed.root import BilateralFactory
from .globals import root


class RouterServer(object):
    @classmethod
    def db_mapping(self, create_tables=False):
        importlib.import_module('router.models')
        db.bind('mysql', host='127.0.0.1', user='root', passwd='root', db='push')
        db.generate_mapping(create_tables=create_tables)

    def __init__(self, port):
        self.port = port

    def masterapp(self):
        routerservice = service.Service("routerservice")
        root.addServiceChannel(routerservice)
        root.doNodeConnect = _doChildConnect
        root.doNodeLostConnect = _doChildLostConnect
        importlib.import_module('router.command')
        self.db_mapping(True)

    def start(self):
        self.masterapp()
        reactor.listenTCP(self.port, BilateralFactory(root))
        reactor.run()



def _doChildConnect(name, transport):
    pass


def _doChildLostConnect(nodeID):
    pass