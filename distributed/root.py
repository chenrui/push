#!/usr/bin/env python
# -*- coding: utf-8 -*-

from twisted.spread import pb
from manager import NodesManager
from node import Node
from utils.logger import logger


class BilateralBroker(pb.Broker):

    def connectionLost(self, reason):
        clientID = self.transport.sessionno
        self.factory.root.dropNodeSessionId(clientID)
        pb.Broker.connectionLost(self, reason)


class BilateralFactory(pb.PBServerFactory):
    protocol = BilateralBroker


class PBRoot(pb.Root):
    '''PB 协议'''

    instance = None

    @classmethod
    def getInstance(cls):
        if cls.instance is None:
            cls.instance = PBRoot()
        return cls.instance

    def __init__(self, manager=NodesManager()):
        '''初始化根节点
        '''
        self.service = None
        self.nodesmanager = manager

    def addServiceChannel(self, service):
        '''添加服务通道
        '''
        self.service = service

    def getServiceChannel(self):
        return self.service

    def remote_takeProxy(self, name, transport):
        '''添加node节点
        '''
        logger.info('node [%s] connect' % name)
        node = Node(name, name)
        self.nodesmanager.addNode(node)
        node.setTransport(transport)
        self.doNodeConnect(name, transport)

    def doNodeConnect(self, name, transport):
        """当node节点连接时的处理
        """
        pass

    def remote_callTarget(self, command, *args, **kw):
        '''远程调用方法
        '''
        data = self.service.callTarget(command, *args, **kw)
        return data

    def dropNode(self, *args, **kw):
        '''删除子节点记录'''
        self.nodesmanager.dropNode(*args, **kw)

    def dropNodeByID(self, nodeId):
        '''删除子节点记录'''
        self.doNodeLostConnect(nodeId)
        self.nodesmanager.dropNodeByID(nodeId)

    def dropNodeSessionId(self, session_id):
        '''删除子节点记录'''
        node = self.nodesmanager.getNodeBySessionId(session_id)
        if not node:
            return
        logger.info('node [%s] lost' % node._name)
        node_id = node._id
        self.doNodeLostConnect(node_id)
        self.nodesmanager.dropNodeByID(node_id)

    def doNodeLostConnect(self, nodeId):
        """当node节点连接时的处理
        """
        pass

    def callNode(self, *args, **kw):
        '''调用子节点的接口
        '''
        return self.nodesmanager.callNode(*args, **kw)

    def callNodeByName(self, nodeName, *args, **kw):
        '''调用子节点的接口
        return Defered Object
        '''
        return self.nodesmanager.callNodeByName(nodeName, *args, **kw)
