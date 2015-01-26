#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.application import service
from message.server import MessageServer
from config.configs import MessageConfig


application = service.Application("dev gateway application")

msg = MessageServer(MessageConfig)
msg.configure()
serv = msg.get_service()
serv.setServiceParent(application)
