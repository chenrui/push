#!/usr/bin/env python
# -*- coding: utf-8 -*-

from utils.logger import logger
from protobuf.devinfo_pb2 import DeviceInfo
from protobuf.message_pb2 import PushMessage
from router.errno import RetNo
from message.enum import MessageStatus
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

@gatewayServiceHandle
def get_all_messages(conn, data):
    def callback(ret):
        if not isinstance(ret, list):
            return None
        for msg in ret:
            connID = ConnectionMapping.get(conn.device_id, None)
            if connID is not None:
                _push(connID, conn.device_id, msg)

    defer = gateway.callRemote('get_messages_by_status', conn.device_id, MessageStatus.NOT_SEND)
    defer.addCallback(callback)
    return defer


@gatewayServiceHandle
def push_ack(conn, data):
    try:
        msg = PushMessage()
        msg.ParseFromString(data)
    except Exception, e:
        logger.error(e)
        return None
    logger.info('did:%s ack msg:%d received' % (conn.device_id, msg.id))
    gateway.callRemote('update_msg_status', conn.device_id, msg.id, MessageStatus.RECEIVED)


@routerServiceHanlde
def push(did, data):
    connID = ConnectionMapping.get(did, None)
    if connID is not None:
        _push(connID, did, data)


def _push(connID, did, data):
    msg = PushMessage()
    msg.id = data['id']
    msg.sendno = data['sendno']
    msg.generator = data['generator']
    msg.title = data['title']
    msg.body = data['body']
    logger.info('push msg:%d to did:%s' % (msg.id, did))
    factory.connmanager.pushObject(DataPackProtoc.CMD_PUAH, msg.SerializeToString(), [connID])
    gateway.callRemote('update_msg_status', did, msg.id, MessageStatus.SENDING)
