#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.application import service
from dev_gateway.server import DevServer
from config.configs import DevConfig


application = service.Application("dev gateway application")

dev = DevServer(DevConfig)
dev.configure()
serv = dev.get_service()
serv.setServiceParent(application)
