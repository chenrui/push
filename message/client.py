#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import json
from utils.logger import log

class MessageClient(object):
    def __init__(self):
        self.url = 'http://0.0.0.0:9997'
        self.headers = {'content-type': 'application/json'}

    def storage(self, data):
        r = requests.post(self.url + '/storage', data=json.dumps(data), headers=self.headers)
        if r.status_code != 200:
            j = r.json()
            log.err(j)
            return j['Error_code']
        return r.json()
