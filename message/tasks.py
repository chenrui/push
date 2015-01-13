#!/usr/bin/env python
# -*- coding: utf-8 -*-

import time
from distributed.remote import RemoteObject
from utils.logger import logger
from .cache import MessageCache
from .enum import MessageStatus

msgCache = MessageCache.getInstance()
msgQueue = msgCache.getQueue()
remote = RemoteObject.getInstance()


def _send_callback(isOnline, did, msg):
    if isOnline:
        logger.info('send message(id:%d, did:%s) to router' % (msg['id'], did))
        msgQueue.rem_from_sending(did, msg['id'])
        msgQueue.add_to_acking(did, msg['id'])
        remote.callRemote('push', did, msg)


def send_to_router():
    current_time = int(time.time())
    rets = msgQueue.get_from_sending()
    if len(rets) == 0:
        return
    for item in rets:
        did = item[0]
        msg = item[1]
        expires = int(msg.pop('expires'))
        msg['sendno'] = int(msg['sendno'])
        msg['id'] = int(msg['id'])
        if current_time > expires:
            logger.info('message(id:%d, did:%s) not send and expired, drop it' % (msg['id'], did))
            msgQueue.rem_from_sending(did, msg['id'])
            msgQueue.add_to_dead(did, msg['id'], MessageStatus.NOT_SEND)
        else:
            defer = remote.callRemote('is_device_online', did)
            defer.addCallback(_send_callback, did, msg)


def check_acking_queue():
    current_time = int(time.time())
    rets = msgQueue.get_from_acking()
    if len(rets) == 0:
        return
    for item in rets:
        did = item[0]
        msg = item[1]
        expires = msg.pop('expires')
        if current_time > expires:
            logger.info('message(id:%d, did:%s) expired, drop it' % (msg['id'], did))
            msgQueue.add_to_dead(did, msg['id'], MessageStatus.EXPIRED)
        else:
            # TODO: resend???
            pass


def check_dead_queue():
    total = []
    while True:
        item = msgQueue.get_from_dead()
        if item is None:
            break
        total.append(item)

    # TODO: 统计
    pass




