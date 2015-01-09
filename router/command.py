#!/usr/bin/env python
# -*- coding: utf-8 -*-

from pony.orm import db_session
from distributed.root import PBRoot
from .models import RouteTable
from .errno import RetNo
from message.enum import MessageStatus
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
def push(dids, msg):
    logger.debug(dids)
    logger.debug(msg)
    # TODO: async
    for did in dids:
        with db_session:
            table = RouteTable.get(did=did, status=1)
            if table:
                root.callNodeByName(table.gateway_name, 'push', did, msg)


@serviceHandle
def update_messages_status(did, msgids, status):
    root.callNodeByName('message-server', 'update_msg_status', did, msgids, status)

@serviceHandle
def get_messages_by_status(did, status):
    defer = root.callNodeByName('message-server', 'getmsg_by_status', did, MessageStatus.NOT_SEND)
    return defer
