#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.internet import reactor
from utils import service
from utils.db import db
from utils.logger import set_logger, logging
from distributed.root import BilateralFactory, PBRoot


class RouterServer(object):
    @classmethod
    def db_mapping(self, create_tables=False):
        importlib.import_module('router.models')
        db.bind('mysql', host='127.0.0.1', user='root', passwd='root', db='push')
        db.generate_mapping(create_tables=create_tables)

    def __init__(self, port):
        self.port = port
        self.root = PBRoot.getInstance()

    def masterapp(self):
        routerservice = service.Service("routerservice")
        self.root.addServiceChannel(routerservice)
        self.root.doNodeConnect = _doChildConnect
        self.root.doNodeLostConnect = _doChildLostConnect
        importlib.import_module('router.command')
        self.db_mapping(True)

    def start(self):
        set_logger(logging.DEBUG)
        self.masterapp()
        reactor.listenTCP(self.port, BilateralFactory(self.root))
        reactor.run()



def _doChildConnect(name, transport):
    pass


def _doChildLostConnect(nodeID):
    pass