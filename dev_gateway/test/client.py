#!/usr/bin/env python
# -*- coding: utf-8 -*-

from socket import AF_INET,SOCK_STREAM,socket
import configure
from dev_gateway.protobuf.devinfo_pb2 import DeviceInfo
from dev_gateway.protobuf.header_pb2 import ProtocolHeader
from dev_gateway.protobuf.message_pb2 import PushMessage


def connect(addr):
    client = socket(AF_INET, SOCK_STREAM)
    client.connect(addr)
    return client


def init():
    header = ProtocolHeader()
    dev = DeviceInfo()
    dev.imei = '0000000000'
    dev.platform = 'Android'
    dev.device_type = 'TCL xxx'
    dev.device_id = ''

    header.cmdid = ProtocolHeader.INITIALIZE
    header.datalen = dev.ByteSize()
    return header.SerializeToString() + dev.SerializeToString()


def init_result(data):
    header = ProtocolHeader()
    dev = DeviceInfo()
    header.ParseFromString(data)
    print header.datalen
    dev.ParseFromString(data[header.ByteSize():])
    print dev


def recevie_msg(data):
    header = ProtocolHeader()
    msg = PushMessage()
    header.ParseFromString(data)
    print header.datalen
    msg.ParseFromString(data[header.ByteSize():])
    print msg


def main():
    client = connect(configure.DevServer)
    client.send(init())
    data = client.recv(1024)
    init_result(data)
    data = client.recv(1024)
    recevie_msg(data)

