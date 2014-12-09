#!/usr/bin/env python
# -*- coding: utf-8 -*-

from auth.server import AuthServer

auth = AuthServer()
auth.masterapp()
auth.start()
