#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from socket import AF_INET,SOCK_STREAM,socket
import configure
from dev_gateway.protobuf.devinfo_pb2 import DeviceInfo
from dev_gateway.protobuf.header_pb2 import ProtocolHeader
from dev_gateway.protobuf.message_pb2 import PushMessage
from dev_gateway.protobuf.message_ack_pb2 import PushMessageAck


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
    return dev


def recevie_push(data):
    header = ProtocolHeader()
    msg = PushMessage()
    header.ParseFromString(data)
    print header.datalen, header.cmdid
    msg.ParseFromString(data[header.ByteSize(): header.ByteSize() + header.datalen])
    print msg
    return msg, data[header.ByteSize() + msg.ByteSize():]


def push_ack(msgids) :
    ack = PushMessageAck()
    ack.ids = json.dumps(msgids)
    header = ProtocolHeader()
    header.cmdid = ProtocolHeader.PUSH_ACK
    header.datalen = ack.ByteSize()
    return header.SerializeToString() + ack.SerializeToString()


def main():
    client = connect(configure.DevServer)
    # init
    client.send(init())
    data = client.recv(1024)
    init_result(data)
    # receive
    while True:
        ids = []
        data = client.recv(1024)
        while len(data) != 0:
            msg, data = recevie_push(data)
            ids.append(msg.id)
        client.send(push_ack(ids))

