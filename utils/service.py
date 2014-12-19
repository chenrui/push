#!/usr/bin/env python
# -*- coding: utf-8 -*-

import threading
from twisted.python import log
from twisted.internet import defer, threads


class Service(object):
    SINGLE_STYLE = 1
    PARALLEL_STYLE = 2

    def __init__(self, name, runstyle=SINGLE_STYLE):
        self._name = name
        self._runstyle = runstyle
        self._targets = {}
        self._lock = threading.RLock()

    def mapTarget(self, target):
        self._lock.acquire()
        try:
            key = target.__name__
            if key in self._targets:
                exist_target = self._targets.get(key)
                raise "target [%d] Already exists,\
                        Conflict between the %s and %s" % (key, exist_target.__name__, target.__name__)
            self._targets[key] = target
        finally:
            self._lock.release()

    def unMapTargetByKey(self, targetKey):
        self._lock.acquire()
        try:
            del self._targets[targetKey]
        finally:
            self._lock.release()

    def getTarget(self, targetKey):
        self._lock.acquire()
        try:
            return self._targets.get(targetKey, None)
        finally:
            self._lock.release()

    def callTarget(self, targetKey, *args, **kwargs):
        target = self.getTarget(targetKey)
        if not target:
            log.err('method command %s not found on service[%s]' % (targetKey, self._name))
            return None
        if self._runstyle == self.SINGLE_STYLE:
            ret = self.callTargetSingle(target, *args, **kwargs)
        else:
            ret = self.callTargetParallel(target, *args, **kwargs)
        return ret

    def callTargetSingle(self, target, *args, **kwargs):
        log.msg('call method %s on service[%s] single' % (target.__name__, self._name))
        self._lock.acquire()
        try:
            data = target(*args, **kwargs)
            if not data:
                return None
            if isinstance(data, defer.Deferred):
                return data
            d = defer.Deferred()
            d.callback(data)
            return d
        finally:
            self._lock.release()

    def callTargetParallel(self, target, *args, **kwargs):
        log.msg('call method %s on service[%s] parallel' % (target.__name__, self._name))
        self._lock.acquire()
        try:
            d = threads.deferToThread(target, *args, **kwargs)
            return d
        finally:
            self._lock.release()
