#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import json
import hashlib


# 'audience': {'device_id': '9c01047c1bee310286fdad2c8b2c235b'},
headers = {'content-type': 'application/json'}
payloads = {'notification': {'title': 'test', 'body': 'this is a test'},
            'audience': 'all',
            'app_key': '50ca489d9a16337e97d8fa9f484be5bd',
            }

mobj = hashlib.md5()
verification_str = json.dumps(payloads['notification']) + '969d9517a9ec4108ad9f071959fe3b32'
mobj.update(verification_str)
code = mobj.hexdigest().upper()
payloads['verification_code'] = code

r = requests.post('http://0.0.0.0:8888/v1/push', data=json.dumps(payloads), headers=headers)
print r.json()
