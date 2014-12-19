#!/usr/bin/env python
# -*- coding: utf-8 -*-

from utils.logger import log
from .globals import factory, account
from protobuf.devinfo_pb2 import DeviceInfo


def serviceHandle(target):
    service = factory.getServiceChannel()
    service.mapTarget(target)


@serviceHandle
def registDevice(conn, data):
    try:
        dev = DeviceInfo()
        dev.ParseFromString(data)
        ret = account.registDevice(dev.imei, dev.platform, dev.device_type)
        dev.device_id = ret['did']
        return dev.SerializePartialToString()
    except Exception, e:
        log.err(e)
        return None

