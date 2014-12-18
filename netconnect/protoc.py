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

    def safeToWriteData(self, data, command):
        if not self.transport.connected or data is None:
            return
        senddata = self.factory.produceResult(data, command)
        reactor.callFromThread(self.transport.write, senddata)

    def dataHandleCoroutine(self):
        length = self.factory.dataprotocl.getHeadlength()
        while True:
            data = yield
            self.buff += data
            while len(self.buff) >= length:
                unpackdata = self.factory.dataprotocl.unpack(self.buff[:length])
                if not unpackdata.get('result'):
                    log.msg('illegal data package')
                    self.transport.loseConnection()
                    break
                command = unpackdata.get('command')
                rlength = unpackdata.get('length')
                request = self.buff[length:length + rlength]
                if len(request) < rlength:
                    log.msg('some data lose')
                    break
                self.buff = self.buff[length + rlength:]
                d = self.factory.doDataReceived(self, command, request)
                if not d:
                    continue
                d.addCallback(self.safeToWriteData, command)
                d.addErrback(DefferedErrorHandle)

    def dataReceived(self, data):
        self.datahandler.send(data)



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

    def doDataReceived(self, conn, commandID, data):
        defer_tool = self.service.callTarget(commandID, conn, data)
        return defer_tool

    def produceResult(self, command, response):
        return self.dataprotocl.pack(command, response)

    def loseConnection(self, connID):
        self.connmanager.loseConnection(connID)

    def pushObject(self, topicID, msg, sendList):
        self.connmanager.pushObject(topicID, msg, sendList)
