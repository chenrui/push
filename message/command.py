#!/usr/bin/env python
# -*- coding: utf-8 -*-

from utils.logger import logger
from .cache import MessageCache
from . import remote, config


msgCache = MessageCache.getInstance(**config['REDIS'])
msgQueue = msgCache.getQueue()


def serviceHandle(target):
    service = remote.getServiceChannel()
    service.mapTarget(target)


@serviceHandle
def messages_ack(did, msg_ids):
    for msg_id in msg_ids:
        logger.info('ack message(id:%d, did:%s)' % (msg_id, did))
        msgQueue.rem_from_acking(did, msg_id)

