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
        ret = self.account.addApplication(self.id, name)
        if ret == ErrNo.DUP_OPERATE:
            raise excepts.DumpOperate
        if not isinstance(ret, dict):
            raise

    def find_apps(self, app_key=None):
        rets = self.account.findApplication(self.id, app_key)
        if rets:
            apps = [App(ret['id'], self.id, ret['app_name'],
                        ret['app_key'], ret['mast_secret'],
                        ret['create_time'], ret['update_time']) for ret in rets]
            return apps
        return []

    def delete_app(self, app_key):
        self.account.delApplication(self.id, app_key)


class App(object):
    def __init__(self, id, user_id, name, app_key, mast_secret, create_time, update_time):
        self.id = id
        self.user_id = user_id
        self.name = name
        self.app_key = app_key
        self.mast_secret = mast_secret
        self.create_time = create_time
        self.update_time = update_time

