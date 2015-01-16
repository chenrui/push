#!/usr/bin/env python
# -*- coding: utf-8 -*-

from utils.db import db, BaseModel
from pony.orm import Required, Set, Optional


class Profile(db.Entity, BaseModel):
    email = Required(str, 32, unique=True)
    password = Required(str, 2048)
    apps = Set('Application')


class Application(db.Entity, BaseModel):
    app_name = Required(str, 12, unique=True)
    app_key = Required(str, 32, unique=True)
    mast_secret = Required(str, 32)
    owner = Required(Profile)
    devices = Set('Device')


class Device(db.Entity, BaseModel):
    did = Required(str, 32, unique=True)
    platform = Required(str, 8)
    dev_type = Required(str, 16)
    mast_secret = Required(str, 32)
    apps = Set(Application)
