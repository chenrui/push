#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.internet import reactor
from twisted.internet import protocol
from twisted.python import log
from .manager import ConnectionManager


def DefferedErrorHandle(e):
    log.err(str(e))
    return


class LiberateProtocol(protocol.Protocol):
    buff = ""

    def connectionMade(self):
        self.factory.connmanger.addConnection(self)
        self.factory.doConnectionMade(self)
        self.datahandler = self.dataHandleCoroutine()
        self.datahandler.next()

    def connectionLost(self, reason):
        self.factory.doConnectionLost(self)
        self.factory.connmanager.dropConnectionByID(self.transport.sessionno)

    def dataReceived(self, data):
        self.datahandler.send(data)

    def safeToWriteData(self, data, cmdID):
        if not self.transport.connected or data is None:
            return
        senddata = self.factory.dataprotocl.pack(data, cmdID)
        reactor.callFromThread(self.transport.write, senddata)

    def dataHandleCoroutine(self):
        length = self.factory.dataprotocl.getHeadlength()
        while True:
            data = yield
            self.buff += data
            while len(self.buff) >= length:
                try:
                    self.factory.dataprotocl.unpack(self.buff[:length])
                except Exception:
                    log.msg('illegal header package')
                    self.transport.loseConnection()
                    break
                rlength = self.factory.dataprotocl.datalen
                command = self.factory.dataprotocl.command
                cmdid = self.factory.dataprotocl.cmdid
                request = self.buff[length:length + rlength]
                if len(request) < rlength:
                    log.msg('some data lose')
                    break
                self.buff = self.buff[length + rlength:]
                d = self.factory.doDataReceived(self, command, request)
                if not d:
                    continue
                d.addCallback(self.safeToWriteData, cmdid)
                d.addErrback(DefferedErrorHandle)


class LiberateFactory(protocol.ServerFactory):

    protocol = LiberateProtocol

    def __init__(self):
        self.service = None
        self.dataprotocl = None
        self.connmanager = ConnectionManager()

    def setDataProtocl(self, dataprotocl):
        self.dataprotocl = dataprotocl

    def doConnectionMade(self, conn):
        pass

    def doConnectionLost(self, conn):
        pass

    def addServiceChannel(self, service):
        self.service = service

    def getServiceChannel(self):
        return self.service

    def doDataReceived(self, conn, command, data):
        defer_tool = self.service.callTarget(command, conn, data)
        return defer_tool

    def loseConnection(self, connID):
        self.connmanager.loseConnection(connID)

    def pushObject(self, topicID, msg, sendList):
        self.connmanager.pushObject(topicID, msg, sendList)
