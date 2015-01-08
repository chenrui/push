#!/usr/bin/env python
# -*- coding: utf-8 -*-

from pony.orm import db_session
from .models import RouteTable
from .globals import root
from .errno import RetNo
from message.enum import MessageStatus


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
    # TODO: async
    need_update = []
    for did in dids:
        with db_session:
            table = RouteTable.get(did=did, status=1)
            if table:
                need_update.append(did)
                root.callNodeByName(table.gateway_name, 'push', did, msg)
    root.callNodeByName('message-server', 'update_msg_status', need_update, msg['id'], MessageStatus.SENDING)
