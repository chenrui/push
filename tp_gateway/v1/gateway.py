#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.web import resource
from web.error import ErrNo, ErrorPage, SuccessPage


class TPGateWay(resource.Resource):
    '''Third party gateway'''
    version = 1

    def __init__(self, authClnt, msgClnt):
        resource.Resource.__init__(self)
        self.authClnt = authClnt
        self.msgClnt = msgClnt

    def getChild(self, path, request):
        if path == 'push':
            return self
        else:
            return ErrorPage(ErrNo.NO_RESOURCE)

    def render_POST(self, request):
        data = self.getReqdata(request)
        if not data:
            return ErrorPage(ErrNo.INVALID_PARAMETER)

        # 1. verify message
        d = self.verifyMsg(data)
        # 2. send msg to message service
        d.addCallback(self.verifyResponse, d, data)
        return d

    def verifyMsg(self, data):
        msg = data['notification']
        return self.authClnt.verifyMsg(data['app_key'], data['verification_code'], msg)

    def verifyResponse(self, ret, defer, data):
        if 'Error_code' in ret:
            return ErrorPage(ret['Error_code'])

        d = self.msgClnt.storage(data)
        def callback(ret, defer):
            if 'Error_code' in ret:
                return ErrorPage(ret['Error_code'])
            return SuccessPage(ret)
        d.addCallback(callback, d)
        return d

    def getReqdata(self, request):
        try:
            data = request.content.getvalue()
            data = json.loads(data)
            if 'app_key' not in data or 'verification_code' not in data \
                or 'audience' not in data or 'notification' not in data:
                return None
            return data
        except Exception:
            return None
