#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import json
from utils.logger import log
from web.error import ErrNo


class AccountClient(object):
    def __init__(self):
        self.url = 'http://0.0.0.0:9999'
        self.headers = {'content-type': 'application/json'}

    def verifyMsg(self, app_key, verification_code, msg):
        payload = {'app_key': app_key, 'hash_code': verification_code, 'verify_str': msg}
        r = requests.post(self.url + '/account-app/checkmsg', data=json.dumps(payload), headers=self.headers)
        if r.status_code != 200:
            log.err(r.json())
            return ErrNo.UNAUTHORIZED
        return r.json()

    def registDevice(self, imei, platform, device_type):
        payload = {'imei': imei, 'platform': platform, 'dev_type': device_type}
        r = requests.post(self.url + '/account-dev/register', data=json.dumps(payload), headers=self.headers)
        if r.status_code != 200:
            log.err(r.json())
            return ErrNo.INTERNAL_SERVER_ERROR
        return r.json()
