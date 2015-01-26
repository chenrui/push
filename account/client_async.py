#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import json
from utils.logger import logger
from web.error import ErrNo
from web.client import httpRequest



class AccountClient(object):
    def __init__(self, addr):
        self.url = 'http://%s:%d' % (addr[0], addr[1])
        self.headers = {'content-type': ['application/json']}

    def verifyMsg(self, app_key, verification_code, msg):
        url = self.url + '/account-app/checkmsg'
        payload = {'app_key': app_key, 'hash_code': verification_code, 'verify_msg': msg}
        d = httpRequest(url, 'POST', payload, self.headers)
        return d

    def registDevice(self, imei, platform, device_type):
        url = self.url + '/account-dev/register'
        payload = {'imei': imei, 'platform': platform, 'dev_type': device_type}
        d = httpRequest(url, 'POST', payload, self.headers)
        return d

    def getDevices(self, page, page_size):
        url = self.url + '/account-dev/device_ids?page=%d&page_size=%d' % (page, page_size)
        d = httpRequest(url, 'GET')
        return d
