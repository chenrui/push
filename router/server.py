#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.application import internet
from utils import service
from utils.db import db
from distributed.root import BilateralFactory
from . import pbroot, config


class RouterServer(object):
    def __init__(self, config_obj):
        config.from_object(config_obj)

    def get_service(self):
        addr, port = config['ROUTER_ADDR']
        return internet.TCPServer(port, BilateralFactory(pbroot), interface=addr)

    def configure(self):
        self.config_pbroot()
        self.config_database(True)

    def config_pbroot(self):
        routerservice = service.Service("RouterServer")
        pbroot.addServiceChannel(routerservice)
        pbroot.doNodeConnect = _doChildConnect
        pbroot.doNodeLostConnect = _doChildLostConnect
        importlib.import_module('router.command')

    def config_database(self, create_tables=False):
        importlib.import_module('router.models')
        if config.get('BINDDB', True):
            db_config = config['DATABASE']
            db.bind(db_config['ENGINE'], host=db_config['HOST'], user=db_config['USER'],
                    passwd=db_config['PASSWORD'], db=db_config['NAME'])
            db.generate_mapping(create_tables=create_tables)


def _doChildConnect(name, transport):
    pass


def _doChildLostConnect(nodeID):
    pass