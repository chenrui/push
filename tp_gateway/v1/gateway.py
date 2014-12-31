#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.web import resource
from twisted.python import log
from web.error import ErrNo, ErrorPage, SuccessPage

SUCCESS = 1


class TPGateWay(resource.Resource):
    '''Third party gateway'''
    version = 1

    def __init__(self, authClnt):
        resource.Resource.__init__(self)
        self.authClnt = authClnt

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
        ret = self.verifyMsg(data)
        log.err(ret)
        if ret == ErrNo.UNAUTHORIZED:
            return ErrorPage(ret)
        # 2. send msg to app service
        return SuccessPage()

    def verifyMsg(self, data):
        msg = data['notification']
        return self.authClnt.verifyMsg(data['app_key'], data['verification_code'], msg)

    def getReqdata(self, request):
        try:
            data = request.content.getvalue()
            data = json.loads(data)
            if 'app_key' not in data or 'verification_code' not in data:
                return None
            return data
        except Exception:
            return None
