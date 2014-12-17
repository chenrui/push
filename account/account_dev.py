#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.web import resource
from .globals import root


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
            return defer

