#!/usr/bin/env python
# -*- coding: utf-8 -*-

from netconnect.protoc import LiberateFactory
from account.client import AccountClient
from distributed.remote import RemoteObject


factory = LiberateFactory()
account = AccountClient()
gateway = RemoteObject()


class RetNo(object):
    FAILD = 0
    SUCCESS = 1
