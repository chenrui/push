#!/usr/bin/env python
# -*- coding: utf-8 -*-

from protobuf.header_pb2 import ProtocolHeader


class DataPackProtoc():
    CMD_MAPPING = {ProtocolHeader.INITIALIZE: 'init',
                   ProtocolHeader.PUSH_ACK: 'push_ack'}
    CMD_PUAH = ProtocolHeader.PUSH

    def __init__(self):
        self.header = ProtocolHeader()
        self.header.cmdid = 0
        self.header.datalen = 0

    @property
    def command(self):
        return self.CMD_MAPPING.get(self.cmdid, None)

    @property
    def cmdid(self):
        return self.header.cmdid

    @property
    def datalen(self):
        return self.header.datalen

    def getHeadlength(self):
        return self.header.ByteSize()

    def unpack(self, buff):
         self.header.ParseFromString(buff)

    def pack(self, data, cmdID):
        self.header.cmdid = cmdID
        self.header.datalen = len(data)
        return self.header.SerializeToString() + data
