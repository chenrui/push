#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.application import service
from router.server import RouterServer
from config.configs import RouterConfig


application = service.Application("router application")


router = RouterServer(RouterConfig)
router.configure()
serv = router.get_service()
serv.setServiceParent(application)
