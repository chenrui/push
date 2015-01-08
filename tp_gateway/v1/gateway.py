#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.web import resource
from web.error import ErrNo, ErrorPage, SuccessPage
from utils.logger import logger

SUCCESS = 1


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

        logger.debug('receive %s', data)
        # 1. verify message
        #ret = self.verifyMsg(data)
        #if ret == ErrNo.UNAUTHORIZED:
        #    return ErrorPage(ret)
        # 2. send msg to message service
        ret = self.msgClnt.storage(data)
        if isinstance(ret, dict):
            return SuccessPage(ret)
        else:
            return ErrorPage(ret)

    def verifyMsg(self, data):
        msg = data['notification']
        return self.authClnt.verifyMsg(data['app_key'], data['verification_code'], msg)

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
