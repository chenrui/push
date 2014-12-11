#!/usr/bin/env python
# -*- coding: utf-8 -*-

from auth.server import AuthServer
import configure

addr, port = configure.AuthServer
auth = AuthServer(addr, port, configure.AuthRootPort)
auth.masterapp()
auth.start()
