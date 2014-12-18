#!/usr/bin/env python
# -*- coding: utf-8 -*-

import hashlib
import uuid
from twisted.internet import reactor
from distributed.remote import RemoteObject
from pony.orm import db_session
from utils import service
from utils.logger import log
from utils.db import db
from .models import Application, Profile, Device
from .globals import RetNo

service = service.Service('reference', service.Service.SINGLE_STYLE)


def serviceHandle(target):
    service.mapTarget(target)


def disconnected():
    log.msg('xxxxxxxxxxxxxxxxxxxxxxx')
    reactor.stop()


##########################
#  account app APIS
##########################

@serviceHandle
def authorizeMessage(app_key, hash_code, verify_str):
    with db_session:
        app = Application.get(app_key=app_key)
        if not app:
            return RetNo.FAILD
        mast_secret = app.mast_secret
    mobj = hashlib.md5()
    verification_str = verify_str + mast_secret
    mobj.update(verification_str)
    code = mobj.hexdigest().upper()
    return RetNo.SUCCESS if code == hash_code else RetNo.FAILD


@serviceHandle
def createApp(userID, appName):
    try:
        with db_session:
            app = Application.get(app_name=appName)
            if app:
                return RetNo.EXISTED
            app_key = uuid.uuid3(uuid.NAMESPACE_DNS, appName).hex()
            mast_secret = uuid.uuid4()
            user = Profile[userID]
            return Application(appName, app_key, mast_secret, user).to_dict()
    except Exception, e:
        log.err(e)
        return RetNo.FAILD


@serviceHandle
def deleteApp(userID, appName):
    try:
        with db_session:
            app = Application.get(app_name=appName)
            if app and app.owner.id == userID:
                app.delete()
        return RetNo.SUCCESS
    except Exception, e:
        log.err(e)
        return RetNo.FAILD


##########################
#  account dev APIS
##########################

@serviceHandle
def register_dev(imei, platform, dev_type):
    did = uuid.uuid3(uuid.NAMESPACE_DNS, imei+platform+dev_type)
    try:
        with db_session:
            dev = Device.get(did=did)
            if dev:
                return dev.to_dict()
            mast_secret = uuid.uuid4()
            return Device(did, platform, dev_type, mast_secret).to_dict()
    except Exception, e:
        log.err(e)
        return RetNo.FAILD


@serviceHandle
def subscribe(app_key, did):
    try:
        with db_session:
            app = Application.get(app_key=app_key)
            dev = Device.get(did=did)
            if not app or not dev:
                return RetNo.NOT_EXIST
            dev.apps.add(app)
            return RetNo.SUCCESS
    except Exception, e:
        log.err(e)
        return RetNo.FAILD


class AuthNode(object):
    def __init__(self, name):
        self.remote = RemoteObject(name)
        self.remote.addServiceChannel(service)

    def connect(self, addr):
        self.remote.connect(addr)
        self.remote.disconnectCallback(disconnected)

    def start(self):
        db.bind('mysql', host='127.0.0.1', user='root', passwd='root', db='push')
        db.generate_mapping(create_tables=False)
        reactor.run()
