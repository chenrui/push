#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.web import resource
from web.error import ErrNo, ErrorPage, SuccessPage
from .globals import root, RetNo


class AccountApp(resource.Resource):
    def __init__(self, method):
        resource.Resource.__init__(self)
        self.method = method

    def render_POST(self, request):
        data = request.content.getvalue()
        return self.handler(json.loads(data))

    def handler(self, data):
        if self.method == 'checkmsg':
            defer = root.callNode('authorizeMessage', data['app_key'], data['hash_code'], data['verify_str'])
            defer.addCallback(lambda ret: ErrorPage(ErrNo.UNAUTHORIZED) if ret == RetNo.FAILD else SuccessPage())
            return defer
        elif self.method == 'new':
            def result(ret):
                if ret == RetNo.EXISTED:
                    return ErrorPage(ErrNo.DUP_OPERATE)
                elif ret == RetNo.FAILD:
                    return ErrorPage(ErrNo.INTERNAL_SERVER_ERROR)
                else:
                    return SuccessPage(ret)
            defer = root.callNode('createApp', data['user_id'], data['app_name'])
            defer.addCallback(result)
            return defer
        elif self.method == 'delete':
            defer = root.callNode('deleteApp', data['user_id'], data['app_name'])
            defer.addCallback(lambda ret: ErrorPage(ErrNo.INTERNAL_SERVER_ERROR) if ret == RetNo.FAILD else SuccessPage())
            return defer
        else:
            return ErrorPage(ErrNo.NO_RESOURCE)
