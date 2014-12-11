#!/usr/bin/env python
# -*- coding: utf-8 -*-

from tp_gateway.server import TPServer
import configure

addr, port = configure.TPServer
tp = TPServer(addr, port)
tp.start()
