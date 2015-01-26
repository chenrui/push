#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.web import resource
from web.error import ErrNo, ErrorPage
from . import pbroot


class AccountProfile(resource.Resource):

    def __init__(self, method):
        resource.Resource.__init__(self)
        self.method = method

    def render_POST(self, request):
        data = request.content.getvalue()
        return self.handler(json.loads(data))

    def handler(self, data):
        if self.method == 'new':
            defer = pbroot.remote_callTarget('createProfile', data['email'], data['password'])
            return defer
        elif self.method == 'find':
            defer = pbroot.remote_callTarget('findProfile', data)
            return defer
        else:
            return ErrorPage(ErrNo.NO_RESOURCE)