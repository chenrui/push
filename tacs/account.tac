#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.application import service
from account.server import AccountServer
from config.configs import AccountConfig


application = service.Application("account application")

account = AccountServer(AccountConfig)
account.configure()
serv = account.get_service()
serv.setServiceParent(application)
