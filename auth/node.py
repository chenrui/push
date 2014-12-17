#!/usr/bin/env python
# -*- coding: utf-8 -*-

import base64
import uuid
from twisted.internet import reactor
from distributed.remote import RemoteObject
from pony.orm import db_session
from utils import service
from utils.logger import log
from utils.db import db
from .models import Application, Profile
from .globals import RetNo

service = service.Service('reference', service.Service.SINGLE_STYLE)


def serviceHandle(target):
    service.mapTarget(target)


@serviceHandle
def authorizeHeader(authString):
    app_key, mast_secret = base64.b64decode(authString).split(':')
    with db_session:
        app = Application.get(app_key=app_key, mast_secret=mast_secret)
        if app:
            return app.to_dict()
        return RetNo.FAILD


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
            return Application(appName, app_key, mast_secret, user)
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


def disconnected():
    log.msg('xxxxxxxxxxxxxxxxxxxxxxx')
    reactor.stop()


class AuthNode(object):
    def __init__(self, name):
        self.remote = RemoteObject(name)
        self.remote.addServiceChannel(service)

    def connect(self, addr):
        self.remote.connect(addr)
        self.remote.disconnectCallback(disconnected)

    def start(self):
        db.bind('mysql', host='127.0.0.1', user='root', passwd='root', db='push')
        reactor.run()
