#!/usr/bin/env python
# -*- coding: utf-8 -*-

from distributed.remote import RemoteObject
from utils.logger import logger
from .cache import MessageCache


msgCache = MessageCache.getInstance()
msgQueue = msgCache.getQueue()
remote = RemoteObject.getInstance()


def serviceHandle(target):
    service = remote.getServiceChannel()
    service.mapTarget(target)


@serviceHandle
def messages_ack(did, msg_ids):
    for msg_id in msg_ids:
        msgQueue.rem_from_acking(did, msg_id)

