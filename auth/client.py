#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import json


SUCCESS = 1


class AuthClient(object):
    def __init__(self):
        self.headers = {'content-type': 'application/json'}

    def verifyReq(self, auth):
        payload = {'auth': auth}
        r = requests.post('http://0.0.0.0:8888/v1/auth', data=json.dumps(payload), headers=self.headers)
        if r.status_code == 200:
            return SUCCESS
        return 0
