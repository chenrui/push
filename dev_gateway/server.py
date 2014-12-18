#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.internet import reactor
from utils import service
from .datapack import DataPackProtoc
from .globals import factory


class DevServer(object):
    '''device gateway server'''

    def __init__(self, port):
        self.port = port
        self.factory = factory

    def config_net_service(self):
        devservice = service.Service("devservice")
        self.factory.addServiceChannel(devservice)
        self.factory.setDataProtocl(DataPackProtoc())

    def _do_start(self):
        self.config_net_service()
        reactor.listenTCP(self.port, self.factory)

    def start(self):
        self._do_start()
        reactor.run()

    def stop(self):
        pass
