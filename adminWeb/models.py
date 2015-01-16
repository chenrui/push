#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask.ext.login import UserMixin
from werkzeug import generate_password_hash, check_password_hash
from account.client import AccountClient
from web.error import ErrNo
import excepts

class Profile(UserMixin):
    account = AccountClient()

    @classmethod
    def create(cls, email, password):
        password = generate_password_hash(password)
        ret = cls.account.createProfile(email, password)
        if ret == ErrNo.DUP_OPERATE:
            raise excepts.DumpOperate
        if not isinstance(ret, dict):
            raise
        return Profile(ret['id'], ret['email'], ret['password'])

    @classmethod
    def find(cls, **kwargs):
        ret = cls.account.findProfile(**kwargs)
        if ret:
            return Profile(ret['id'], ret['email'], ret['password'])
        return None

    def __init__(self, id, email, password):
        self.id = id
        self.email = email
        self.password = password

    def check_password(self, password):
        if check_password_hash(self.password, password):
            return True
        return False

    def add_app(self, name):
        self.account.addApplication(self.id, name)

