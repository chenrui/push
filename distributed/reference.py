#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.spread import pb
from firefly.utils.services import Service


class ProxyReference(pb.Referenceable):
    '''代理通道'''

    def __init__(self):
        self._service = Service('proxy')

    def addService(self, service):
        self._service = service

    def remote_callNode(self, command, *arg, **kw):
        '''代理发送数据
        '''
        return self._service.callTarget(command, *arg, **kw)
