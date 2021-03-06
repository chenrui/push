#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import json
from utils.logger import logger
from web.error import ErrNo


class AccountClient(object):
    def __init__(self, addr):
        self.url = 'http://%s:%d' % (addr[0], addr[1])
        self.headers = {'content-type': 'application/json'}

    def verifyMsg(self, app_key, verification_code, msg):
        payload = {'app_key': app_key, 'hash_code': verification_code, 'verify_msg': msg}
        r = requests.post(self.url + '/account-app/checkmsg', data=json.dumps(payload), headers=self.headers)
        if r.status_code != 200:
            logger.error(r.json())
            return ErrNo.UNAUTHORIZED
        return True

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

    def addApplication(self, user_id, app_name):
        payload = {'user_id': user_id, 'app_name': app_name}
        r = requests.post(self.url + '/account-app/new', data=json.dumps(payload), headers=self.headers)
        j = r.json()
        if r.status_code != 200:
            return j['Error_code']
        return j

    def findApplication(self, user_id, app_key=None):
        payload = {'user_id': user_id, 'app_key': app_key}
        r = requests.post(self.url + '/account-app/find', data=json.dumps(payload), headers=self.headers)
        j = r.json()
        if r.status_code != 200:
            logger.error(j)
            return None
        return j['apps']

    def delApplication(self, user_id, app_key):
        payload = {'user_id': user_id, 'app_key': app_key}
        requests.post(self.url + '/account-app/delete', data=json.dumps(payload), headers=self.headers)

    def getDevices(self, page, page_size):
        r = requests.get(self.url + '/account-dev/device_ids?page=%d&page_size=%d' % (page, page_size))
        d = r.json()
        if r.status_code != 200:
            logger.error(d)
            return ErrNo.INTERNAL_SERVER_ERROR
        return d['dids']
