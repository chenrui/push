#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import json
from utils.logger import log


class AuthClient(object):
    def __init__(self):
        self.url = 'http://0.0.0.0:8888/account-app'
        self.headers = {'content-type': 'application/json'}

    def verifyHeader(self, auth):
        payload = {'Authorization': auth}
        r = requests.post(self.url + '/checkheader', data=json.dumps(payload), headers=self.headers)
        if r.status_code != 200:
            log.err(r.json())
            raise
        return r.json()
