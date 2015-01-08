#!/usr/bin/env python
# -*- coding: utf-8 -*-

from utils.logger import logger
from protobuf.devinfo_pb2 import DeviceInfo
from protobuf.message_pb2 import PushMessage
from router.errno import RetNo
from .globals import factory, account, gateway
from .datapack import DataPackProtoc

ConnectionMapping = {}


def gatewayServiceHandle(target):
    service = factory.getServiceChannel()
    service.mapTarget(target)


def routerServiceHanlde(target):
    service = gateway.getServiceChannel()
    service.mapTarget(target)


def connectionlost(conn):
    gateway.callRemote('logout', gateway.getName(), conn.device_id)
    try:
        del ConnectionMapping[conn.device_id]
    except Exception:
        pass
factory.doConnectionLost = connectionlost


@gatewayServiceHandle
def init(conn, data):
    try:
        dev = DeviceInfo()
        dev.ParseFromString(data)
    except Exception, e:
        logger.error(e)
        return None
    # register device
    if not dev.device_id:
        ret = account.registDevice(dev.imei, dev.platform, dev.device_type)
        dev.device_id = ret['did']
    conn.device_id = dev.device_id
    ConnectionMapping[dev.device_id] = conn.transport.sessionno
    # login
    defer = gateway.callRemote('login', gateway.getName(), dev.device_id)
    defer.addCallback(lambda ret: dev.SerializeToString() if ret == RetNo.SUCCESS else None)
    return defer


@routerServiceHanlde
def push(did, data):
    msg = PushMessage()
    msg.sendno = data['sendno']
    msg.generator = data.get('generator', '')
    msg.title = data['title']
    msg.body = data['body']
    connID = ConnectionMapping.get(did, None)
    if connID is not None:
        factory.connmanager.pushObject(DataPackProtoc.CMD_PUAH, msg.SerializeToString(), [connID])
