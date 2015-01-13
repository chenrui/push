#!/usr/bin/env python
# -*- coding: utf-8 -*-

import redis


class Redis(object):
    def __init__(self, **kwargs):
        """The default connection parameters are: host='localhost', port=6379, db=0"""
        self.db = redis.Redis(**kwargs)


class RedisQueue(Redis):
    """Simple Queue with Redis Backend"""
    def __init__(self, name, namespace='queue', **redis_kwargs):
        Redis.__init__(**redis_kwargs)
        self.key = '%s:%s' % (namespace, name)

    def qsize(self):
        """Return the approximate size of the queue."""
        return self.db.llen(self.key)

    def empty(self):
        """Return True if the queue is empty, False otherwise."""
        return self.qsize() == 0

    def put(self, item):
        """Put item into the queue."""
        self.db.rpush(self.key, item)

    def get(self, block=True, timeout=None):
        """Remove and return an item from the queue.

        If optional args block is true and timeout is None (the default), block
        if necessary until an item is available."""
        if block:
            item = self.db.blpop(self.key, timeout=timeout)
        else:
            item = self.db.lpop(self.key)

        if item:
            item = item[1]
        return item

    def get_nowait(self):
        """Equivalent to get(False)."""
        return self.get(False)
