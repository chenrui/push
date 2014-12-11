#!/usr/bin/env python
# -*- coding: utf-8 -*-

from auth.node import AuthNode

node = AuthNode('test')
node.connect(('localhost', 9998))
node.start()
