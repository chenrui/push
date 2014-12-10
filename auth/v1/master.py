#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.web import resource
from web.error import ErrNo, ErrorPage, SuccessPage
from ..globals import master


class Master(resource.Resource):
    version = 1

    def __init__(self):
        resource.Resource.__init__(self)

    def getChild(self, path, request):
        if path == 'auth':
            return self
        else:
            return ErrorPage(ErrNo.NO_RESOURCE)

    def render_POST(self, request):
        data = request.content.getvalue()
        data = json.loads(data)
        return SuccessPage()

    def handler(self):
        master.callNode()
