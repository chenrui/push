#!/usr/bin/env python
# -*- coding: utf-8 -*-

from pony.orm import db_session
from utils.logger import log
from .models import RouteTable
from .globals import root


def serviceHandle(target):
    service = root.getServiceChannel()
    service.mapTarget(target)


@serviceHandle
def login(gateway_name, did):
    log.err('xxxxxxxxxxxxx')
    with db_session:
        route = RouteTable.get(did=did)
        if route:
            # update
            route.gateway_name = gateway_name
            route.status = 1
        else:
            # new
            RouteTable(gateway_name, did, 1)


@serviceHandle
def logout(gateway_name, did):
    with db_session:
        route = RouteTable.get(did=did)
        if route and route.gateway_name == gateway_name:
            route.status = -1
