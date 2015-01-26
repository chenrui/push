#!/usr/bin/env python
# -*- coding: utf-8 -*-

from web.client import httpRequest

class MessageClient(object):
    def __init__(self, addr):
        self.url = 'http://%s:%d' % (addr[0], addr[1])
        self.headers = {'content-type': ['application/json']}

    def storage(self, data):
        url = self.url + '/storage'
        d = httpRequest(url, 'POST', data, self.headers)
        return d
