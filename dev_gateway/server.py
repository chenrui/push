#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.internet import reactor
from netconnect.protoc import LiberateFactory
from distributed.remote import RemoteObject
from utils import service
from utils.logger import set_logger, logging
from .datapack import DataPackProtoc


class DevServer(object):
    '''device gateway server'''

    def __init__(self, node_name, port, remote_addr):
        self.port = port
        self.remode_addr = remote_addr
        self.factory = LiberateFactory.getInstance()
        self.remote = RemoteObject.getInstance(node_name)

    def config_net_service(self):
        devservice = service.Service("devservice")
        self.factory.addServiceChannel(devservice)
        self.factory.setDataProtocl(DataPackProtoc())
        importlib.import_module('dev_gateway.command')

    def config_gateway(self):
        devservice = service.Service("devservice-inner")
        self.remote.addServiceChannel(devservice)
        self.remote.connect(self.remode_addr)

    def _do_start(self):
        set_logger(logging.DEBUG)
        self.config_gateway()
        self.config_net_service()
        reactor.listenTCP(self.port, self.factory)

    def start(self):
        self._do_start()
        reactor.run()

    def stop(self):
        pass
