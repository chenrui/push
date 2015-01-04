#!/usr/bin/env python
# -*- coding: utf-8 -*-

from dev_gateway.server import DevServer
import configure

addr, port = configure.DevServer
dev = DevServer(configure.nodeName, port, configure.routerService)
dev.start()
