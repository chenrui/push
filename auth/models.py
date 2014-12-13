#!/usr/bin/env python
# -*- coding: utf-8 -*-

from utils.db import db
from pony.orm import Required


class Application(db.Entity):
    app_name = Required(str, unique=True)
    company = Required(str)
    owner = Required(str)
