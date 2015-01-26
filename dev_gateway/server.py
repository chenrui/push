#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.application import internet
from utils import service
from .datapack import DataPackProtoc
from . import config, remote, factory


class DevServer(object):
    '''device gateway server'''

    def __init__(self, config_obj):
        config.from_object(config_obj)

    def configure(self):
        self.config_net_service()
        self.config_remote()

    def get_service(self):
        addr, port = config['DEV_GATEWAY_ADDR']
        return internet.TCPServer(port, factory, interface=addr)

    def config_net_service(self):
        devservice = service.Service("DevServer")
        factory.addServiceChannel(devservice)
        factory.setDataProtocl(DataPackProtoc())

    def config_remote(self):
        devservice = service.Service("Devservice-remote")
        remote.addServiceChannel(devservice)
        remote.setName(config['NODENAME'])
        remote.connect(config['ROUTER_ADDR'])
        importlib.import_module('dev_gateway.command')
