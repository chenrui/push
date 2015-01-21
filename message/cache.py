#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from utils.cache import Redis
from .enum import MessageStatus


class MessageCache(Redis):
    instance = None
    queue = None

    @classmethod
    def getInstance(cls, **kwargs):
        if cls.instance is None:
            cls.instance = MessageCache(**kwargs)
            cls.queue = MessageQueue(cls.instance, **kwargs)
        return cls.instance

    def getQueue(self):
        return self.queue

    def add(self, did, msg):
        key = '%s-%d' % (did, msg['id'])
        self.db.hmset(key, msg)
        self.queue.add_to_sending(did, msg['id'])

    def get(self, did, msg_id):
        key = '%s-%d' % (did, msg_id)
        return self.db.hgetall(key)

    def remove(self, did, msg_id):
        key = '%s-%d' % (did, msg_id)
        self.db.delete(key)


class MessageQueue(Redis):
    def __init__(self, msgCache, **kwargs):
        self.msgCache = msgCache
        Redis.__init__(self, **kwargs)

    def _add_to_queue(self, qname, did, msg_id):
        item = {'did': did, 'msg_id': msg_id}
        self.db.sadd(qname, json.dumps(item))

    def _get_from_queue(self, qname):
        rets = self.db.smembers(qname)
        rets = [json.loads(i) for i in rets]
        msg = []
        for item in rets:
            msg.append((item['did'], self.msgCache.get(item['did'], item['msg_id'])))
        return msg

    def _rem_from_queue(self, qname, did, msg_id):
        item = {'did': did, 'msg_id': msg_id}
        item = json.dumps(item)
        ret = self.db.sismember(qname, item)
        if ret:
            self.db.srem(qname, item)
        return ret

    # sending queue
    def add_to_sending(self, did, msg_id):
        self._add_to_queue('sending', did, msg_id)

    def get_from_sending(self):
        return self._get_from_queue('sending')

    def rem_from_sending(self, did, msg_id):
        self._rem_from_queue('sending', did, msg_id)

    # acking queue
    def add_to_acking(self, did, msg_id):
        self._add_to_queue('acking', did, msg_id)

    def get_from_acking(self):
        return self._get_from_queue('acking')

    def rem_from_acking(self, did, msg_id):
        ret = self._rem_from_queue('acking', did, msg_id)
        if ret:
            self.add_to_dead(did, msg_id, MessageStatus.RECEIVED)

    # dead queue
    def add_to_dead(self, did, msg_id, status):
        item = {'did': did, 'msg_id': msg_id, 'status': status}
        self.db.lpush('dead', json.dumps(item))

    def get_from_dead(self):
        item = self.db.rpop('dead')
        if item:
            item = json.loads(item)
            msg_id = item.pop('msg_id')
            msg = self.msgCache.get(item['did'], msg_id)
            self.msgCache.remove(item['did'], msg_id)
            item['msg'] = msg
            return item
        return None
