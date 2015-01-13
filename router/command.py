#!/usr/bin/env python
# -*- coding: utf-8 -*-

from pony.orm import db_session
from distributed.root import PBRoot
from .models import RouteTable
from .errno import RetNo
from utils.logger import logger


root = PBRoot.getInstance()


def serviceHandle(target):
    service = root.getServiceChannel()
    service.mapTarget(target)


@serviceHandle
def login(gateway_name, did):
    with db_session:
        route = RouteTable.get(did=did)
        if route:
            # update
            route.gateway_name = gateway_name
            route.status = 1
        else:
            # new
            RouteTable(gateway_name=gateway_name, did=did, status=1)
    return RetNo.SUCCESS


@serviceHandle
def logout(gateway_name, did):
    with db_session:
        route = RouteTable.get(did=did)
        if route and route.gateway_name == gateway_name:
            route.status = 0


@serviceHandle
def is_device_online(did):
    with db_session:
        table = RouteTable.get(did=did)
        if table:
            return table.status == 1
        return False

@serviceHandle
def push(did, msg):
    with db_session:
        table = RouteTable.get(did=did, status=1)
        if table:
            root.callNodeByName(table.gateway_name, 'push', did, msg)


@serviceHandle
def messages_ack(did, msgids):
    root.callNodeByName('message-server', 'messages_ack', did, msgids)
