#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.web import resource
from twisted.python import log
from web.error import ErrNo, ErrorPage, SuccessPage

SUCCESS = 1


class TPGateWay(resource.Resource):
    '''Third party gateway'''

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
        # id verify
        ret = self.verifyReq(request)
        log.msg("xxxxxx %d" % ret)
        if ret != SUCCESS:
            return ErrorPage(ErrNo.UNAUTHORIZED)
        else:
            return SuccessPage()

    def verifyReq(self, request):
        auth = request.getHeader(b"Authorization")
        if auth is None:
            return ErrNo.UNAUTHORIZED
        return self.authClnt.verifyReq(auth)

    def getReqdata(self, request):
        try:
            data = request.content.getvalue()
            data = json.loads(data)
            return data
        except Exception:
            return None
