#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import json


SUCCESS = 1


class AuthClient(object):
    def __init__(self):
        self.url = 'http://0.0.0.0:8888/auth'
        self.headers = {'content-type': 'application/json'}

    def verifyReq(self, auth):
        payload = {'auth': auth}
        r = requests.post(self.url, data=json.dumps(payload), headers=self.headers)
        if r.status_code == 200:
            return SUCCESS
        return 0
