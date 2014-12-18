#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.web import resource
from web.error import ErrorPage, SuccessPage, ErrNo
from .globals import root, RetNo


class AccountDev(resource.Resource):
    def __init__(self, method):
        resource.Resource.__init__(self)
        self.method = method

    def render_POST(self, request):
        data = request.content.getvalue()
        return self.handler(json.loads(data))

    def handler(self, data):
        if self.method == 'register':
            defer = root.callNode('register_dev', data['imei'], data['platform'], data['dev_type'])
            defer.addCallback(lambda ret: ErrorPage(ErrNo.INTERNAL_SERVER_ERROR) if ret == RetNo.FAILD else SuccessPage(ret))
            return defer
        elif self.method == 'subscribe':
            defer = root.callNode('subscribe', data['app_key'], data['did'])
            return defer

