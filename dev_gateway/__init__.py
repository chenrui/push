#!/usr/bin/env python
# -*- coding: utf-8 -*-

from utils.config import Config
from distributed.remote import RemoteObject
from netconnect.protoc import LiberateFactory


config = Config()
remote = RemoteObject()
factory = LiberateFactory()
