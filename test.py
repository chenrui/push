#!/usr/bin/env python
# -*- coding: utf-8 -*-

from account.server import AccountServer
import configure

addr, port = configure.AuthServer
auth = AccountServer(addr, port, configure.AuthRootPort)
auth.masterapp()
auth.start()
