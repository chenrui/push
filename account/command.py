#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import hashlib
import uuid
from twisted.internet import reactor
from distributed.remote import RemoteObject
from pony.orm import db_session
from distributed.root import PBRoot
from web.error import ErrNo, ErrorPage, SuccessPage
from utils import service
from utils.logger import logger
from utils.db import db
from .models import Application, Profile, Device


def serviceHandle(target):
    root = PBRoot.getInstance()
    service = root.getServiceChannel()
    service.mapTarget(target)


##########################
#  account app APIS
##########################

@serviceHandle
def authorizeMessage(app_key, hash_code, verify_msg):
    try:
        with db_session:
            app = Application.get(app_key=app_key)
            if not app:
                return ErrorPage(ErrNo.UNAUTHORIZED)
            mast_secret = app.mast_secret
        mobj = hashlib.md5()
        verification_str = json.dumps(verify_msg) + mast_secret
        mobj.update(verification_str)
        code = mobj.hexdigest().upper()
        return SuccessPage({'app_id': app.id}) if code == hash_code else ErrorPage(ErrNo.UNAUTHORIZED)
    except Exception, e:
        logger.error(e)
        return ErrorPage(ErrNo.INTERNAL_SERVER_ERROR)


@serviceHandle
def createApp(userID, appName):
    try:
        with db_session:
            app = Application.get(app_name=appName)
            if app:
                return ErrorPage(ErrNo.DUP_OPERATE)
            app_key = uuid.uuid3(uuid.NAMESPACE_DNS, appName).hex
            mast_secret = uuid.uuid4().hex
            user = Profile[userID]
            app = Application(app_name=appName, app_key=app_key, mast_secret=mast_secret, owner=user)
            return SuccessPage(app.to_dict())
    except Exception, e:
        logger.error(e)
        return ErrorPage(ErrNo.INTERNAL_SERVER_ERROR)


@serviceHandle
def deleteApp(userID, appName):
    try:
        with db_session:
            app = Application.get(app_name=appName)
            if app and app.owner.id == userID:
                app.delete()
        return SuccessPage()
    except Exception, e:
        logger.error(e)
        return ErrorPage(ErrNo.INTERNAL_SERVER_ERROR)


##########################
#  account dev APIS
##########################

@serviceHandle
def register_dev(imei, platform, dev_type):
    string = imei + platform + dev_type
    did = uuid.uuid3(uuid.NAMESPACE_DNS, str(string)).hex
    logger.debug('register device info:')
    logger.debug('\timei: %s, platform: %s, dev_type: %s, did: %s' % (imei, platform, dev_type, did))
    try:
        with db_session:
            dev = Device.get(did=did)
            if not dev:
                mast_secret = uuid.uuid4().hex
                dev = Device(did=did, platform=platform, dev_type=dev_type, mast_secret=mast_secret)
            return SuccessPage(dev.to_dict())
    except Exception, e:
        logger.error(e)
        return ErrorPage(ErrNo.INTERNAL_SERVER_ERROR)


@serviceHandle
def subscribe(app_key, did):
    try:
        with db_session:
            app = Application.get(app_key=app_key)
            dev = Device.get(did=did)
            if not app or not dev:
                return ErrorPage(ErrNo.INVALID_PARAMETER)
            dev.apps.add(app)
            return SuccessPage()
    except Exception, e:
        logger.error(e)
        return ErrorPage(ErrNo.INTERNAL_SERVER_ERROR)


@serviceHandle
def get_dids(page, page_size):
    with db_session:
        offset = (page - 1) * page_size
        sql = 'select * from Device limit %d offset %d' % (page_size, offset)
        devs = Device.select_by_sql(sql)
        dids = [dev.did for dev in devs]
        return SuccessPage({'dids': dids})


class AuthNode(object):
    pass
    def __init__(self, name):
        self.remote = RemoteObject(name)
        self.remote.addServiceChannel(service)

    def connect(self, addr):
        self.remote.connect(addr)
        # self.remote.disconnectCallback(disconnected)

    def start(self):
        db.bind('mysql', host='127.0.0.1', user='root', passwd='root', db='push')
        db.generate_mapping(create_tables=False)
        reactor.run()
