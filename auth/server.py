#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.web import vhost, resource
from twisted.internet import reactor
from web.request import DelaySite
from web.error import ErrNo, ErrorPage, SuccessPage
from utils import service
# from utils.logger import log
from distributed.root import BilateralFactory
from .globals import root, RetNo


class AuthMaster(resource.Resource):

    def __init__(self, method=None):
        self.method = method
        resource.Resource.__init__(self)

    def getChild(self, path, request):
        if path == 'account-app':
            self.putChild('checkheader', AuthMaster('checkheader'))
            self.putChild('new', AuthMaster('new'))
            self.putChild('delete', AuthMaster('delete'))
            return resource.getChildForRequest(self, request)
        else:
            return ErrorPage(ErrNo.NO_RESOURCE)

    def render_POST(self, request):
        data = request.content.getvalue()
        return self.handler(json.loads(data))

    def handler(self, data):
        if self.method == 'checkheader':
            defer = root.callNode('authorizeHeader', data['Authorization'])
            defer.addCallback(lambda ret: ErrorPage(ErrNo.UNAUTHORIZED) if ret == RetNo.FAILD else SuccessPage(ret))
            return defer
        elif self.method == 'new':
            def result(ret):
                if ret == RetNo.EXISTED:
                    return ErrorPage(ErrNo.DUP_OPERATE)
                elif ret == RetNo.FAILD:
                    return ErrorPage(ErrNo.INTERNAL_SERVER_ERROR)
                else:
                    return ret
            defer = root.callNode('createApp', data['user_id'], data['app_name'])
            defer.addCallback(result)
            return defer
        elif self.method == 'delete':
            defer = root.callNode('deleteApp', data['user_id'], data['app_name'])
            defer.addCallback(lambda ret: ErrorPage(ErrNo.INTERNAL_SERVER_ERROR) if ret == RetNo.FAILD else SuccessPage(ret))
            return defer
        else:
            return ErrorPage(ErrNo.NO_RESOURCE)


class AuthServer(object):
    def __init__(self, addr, port, root_port):
        self.webSrv = None
        self.addr = addr
        self.port = port
        self.root_port = root_port

    def masterapp(self):
        rootservice = service.Service("rootservice")
        root.addServiceChannel(rootservice)
        root.doNodeConnect = _doChildConnect
        root.doNodeLostConnect = _doChildLostConnect
        self.webSrv = vhost.NameVirtualHost()
        self.webSrv.addHost(self.addr, AuthMaster())

    def start(self):
        reactor.listenTCP(self.root_port, BilateralFactory(root))
        reactor.listenTCP(self.port, DelaySite(self.webSrv))
        reactor.run()


def _doChildConnect(name, transport):
    pass


def _doChildLostConnect(childID):
    pass
