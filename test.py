#!/usr/bin/env python
# -*- coding: utf-8 -*-

from account.server import AccountServer
import configure

addr, port = configure.accountServer
account = AccountServer(addr, port)
account.masterapp()
account.start()
