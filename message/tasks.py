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
        msg['timestamp'] = int(msg['timestamp'])
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
        expires = int(msg['expires'])
        if current_time > expires:
            logger.info('message(id:%d, did:%s) expired, drop it' % (msg['id'], did))
            msgQueue.add_to_dead(did, msg['id'], MessageStatus.EXPIRED)
        else:
            # TODO: resend???
            pass


def check_dead_queue():
    # TODO: 统计
    count_by_app = {}
    count_by_msg = {}
    while True:
        item = msgQueue.get_from_dead()
        if item is None:
            break
        count_by_app = collect_by_app(count_by_app, item)
        count_by_msg = collect_by_msg(count_by_msg, item)
    print 'collect by app:'
    print count_by_app
    print 'collect by msg:'
    print count_by_msg


def collect_by_app(collect, item):
    msg = item['msg']
    app_key = msg['app_key']
    if app_key not in collect:
        data = {'droped': 0,
                'expired': 0,
                'success': 0}
        collect[app_key] = data

    status = item['status']
    if status == MessageStatus.NOT_SEND:
        collect[app_key]['droped'] += 1
    elif status == MessageStatus.EXPIRED:
        collect[app_key]['expired'] += 1
    elif status == MessageStatus.RECEIVED:
        collect[app_key]['success'] += 1
    return collect


def collect_by_msg(collect, item):
    msg = item['msg']
    msg_id = int(msg['id'])
    if msg_id not in collect:
        data = {'droped': 0,
                'expired': 0,
                'success': 0}
        collect[msg_id] = data

    status = item['status']
    if status == MessageStatus.NOT_SEND:
        collect[msg_id]['droped'] += 1
    elif status == MessageStatus.EXPIRED:
        collect[msg_id]['expired'] += 1
    elif status == MessageStatus.RECEIVED:
        collect[msg_id]['success'] += 1
    return collect
