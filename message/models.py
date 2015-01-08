#!/usr/bin/env python
# -*- coding: utf-8 -*-

from utils.db import db, BaseModel
from pony.orm import Required, Set, Optional


class Message(db.Entity, BaseModel):
    sendno = Required(int, size=64)
    generator = Required(str, 32)
    title = Required(str, 128)
    body = Required(str, 4096)
    expires = Required(int, size=64)


class Message_X_Device(db.Entity, BaseModel):
    did = Required(str, 32)
    msg_id = Required(int, size=64)
    status = Required(int)