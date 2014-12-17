#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import json
from utils.logger import log


class AccountClient(object):
    def __init__(self):
        self.url = 'http://0.0.0.0:8888'
        self.headers = {'content-type': 'application/json'}

    def verifyMsg(self, app_key, verification_code, msg):
        payload = {'app_key': app_key, 'hash_code': verification_code, 'verify_str': msg}
        r = requests.post(self.url + '/account-app/checkmsg', data=json.dumps(payload), headers=self.headers)
        if r.status_code != 200:
            log.err(r.json())
            raise
        return r.json()
