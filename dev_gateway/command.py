#!/usr/bin/env python
# -*- coding: utf-8 -*-

from utils.logger import log
from .globals import factory, account, gateway
from protobuf.devinfo_pb2 import DeviceInfo
from router.errno import RetNo


def serviceHandle(target):
    service = factory.getServiceChannel()
    service.mapTarget(target)


@serviceHandle
def init(conn, data):
    try:
        dev = DeviceInfo()
        dev.ParseFromString(data)
    except Exception, e:
        log.err(e)
        return None
    # register device
    if not dev.device_id:
        ret = account.registDevice(dev.imei, dev.platform, dev.device_type)
        dev.device_id = ret['did']
    # login
    defer = gateway.callRemote('login', gateway.getName(), dev.device_id)
    defer.addCallback(lambda ret: dev.SerializeToString() if ret == RetNo.SUCCESS else None)
    return defer

