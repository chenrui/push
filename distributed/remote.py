#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.spread import pb
from twisted.internet import reactor
from reference import ProxyReference


def callRemote(obj, funcName, *args, **kw):
    return obj.callRemote(funcName, *args, **kw)


class RemoteObject(object):
    '''远程调用对象'''

    def __init__(self, name=None):
        self._name = name
        self._factory = pb.PBClientFactory()
        self._reference = ProxyReference()
        self._addr = None

    def setName(self, name):
        self._name = name

    def getName(self):
        return self._name

    def connect(self, addr):
        self._addr = addr
        reactor.connectTCP(addr[0], addr[1], self._factory)
        self.takeProxy()

    def reconnect(self):
        self.connect(self._addr)

    def addServiceChannel(self, service):
        self._reference.addService(service)

    def disconnectCallback(self, callback):
        self._factory.stopFactory = callback

    def takeProxy(self):
        deferedRemote = self._factory.getRootObject()
        deferedRemote.addCallback(callRemote, 'takeProxy', self._name, self._reference)

    def callRemote(self, commandId, *args, **kw):
        '''回调root的接口'''
        deferedRemote = self._factory.getRootObject()
        return deferedRemote.addCallback(callRemote, 'callTarget', commandId, *args, **kw)
