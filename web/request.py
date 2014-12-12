#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.web.server import Request, Site, NOT_DONE_YET
from twisted.web.error import UnsupportedMethod
from twisted.internet import defer
from .error import ErrNo, ErrorPage, SuccessPage


class DelayRequest(Request):
    def render(self, resrc):
        try:
            if self.method == "POST" and self.getHeader(b"content-type") != "application/json":
                body = ErrorPage(ErrNo.INVALID_PARAMETER)
            else:
                body = resrc.render(self)
        except UnsupportedMethod:
            body = ErrorPage(ErrNo.METHOD_NOT_ALLOWED)

        if body == NOT_DONE_YET:
            return
        if isinstance(body, defer.Deferred):
            body.addCallback(self._write)
        elif isinstance(body, ErrorPage) or isinstance(body, SuccessPage):
            self._write(body.render(self))
        else:
            self._write(body)

    def _write(self, body):
        if isinstance(body, ErrorPage) or isinstance(body, SuccessPage):
            self._write(body.render(self))
            return
        data = json.dumps(body)
        self.setHeader(b"content-type", b"application/json")
        self.setHeader('content-length', len(data))
        self.write(data)
        self.finish()


class DelaySite(Site):
    def __init__(self, resource, logPath=None, timeout=60):
        Site.__init__(self, resource, logPath=logPath, timeout=timeout)
        self.requestFactory = DelayRequest
