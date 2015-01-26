#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.web import resource
from . import pbroot

from utils.logger import logging

class AccountDev(resource.Resource):

    def __init__(self, method):
        resource.Resource.__init__(self)
        self.method = method

    def render_GET(self, request):
        if self.method == 'device_ids':
            page = request.args['page'][0]
            page_size = request.args['page_size'][0]
            defer = pbroot.remote_callTarget('get_dids', int(page), int(page_size))
            return defer

    def render_POST(self, request):
        data = request.content.getvalue()
        return self.handler(json.loads(data))


    def handler(self, data):
        if self.method == 'register':
            defer = pbroot.remote_callTarget('register_dev', data['imei'], data['platform'], data['dev_type'])
            return defer
        elif self.method == 'subscribe':
            defer = pbroot.remote_callTarget('subscribe', data['app_key'], data['did'])
            return defer

