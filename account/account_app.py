#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.web import resource
from web.error import ErrNo, ErrorPage
from .globals import root


class AccountApp(resource.Resource):
    def __init__(self, method):
        resource.Resource.__init__(self)
        self.method = method

    def render_POST(self, request):
        data = request.content.getvalue()
        return self.handler(json.loads(data))

    def handler(self, data):
        if self.method == 'checkmsg':
            defer = root.remote_callTarget('authorizeMessage', data['app_key'], data['hash_code'], data['verify_str'])
            return defer
        elif self.method == 'new':
            defer = root.remote_callTarget('createApp', data['user_id'], data['app_name'])
            return defer
        elif self.method == 'delete':
            defer = root.remote_callTarget('deleteApp', data['user_id'], data['app_name'])
            return defer
        else:
            return ErrorPage(ErrNo.NO_RESOURCE)
