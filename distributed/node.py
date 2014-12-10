#!/usr/bin/env python
# -*- coding: utf-8 -*-


class Node(object):
    '''子节点对象'''

    def __init__(self, id, name):
        '''初始化子节点对象
        '''
        self._id = id
        self._name = name
        self._transport = None

    def getName(self):
        '''获取子节点的名称'''
        return self._name

    def setTransport(self, transport):
        '''设置子节点的通道'''
        self._transport = transport

    def callbackNode(self, *args, **kw):
        '''回调子节点的接口
        return a Defered Object (recvdata)
        '''
        recvdata = self._transport.callRemote('callNode', *args, **kw)
        return recvdata
