#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import json
from utils.logger import logger
from web.error import ErrNo


class AccountClient(object):
    def __init__(self):
        self.url = 'http://0.0.0.0:9999'
        self.headers = {'content-type': 'application/json'}

    def verifyMsg(self, app_key, verification_code, msg):
        payload = {'app_key': app_key, 'hash_code': verification_code, 'verify_msg': msg}
        r = requests.post(self.url + '/account-app/checkmsg', data=json.dumps(payload), headers=self.headers)
        if r.status_code != 200:
            logger.error(r.json())
            return ErrNo.UNAUTHORIZED
        return r.json()

    def createProfile(self, email, pwd):
        payload = {'email': email, 'password': pwd}
        r = requests.post(self.url + '/account-profile/new', data=json.dumps(payload), headers=self.headers)
        j = r.json()
        if r.status_code != 200:
            return j['Error_code']
        return j

    def findProfile(self, **kwargs):
        r = requests.post(self.url + '/account-profile/find', data=json.dumps(kwargs), headers=self.headers)
        j = r.json()
        if r.status_code != 200:
            logger.error(j)
            return None
        return j

    def registDevice(self, imei, platform, device_type):
        payload = {'imei': imei, 'platform': platform, 'dev_type': device_type}
        r = requests.post(self.url + '/account-dev/register', data=json.dumps(payload), headers=self.headers)
        if r.status_code != 200:
            logger.error(r.json())
            return ErrNo.INTERNAL_SERVER_ERROR
        return r.json()

    def getDevices(self, page, page_size):
        r = requests.get(self.url + '/account-dev/device_ids?page=%d&page_size=%d' % (page, page_size))
        d = r.json()
        if r.status_code != 200:
            logger.error(d)
            return ErrNo.INTERNAL_SERVER_ERROR
        return d['dids']
