#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from utils.logger import logger
from netconnect.protoc import LiberateFactory
from distributed.remote import RemoteObject
from account.client import AccountClient
from protobuf.devinfo_pb2 import DeviceInfo
from protobuf.message_pb2 import PushMessage
from protobuf.message_ack_pb2 import PushMessageAck
from router.errno import RetNo
from .datapack import DataPackProtoc


factory = LiberateFactory.getInstance()
gateway = RemoteObject.getInstance()
account = AccountClient()
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
def push_ack(conn, data):
    try:
        ack = PushMessageAck()
        ack.ParseFromString(data)
        ids = json.loads(ack.ids)
    except Exception, e:
        logger.error(e)
        return None
    logger.info('ack message ids:%s, did:%s' % (ids, conn.device_id))
    gateway.callRemote('messages_ack', conn.device_id, ids)


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
    msg.timestamp = data['timestamp']
    logger.info('push message(id:%d, did:%s)' % (msg.id, did))
    factory.connmanager.pushObject(DataPackProtoc.CMD_PUAH, msg.SerializeToString(), [connID])
