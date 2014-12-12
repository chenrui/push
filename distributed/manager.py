#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.python import log


class NodesManager(object):
    def __init__(self):
        self._nodes = {}

    def getNodeByID(self, nodeID):
        return self._nodes.get(nodeID, None)

    def getNodeByName(self, nodeName):
        for node in self._nodes.values():
            if nodeName == node.getName():
                return node
        return None

    def addNode(self, node):
        key = node._id
        if key in self._nodes:
            raise "child node %s exists" % key
        self._nodes[key] = node

    def dropNode(self, node):
        key = node._id
        if key in self._nodes:
            del self._nodes[key]

    def dropNodeByID(self, nodeID):
        if nodeID in self._nodes:
            del self._nodes[nodeID]

    def loadBalance(self):
        for node in self._nodes.values():
            return node
        return None

    def callNode(self, *args, **kwargs):
        node = self.loadBalance()
        if not node:
            log.err("node doesn't exists")
            return
        return node.callbackNode(*args, **kwargs)

    def callNodeByID(self, nodeID, *args, **kwargs):
        node = self._nodes.get(nodeID, None)
        if not node:
            log.err("nodeID %s doesn't exists" % nodeID)
            return
        return node.callbackNode(*args, **kwargs)

    def callNodeByName(self, nodeName, *args, **kwargs):
        node = self.getNodeByName(nodeName)
        if not node:
            log.err("nodeName %s doesn't exists" % nodeName)
            return
        return node.callbackNode(*args, **kwargs)

    def getNodeBySessionId(self, sessionID):
        for node in self._nodes.values():
            if node._transport.broker.transport.sessionno == sessionID:
                return node
        return None
