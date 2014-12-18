#!/usr/bin/env python
# -*- coding: utf-8 -*-

from utils.db import db, BaseModel
from pony.orm import Required, Set, Optional


class Profile(db.Entity, BaseModel):
    name = Required(str, 16, unique=True)
    apps = Set('Application')


class Application(db.Entity, BaseModel):
    app_name = Required(str, 12, unique=True)
    app_key = Required(str, 32, unique=True)
    mast_secret = Required(str, 32)
    owner = Required(Profile)
    devices = Set('Device')

    def __init__(self, app_name, app_key, mast_secret, owner=''):
        self.app_name = app_name
        self.app_key = app_key
        self.mast_secret = mast_secret
        self.owner = owner


class Device(db.Entity, BaseModel):
    did = Required(str, 32, unique=True)
    platform = Required(str, 8)
    dev_type = Required(str, 16)
    mast_secret = Required(str, 32)
    apps = Set(Application)

    def __init__(self, did, platform, dev_type, mast_secret):
        self.did = did
        self.platform = platform
        self.dev_type = dev_type
        self.mast_secret = mast_secret
