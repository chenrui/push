#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.internet import reactor
from utils import service
from .datapack import DataPackProtoc
from .globals import factory, gateway


class DevServer(object):
    '''device gateway server'''

    def __init__(self, node_name, port, remote_addr):
        self.port = port
        self.factory = factory
        self.node_name = node_name
        self.remode_addr = remote_addr

    def config_net_service(self):
        devservice = service.Service("devservice")
        self.factory.addServiceChannel(devservice)
        self.factory.setDataProtocl(DataPackProtoc())
        importlib.import_module('dev_gateway.command')

    def config_gateway(self):
        devservice = service.Service("devservice-inner")
        gateway.addServiceChannel(devservice)
        gateway.setName(self.node_name)
        gateway.connect(self.remode_addr)

    def _do_start(self):
        self.config_gateway()
        self.config_net_service()
        reactor.listenTCP(self.port, self.factory)

    def start(self):
        self._do_start()
        reactor.run()

    def stop(self):
        pass
