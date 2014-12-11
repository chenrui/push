#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.internet import reactor
from distributed.remote import RemoteObject
from utils import service
from utils.logger import log

service = service.Service('reference', service.Service.SINGLE_STYLE)


def serviceHandle(target):
    service.mapTarget(target)


@serviceHandle
def printOK(data):
    log.msg("############################")
    log.msg(data)
    return "call printOK_01"


def errback():
    log.msg('xxxxxxxxxxxxxxxxxxxxxxx')
    reactor.stop()


class AuthNode(object):
    def __init__(self, name):
        self.remote = RemoteObject(name)
        self.remote.addServiceChannel(service)

    def connect(self, addr):
        self.remote.connect(addr)
        self.remote.disconnectCallback(errback)

    def start(self):
        reactor.run()
