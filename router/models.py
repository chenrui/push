#!/usr/bin/env python
# -*- coding: utf-8 -*-
from utils.db import db, BaseModel
from pony.orm import Required, Set, Optional


class RouteTable(db.Entity, BaseModel):
    did = Required(str, 32)
    gateway_name = Required(str, 16)
    # 1: login; -1: logout
    status = Required(int)

